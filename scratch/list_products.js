const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function list() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: products, error } = await supabase.from('products').select('name');
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Products:', products.map(p => p.name));
  }
}

list();
