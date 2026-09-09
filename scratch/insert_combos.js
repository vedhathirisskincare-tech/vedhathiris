import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const combos = [
  {
    name: "🌿 Herbal Soap Trio",
    description: "Contains Neem Shuddhi Soap, Manjistha With Green Gram Soap, and Carrot Fresh Soap. The ultimate herbal care for your skin.",
    price: 555,
    stock: 100,
    category: "Combo Packages",
    ingredients: ["Neem", "Manjistha", "Green Gram", "Carrot Extract"],
  },
  {
    name: "🌸 Natural Glow Soap Trio",
    description: "Contains Rose Radiance Soap, Potato, Beetroot & Tomato Soap, and Carrot Fresh Soap. Unveil your natural radiance.",
    price: 555,
    stock: 100,
    category: "Combo Packages",
    ingredients: ["Rose Petals", "Potato Extract", "Beetroot", "Tomato Extract", "Carrot Extract"],
  },
  {
    name: "👑 Luxury Soap Trio",
    description: "Contains Charcoal Detox Soap, Saffron, Tomato & Camel Milk Soap, and Licorice Coffee & Camel Milk Soap. Premium detoxification and glow.",
    price: 888,
    stock: 100,
    category: "Combo Packages",
    ingredients: ["Activated Charcoal", "Saffron", "Camel Milk", "Licorice Extract", "Coffee Beans"],
  },
  {
    name: "🌿 Natural Care Trio",
    description: "Contains Neem Shuddhi Soap, Veda Tress Oil, and Crown Elixir 17 Shampoo. Complete natural care routine.",
    price: 1444,
    stock: 100,
    category: "Combo Packages",
    ingredients: ["Neem", "Bhringraj", "Amla", "Hibiscus"],
  },
  {
    name: "👑 Premium Family Trio",
    description: "Contains Saffron, Tomato & Camel Milk Soap, Veda Tress Oil, and Keravance Luxe Shampoo. The premium choice for the whole family.",
    price: 1555,
    stock: 100,
    category: "Combo Packages",
    ingredients: ["Saffron", "Camel Milk", "Bhringraj", "Hibiscus"],
  },
  {
    name: "💆 Hair Growth Duo",
    description: "Contains Veda Tress Oil and Crown Elixir 17 Shampoo. Boost hair growth and thickness naturally.",
    price: 1222,
    stock: 100,
    category: "Combo Packages",
    ingredients: ["Bhringraj", "Amla", "Rosemary", "Hibiscus"],
  },
  {
    name: "✨ Hair Repair Duo",
    description: "Contains Luxury Hair Oil and Keravance Luxe Shampoo. Repair damage and restore shine.",
    price: 2111,
    stock: 100,
    category: "Combo Packages",
    ingredients: ["Almond Oil", "Argan Oil", "Hibiscus", "Bhringraj"],
  },
  {
    name: "👑 Complete Hair Ritual",
    description: "Contains Luxury Hair Oil and Crown Elixir 17 Shampoo. The ultimate routine for luxurious hair.",
    price: 2111,
    stock: 100,
    category: "Combo Packages",
    ingredients: ["Almond Oil", "Amla", "Rosemary", "Hibiscus"],
  },
  {
    name: "💎 Luxury Hair & Skin Trio",
    description: "Contains Papaya Nourish Soap, Luxury Hair Oil, and Keravance Luxe Shampoo. Total indulgence for skin and hair.",
    price: 2555,
    stock: 100,
    category: "Combo Packages",
    ingredients: ["Papaya Extract", "Almond Oil", "Hibiscus", "Shea Butter"],
  }
];

async function main() {
  console.log("Checking if combos already exist...");
  
  const { data: existingCombos, error: fetchError } = await supabase
    .from('products')
    .select('name')
    .eq('category', 'Combo Packages');

  if (fetchError) {
    console.error("Error fetching combos:", fetchError);
    return;
  }

  const existingNames = existingCombos.map(c => c.name);
  const combosToInsert = combos.filter(c => !existingNames.includes(c.name));

  if (combosToInsert.length === 0) {
    console.log("All combos already exist. Nothing to insert.");
    return;
  }

  console.log(`Inserting ${combosToInsert.length} combos...`);
  const { data, error } = await supabase
    .from('products')
    .insert(combosToInsert)
    .select();

  if (error) {
    console.error("Error inserting combos:", error);
  } else {
    console.log("Successfully inserted combos:", data.map(d => d.name));
  }
}

main();
