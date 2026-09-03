'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export interface Coupon {
  id: string
  code: string
  description?: string | null
  discount_type: 'percentage' | 'flat'
  discount_value: number
  min_order_amount: number
  max_discount_amount?: number | null
  is_active: boolean
  created_at?: string
}

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createSupabaseClient(supabaseUrl, supabaseServiceKey)
}

// Fallback coupons in case database table is awaiting migration
const DEFAULT_COUPONS: Coupon[] = [
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

export async function getAvailableCoupons(): Promise<Coupon[]> {
  try {
    const supabase = getAdminSupabase()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return DEFAULT_COUPONS
    }

    return data as Coupon[]
  } catch (err) {
    console.warn('Could not fetch coupons from DB, using defaults:', err)
    return DEFAULT_COUPONS
  }
}

export async function validateCoupon(code: string, subtotal: number): Promise<{
  success: boolean
  coupon?: Coupon
  discountAmount?: number
  finalTotal?: number
  error?: string
}> {
  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) {
    return { success: false, error: 'Please enter a promo code.' }
  }

  let coupon: Coupon | null = null

  try {
    const supabase = getAdminSupabase()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', cleanCode)
      .eq('is_active', true)
      .maybeSingle()

    if (!error && data) {
      coupon = data as Coupon
    }
  } catch (err) {
    console.warn('Error querying coupons DB:', err)
  }

  // Check fallback default coupons if not found in DB
  if (!coupon) {
    coupon = DEFAULT_COUPONS.find(c => c.code.toUpperCase() === cleanCode && c.is_active) || null
  }

  if (!coupon) {
    return { success: false, error: `Promo code "${cleanCode}" is invalid or expired.` }
  }

  // Check minimum order amount
  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
    return {
      success: false,
      error: `Coupon "${cleanCode}" requires a minimum order of ₹${coupon.min_order_amount}. Add ₹${coupon.min_order_amount - subtotal} more to apply!`,
    }
  }

  // Calculate discount amount
  let discount = 0
  if (coupon.discount_type === 'percentage') {
    discount = Math.round((subtotal * coupon.discount_value) / 100)
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount
    }
  } else {
    discount = Math.min(coupon.discount_value, subtotal)
  }

  const finalTotal = Math.max(0, subtotal - discount)

  return {
    success: true,
    coupon,
    discountAmount: discount,
    finalTotal,
  }
}
