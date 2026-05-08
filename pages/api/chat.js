import { AGENTS } from '../../lib/agents';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    // Use GPT-4o with web search for real-time data
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
          { role: 'system', content: agent.systemPrompt + '\n\nIMPORTANT: Always use web search to find the latest real-time data, statistics, trends, and news from 2026. Never rely solely on training data. Today is ' + new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '.' },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Extract text content from response
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

    if (!content) {
      content = 'Maaf, terjadi kesalahan. Silakan coba lagi.';
    }

    const usage = data.usage || {};

    return res.status(200).json({
      content,
      usage: {
        prompt_tokens: usage.input_tokens || 0,
        completion_tokens: usage.output_tokens || 0,
        total_tokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
