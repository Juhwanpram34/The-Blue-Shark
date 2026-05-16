import { applyRateLimit } from '../../lib/rateLimit';
import { createClient } from '@supabase/supabase-js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Supabase admin client for storage uploads
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Image generation limits per plan
// gpt-image-1 sizes: 1024x1024, 1024x1536, 1536x1024, auto
const IMAGE_LIMITS = {
  free: {
    maxVariations: 1,
    allowedSizes: ['1024x1024'],
    allowedQualities: ['low'],
    defaultSize: '1024x1024',
    defaultQuality: 'low',
  },
  pro: {
    maxVariations: 3,
    allowedSizes: ['1024x1024', '1024x1536', '1536x1024'],
    allowedQualities: ['low', 'medium', 'high'],
    defaultSize: '1024x1024',
    defaultQuality: 'medium',
  },
  business: {
    maxVariations: 4,
    allowedSizes: ['1024x1024', '1024x1536', '1536x1024', 'auto'],
    allowedQualities: ['low', 'medium', 'high'],
    defaultSize: '1024x1024',
    defaultQuality: 'high',
  },
};

// Max n per model
const MODEL_MAX_N = {
  'gpt-image-1': 4,
};

// Valid sizes per model
const MODEL_SIZES = {
  'gpt-image-1': ['1024x1024', '1024x1536', '1536x1024', 'auto'],
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
  };

  return sizeMap[model]?.[requestedSize] || validSizes[0];
}

// Upload base64 image to Supabase Storage, return public URL
async function uploadToSupabase(base64Data, index) {
  if (!supabaseAdmin) return null;

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `generated/${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}.png`;

    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error.message);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  } catch (err) {
    console.error('Upload to Supabase failed:', err.message);
    return null;
  }
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
    const models = ['gpt-image-1'];
    const modelErrors = [];

    for (const model of models) {
      try {
        const modelSize = mapSizeForModel(finalSize, model);
        const maxN = MODEL_MAX_N[model] || 1;

        let result;
        if (maxN >= finalVariations) {
          result = await generateImages(model, prompt, modelSize, finalQuality, finalVariations);
        } else {
          // Parallel requests for variations
          const promises = [];
          for (let i = 0; i < finalVariations; i++) {
            promises.push(generateImages(model, prompt, modelSize, finalQuality, 1));
          }
          const results = await Promise.allSettled(promises);
          const images = results
            .filter(r => r.status === 'fulfilled' && r.value && !r.value.failed)
            .flatMap(r => r.value.images);

          results.forEach(r => {
            if (r.status === 'fulfilled' && r.value?.failed) {
              modelErrors.push({ model, error: r.value.errorMsg });
            }
          });

          if (images.length > 0) {
            result = {
              success: true,
              images: images.map((img, idx) => ({ ...img, index: idx })),
              model,
              size: modelSize,
              quality: finalQuality,
            };
          }
        }

        if (result && !result.failed && result.images?.length > 0) {
          // Upload each image to Supabase Storage for permanent URLs
          const persistedImages = await Promise.all(
            result.images.map(async (img, idx) => {
              // If it's a base64 data URL, upload to Supabase
              if (img.url && img.url.startsWith('data:image')) {
                const base64 = img.url.replace(/^data:image\/\w+;base64,/, '');
                const permanentUrl = await uploadToSupabase(base64, idx);
                return { ...img, url: permanentUrl || img.url };
              }
              return img;
            })
          );

          return res.status(200).json({
            success: true,
            images: persistedImages,
            model: result.model,
            size: result.size,
            quality: result.quality,
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
      } catch (modelError) {
        modelErrors.push({ model, error: modelError.message || 'Unknown error' });
        console.log(`Model ${model} failed:`, modelError.message);
        continue;
      }
    }

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

  if (model === 'gpt-image-1') {
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
