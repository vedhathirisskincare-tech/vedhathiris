-- Migration: Add benefits column to public.products table
-- Stores an array of key benefits for each product (e.g. ['Hair Fall Reduction', 'Deep Cleansing'])

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}';

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

