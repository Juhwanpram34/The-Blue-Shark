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
    // Try DALL-E 3 first
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: quality,
        response_format: 'url',
      }),
    });

    const data = await response.json();

    if (data.error) {
      // Fallback to DALL-E 2
      const fallback = await fetch('https://api.openai.com/v1/images/generations', {
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

      const fallbackData = await fallback.json();
      if (fallbackData.error) {
        return res.status(500).json({ error: fallbackData.error.message });
      }

      return res.status(200).json({
        success: true,
        url: fallbackData.data?.[0]?.url,
        revisedPrompt: fallbackData.data?.[0]?.revised_prompt,
        model: 'dall-e-2',
      });
    }

    return res.status(200).json({
      success: true,
      url: data.data?.[0]?.url,
      revisedPrompt: data.data?.[0]?.revised_prompt,
      model: 'dall-e-3',
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ error: 'Gagal membuat gambar' });
  }
}
