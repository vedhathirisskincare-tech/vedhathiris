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
  
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('*');
    
  if (reviews && reviews.length > 0) {
    const userIds = [...new Set(reviews.map(r => r.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
      
    console.log("Reviews:", reviews);
    console.log("Profiles for reviews:", profiles);
  } else {
    console.log("No reviews found.");
  }
}

testQuery();
