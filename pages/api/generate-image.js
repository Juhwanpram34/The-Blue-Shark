import { applyRateLimit } from '../../lib/rateLimit';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Image generation limits per plan
const IMAGE_LIMITS = {
  free: {
    maxVariations: 1,
    allowedSizes: ['1024x1024'],
    allowedQualities: ['standard'],
    defaultSize: '1024x1024',
    defaultQuality: 'standard',
  },
  pro: {
    maxVariations: 3,
    allowedSizes: ['1024x1024', '1024x1792', '1792x1024'],
    allowedQualities: ['standard', 'hd'],
    defaultSize: '1024x1024',
    defaultQuality: 'standard',
  },
  business: {
    maxVariations: 4,
    allowedSizes: ['1024x1024', '1024x1792', '1792x1024'],
    allowedQualities: ['standard', 'hd'],
    defaultSize: '1024x1024',
    defaultQuality: 'hd',
  },
};

// Max n per model
const MODEL_MAX_N = {
  'gpt-image-1': 4,
  'dall-e-3': 1,
  'dall-e-2': 4,
};

// Valid sizes per model
const MODEL_SIZES = {
  'gpt-image-1': ['1024x1024', '1024x1536', '1536x1024', 'auto'],
  'dall-e-3': ['1024x1024', '1024x1792', '1792x1024'],
  'dall-e-2': ['256x256', '512x512', '1024x1024'],
};

// Map requested size to closest valid model size
function mapSizeForModel(requestedSize, model) {
  const validSizes = MODEL_SIZES[model] || ['1024x1024'];
  if (validSizes.includes(requestedSize)) return requestedSize;

  const sizeMap = {
    'gpt-image-1': {
      '512x512': '1024x1024',
      '1024x1792': '1024x1536',
      '1792x1024': '1536x1024',
    },
    'dall-e-2': {
      '1024x1792': '1024x1024',
      '1792x1024': '1024x1024',
    },
    'dall-e-3': {
      '512x512': '1024x1024',
    },
  };

  return sizeMap[model]?.[requestedSize] || validSizes[0];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  if (!applyRateLimit(req, res, 'generateImage')) return;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const {
    prompt,
    size,
    quality,
    variations = 1,
    plan = 'free',
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // Get plan limits
  const planLimits = IMAGE_LIMITS[plan] || IMAGE_LIMITS.free;

  // Validate & clamp parameters based on plan
  const finalSize = planLimits.allowedSizes.includes(size) ? size : planLimits.defaultSize;
  const finalQuality = planLimits.allowedQualities.includes(quality) ? quality : planLimits.defaultQuality;
  const finalVariations = Math.min(Math.max(1, variations), planLimits.maxVariations);

  try {
    // Tier 1: dall-e-3 & dall-e-2 available. gpt-image-1 needs Tier 3+.
    const models = ['dall-e-3', 'dall-e-2'];
    const modelErrors = [];

    for (const model of models) {
      try {
        const modelSize = mapSizeForModel(finalSize, model);
        const maxN = MODEL_MAX_N[model] || 1;

        if (maxN >= finalVariations) {
          // Model supports requested n directly
          const result = await generateImages(model, prompt, modelSize, finalQuality, finalVariations);
          if (result && !result.failed) {
            return res.status(200).json({
              ...result,
              planLimits: {
                maxVariations: planLimits.maxVariations,
                allowedSizes: planLimits.allowedSizes,
                allowedQualities: planLimits.allowedQualities,
              },
            });
          }
          if (result?.failed) {
            modelErrors.push({ model, error: result.errorMsg });
          }
        } else {
          // dall-e-3 only supports n=1, make parallel requests
          const promises = [];
          for (let i = 0; i < finalVariations; i++) {
            promises.push(generateImages(model, prompt, modelSize, finalQuality, 1));
          }
          const results = await Promise.allSettled(promises);
          const images = results
            .filter(r => r.status === 'fulfilled' && r.value && !r.value.failed)
            .flatMap(r => r.value.images);

          // Collect errors from failed attempts
          results.forEach(r => {
            if (r.status === 'fulfilled' && r.value?.failed) {
              modelErrors.push({ model, error: r.value.errorMsg });
            }
          });

          if (images.length > 0) {
            return res.status(200).json({
              success: true,
              images: images.map((img, idx) => ({ ...img, index: idx })),
              model,
              size: modelSize,
              quality: finalQuality,
              planLimits: {
                maxVariations: planLimits.maxVariations,
                allowedSizes: planLimits.allowedSizes,
                allowedQualities: planLimits.allowedQualities,
              },
            });
          }
        }
      } catch (modelError) {
        modelErrors.push({ model, error: modelError.message || 'Unknown error' });
        console.log(`Model ${model} failed:`, modelError.message);
        continue;
      }
    }

    // Return detailed error info for debugging
    return res.status(500).json({
      error: `Image generation gagal. Detail: ${modelErrors.map(e => `${e.model}: ${e.error}`).join(' | ')}. Pastikan akun OpenAI ada credit dan sudah Tier 1+.`,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ error: 'Gagal membuat gambar' });
  }
}

async function generateImages(model, prompt, size, quality, n) {
  const body = {
    model,
    prompt,
    n,
    size,
  };

  // Only dall-e-3 supports quality parameter
  if (model === 'dall-e-3') {
    body.quality = quality;
  }

  const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const imgData = await imgRes.json();

  if (imgData.error || !imgData.data?.length) {
    return { failed: true, errorMsg: imgData.error?.message || 'No data returned' };
  }

  const images = imgData.data.map((item, index) => ({
    url: item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null),
    revisedPrompt: item.revised_prompt || prompt,
    index,
  })).filter(img => img.url);

  if (images.length === 0) return null;

  return {
    success: true,
    images,
    model,
    size,
    quality,
  };
}
