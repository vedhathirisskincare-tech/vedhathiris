const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(envVars['NEXT_PUBLIC_SUPABASE_URL'], envVars['SUPABASE_SERVICE_ROLE_KEY']);

const ingredientsMap = [
  { name: 'Crown Elixir 17', ingredients: ['Garlic', 'Onion', 'Aloe Vera', 'Pomegranate', 'Clove', 'Rosemary', 'Lavender', 'Fenugreek', 'Neem', 'Hibiscus Leaves', 'Hibiscus Flower', 'Kalonji Seeds', 'Black Pepper', 'Tea Tree', 'Herbal Extract Blend', 'Botanical Extracts', 'Essential Oil Blend'] },
  { name: 'Keravance Luxe', ingredients: ['Aloe Vera Extract', 'Pomegranate Extract', 'Keratin Protein', 'Coconut Derived Cleanser', 'Milk Protein', 'Vitamin E', 'Pro Vitamin B5', 'Natural Fragrance'] }
];

async function run() {
  const { data: products, error: fetchError } = await supabase.from('products').select('id, name');
  if (fetchError) {
    console.error('Error fetching products:', fetchError);
    return;
  }

  for (const item of ingredientsMap) {
    // Find matching product
    const product = products.find(p => 
      p.name.toLowerCase() === item.name.toLowerCase() || 
      (item.nameMatches && item.nameMatches.some(m => p.name.toLowerCase() === m.toLowerCase()))
    );

    if (product) {
      console.log(`Updating ${product.name} with ingredients...`);
      const { error: updateError } = await supabase
        .from('products')
        .update({ ingredients: item.ingredients })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Failed to update ${product.name}:`, updateError);
      } else {
        console.log(`Successfully updated ${product.name}`);
      }
    } else {
      console.log(`Product not found in database: ${item.name}`);
    }
  }
}

run();
