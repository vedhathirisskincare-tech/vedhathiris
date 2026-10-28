const fs = require('fs');

async function testSupabaseMeta() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const url = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const key = envVars['SUPABASE_SERVICE_ROLE_KEY'];

  // Test /rest/v1/rpc or postgres endpoints
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log('Rest root status:', res.status);
    const text = await res.text();
    console.log('Rest endpoints sample:', text.slice(0, 300));
  } catch (e) {
    console.error(e);
  }
}

testSupabaseMeta();
