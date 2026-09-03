-- Create coupons table for promo codes and discounts
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'flat'
  discount_value NUMERIC NOT NULL, -- e.g., 10 (for 10%) or 100 (for ₹100 flat)
  min_order_amount NUMERIC DEFAULT 0, -- minimum cart total required
  max_discount_amount NUMERIC, -- max cap for percentage discount (e.g., max ₹200 off)
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Allow everyone (including guest / anon) to read active coupons
CREATE POLICY "Active coupons are viewable by everyone" ON public.coupons
  FOR SELECT USING (is_active = true);

-- Allow authenticated users (admins) to manage coupons
CREATE POLICY "Coupons are manageable by authenticated users" ON public.coupons
  FOR ALL USING (auth.role() = 'authenticated');

-- Ensure orders table has coupon_code and discount_amount columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='coupon_code') THEN
        ALTER TABLE public.orders ADD COLUMN coupon_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='discount_amount') THEN
        ALTER TABLE public.orders ADD COLUMN discount_amount NUMERIC DEFAULT 0;
    END IF;
END $$;

-- Insert default starter promo codes
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
VALUES 
  ('VEDHA10', 'Get 10% OFF on all natural products', 'percentage', 10, 200, 300, true),
  ('FLAT50', 'Flat ₹50 OFF on orders above ₹499', 'flat', 50, 499, 50, true),
  ('GLOW20', 'Special 20% OFF on orders above ₹800', 'percentage', 20, 800, 500, true)
ON CONFLICT (code) DO NOTHING;
