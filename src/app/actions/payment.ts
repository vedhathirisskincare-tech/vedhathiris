'use server'

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { CartItem } from '@/store/cartStore';

// Safe bypass for admin/backend inserts
function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

  if (!key_id || !key_secret) {
    throw new Error('Razorpay API keys (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) are missing in environment variables.');
  }

  return {
    instance: new Razorpay({ key_id, key_secret }),
    keyId: key_id,
  };
}

export async function createRazorpayOrder(amount: number) {
  try {
    const { instance, keyId } = getRazorpayInstance();

    // Ensure minimum 1 INR for Razorpay order
    const safeAmount = Math.max(1, amount);

    const options = {
      amount: Math.round(safeAmount * 100), // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const order = await instance.orders.create(options);
    return { success: true, order, keyId };
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return { success: false, error: error.message };
  }
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

export async function verifyPaymentAndSaveOrder(
  paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
  cartItems: CartItem[],
  totalAmount: number,
  deliveryInfo?: {
    customer_name: string;
    contact_number: string;
    shipping_address: string;
  },
  couponInfo?: {
    coupon_code?: string | null;
    discount_amount?: number;
  }
) {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(paymentData.razorpay_order_id + '|' + paymentData.razorpay_payment_id)
      .digest('hex');

    if (generatedSignature !== paymentData.razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    // Get current user if any
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();

    // Use admin client to bypass RLS for inserting orders
    const adminSupabase = getAdminSupabase();

    // Ensure profile row exists in profiles table so foreign key constraint never fails
    if (user?.id) {
      await ensureUserProfileExists(adminSupabase, user.id, deliveryInfo);
    }

    // 1. Create Order
    const orderPayload: any = {
      user_id: user?.id || null, // Allow anonymous orders if user not logged in
      total_amount: totalAmount,
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

    // Fallback if coupon_code column is not yet present in schema cache
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

    if (orderError) throw new Error(`Order Creation Failed: ${orderError.message}`);

    // 2. Create Order Items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      size: item.selectedSize || null,
    }));

    let { error: itemsError } = await adminSupabase
      .from('order_items')
      .insert(orderItems);

    // If 'size' column doesn't exist yet on order_items table, retry without size
    if (itemsError && itemsError.message?.includes("'size' column")) {
      const itemsWithoutSize = orderItems.map(({ size, ...rest }) => rest);
      const fallback = await adminSupabase
        .from('order_items')
        .insert(itemsWithoutSize);
      itemsError = fallback.error;
    }

    if (itemsError) throw new Error(`Order Items Creation Failed: ${itemsError.message}`);

    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return { success: false, error: error.message };
  }
}
