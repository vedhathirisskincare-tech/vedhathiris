const fs = require('fs');

async function testDefs() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const url = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const key = envVars['SUPABASE_SERVICE_ROLE_KEY'];

  const res = await fetch(`${url}/rest/v1/`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await res.json();
  console.log('Paths:', Object.keys(data.paths || {}));
  console.log('Definitions:', Object.keys(data.definitions || {}));
}

testDefs();
