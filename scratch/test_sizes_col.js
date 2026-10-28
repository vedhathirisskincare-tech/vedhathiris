const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function testSizesColumn() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: prod } = await supabase.from('products').select('id').limit(1).single();
  if (!prod) return;

  const { data, error } = await supabase.from('products').update({ sizes: [] }).eq('id', prod.id).select();
  console.log('Update sizes result:', { data, error: error ? error.message : null });
}

testSizesColumn();
