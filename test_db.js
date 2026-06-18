const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function testQuery() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY']; // I'll use service key first just to see if the query itself is valid
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: items, error } = await supabase
    .from('order_items')
    .select('*')
    .limit(1);
    
  console.log('Error:', error);
  console.log('Items:', items);
}

testQuery();
