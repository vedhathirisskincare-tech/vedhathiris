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
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: reviews, error } = await supabase
    .from('product_reviews')
    .select(`
      id, rating, review_text, created_at, user_id,
      profiles ( full_name )
    `);
    
  console.log('Error:', error);
  console.log('Reviews:', reviews);
}

testQuery();
