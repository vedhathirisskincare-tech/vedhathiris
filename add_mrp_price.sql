-- Migration: Add mrp_price column to public.products table
-- Allows setting an MRP (Maximum Retail Price) which displays striked-out alongside the Selling Price

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS mrp_price NUMERIC;

-- Optional: Initialize mrp_price to existing price for records where it's null
-- UPDATE public.products SET mrp_price = price WHERE mrp_price IS NULL;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

