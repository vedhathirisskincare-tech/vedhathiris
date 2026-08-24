-- Create carousel_offers table
CREATE TABLE IF NOT EXISTS public.carousel_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on carousel_offers
ALTER TABLE public.carousel_offers ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read carousel_offers
CREATE POLICY "Carousel offers are viewable by everyone" ON public.carousel_offers
  FOR SELECT USING (true);

-- Allow authenticated users (admins) to manage carousel_offers
CREATE POLICY "Carousel offers are manageable by authenticated users" ON public.carousel_offers
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial offer if you want
INSERT INTO public.carousel_offers (message, is_active)
VALUES 
  ('Use code VEDHATHIRIS for 10% off your first order!', true);
