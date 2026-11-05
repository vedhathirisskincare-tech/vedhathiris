import sharp from 'sharp';
import https from 'https';
import http from 'http';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}

function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      const data: Buffer[] = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
      res.on('error', reject);
    });
  });
}

/**
 * Generates an 800x800 WebP grid image composed of up to 4 product images.
 * Uses 'contain' fitting so cosmetic bottles and containers are never cropped.
 */
export async function generateComboGridBuffer(imageUrls: string[]): Promise<Buffer | null> {
  const cleanUrls = imageUrls.filter((u) => typeof u === 'string' && u.trim().startsWith('http'));
  if (cleanUrls.length === 0) return null;

  const validBuffers: Buffer[] = [];
  for (const url of cleanUrls.slice(0, 4)) {
    try {
      const buf = await fetchBuffer(url);
      validBuffers.push(buf);
    } catch (e: any) {
      console.warn(`[comboImage] Failed to fetch constituent image ${url}:`, e.message);
    }
  }

  if (validBuffers.length === 0) return null;

  const width = 800;
  const height = 800;
  const gap = 12;
  const bg = { r: 253, g: 252, b: 250, alpha: 1 }; // luxury warm off-white

  if (validBuffers.length === 1) {
    return sharp(validBuffers[0])
      .resize(width - 40, height - 40, { fit: 'contain', background: bg })
      .webp({ quality: 90 })
      .toBuffer();
  }

  const composites: sharp.OverlayOptions[] = [];

  if (validBuffers.length === 2) {
    // 2-column side-by-side grid
    const cellW = Math.floor((width - gap) / 2);
    for (let i = 0; i < 2; i++) {
      const resized = await sharp(validBuffers[i])
        .resize(cellW - 24, height - 48, { fit: 'contain', background: bg })
        .toBuffer();
      composites.push({
        input: resized,
        left: i * (cellW + gap) + 12,
        top: 24,
      });
    }
  } else if (validBuffers.length === 3) {
    // Left: 1 tall hero item; Right: 2 stacked items
    const colW = Math.floor((width - gap) / 2);
    const leftImg = await sharp(validBuffers[0])
      .resize(colW - 24, height - 48, { fit: 'contain', background: bg })
      .toBuffer();
    composites.push({ input: leftImg, left: 12, top: 24 });

    const cellH = Math.floor((height - gap) / 2);
    for (let i = 1; i <= 2; i++) {
      const rightImg = await sharp(validBuffers[i])
        .resize(colW - 24, cellH - 24, { fit: 'contain', background: bg })
        .toBuffer();
      composites.push({
        input: rightImg,
        left: colW + gap + 12,
        top: (i - 1) * (cellH + gap) + 12,
      });
    }
  } else {
    // 4 items (2x2 grid)
    const cellW = Math.floor((width - gap) / 2);
    const cellH = Math.floor((height - gap) / 2);
    const positions = [
      { left: 12, top: 12 },
      { left: cellW + gap + 12, top: 12 },
      { left: 12, top: cellH + gap + 12 },
      { left: cellW + gap + 12, top: cellH + gap + 12 },
    ];
    for (let i = 0; i < 4; i++) {
      const resized = await sharp(validBuffers[i])
        .resize(cellW - 24, cellH - 24, { fit: 'contain', background: bg })
        .toBuffer();
      composites.push({
        input: resized,
        left: positions[i].left,
        top: positions[i].top,
      });
    }
  }

  return sharp({
    create: { width, height, channels: 4, background: bg },
  })
    .composite(composites)
    .webp({ quality: 90 })
    .toBuffer();
}

/**
 * Generates the combo grid buffer and uploads it directly to Supabase storage.
 * Returns the public URL of the uploaded combo grid image.
 */
export async function generateAndUploadComboGrid(
  imageUrls: string[],
  identifier: string = 'combo'
): Promise<string | null> {
  try {
    const buffer = await generateComboGridBuffer(imageUrls);
    if (!buffer) return null;

    const supabase = getAdminSupabase();
    const cleanId = identifier.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const fileName = `combo_grid_${cleanId}_${Date.now()}.webp`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, { contentType: 'image/webp', upsert: true });

    if (uploadError) {
      console.error('[comboImage] Storage upload error:', uploadError.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (err: any) {
    console.error('[comboImage] Exception generating combo grid:', err.message);
    return null;
  }
}
