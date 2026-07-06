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
  { name: 'Charcoal Detox Soap', ingredients: ['Bamboo Charcoal Powder', 'Orange Peel Powder', 'Coconut Oil', 'Castor Oil', 'Olive Oil', 'Green Clay', 'Pink Clay'] },
  { name: 'Saffron, Tomato & Camel Milk Soap', ingredients: ['Saffron', 'Camel Milk Powder', 'Tomato Powder', 'Coconut Oil', 'Castor Oil', 'Olive Oil', 'Sesame Oil', 'Rice', 'Pink Clay', 'Corn Starch'] },
  { name: 'Licorice Coffee & Camel Milk Soap', nameMatches: ['Licorice with Coffee & Camel Milk Soap'], ingredients: ['Licorice', 'Coffee', 'Camel Milk Powder', 'Coconut Oil', 'Castor Oil', 'Olive Oil', 'Safflower Oil'] },
  { name: 'Potato, Beetroot & Tomato Soap', ingredients: ['Potato Powder', 'Beetroot Powder', 'Tomato Powder', 'Coconut Oil', 'Castor Oil'] },
  { name: 'Rose Radiance Soap', ingredients: ['Rose Petals Powder', 'Rose Essential Oil', 'Kokum Butter', 'Coconut Oil', 'Castor Oil', 'Safflower Oil', 'Rice', 'Corn', 'Potato', 'Pink Clay'] },
  { name: 'Carrot Fresh Soap', ingredients: ['Carrot Powder', 'Coconut Oil', 'Castor Oil', 'Safflower Oil'] },
  { name: 'Neem Shuddhi Soap', ingredients: ['Neem Powder', 'Neem Essential Oil', 'Green Gram Powder', 'Potato Powder', 'Rice Starch', 'Corn Starch', 'Coconut Oil', 'Castor Oil', 'Olive Oil', 'Safflower Oil'] },
  { name: 'Manjistha with Green Gram Soap', nameMatches: ['Manjistha With Green Gram Soap'], ingredients: ['Manjistha Root Powder', 'Green Gram Powder', 'Coconut Oil', 'Castor Oil', 'Safflower Oil', 'Rice', 'Corn', 'Oats', 'Potato'] },
  { name: 'Almond Potato & Rice Soap', nameMatches: ['Potato Almond with Rice'], ingredients: ['Almond Oil', 'Olive Oil', 'Coconut Oil', 'Castor Oil', 'Potato Powder', 'Rice', 'Almond'] },
  { name: 'Banana Oats Besan Soap', nameMatches: ['Banana Oats Soap'], ingredients: ['Banana Powder', 'Oats', 'Besan', 'Rice', 'Corn', 'Mango Butter', 'Cocoa Butter', 'Coconut Oil', 'Castor Oil', 'Safflower Oil', 'Geranium Essential Oil'] },
  { name: 'Red Sandal Zest Soap', nameMatches: ['Redsandal zest'], ingredients: ['Red Sandal Powder', 'Sandalwood Powder', 'Kaolin Clay', 'Corn', 'Jojoba Oil', 'Organic Safflower Oil'] },
  { name: 'Papaya Nourish Soap', ingredients: ['Papaya Powder', 'Carrot Powder', 'Camel Milk', 'Oats', 'Mango Butter', 'Jojoba Oil', 'Almond Oil', 'Olive Oil', 'Coconut Oil', 'Castor Oil', 'Safflower Oil', 'Lotus Essential Oil'] }
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
