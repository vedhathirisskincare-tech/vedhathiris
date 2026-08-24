const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function getProducts() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabase = createClient(envVars['NEXT_PUBLIC_SUPABASE_URL'], envVars['SUPABASE_SERVICE_ROLE_KEY']);
  
  const { data, error } = await supabase
    .from('products')
    .select('name, images');
    
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}

getProducts();
