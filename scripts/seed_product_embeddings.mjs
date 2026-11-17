import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[key] = val.trim();
    }
  }
}

const geminiKey = process.env.GEMINI_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!geminiKey) {
  console.error('❌ Please set GEMINI_API_KEY in .env.local first.');
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in .env.local.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: geminiKey });
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🌿 Starting Vedhathiri product embedding generation...');

  const { data: products, error } = await supabase.from('products').select('*');
  if (error || !products) {
    console.error('Failed to fetch products:', error);
    process.exit(1);
  }

  console.log(`📦 Found ${products.length} products to embed.`);

  let successCount = 0;

  for (const prod of products) {
    const ingredients = Array.isArray(prod.ingredients) ? prod.ingredients.join(', ') : '';
    const benefits = Array.isArray(prod.benefits) ? prod.benefits.join(', ') : '';
    let sizes = '';
    if (prod.sizes && Array.isArray(prod.sizes)) {
      sizes = prod.sizes.map((s) => `${s.size} for ₹${s.price}`).join(', ');
    }

    const chunkContent = [
      `Product: ${prod.name}`,
      `Category: ${prod.category}`,
      `Selling Price: ₹${prod.price}`,
      sizes ? `Available Sizes: ${sizes}` : '',
      `Stock: ${prod.stock} units`,
      ingredients ? `Ingredients: ${ingredients}` : '',
      benefits ? `Benefits: ${benefits}` : '',
      `Description: ${prod.description}`,
    ].filter(Boolean).join('\n');

    try {
      const embedRes = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: chunkContent,
        config: {
          outputDimensionality: 768,
        },
      });

      const embedding = embedRes.embeddings?.[0]?.values;
      if (!embedding) {
        console.warn(`⚠️ No embedding returned for ${prod.name}`);
        continue;
      }

      // Clean up existing embedding for this product to avoid duplicates
      await supabase.from('product_embeddings').delete().eq('product_id', prod.id);

      // Insert new embedding into product_embeddings table
      const { error: insertError } = await supabase.from('product_embeddings').insert({
        product_id: prod.id,
        content: chunkContent,
        embedding: embedding,
      });

      if (insertError) {
        console.error(`❌ Error inserting embedding for ${prod.name}:`, insertError.message);
      } else {
        successCount++;
        console.log(`✅ [${successCount}/${products.length}] Embedded: ${prod.name}`);
      }
    } catch (err) {
      console.error(`❌ Failed embedding for ${prod.name}:`, err.message);
    }
  }

  console.log(`\n🎉 Completed embedding generation! Successfully embedded ${successCount} products.`);
}

main().catch(console.error);
