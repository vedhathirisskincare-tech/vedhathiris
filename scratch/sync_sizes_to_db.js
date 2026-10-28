const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const PRODUCT_SIZES = {
  "Aqua Bloom Hair Growth Mist": [
    { size: "100ml", price: 499, stock: 50 },
    { size: "200ml", price: 899, stock: 30 }
  ],
  "Luxury Hair Oil – 22 Herbs": [
    { size: "100ml", price: 599, stock: 50 },
    { size: "200ml", price: 999, stock: 35 }
  ],
  "Vedha Tress – 35 Herbs": [
    { size: "100ml", price: 555, stock: 50 },
    { size: "200ml", price: 950, stock: 30 }
  ],
  "Keratin Shampoo": [
    { size: "200ml", price: 699, stock: 50 },
    { size: "350ml", price: 999, stock: 25 }
  ],
  "Herbal Shampoo": [
    { size: "200ml", price: 599, stock: 50 },
    { size: "350ml", price: 899, stock: 30 }
  ],
  "Honey Glow Face Wash": [
    { size: "100ml", price: 349, stock: 50 },
    { size: "200ml", price: 599, stock: 30 }
  ],
  "Pearl Serum": [
    { size: "30ml", price: 799, stock: 50 },
    { size: "50ml", price: 1199, stock: 25 }
  ],
  "Gold Serum": [
    { size: "30ml", price: 899, stock: 50 },
    { size: "50ml", price: 1399, stock: 25 }
  ],
  "Mulberry Banana Moisturiser – Face + Body": [
    { size: "100g", price: 449, stock: 50 },
    { size: "200g", price: 749, stock: 30 }
  ],
  "Face Pack": [
    { size: "100g", price: 399, stock: 50 },
    { size: "200g", price: 699, stock: 35 }
  ],
  "Foundation Cream": [
    { size: "30g", price: 499, stock: 50 },
    { size: "50g", price: 799, stock: 30 }
  ],
  "Carrot Saffron Oil": [
    { size: "30ml", price: 549, stock: 50 },
    { size: "50ml", price: 899, stock: 30 }
  ],
  "Face Mist": [
    { size: "100ml", price: 399, stock: 50 },
    { size: "200ml", price: 649, stock: 40 }
  ]
};

async function syncSizes() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Syncing sizes to products in database...');

  for (const [name, sizes] of Object.entries(PRODUCT_SIZES)) {
    const { data: prod, error: fetchErr } = await supabase
      .from('products')
      .select('id, name')
      .eq('name', name)
      .maybeSingle();

    if (fetchErr) {
      console.error(`Error finding ${name}:`, fetchErr.message);
      continue;
    }

    if (!prod) {
      console.log(`Product "${name}" not found in database.`);
      continue;
    }

    const { error: updateErr } = await supabase
      .from('products')
      .update({ sizes })
      .eq('id', prod.id);

    if (updateErr) {
      console.log(`Could not update sizes for "${name}": ${updateErr.message}`);
    } else {
      console.log(`Successfully updated sizes for "${name}"!`);
    }
  }

  console.log('Done!');
}

syncSizes();
