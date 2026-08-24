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
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  const anonKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
  const anonSupabase = createClient(supabaseUrl, anonKey);
  
  // 1. Create the view using admin (rpc isn't available for arbitrary sql, so I can't do DDL here easily unless I use the postgres driver)
  // Instead, I'll just query auth.users directly using the admin key to see if the user exists
  const { data: users, error } = await adminSupabase.auth.admin.listUsers();
  
  console.log("Admin Users fetch error:", error);
  if (users) {
    console.log("Found users:", users.users.length);
    const targetUser = users.users.find(u => u.id === 'dbe2e476-276a-4285-aec7-59d15d7674cf');
    console.log("Target user:", targetUser);
  }
}

testQuery();
