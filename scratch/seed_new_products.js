const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function seedProducts() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const urls = JSON.parse(fs.readFileSync('scratch/uploaded_urls.json', 'utf-8'));

  const newProducts = [
    // Haircare
    {
      name: "Aqua Bloom Hair Growth Mist",
      description: "Supports hair growth with an advanced bioactive infusion of Anagain, Baicapil, and Saw Palmetto. Re-energizes dormant hair follicles, reduces scalp dryness, and restores healthy density.",
      price: 499,
      stock: 50,
      category: "Haircare",
      images: [urls.aqua_bloom],
      ingredients: ["Anagain", "Baicapil", "Saw Palmetto", "Rosemary Water", "Aloe Vera Extract"],
      sizes: [
        { size: "100ml", price: 499, stock: 50 },
        { size: "200ml", price: 899, stock: 30 }
      ]
    },
    {
      name: "Luxury Hair Oil – 22 Herbs",
      description: "Lightweight, non-greasy daily use herbal oil infused with 22 pure Ayurvedic herbs. Delivers silky shine, smooth texture, and deep root nourishment without stickiness.",
      price: 599,
      stock: 50,
      category: "Haircare",
      images: [urls.luxury_hair_oil],
      ingredients: ["22 Herbal Infusions", "Almond Oil", "Jojoba Oil", "Bhringraj", "Vitamin E"],
      sizes: [
        { size: "100ml", price: 599, stock: 50 },
        { size: "200ml", price: 999, stock: 35 }
      ]
    },
    {
      name: "Vedha Tress – 35 Herbs",
      description: "Authentic herbal hair oil with a rich blend of 35 traditional herbs. Delivers deep nourishment, revitalizes weak roots, and visibly helps reduce hair fall naturally.",
      price: 555,
      stock: 50,
      category: "Haircare",
      images: [urls.vedha_tress],
      ingredients: ["35 Ayurvedic Herbs", "Bhringraj", "Brahmi", "Amla", "Neem Seed Oil", "Black Sesame"],
      sizes: [
        { size: "100ml", price: 555, stock: 50 },
        { size: "200ml", price: 950, stock: 30 }
      ]
    },
    {
      name: "Keratin Shampoo",
      description: "Double protein formulation that repairs damage, seals split ends, and leaves hair with a smooth, frizz-free salon finish. Strengthens hair cuticles from within.",
      price: 699,
      stock: 50,
      category: "Haircare",
      images: [urls.keratin_shampoo],
      ingredients: ["Plant Keratin", "Hydrolyzed Silk Protein", "Argan Oil", "Pro-Vitamin B5"],
      sizes: [
        { size: "200ml", price: 699, stock: 50 },
        { size: "350ml", price: 999, stock: 25 }
      ]
    },
    {
      name: "Herbal Shampoo",
      description: "Infused with rice protein and natural cleansing herbs. Boosts natural hair strength, gently clarifies the scalp, and adds soft, bouncy volume.",
      price: 599,
      stock: 50,
      category: "Haircare",
      images: [urls.herbal_shampoo],
      ingredients: ["Rice Protein", "Shikakai", "Reetha", "Hibiscus Extract", "Aloe Vera"],
      sizes: [
        { size: "200ml", price: 599, stock: 50 },
        { size: "350ml", price: 899, stock: 30 }
      ]
    },

    // Face Care
    {
      name: "Honey Glow Face Wash",
      description: "Deep cleansing face wash enriched with raw golden honey. Purifies pores, washes away grime, and imparts an instant luminous honey glow.",
      price: 349,
      stock: 50,
      category: "Face Care",
      images: [urls.honey_glow_wash],
      ingredients: ["Raw Forest Honey", "Turmeric Extract", "Saffron", "Aloe Vera Juice"],
      sizes: [
        { size: "100ml", price: 349, stock: 50 },
        { size: "200ml", price: 599, stock: 30 }
      ]
    },
    {
      name: "Pearl Serum",
      description: "Luminous brightening elixir formulated with pearl extract and collagen. Promotes radiant skin renewal and a smooth, luminous glass-skin appearance.",
      price: 799,
      stock: 50,
      category: "Face Care",
      images: [urls.pearl_serum],
      ingredients: ["Crushed Pearl Extract", "Botanical Collagen", "Niacinamide 5%", "Hyaluronic Acid"],
      sizes: [
        { size: "30ml", price: 799, stock: 50 },
        { size: "50ml", price: 1199, stock: 25 }
      ]
    },
    {
      name: "Gold Serum",
      description: "Anti-aging skincare treatment powered by red algae and collagen. Rejuvenates dull skin, smooths fine lines, and restores youthful firmness.",
      price: 899,
      stock: 50,
      category: "Face Care",
      images: [urls.gold_serum],
      ingredients: ["24K Gold Flakes", "Red Algae Extract", "Marine Collagen", "Bakuchiol", "Rosehip Oil"],
      sizes: [
        { size: "30ml", price: 899, stock: 50 },
        { size: "50ml", price: 1399, stock: 25 }
      ]
    },
    {
      name: "Mulberry Banana Moisturiser – Face + Body",
      description: "Deep moisturisation for both face and body. Enriched with mulberry antioxidants and banana fruit pulp to soothe dry skin and leave it velvety soft.",
      price: 449,
      stock: 50,
      category: "Face Care",
      images: [urls.banana_moisturiser],
      ingredients: ["Mulberry Extract", "Banana Fruit Pulp", "Shea Butter", "Almond Oil"],
      sizes: [
        { size: "100g", price: 449, stock: 50 },
        { size: "200g", price: 749, stock: 30 }
      ]
    },
    {
      name: "Face Pack",
      description: "Deep cleansing and purifying Ayurvedic face pack. Draws out impurities, tightens enlarged pores, and refreshes skin with a vibrant natural glow.",
      price: 399,
      stock: 50,
      category: "Face Care",
      images: [urls.face_pack],
      ingredients: ["Multani Mitti", "Wild Turmeric", "Sandalwood", "Neem Leaf Powder", "Rose Petals"],
      sizes: [
        { size: "100g", price: 399, stock: 50 },
        { size: "200g", price: 699, stock: 35 }
      ]
    },
    {
      name: "Foundation Cream",
      description: "Even-looking skin tone with a smooth, breathable finish and natural coverage. Infused with moisturizing botanical care for comfortable all-day wear.",
      price: 499,
      stock: 50,
      category: "Face Care",
      images: [urls.foundation_cream],
      ingredients: ["Mineral Zinc", "Saffron Oil", "Jojoba Butter", "Vitamin E", "Aloe Butter"],
      sizes: [
        { size: "30g", price: 499, stock: 50 },
        { size: "50g", price: 799, stock: 30 }
      ]
    },
    {
      name: "Carrot Saffron Oil",
      description: "Golden glow beauty oil enriched with carrot seed and Kashmiri saffron. Visibly evens out skin tone, fades hyperpigmentation, and imparts radiant luminosity.",
      price: 549,
      stock: 50,
      category: "Face Care",
      images: [urls.carrot_saffron_oil],
      ingredients: ["Kashmiri Saffron", "Carrot Seed Oil", "Cold-Pressed Rosehip", "Golden Jojoba"],
      sizes: [
        { size: "30ml", price: 549, stock: 50 },
        { size: "50ml", price: 899, stock: 30 }
      ]
    },
    {
      name: "Face Mist",
      description: "Instant hydration facial mist featuring watermelon and pink guava glow. Refreshes tired skin, tightens pores, and restores a dewy, glowing complexion.",
      price: 399,
      stock: 50,
      category: "Face Care",
      images: [urls.face_mist],
      ingredients: ["Watermelon Hydrosol", "Pink Guava Extract", "Witch Hazel", "Niacinamide"],
      sizes: [
        { size: "100ml", price: 399, stock: 50 },
        { size: "200ml", price: 649, stock: 40 }
      ]
    }
  ];

  for (const item of newProducts) {
    // Check if product already exists by name
    const { data: existing } = await supabase.from('products').select('id, sizes').eq('name', item.name).maybeSingle();

    if (existing) {
      console.log(`Product "${item.name}" already exists. Updating...`);
      // Try update with sizes
      let updateData = { ...item };
      let { error: updateErr } = await supabase.from('products').update(updateData).eq('id', existing.id);
      if (updateErr && updateErr.message?.includes("'sizes' column")) {
        delete updateData.sizes;
        const res = await supabase.from('products').update(updateData).eq('id', existing.id);
        if (res.error) console.error(`Error updating ${item.name}:`, res.error.message);
        else console.log(`Updated "${item.name}" without sizes column (pending SQL migration)`);
      } else if (updateErr) {
        console.error(`Error updating ${item.name}:`, updateErr.message);
      } else {
        console.log(`Updated "${item.name}" with multi-sizes!`);
      }
    } else {
      console.log(`Inserting new product "${item.name}"...`);
      let insertData = { ...item };
      let { error: insertErr } = await supabase.from('products').insert([insertData]);
      if (insertErr && insertErr.message?.includes("'sizes' column")) {
        delete insertData.sizes;
        const res = await supabase.from('products').insert([insertData]);
        if (res.error) console.error(`Error inserting ${item.name}:`, res.error.message);
        else console.log(`Inserted "${item.name}" without sizes column (pending SQL migration)`);
      } else if (insertErr) {
        console.error(`Error inserting ${item.name}:`, insertErr.message);
      } else {
        console.log(`Inserted "${item.name}" successfully!`);
      }
    }
  }

  console.log('Seeding finished!');
}

seedProducts();
