const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const { prompt, size = '1024x1024', quality = 'standard' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    // Try gpt-image-1 (newest model)
    let response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: size,
        response_format: 'url',
      }),
    });

    let data = await response.json();

    // If gpt-image-1 fails, try dall-e-3
    if (data.error) {
      response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'url',
        }),
      });
      data = await response.json();
    }

    // If dall-e-3 fails, try dall-e-2
    if (data.error) {
      response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-2',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'url',
        }),
      });
      data = await response.json();
    }

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json({
      success: true,
      url: data.data?.[0]?.url,
      revisedPrompt: data.data?.[0]?.revised_prompt,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ error: 'Gagal membuat gambar' });
  }
}
