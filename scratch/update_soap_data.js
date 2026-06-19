const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const updates = [
    {
      oldName: 'Charcoal detox Soap',
      newName: 'Charcoal Detox Soap',
      category: 'Luxury Collection',
      price: 333
    },
    {
      oldName: 'Saffron with Camel Milk',
      newName: 'Saffron, Tomato & Camel Milk Soap',
      category: 'Luxury Collection',
      price: 333
    },
    {
      oldName: 'Licorice with coffe and camel milk',
      newName: 'Licorice with Coffee & Camel Milk Soap',
      category: 'Luxury Collection',
      price: 333
    },
    {
      oldName: 'Potato beetroot tomato soap',
      newName: 'Potato, Beetroot & Tomato Soap',
      category: 'Floral Collection',
      price: 222
    },
    {
      oldName: 'Rose Soap',
      newName: 'Rose Radiance Soap',
      category: 'Floral Collection',
      price: 222
    },
    {
      oldName: 'Carrot Soap',
      newName: 'Carrot Fresh Soap',
      category: 'Floral Collection',
      price: 222
    },
    {
      oldName: 'Neem Soap',
      newName: 'Neem Shuddhi Soap',
      category: 'Herbal Collection',
      price: 222
    },
    {
      oldName: 'Manjistha with green gram soap',
      newName: 'Manjistha With Green Gram Soap',
      category: 'Herbal Collection',
      price: 222
    },
    {
      oldName: 'Pappaya Soap',
      newName: 'Papaya Nourish Soap',
      category: 'Super Luxury Collection',
      price: 444
    }
  ];

  console.log('Starting product updates...');

  for (const update of updates) {
    // We do a case-insensitive check by fetching the item first
    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .ilike('name', update.oldName)
      .limit(1);

    if (fetchError) {
      console.error(`Error finding product "${update.oldName}":`, fetchError);
      continue;
    }

    if (!existing || existing.length === 0) {
      console.warn(`Product matching "${update.oldName}" not found. Trying new name instead...`);
      // check if it's already updated
      const { data: alreadyUpdated, error: checkError } = await supabase
        .from('products')
        .select('id, name')
        .ilike('name', update.newName)
        .limit(1);
      
      if (alreadyUpdated && alreadyUpdated.length > 0) {
        console.log(`Product "${update.newName}" is already present. Updating properties just in case.`);
        const { error: updateError } = await supabase
          .from('products')
          .update({
            price: update.price,
            category: update.category
          })
          .eq('id', alreadyUpdated[0].id);
        
        if (updateError) {
          console.error(`Error updating "${update.newName}":`, updateError);
        } else {
          console.log(`Successfully updated properties for "${update.newName}"`);
        }
      } else {
        console.error(`Could not find product for "${update.oldName}" or "${update.newName}"`);
      }
      continue;
    }

    const target = existing[0];
    console.log(`Found "${target.name}" (ID: ${target.id}). Updating name, price, category...`);

    const { error: updateError } = await supabase
      .from('products')
      .update({
        name: update.newName,
        price: update.price,
        category: update.category
      })
      .eq('id', target.id);

    if (updateError) {
      console.error(`Error updating "${target.name}":`, updateError);
    } else {
      console.log(`Successfully updated "${target.name}" ➔ "${update.newName}" (Price: ${update.price}, Category: ${update.category})`);
    }
  }

  console.log('All updates finished.');
}

main();
