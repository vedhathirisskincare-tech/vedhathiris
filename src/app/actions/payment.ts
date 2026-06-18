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

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function createRazorpayOrder(amount: number) {
  try {
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const order = await instance.orders.create(options);
    return { success: true, order };
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return { success: false, error: error.message };
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

    // 1. Create Order
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .insert({
        user_id: user?.id || null, // Allow anonymous orders if user not logged in
        total_amount: totalAmount,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        status: 'completed',
        customer_name: deliveryInfo?.customer_name || null,
        contact_number: deliveryInfo?.contact_number || null,
        shipping_address: deliveryInfo?.shipping_address || null,
      })
      .select()
      .single();

    if (orderError) throw new Error(`Order Creation Failed: ${orderError.message}`);

    // 2. Create Order Items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await adminSupabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw new Error(`Order Items Creation Failed: ${itemsError.message}`);

    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return { success: false, error: error.message };
  }
}
