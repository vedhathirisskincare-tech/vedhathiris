-- Migration: Add product multi-sizes support and order item variant tracking

-- 1. Add 'sizes' column to public.products table
-- Format: JSONB array of objects e.g. [{"size": "100ml", "price": 499, "stock": 50}, {"size": "200ml", "price": 899, "stock": 30}]
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]'::jsonb;

-- 2. Add 'size' column to public.order_items table to record the size chosen during purchase
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS size TEXT;

-- 3. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
