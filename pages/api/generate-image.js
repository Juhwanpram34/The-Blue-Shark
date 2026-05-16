import { applyRateLimit } from '../../lib/rateLimit';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  if (!applyRateLimit(req, res, 'generateImage')) return;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const { prompt, size = '1024x1024', quality = 'standard' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    // Use GPT-4o to generate image (works on most tiers)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: `Create a detailed, professional image based on this description: ${prompt}. Make it high quality, visually appealing, and suitable for business use.`,
          },
        ],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // GPT-4o returns text description, not actual image
    // So we use a different approach - try the images endpoint with available models
    const models = ['gpt-image-1', 'dall-e-3', 'dall-e-2'];
    
    for (const model of models) {
      try {
        const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: model,
            prompt: prompt,
            n: 1,
            size: model === 'dall-e-2' ? '512x512' : '1024x1024',
          }),
        });

        const imgData = await imgRes.json();

        if (!imgData.error && imgData.data?.[0]) {
          const imageItem = imgData.data[0];
          const imageUrl = imageItem.url || (imageItem.b64_json ? `data:image/png;base64,${imageItem.b64_json}` : null);
          
          if (imageUrl) {
            return res.status(200).json({
              success: true,
              url: imageUrl,
              revisedPrompt: imageItem.revised_prompt || prompt,
              model: model,
            });
          }
        }
      } catch (modelError) {
        console.log(`Model ${model} failed, trying next...`);
        continue;
      }
    }

    return res.status(500).json({ 
      error: 'Image generation tidak tersedia di akun Anda. Silakan upgrade plan OpenAI atau top up credit.' 
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ error: 'Gagal membuat gambar' });
  }
}
