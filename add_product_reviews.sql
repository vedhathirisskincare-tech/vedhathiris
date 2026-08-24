-- Drop existing objects if they exist so we can recreate them
DROP VIEW IF EXISTS public.product_rating_summary;
DROP TABLE IF EXISTS public.product_reviews;

-- Create the product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, user_id) -- A user can only leave one review per product
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.product_reviews
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert their own reviews
CREATE POLICY "Users can insert their own reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" ON public.product_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create a view for product rating summaries (optional, but very helpful for fetching aggregates easily)
CREATE OR REPLACE VIEW public.product_rating_summary AS
SELECT 
  product_id,
  ROUND(AVG(rating)::numeric, 1) as average_rating,
  COUNT(rating) as review_count
FROM public.product_reviews
GROUP BY product_id;

-- Ensure the view is accessible by everyone
GRANT SELECT ON public.product_rating_summary TO anon, authenticated;
