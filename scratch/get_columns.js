const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkSchema() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check products table structure by fetching one row
  const { data: products, error: prodErr } = await supabase.from('products').select('*').limit(1);
  console.log('Product columns:', products ? Object.keys(products[0] || {}) : 'No products found', prodErr);

  // Check offers table structure by fetching one row
  const { data: offers, error: offerErr } = await supabase.from('offers').select('*').limit(1);
  console.log('Offer columns:', offers ? Object.keys(offers[0] || {}) : 'No offers found', offerErr);
}

checkSchema();
