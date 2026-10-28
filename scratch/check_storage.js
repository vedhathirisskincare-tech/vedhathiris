const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function listStorage() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: rootFiles, error: rootErr } = await supabase.storage.from('product-images').list();
  console.log('Root files/folders in product-images:', rootFiles?.map(f => f.name));

  // Also check subfolders
  if (rootFiles) {
    for (const f of rootFiles) {
      if (!f.id) { // likely folder
        const { data: subFiles } = await supabase.storage.from('product-images').list(f.name);
        console.log(`Subfiles in ${f.name}:`, subFiles?.map(sf => sf.name));
      }
    }
  }
}

listStorage();
