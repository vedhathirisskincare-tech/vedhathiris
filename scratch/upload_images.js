const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const IMAGES = {
  aqua_bloom: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\aqua_bloom_mist_1793104443339.jpg',
  luxury_hair_oil: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\luxury_hair_oil_1793104462502.jpg',
  vedha_tress: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\vedha_tress_oil_1793104487760.jpg',
  keratin_shampoo: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\keratin_shampoo_1793104536856.jpg',
  herbal_shampoo: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\herbal_shampoo_1793104561724.jpg',
  honey_glow_wash: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\honey_glow_wash_1793104587146.jpg',
  pearl_serum: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\pearl_serum_1793104610896.jpg',
  gold_serum: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\gold_serum_1793104640416.jpg',
  banana_moisturiser: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\banana_moisturiser_1793104666372.jpg',
  face_pack: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\face_pack_jar_1793104691486.jpg',
  foundation_cream: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\foundation_cream_1793104723919.jpg',
  carrot_saffron_oil: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\carrot_saffron_oil_1793104754063.jpg',
  face_mist: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\152c1b29-a6dd-4621-86cd-62074f0d67f4\\face_mist_1793104790405.jpg'
};

async function uploadAllImages() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const uploadedUrls = {};

  for (const [key, filePath] of Object.entries(IMAGES)) {
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      continue;
    }
    const fileBuffer = fs.readFileSync(filePath);
    const destName = `catalog/${key}.jpg`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(destName, fileBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '31536000',
        upsert: true
      });

    if (error) {
      console.error(`Failed to upload ${key}:`, error.message);
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(destName);
      uploadedUrls[key] = publicUrl;
      console.log(`Uploaded ${key}: ${publicUrl}`);
    }
  }

  fs.writeFileSync('scratch/uploaded_urls.json', JSON.stringify(uploadedUrls, null, 2));
  console.log('Saved all uploaded URLs to scratch/uploaded_urls.json');
}

uploadAllImages();
