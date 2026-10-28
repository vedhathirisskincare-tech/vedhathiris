const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('--- Step 1: Uploading generated product images ---');

  const generatedImages = {
    multani_glow_cream: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\f285232b-da56-454d-9bce-bd1c575bc614\\multani_glow_cream_1793169305762.jpg',
    senban_blue_clay: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\f285232b-da56-454d-9bce-bd1c575bc614\\senban_blue_clay_1793169323763.jpg',
    brazilian_purple_clay: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\f285232b-da56-454d-9bce-bd1c575bc614\\brazilian_purple_clay_1793169357688.jpg',
    chocolate_clay: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\f285232b-da56-454d-9bce-bd1c575bc614\\chocolate_clay_1793169377025.jpg',
    rose_powder_wash: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\f285232b-da56-454d-9bce-bd1c575bc614\\rose_powder_wash_1793169396030.jpg',
    charcoal_powder_wash: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\f285232b-da56-454d-9bce-bd1c575bc614\\charcoal_powder_wash_1793169414399.jpg',
    face_powder_women: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\f285232b-da56-454d-9bce-bd1c575bc614\\face_powder_women_1793169438358.jpg',
    face_powder_men: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\f285232b-da56-454d-9bce-bd1c575bc614\\face_powder_men_1793169463047.jpg',
    lip_balm_lipstick: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\f285232b-da56-454d-9bce-bd1c575bc614\\lip_balm_lipstick_1793169486952.jpg',
    detangler_hair_spray: 'C:\\Users\\hirlo\\.gemini\\antigravity-ide\\brain\\f285232b-da56-454d-9bce-bd1c575bc614\\detangler_hair_spray_1793169508765.jpg'
  };

  const uploadedUrls = {};

  for (const [key, filePath] of Object.entries(generatedImages)) {
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

  console.log('\n--- Step 2: Updating existing products in database ---');

  const existingUpdates = [
    {
      matchNames: ["Carrot Saffron Oil"],
      price: 599,
      sizes: [
        { size: "30ml", price: 599, stock: 50 },
        { size: "50ml", price: 879, stock: 30 }
      ]
    },
    {
      matchNames: ["Aqua Bloom Hair Growth Mist"],
      price: 399,
      sizes: [
        { size: "20ml", price: 399, stock: 50 },
        { size: "100ml", price: 1888, stock: 30 }
      ]
    },
    {
      matchNames: ["Gold Serum"],
      price: 599,
      sizes: [
        { size: "30ml", price: 599, stock: 50 },
        { size: "50ml", price: 899, stock: 25 }
      ]
    },
    {
      matchNames: ["Pearl Serum"],
      price: 599,
      sizes: [
        { size: "30ml", price: 599, stock: 50 },
        { size: "50ml", price: 899, stock: 25 }
      ]
    },
    {
      matchNames: ["Luxury Hair Oil – 22 Herbs"],
      price: 499,
      sizes: [
        { size: "50ml", price: 499, stock: 50 },
        { size: "100ml", price: 1522, stock: 35 }
      ]
    },
    {
      matchNames: ["Grow Well Kids Hair Oil"],
      price: 455,
      sizes: [
        { size: "100ml", price: 455, stock: 50 }
      ]
    },
    {
      matchNames: ["Face Mist"],
      price: 699,
      sizes: [
        { size: "100ml", price: 699, stock: 50 }
      ]
    },
    {
      matchNames: ["Honey Glow Face Wash"],
      price: 599,
      sizes: [
        { size: "100ml", price: 599, stock: 50 }
      ]
    },
    {
      matchNames: ["Mulberry Banana Moisturiser – Face + Body"],
      price: 477,
      sizes: [
        { size: "500g", price: 477, stock: 50 }
      ]
    },
    {
      matchNames: ["Foundation Cream"],
      price: 122,
      sizes: [
        { size: "50g", price: 122, stock: 50 }
      ]
    },
    {
      matchNames: ["Vedha Tress – 35 Herbs", "Veda Tress Oil"],
      price: 555,
      sizes: [
        { size: "100ml", price: 555, stock: 50 }
      ]
    },
    {
      matchNames: ["Keratin Shampoo"],
      price: 699,
      sizes: [
        { size: "200ml", price: 699, stock: 50 },
        { size: "350ml", price: 999, stock: 25 }
      ]
    },
    {
      matchNames: ["Herbal Shampoo"],
      price: 599,
      sizes: [
        { size: "200ml", price: 599, stock: 50 },
        { size: "350ml", price: 899, stock: 30 }
      ]
    }
  ];

  for (const item of existingUpdates) {
    for (const name of item.matchNames) {
      const { data: prod } = await supabase
        .from('products')
        .select('id, name')
        .eq('name', name)
        .maybeSingle();

      if (prod) {
        const { error } = await supabase
          .from('products')
          .update({
            price: item.price,
            sizes: item.sizes
          })
          .eq('id', prod.id);

        if (error) {
          console.error(`Error updating "${name}":`, error.message);
        } else {
          console.log(`Updated "${name}": price = ₹${item.price}, sizes =`, JSON.stringify(item.sizes));
        }
      }
    }
  }

  console.log('\n--- Step 3: Upserting / adding new products ---');

  const newProducts = [
    {
      name: "Multani Glow Cream",
      description: "Nourishing and skin-illuminating Ayurvedic facial cream enriched with pure Multani Mitti, Kashmiri saffron, and botanical extracts. Restores natural radiance, deep moisture, and a glowing complexion.",
      price: 499,
      stock: 50,
      category: "Face Care",
      images: [uploadedUrls.multani_glow_cream || ""],
      ingredients: ["Multani Mitti", "Kashmiri Saffron", "Sandalwood Extract", "Almond Oil", "Aloe Vera"],
      sizes: [
        { size: "50g", price: 499, stock: 50 }
      ]
    },
    {
      name: "Senban Blue Clay Face Pack",
      description: "Purifying and detoxifying facial mask crafted from natural blue mineral clay, wild lavender, and neem. Absorbs excess sebum, clears congested pores, and reveals luminous skin clarity.",
      price: 599,
      stock: 50,
      category: "Face Care",
      images: [uploadedUrls.senban_blue_clay || ""],
      ingredients: ["Blue Mineral Clay", "Wild Lavender Extract", "Neem Leaf", "Kaolin Clay", "Tea Tree Oil"],
      sizes: [
        { size: "50g", price: 599, stock: 50 }
      ]
    },
    {
      name: "Brazilian Purple Clay Face Pack",
      description: "Exotic anti-aging and firming face mask formulated with Brazilian purple clay rich in magnesium and antioxidants. Rejuvenates tired skin and enhances firmness and elasticity.",
      price: 395,
      stock: 50,
      category: "Face Care",
      images: [uploadedUrls.brazilian_purple_clay || ""],
      ingredients: ["Brazilian Purple Clay", "Rose Petals", "Hibiscus Powder", "Jojoba Oil", "Vitamin E"],
      sizes: [
        { size: "50g", price: 395, stock: 50 }
      ]
    },
    {
      name: "Chocolate Clay Face Pack",
      description: "Indulgent gourmet facial treatment packed with raw cocoa and natural French clay. Boosts skin microcirculation, delivers intensive hydration, and shields against free radicals.",
      price: 395,
      stock: 50,
      category: "Face Care",
      images: [uploadedUrls.chocolate_clay || ""],
      ingredients: ["Raw Cocoa Powder", "Bentonite Clay", "Cocoa Butter", "Oat Flour", "Vanilla Infusion"],
      sizes: [
        { size: "50g", price: 395, stock: 50 }
      ]
    },
    {
      name: "Rose Glow Powder Face Wash",
      description: "Gentle daily foaming powder cleanser infused with sun-dried Damask rose petals and soothing oat protein. Cleanses delicately without stripping moisture, giving a rosy glow.",
      price: 399,
      stock: 50,
      category: "Face Care",
      images: [uploadedUrls.rose_powder_wash || ""],
      ingredients: ["Damask Rose Petal Powder", "Colloidal Oats", "Coconut Sodium Cocoyl", "Licorice Root", "Sandalwood"],
      sizes: [
        { size: "Standard", price: 399, stock: 50 }
      ]
    },
    {
      name: "Charcoal Powder Face Wash",
      description: "Activated bamboo charcoal exfoliating cleansing powder. Cleanses deep inside pores, gently removes blackheads and impurities, and controls excess oil.",
      price: 444,
      stock: 50,
      category: "Face Care",
      images: [uploadedUrls.charcoal_powder_wash || ""],
      ingredients: ["Activated Bamboo Charcoal", "Rice Enzyme Powder", "Green Tea Extract", "Tea Tree", "Kaolin"],
      sizes: [
        { size: "Standard", price: 444, stock: 50 }
      ]
    },
    {
      name: "Face Powder – Women",
      description: "Silky, feather-light organic translucent mineral face setting powder. Formulated with botanical starches and soothing herbs for a flawless, matte, and breathable finish.",
      price: 255,
      stock: 50,
      category: "Face Care",
      images: [uploadedUrls.face_powder_women || ""],
      ingredients: ["Organic Arrowroot Starch", "Corn Starch", "Zinc Oxide", "Rose Powder", "Mica"],
      sizes: [
        { size: "Standard", price: 255, stock: 50 }
      ]
    },
    {
      name: "Face Powder – Men",
      description: "Invisible oil-control matte finish face powder designed for men's skin. Absorbs sweat and excess shine while soothing skin post-shave with calming sandalwood and aloe.",
      price: 259,
      stock: 50,
      category: "Face Care",
      images: [uploadedUrls.face_powder_men || ""],
      ingredients: ["Bamboo Charcoal Extract", "Arrowroot Powder", "Sandalwood Extract", "Zinc Ricinoleate"],
      sizes: [
        { size: "Standard", price: 259, stock: 50 }
      ]
    },
    {
      name: "2-in-1 Lip Balm + Lipstick",
      description: "Ultra-hydrating tinted lip care combining the rich nourishment of a natural shea-beeswax balm with the sheer, radiant tint of a lipstick. Leaves lips soft, plump, and tinted.",
      price: 199,
      stock: 50,
      category: "Face Care",
      images: [uploadedUrls.lip_balm_lipstick || ""],
      ingredients: ["Organic Beeswax", "Shea Butter", "Beetroot Extract", "Almond Oil", "Rosehip Oil"],
      sizes: [
        { size: "Standard", price: 199, stock: 50 }
      ]
    },
    {
      name: "Detangler",
      description: "Botanical leave-in conditioning detangler spray with chamomile, rosemary, and aloe vera. Instantly eases tangles, eliminates knots, prevents breakage, and softens hair strands.",
      price: 499,
      stock: 50,
      category: "Haircare",
      images: [uploadedUrls.detangler_hair_spray || ""],
      ingredients: ["Rosemary Hydrosol", "Aloe Vera Juice", "Chamomile Extract", "Hydrolyzed Wheat Protein", "Argan Oil"],
      sizes: [
        { size: "50ml", price: 499, stock: 50 },
        { size: "100ml", price: 955, stock: 30 }
      ]
    }
  ];

  for (const item of newProducts) {
    const { data: existing } = await supabase
      .from('products')
      .select('id, name')
      .eq('name', item.name)
      .maybeSingle();

    if (existing) {
      const { error: updErr } = await supabase
        .from('products')
        .update(item)
        .eq('id', existing.id);
      if (updErr) {
        console.error(`Error updating "${item.name}":`, updErr.message);
      } else {
        console.log(`Updated existing product "${item.name}"`);
      }
    } else {
      const { error: insErr } = await supabase
        .from('products')
        .insert([item]);
      if (insErr) {
        console.error(`Error inserting "${item.name}":`, insErr.message);
      } else {
        console.log(`Inserted new product "${item.name}" successfully!`);
      }
    }
  }

  console.log('\n--- All product prices and sizes updated successfully! ---');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
