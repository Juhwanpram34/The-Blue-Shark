import { AGENTS } from '../../lib/agents';
import { applyRateLimit } from '../../lib/rateLimit';

// Fetch live data from external APIs
async function fetchLiveContext(query, agentId) {
  const liveData = {};
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const SERP_API_KEY = process.env.SERP_API_KEY;

  // Fetch latest news via SerpAPI Google News (works in production unlike NewsAPI)
  if (SERP_API_KEY) {
    try {
      const newsRes = await fetch(
        `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(query + ' 2026')}&gl=id&hl=id&api_key=${SERP_API_KEY}`
      );
      const newsData = await newsRes.json();
      if (newsData.news_results?.length > 0) {
        liveData.news = newsData.news_results.slice(0, 5).map(a => ({
          title: a.title,
          source: a.source?.name || a.source,
          date: a.date,
          snippet: a.snippet || a.title,
        }));
      }
    } catch (e) {
      console.error('SerpAPI News error:', e);
    }
  }

  // Fetch Google search results for latest info
  if (SERP_API_KEY) {
    try {
      const serpRes = await fetch(
        `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query + ' 2026 terbaru')}&gl=id&hl=id&num=5&api_key=${SERP_API_KEY}`
      );
      const serpData = await serpRes.json();
      if (serpData.organic_results?.length > 0) {
        liveData.searchResults = serpData.organic_results.map(r => ({
          title: r.title,
          snippet: r.snippet,
          date: r.date,
        }));
      }
    } catch (e) {
      console.error('SerpAPI error:', e);
    }
  }

  // Fetch Google Trends data
  if (SERP_API_KEY && ['market-research', 'sentiment-analysis', 'marketing-optimizer', 'content-creator'].includes(agentId)) {
    try {
      const trendsRes = await fetch(
        `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(query)}&geo=ID&api_key=${SERP_API_KEY}`
      );
      const trendsData = await trendsRes.json();
      if (trendsData.interest_over_time?.timeline_data) {
        liveData.trends = trendsData.interest_over_time.timeline_data.slice(-5).map(t => ({
          date: t.date,
          value: t.values?.[0]?.extracted_value,
        }));
      }
    } catch (e) {
      console.error('Trends error:', e);
    }
  }

  return liveData;
}

// Build live data context string for AI
function buildLiveContext(liveData) {
  let context = '';

  if (liveData.news?.length > 0) {
    context += '\n\n📰 LIVE NEWS DATA (real-time):\n';
    liveData.news.forEach((n, i) => {
      context += `${i + 1}. [${n.date}] ${n.title} (${n.source}) - ${n.snippet}\n`;
    });
  }

  if (liveData.searchResults?.length > 0) {
    context += '\n\n🔍 LATEST SEARCH RESULTS (real-time):\n';
    liveData.searchResults.forEach((r, i) => {
      context += `${i + 1}. ${r.title} ${r.date ? `(${r.date})` : ''} - ${r.snippet}\n`;
    });
  }

  if (liveData.trends?.length > 0) {
    context += '\n\n📊 GOOGLE TRENDS DATA (real-time):\n';
    liveData.trends.forEach(t => {
      context += `- ${t.date}: interest score ${t.value}/100\n`;
    });
  }

  return context;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  if (!applyRateLimit(req, res, 'chat')) return;

  const { messages, agentId } = req.body;

  if (!messages || !agentId) {
    return res.status(400).json({ error: 'Missing messages or agentId' });
  }

  const agent = AGENTS.find(a => a.id === agentId);
  if (!agent) {
    return res.status(400).json({ error: 'Agent not found' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    // Extract user's latest query for live data search
    const latestQuery = messages[messages.length - 1]?.content || '';

    // Fetch live data from external APIs
    const liveData = await fetchLiveContext(latestQuery, agentId);
    const liveContext = buildLiveContext(liveData);

    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const systemPrompt = agent.systemPrompt +
      `\n\nCRITICAL: Today is ${today}. You have access to LIVE real-time data below. ALWAYS prioritize this live data over your training data. Reference specific dates and sources when presenting information.` +
      liveContext;

    // Try GPT-4o with responses endpoint first, fallback to chat/completions
    let content = '';
    let usage = {};

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          tools: [{ type: 'web_search_preview' }],
          input: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.output) {
        for (const block of data.output) {
          if (block.type === 'message' && block.content) {
            for (const c of block.content) {
              if (c.type === 'output_text') {
                content += c.text;
              }
            }
          }
        }
      }
      usage = data.usage || {};
    } catch (primaryError) {
      console.log('Responses API failed, falling back to chat/completions:', primaryError.message);

      // Fallback to chat/completions
      const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 4096,
          temperature: 0.7,
        }),
      });

      const fallbackData = await fallbackResponse.json();

      if (fallbackData.error) {
        // Try gpt-4o-mini as last resort
        const miniResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map(m => ({ role: m.role, content: m.content })),
            ],
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });

        const miniData = await miniResponse.json();
        if (miniData.error) {
          return res.status(500).json({ error: miniData.error.message });
        }
        content = miniData.choices?.[0]?.message?.content || '';
        usage = miniData.usage || {};
      } else {
        content = fallbackData.choices?.[0]?.message?.content || '';
        usage = fallbackData.usage || {};
      }
    }

    if (!content) {
      content = 'Maaf, terjadi kesalahan. Silakan coba lagi.';
    }

    const hasLiveData = Object.keys(liveData).length > 0;

    return res.status(200).json({
      content,
      liveDataSources: hasLiveData ? Object.keys(liveData) : [],
      usage: {
        prompt_tokens: usage.input_tokens || usage.prompt_tokens || 0,
        completion_tokens: usage.output_tokens || usage.completion_tokens || 0,
        total_tokens: (usage.input_tokens || usage.prompt_tokens || 0) + (usage.output_tokens || usage.completion_tokens || 0),
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
