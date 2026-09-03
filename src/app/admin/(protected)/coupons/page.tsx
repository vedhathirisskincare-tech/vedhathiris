import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { CouponClient } from './CouponClient'
import type { Coupon } from '@/app/actions/coupon'

export const metadata = {
  title: 'Manage Coupons | Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminCouponsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

  let coupons: Coupon[] = []

  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      coupons = data as Coupon[]
    }
  } catch (err) {
    console.error('Error fetching admin coupons:', err)
  }

  // Fallback starter coupons if database table is currently empty
  if (coupons.length === 0) {
    coupons = [
      {
        id: 'c1',
        code: 'VEDHA10',
        description: 'Get 10% OFF on all natural products',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 200,
        max_discount_amount: 300,
        is_active: true,
      },
      {
        id: 'c2',
        code: 'FLAT50',
        description: 'Flat ₹50 OFF on orders above ₹499',
        discount_type: 'flat',
        discount_value: 50,
        min_order_amount: 499,
        max_discount_amount: 50,
        is_active: true,
      },
      {
        id: 'c3',
        code: 'GLOW20',
        description: 'Special 20% OFF on orders above ₹800',
        discount_type: 'percentage',
        discount_value: 20,
        min_order_amount: 800,
        max_discount_amount: 500,
        is_active: true,
      },
    ]
  }

  return <CouponClient initialCoupons={coupons} />
}
