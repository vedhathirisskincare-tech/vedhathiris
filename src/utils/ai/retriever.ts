import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { INGREDIENTS } from '@/data/ingredients';

export interface RetrievedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  ingredients?: string[];
  benefits?: string[];
  sizes?: Array<{ size: string; price: number; stock: number; mrp_price?: number }>;
  discount_percentage?: number;
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  return createSupabaseClient(url, key);
}

/**
 * Dynamically retrieves relevant product and ingredient chunks from Supabase
 * based on user message and query intent, with pgvector support and fallback.
 */
export async function getDynamicSupabaseContext(
  userQuery: string,
  queryEmbedding?: number[]
): Promise<{ contextText: string; matchedProducts: RetrievedProduct[] }> {
  const supabase = getSupabaseClient();
  const lowerQuery = userQuery.toLowerCase();

  let matchedProducts: RetrievedProduct[] = [];
  let pgVectorChunks: string[] = [];

  // 1. Try pgvector semantic search if embedding is available
  if (queryEmbedding && queryEmbedding.length > 0) {
    try {
      const { data: vectorResults, error: rpcError } = await supabase.rpc('match_products', {
        query_embedding: queryEmbedding,
        match_threshold: 0.45,
        match_count: 6,
      });

      if (!rpcError && vectorResults && vectorResults.length > 0) {
        pgVectorChunks = vectorResults.map((r: any) => r.content);
        const productIds = vectorResults.map((r: any) => r.product_id).filter(Boolean);
        if (productIds.length > 0) {
          const { data: vProducts } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);
          if (vProducts) {
            // Preserve the similarity ranking order from pgvector
            const productMap = new Map(vProducts.map((p) => [p.id, p]));
            const sortedBySimilarity = productIds
              .map((id: string) => productMap.get(id))
              .filter(Boolean) as RetrievedProduct[];
            matchedProducts.push(...sortedBySimilarity);
          }
        }
      }
    } catch {
      // pgvector function might not be executed in SQL yet; graceful fallback continues below
    }
  }

  // 2. Fetch products from Supabase
  try {
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('*');

    if (!error && allProducts) {
      // Score and rank products based on user query
      const scored = allProducts.map((p) => {
        let score = 0;
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        const ingredients = Array.isArray(p.ingredients) ? p.ingredients.join(' ').toLowerCase() : '';
        const benefits = Array.isArray(p.benefits) ? p.benefits.join(' ').toLowerCase() : '';

        // Query token matches
        const tokens = lowerQuery.split(/\s+/).filter((t) => t.length > 2);
        for (const token of tokens) {
          if (name.includes(token)) score += 10;
          if (category.includes(token)) score += 5;
          if (benefits.includes(token)) score += 4;
          if (ingredients.includes(token)) score += 4;
          if (desc.includes(token)) score += 2;
        }

        // Direct full name match
        if (lowerQuery.includes(name) || name.includes(lowerQuery)) {
          score += 25;
        }

        // Skin concerns heuristics
        if (lowerQuery.includes('dry') && (desc.includes('dry') || benefits.includes('moistur') || name.includes('oats'))) score += 8;
        if (lowerQuery.includes('oily') && (desc.includes('oil') || benefits.includes('detox') || name.includes('charcoal'))) score += 8;
        if (lowerQuery.includes('acne') || lowerQuery.includes('pimple')) {
          if (desc.includes('manjistha') || desc.includes('neem') || name.includes('manjistha')) score += 10;
        }
        if (lowerQuery.includes('hair') || lowerQuery.includes('scalp') || lowerQuery.includes('growth')) {
          if (category.includes('hair') || name.includes('tress') || name.includes('oil')) score += 10;
        }
        if (lowerQuery.includes('soap') && (category.includes('collection') || category.includes('soap'))) {
          score += 5;
        }

        return { product: p, score };
      });

      scored.sort((a, b) => b.score - a.score);

      // Take top scored products (or top 8 if broad query)
      const topMatches = scored
        .filter((item) => item.score > 0)
        .slice(0, 8)
        .map((item) => item.product);

      // If no strong keyword matches, provide representative catalog sample
      const finalProducts = topMatches.length > 0 ? topMatches : allProducts.slice(0, 8);

      // Merge unique
      const existingIds = new Set(matchedProducts.map((p) => p.id));
      for (const p of finalProducts) {
        if (!existingIds.has(p.id)) {
          matchedProducts.push(p);
          existingIds.add(p.id);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching Supabase products for context:', err);
  }

  // 3. Match relevant herbal ingredients from knowledge base
  const matchedIngredients = INGREDIENTS.filter((ing) => {
    const ingName = ing.name.toLowerCase();
    const ingDesc = ing.description.toLowerCase();
    return (
      lowerQuery.includes(ingName) ||
      ing.benefits.some((b) => lowerQuery.includes(b.toLowerCase())) ||
      ing.skinTypes.some((st) => lowerQuery.includes(st.toLowerCase())) ||
      matchedProducts.some((p) =>
        Array.isArray(p.ingredients) && p.ingredients.some((pi) => pi.toLowerCase().includes(ingName))
      )
    );
  }).slice(0, 6);

  // 4. Build Structured Text Context Chunks
  const contextChunks: string[] = [];

  // Brand Info Header
  contextChunks.push(
    `[BRAND CONTEXT]\nBrand: Vedhathiri's Skin Care\nLocation: Chetpet, Chennai, Tamil Nadu, India\nValues: 100% natural, chemical-free herbal skincare, cold-processed handmade soaps, paraben-free, cruelty-free, artisan crafted.`
  );

  // If pgvector returned chunks
  if (pgVectorChunks.length > 0) {
    contextChunks.push(`[VECTOR RETRIEVED CHUNKS]\n` + pgVectorChunks.join('\n\n'));
  }

  // Product chunks
  matchedProducts.forEach((prod, index) => {
    let sizeDetails = 'Standard Single Size';
    if (prod.sizes && Array.isArray(prod.sizes) && prod.sizes.length > 0) {
      sizeDetails = prod.sizes
        .map((s) => `${s.size}: ₹${s.price}${s.stock !== undefined ? ` (Stock: ${s.stock})` : ''}`)
        .join(', ');
    }

    const ingList = Array.isArray(prod.ingredients) && prod.ingredients.length > 0
      ? prod.ingredients.join(', ')
      : 'Natural Herbal Ingredients';

    const benefitList = Array.isArray(prod.benefits) && prod.benefits.length > 0
      ? prod.benefits.join(', ')
      : 'Gentle, nourishing, suitable for sensitive and all skin types';

    contextChunks.push(
      `--- PRODUCT CHUNK ${index + 1} ---\n` +
      `Product ID: ${prod.id}\n` +
      `Name: ${prod.name}\n` +
      `Category: ${prod.category}\n` +
      `Selling Price: ₹${prod.price}\n` +
      `Available Sizes: ${sizeDetails}\n` +
      `Stock Status: ${prod.stock > 0 ? `${prod.stock} in stock` : 'Out of Stock'}\n` +
      `Key Ingredients: ${ingList}\n` +
      `Benefits: ${benefitList}\n` +
      `Description: ${prod.description}\n` +
      `Image URL: ${prod.images && prod.images[0] ? prod.images[0] : ''}`
    );
  });

  // Ingredient chunks
  if (matchedIngredients.length > 0) {
    const ingText = matchedIngredients
      .map(
        (i) =>
          `• ${i.name} (${i.scientificName}): ${i.description} | Benefits: ${i.benefits.join(', ')} | Skin Types: ${i.skinTypes.join(', ')}`
      )
      .join('\n');
    contextChunks.push(`[HERBAL INGREDIENTS KNOWLEDGE]\n${ingText}`);
  }

  return {
    contextText: contextChunks.join('\n\n'),
    matchedProducts,
  };
}

