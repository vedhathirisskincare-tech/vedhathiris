const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function listAll() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: prods } = await supabase.from('products').select('id, name, category, price, stock');
  console.log('Total products:', prods?.length);
  const categories = [...new Set(prods?.map(p => p.category))];
  console.log('Existing categories:', categories);
  console.log('Products:', prods?.map(p => `${p.name} [${p.category}] - ₹${p.price}`));
}

listAll();
