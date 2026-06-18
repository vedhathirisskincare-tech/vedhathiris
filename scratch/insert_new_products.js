const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function uploadImage(supabase, localPath, fileName) {
  const fileBuffer = fs.readFileSync(localPath);
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(`HairOils/${fileName}`, fileBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload ${fileName}: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(`HairOils/${fileName}`);

  return publicUrl;
}

async function runSeed() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL or Service Key is missing in env vars.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Uploading images to Supabase storage...');
  
  const kidsImgPath = 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\cc5e16b4-741a-442d-83b2-0ff0d9987997\\grow_well_kids_1781614332522.png';
  const tressImgPath = 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\cc5e16b4-741a-442d-83b2-0ff0d9987997\\veda_tress_1781614351615.png';
  const elixirImgPath = 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\cc5e16b4-741a-442d-83b2-0ff0d9987997\\seraphine_aura_1781614366878.png';

  const kidsUrl = await uploadImage(supabase, kidsImgPath, 'grow_well_kids.png');
  const tressUrl = await uploadImage(supabase, tressImgPath, 'veda_tress.png');
  const elixirUrl = await uploadImage(supabase, elixirImgPath, 'seraphine_aura.png');

  console.log('Images uploaded successfully:');
  console.log('- Kids Oil:', kidsUrl);
  console.log('- Tress Oil:', tressUrl);
  console.log('- Elixir:', elixirUrl);

  const newProducts = [
    {
      name: "Grow Well Kids Hair Oil",
      description: "With Goodness of 14 Herbs. An Ayurvedic hair oil crafted for all age groups & kids. Nourishes, strengthens, and protects. Features anti-sinus and anti-lice benefits, promoting healthy hair growth naturally. Key ingredients: Tulsi, Neem, Betel Leaves, Curry Leaves, Almond Oil, Rosemary, Lavender, Neem Infused Coconut Oil, Karpooravalli, and other herbs.",
      price: 333,
      stock: 50,
      category: "Hair Oil",
      images: [kidsUrl]
    },
    {
      name: "Veda Tress Oil",
      description: "Blend of 32 Mixture of Hair Oil. Helps prevent premature grey hair, promotes hair growth and thickness, supports scalp health, and reduces irritation and dandruff naturally. Suitable for all age groups & kids. Key ingredients: Clove, Ginger, Fenugreek, Curry Leaves, Jadamanji, Avuri, Green Tea, Cinnamon, Pepper, Neem, Moringa, Karunjeera, Vasambu, Rosemary, Orange Peel, Mustard/Sesame/Almond/Coconut Oils, Lotus, Tea Tree, and other herbs.",
      price: 555,
      stock: 50,
      category: "Hair Oil",
      images: [tressUrl]
    },
    {
      name: "Seraphine Aura Luxurious Hair Elixir",
      description: "Luxurious Serum-Like Hair Oil featuring a blend of 25 premium oils. Strengthens hair from root to tip, repairs damage, reduces breakage, and adds natural shine and silky smoothness. Suitable for men, women, and kids above 4 years. Key ingredients: Argan, Walnut, Apricot, Avocado, Pomegranate, Jojoba, Hempseed, Olive, Almond, Lotus, Tea Tree, Lavender, Cedarwood, Chamomile, Clarysage, Bhringaraj, Menthol, Onion Vite, Carrot Seed, Castor, Flaxseed, and other premium blends.",
      price: 1555,
      stock: 50,
      category: "Hair Oil",
      images: [elixirUrl]
    }
  ];

  console.log('Inserting new products into database...');
  const { data, error } = await supabase
    .from('products')
    .insert(newProducts)
    .select();

  if (error) {
    console.error('Error inserting products:', error);
  } else {
    console.log('Successfully inserted products:', data);
  }
}

runSeed();
