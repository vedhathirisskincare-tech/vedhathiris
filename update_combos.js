const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if(key && val.length) env[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const combos = [
  { name: "Herbal Soap Trio", original_price: 666, price: 555, ingredients: ["Neem Shuddhi Soap", "Manjistha With Green Gram Soap", "Carrot Fresh Soap"] },
  { name: "Natural Glow Soap Trio", original_price: 666, price: 555, ingredients: ["Rose Radiance Soap", "Potato, Beetroot & Tomato Soap", "Carrot Fresh Soap"] },
  { name: "Luxury Soap Trio", original_price: 999, price: 888, ingredients: ["Charcoal Detox Soap", "Saffron, Tomato & Camel Milk Soap", "Licorice Coffee & Camel Milk Soap"] },
  { name: "Natural Care Trio", original_price: 1554, price: 1444, ingredients: ["Neem Shuddhi Soap", "Veda Tress Oil", "Crown Elixir 17 Shampoo"] },
  { name: "Premium Family Trio", original_price: 1665, price: 1555, ingredients: ["Saffron, Tomato & Camel Milk Soap", "Veda Tress Oil", "Keravance Luxe Shampoo"] },
  { name: "Hair Growth Duo", original_price: 1332, price: 1222, ingredients: ["Veda Tress Oil", "Crown Elixir 17 Shampoo"] },
  { name: "Hair Repair Duo", original_price: 2332, price: 2111, ingredients: ["Luxury Hair Oil", "Keravance Luxe Shampoo"] },
  { name: "Complete Hair Ritual", original_price: 2332, price: 2111, ingredients: ["Luxury Hair Oil", "Crown Elixir 17 Shampoo"] },
  { name: "Luxury Hair & Skin Trio", original_price: 2776, price: 2555, ingredients: ["Papaya Nourish Soap", "Luxury Hair Oil", "Keravance Luxe Shampoo"] }
];

async function update() {
  for (const combo of combos) {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        original_price: combo.original_price, 
        price: combo.price,
        ingredients: combo.ingredients 
      })
      .eq('name', combo.name);
    if (error) console.error(`Error updating ${combo.name}:`, error);
    else console.log(`Successfully updated ${combo.name}`);
  }
}

update();
