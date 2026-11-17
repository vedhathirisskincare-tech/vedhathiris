import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerSupabase } from '@/utils/supabase/server';

export const runtime = 'nodejs';

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}

async function ensureUserProfileExists(
  adminSupabase: any,
  userId: string,
  deliveryInfo?: { customer_name?: string | null; contact_number?: string | null }
) {
  try {
    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingProfile) {
      let email: string | null = null;
      let fullName: string | null = deliveryInfo?.customer_name || 'Customer';
      let phone: string | null = deliveryInfo?.contact_number || null;

      try {
        const { data: authData } = await adminSupabase.auth.admin.getUserById(userId);
        if (authData?.user) {
          email = authData.user.email || null;
          fullName = authData.user.user_metadata?.full_name || fullName;
          phone = authData.user.user_metadata?.phone_number || phone;
        }
      } catch (authErr) {
        console.warn('Could not query auth user for profile creation:', authErr);
      }

      await adminSupabase.from('profiles').upsert(
        {
          id: userId,
          email,
          full_name: fullName,
          phone,
          role: 'user',
        },
        { onConflict: 'id' }
      );
    }
  } catch (err) {
    console.warn('Error in ensureUserProfileExists:', err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentData, items, totalAmount, deliveryInfo, couponInfo, userId } = body;

    if (!paymentData?.razorpay_order_id || !paymentData?.razorpay_payment_id || !paymentData?.razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing payment signature data.' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart items cannot be empty.' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    if (!secret) {
      return NextResponse.json({ success: false, error: 'Server payment configuration missing.' }, { status: 500 });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${paymentData.razorpay_order_id}|${paymentData.razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== paymentData.razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature.' }, { status: 400 });
    }

    // Determine current user
    let authenticatedUserId: string | null = userId || null;
    try {
      const serverSupabase = await createServerSupabase();
      const { data: { user } } = await serverSupabase.auth.getUser();
      if (user?.id) {
        authenticatedUserId = user.id;
      }
    } catch {
      // Allow anonymous checkout if auth check fails
    }

    const adminSupabase = getAdminSupabase();

    // Ensure profile row exists in profiles table so foreign key constraint never fails
    if (authenticatedUserId) {
      await ensureUserProfileExists(adminSupabase, authenticatedUserId, deliveryInfo);
    }

    // 1. Create Order
    const orderPayload: any = {
      user_id: authenticatedUserId,
      total_amount: Number(totalAmount) || 0,
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      status: 'completed',
      customer_name: deliveryInfo?.customer_name || null,
      contact_number: deliveryInfo?.contact_number || null,
      shipping_address: deliveryInfo?.shipping_address || null,
    };

    if (couponInfo?.coupon_code) {
      orderPayload.coupon_code = couponInfo.coupon_code;
    }
    if (typeof couponInfo?.discount_amount === 'number') {
      orderPayload.discount_amount = couponInfo.discount_amount;
    }

    let { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    // Fallback if coupon_code column is not present in schema
    if (orderError && (orderError.message.includes('coupon_code') || orderError.message.includes('discount_amount'))) {
      delete orderPayload.coupon_code;
      delete orderPayload.discount_amount;
      const fallbackResult = await adminSupabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();
      order = fallbackResult.data;
      orderError = fallbackResult.error;
    }

    // Fallback if user_id foreign key constraint violates
    if (orderError && (orderError.code === '23503' || orderError.message?.includes('orders_user_id_fkey') || orderError.message?.includes('profiles'))) {
      console.warn('Foreign key violation for user_id on orders. Retrying order creation without user_id to ensure customer order is saved.');
      const fallbackResult = await adminSupabase
        .from('orders')
        .insert({ ...orderPayload, user_id: null })
        .select()
        .single();
      order = fallbackResult.data;
      orderError = fallbackResult.error;
    }

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { success: false, error: `Order record creation failed: ${orderError?.message || 'Unknown database error'}` },
        { status: 500 }
      );
    }

    // 2. Create Order Items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      size: item.selectedSize || item.size || null,
    }));

    let { error: itemsError } = await adminSupabase
      .from('order_items')
      .insert(orderItems);

    // If 'size' column doesn't exist yet on order_items table, retry without size
    if (itemsError && itemsError.message?.includes("'size' column")) {
      const itemsWithoutSize = orderItems.map(({ size, ...rest }: any) => rest);
      const fallback = await adminSupabase
        .from('order_items')
        .insert(itemsWithoutSize);
      itemsError = fallback.error;
    }

    if (itemsError) {
      console.error('Order items error:', itemsError);
      return NextResponse.json({ success: true, orderId: order.id, warning: itemsError.message });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error('Payment verification error in API route:', error);
    return NextResponse.json({ success: false, error: error.message || 'Payment verification failed' }, { status: 500 });
  }
}
