const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function check() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Checking category_offers...');
  const { data: offers, error: offersErr } = await supabase.from('category_offers').select('*');
  if (offersErr) {
    console.log('Error selecting category_offers:', offersErr.message);
  } else {
    console.log('category_offers content:', offers);
  }

  console.log('Checking products column discount_percentage...');
  const { data: products, error: prodErr } = await supabase.from('products').select('id, name, price, discount_percentage').limit(1);
  if (prodErr) {
    console.log('Error selecting discount_percentage from products:', prodErr.message);
  } else {
    console.log('products discount_percentage content:', products);
  }
}

check();
