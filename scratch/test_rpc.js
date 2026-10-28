const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function testRPC() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check if any rpc exists or test alter table
  const { data, error } = await supabase.rpc('exec_sql', { query: 'SELECT 1;' });
  console.log('exec_sql:', { data, error: error ? error.message : null });
}

testRPC();
