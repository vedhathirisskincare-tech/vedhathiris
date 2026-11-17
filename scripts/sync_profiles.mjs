import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const getEnvVal = (key) => {
  const match = envContent.match(new RegExp(`${key}\\s*=\\s*([^\\r\\n]+)`));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
};

const supabaseUrl = getEnvVal('NEXT_PUBLIC_SUPABASE_URL');
const serviceKey = getEnvVal('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, serviceKey);

async function syncAllAuthUsersToProfiles() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    return;
  }

  console.log(`Found ${users.length} total auth users.`);

  for (const u of users) {
    const { data: prof } = await supabase.from('profiles').select('id').eq('id', u.id).maybeSingle();
    if (!prof) {
      console.log(`Syncing missing profile for user: ${u.id} (${u.email})`);
      const { error: insErr } = await supabase.from('profiles').insert({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || 'Customer',
        phone: u.user_metadata?.phone_number || null,
        role: 'user',
      });
      if (insErr) {
        console.error(`Failed to insert profile for ${u.id}:`, insErr);
      } else {
        console.log(`Successfully created profile for ${u.id}`);
      }
    }
  }
}

syncAllAuthUsersToProfiles().catch(console.error);

