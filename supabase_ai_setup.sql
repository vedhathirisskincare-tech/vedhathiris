-- ========================================================
-- Supabase AI & pgvector Setup for Vedhathiri's Skin Care
-- ========================================================

-- 1. Enable pgvector extension

CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create product_embeddings table
CREATE TABLE IF NOT EXISTS public.product_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
  content TEXT NOT NULL,
  embedding vector(768),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure unique index on product_id if table was already created
CREATE UNIQUE INDEX IF NOT EXISTS product_embeddings_product_id_idx ON public.product_embeddings (product_id);

-- 3. Enable RLS on product_embeddings
ALTER TABLE public.product_embeddings ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Allow public read on product_embeddings" ON public.product_embeddings;
CREATE POLICY "Allow public read on product_embeddings" ON public.product_embeddings
  FOR SELECT USING (true);

-- 5. Semantic Match Function for pgvector
CREATE OR REPLACE FUNCTION match_products (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 6
)
RETURNS TABLE (
  id UUID,
  product_id UUID,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.product_id,
    pe.content,
    (1 - (pe.embedding <=> query_embedding))::float AS similarity
  FROM public.product_embeddings pe
  WHERE (1 - (pe.embedding <=> query_embedding)) > match_threshold
  ORDER BY pe.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

