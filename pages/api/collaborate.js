import { AGENTS } from '../../lib/agents';

const SERP_API_KEY = process.env.SERP_API_KEY;

// Determine which agents are relevant for a given query
function selectAgents(query, requestedAgents = []) {
  if (requestedAgents.length > 0) {
    return AGENTS.filter(a => requestedAgents.includes(a.id));
  }

  // Auto-select relevant agents based on query keywords
  const q = query.toLowerCase();
  const selected = [];

  // Always include market research for business queries
  if (q.match(/pasar|market|tren|trend|kompetitor|industri|peluang|bisnis|business/)) {
    selected.push('market-research');
  }
  // Content creator for content-related queries
  if (q.match(/konten|content|copywriting|artikel|blog|sosial media|social media|post|caption/)) {
    selected.push('content-creator');
  }
  // Sentiment analysis for opinion/feedback queries
  if (q.match(/sentimen|sentiment|review|ulasan|feedback|opini|brand|persepsi|pelanggan/)) {
    selected.push('sentiment-analysis');
  }
  // Marketing optimizer for marketing queries
  if (q.match(/marketing|pemasaran|iklan|ads|campaign|konversi|roi|growth|promosi/)) {
    selected.push('marketing-optimizer');
  }
  // Cybersecurity for security queries
  if (q.match(/keamanan|security|cyber|hack|data protection|enkripsi|vulnerability|ancaman/)) {
    selected.push('cybersecurity');
  }
  // Workflow automation for process queries
  if (q.match(/otomatisasi|automation|workflow|proses|efisiensi|integrasi|zapier|tools/)) {
    selected.push('workflow-automation');
  }
  // ML performance for AI/ML queries
  if (q.match(/machine learning|ml|ai|model|deep learning|neural|training|dataset|algoritma/)) {
    selected.push('ml-performance');
  }
  // Customer support for support queries
  if (q.match(/customer|pelanggan|support|bantuan|chatbot|helpdesk|tiket|ticket|layanan/)) {
    selected.push('customer-support');
  }

  // If no specific match, select top 3 most relevant agents
  if (selected.length === 0) {
    selected.push('market-research', 'content-creator', 'marketing-optimizer');
  }

  // Minimum 2 agents for collaboration
  if (selected.length < 2) {
    if (!selected.includes('market-research')) selected.push('market-research');
    if (selected.length < 2 && !selected.includes('marketing-optimizer')) selected.push('marketing-optimizer');
  }

  // Maximum 4 agents to keep response time reasonable
  return AGENTS.filter(a => selected.slice(0, 4).includes(a.id));
}

// Fetch live search data
async function fetchLiveData(query) {
  if (!SERP_API_KEY) return '';
  try {
    const res = await fetch(
      `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query + ' 2026 terbaru')}&gl=id&hl=id&num=5&api_key=${SERP_API_KEY}`
    );
    const data = await res.json();
    if (data.organic_results?.length > 0) {
      let context = '\n\n🔍 LATEST SEARCH RESULTS (real-time):\n';
      data.organic_results.slice(0, 5).forEach((r, i) => {
        context += `${i + 1}. ${r.title} ${r.date ? `(${r.date})` : ''} - ${r.snippet}\n`;
      });
      return context;
    }
  } catch (e) {
    console.error('Search error:', e);
  }
  return '';
}

// Call a single agent
async function callAgent(agent, query, liveContext, apiKey) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const systemPrompt = agent.systemPrompt +
    `\n\nCRITICAL: Today is ${today}. You are part of a MULTI-AGENT COLLABORATION team. Provide your analysis ONLY from your area of expertise (${agent.name}). Be concise but thorough. Use real-time data when available. Format with ** for headers and - for bullet points.` +
    liveContext;

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
          { role: 'user', content: query },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return { agentId: agent.id, agentName: agent.name, agentIcon: agent.icon, content: `Error: ${data.error.message}`, error: true };
    }

    let content = '';
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

    return {
      agentId: agent.id,
      agentName: agent.name,
      agentIcon: agent.icon,
      agentColor: agent.color,
      content: content || 'Tidak ada respons.',
      error: false,
    };
  } catch (e) {
    return { agentId: agent.id, agentName: agent.name, agentIcon: agent.icon, content: `Connection error: ${e.message}`, error: true };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, agents: requestedAgents } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Missing query' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    // Select relevant agents
    const selectedAgents = selectAgents(query, requestedAgents || []);

    // Fetch live data once (shared across all agents)
    const liveContext = await fetchLiveData(query);

    // Call all agents in parallel
    const agentResults = await Promise.all(
      selectedAgents.map(agent => callAgent(agent, query, liveContext, apiKey))
    );

    // Generate executive summary by combining all agent outputs
    const combinedAnalysis = agentResults
      .filter(r => !r.error)
      .map(r => `[${r.agentName} Analysis]:\n${r.content}`)
      .join('\n\n---\n\n');

    let executiveSummary = '';
    try {
      const summaryRes = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          input: [
            {
              role: 'system',
              content: 'You are Blue Shark Executive Strategist. Synthesize the following multi-agent analysis into a concise executive summary with key insights and recommended actions. If the user writes in Indonesian, respond in Indonesian. Format with ** for headers and - for bullet points.',
            },
            {
              role: 'user',
              content: `Original query: "${query}"\n\nMulti-Agent Analysis:\n\n${combinedAnalysis}\n\nProvide a concise executive summary with:\n1. Key insights from all agents\n2. Cross-functional recommendations\n3. Prioritized action items`,
            },
          ],
        }),
      });

      const summaryData = await summaryRes.json();
      if (summaryData.output) {
        for (const block of summaryData.output) {
          if (block.type === 'message' && block.content) {
            for (const c of block.content) {
              if (c.type === 'output_text') {
                executiveSummary += c.text;
              }
            }
          }
        }
      }
    } catch (e) {
      executiveSummary = 'Executive summary generation failed.';
    }

    return res.status(200).json({
      success: true,
      query,
      agentsUsed: selectedAgents.map(a => ({ id: a.id, name: a.name, icon: a.icon, color: a.color })),
      executiveSummary,
      agentResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Multi-agent error:', error);
    return res.status(500).json({ error: 'Failed to process multi-agent request' });
  }
}
