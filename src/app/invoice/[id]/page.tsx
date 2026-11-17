import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { FileText, ShieldCheck } from 'lucide-react';
import { PrintButton } from './PrintButton';

export const metadata: Metadata = {
  title: 'Order Invoice',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  // 1. Check if user is authenticated as Store Admin via admin_session cookie
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  const isAdmin = adminSession?.value === 'authenticated';

  // 2. If not admin, check customer auth
  let currentUser: any = null;
  if (!isAdmin) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      currentUser = user;
    } catch {
      currentUser = null;
    }
  }

  // 3. Use admin service role client to fetch the order and avoid RLS or join blocks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const db = createSupabaseAdminClient(supabaseUrl, supabaseServiceKey);

  const { data: order, error: orderError } = await db
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .maybeSingle();

  if (orderError) {
    console.error('Error fetching order for invoice:', orderError);
  }

  if (!order) {
    notFound();
  }

  // 4. Access Authorization:
  // - Admin always has full access
  // - Registered customer has access to their own order
  // - Guest orders (order.user_id === null) are accessible directly via order link
  const isOwner = Boolean(currentUser && order.user_id && order.user_id === currentUser.id);
  const isGuestOrder = !order.user_id;

  if (!isAdmin && !isOwner && !isGuestOrder) {
    redirect(`/login?redirect=/invoice/${id}`);
  }

  // 5. Fetch profile details if user_id exists
  if (order.user_id) {
    const { data: profile } = await db
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', order.user_id)
      .maybeSingle();

    order.profiles = profile;
  }

  // 6. Fetch products details for items
  if (order.order_items && order.order_items.length > 0) {
    const productIds = order.order_items.map((item: any) => item.product_id);
    const { data: products } = await db
      .from('products')
      .select('id, name, images')
      .in('id', productIds);

    if (products) {
      order.order_items.forEach((item: any) => {
        const product = products.find((p) => p.id === item.product_id);
        if (product) {
          item.products = { name: product.name, image: product.images?.[0] };
        }
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-violet-700 transition-colors shadow-2xs"
              >
                ← Back to Admin Orders
              </Link>
              <span className="text-[11px] font-bold bg-violet-100 text-violet-800 px-2.5 py-1 rounded-lg border border-violet-200">
                Admin View
              </span>
            </div>
          ) : (
            <Link
              href="/profile?tab=orders"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-violet-700 transition-colors shadow-2xs"
            >
              ← Back to My Orders
            </Link>
          )}

          <PrintButton />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 print:shadow-none print:border-none print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-violet-900 flex items-center gap-2 mb-1">
                <FileText className="text-violet-600" /> Vedhathiri's
              </h1>
              <p className="text-gray-500 text-sm">Natural Skincare & Personal Care</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-900 mb-1">INVOICE</h2>
              <p className="text-gray-500 font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm text-gray-500 mt-2">
                Date: {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Customer Details & Shipping Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Billed To</h3>
              <p className="text-lg font-medium text-gray-900">
                {order.customer_name || order.profiles?.full_name || 'Customer'}
              </p>
              <p className="text-gray-600 text-sm">
                {order.profiles?.email || 'Guest Customer'}
              </p>
              {(order.contact_number || order.profiles?.phone) && (
                <p className="text-gray-600 text-sm mt-0.5">
                  Phone: {order.contact_number || order.profiles?.phone}
                </p>
              )}
            </div>
            {order.shipping_address && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Shipping To</h3>
                <p className="text-lg font-medium text-gray-900">
                  {order.customer_name || order.profiles?.full_name || 'Customer'}
                </p>
                <p className="text-gray-600 font-medium text-sm">
                  Phone: <span className="font-normal text-gray-500">{order.contact_number || order.profiles?.phone || 'N/A'}</span>
                </p>
                <p className="text-gray-500 text-sm whitespace-pre-line mt-1">{order.shipping_address}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <table className="w-full text-left mb-10">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-sm font-bold text-gray-400 uppercase tracking-wider">Item / Description</th>
                <th className="py-3 text-sm font-bold text-gray-400 uppercase tracking-wider text-center">Qty</th>
                <th className="py-3 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Price</th>
                <th className="py-3 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.order_items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{item.products?.name || `Product ID: ${item.product_id}`}</p>
                      {item.size && (
                        <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
                          {item.size}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-600">₹{item.price}</td>
                  <td className="py-4 text-right font-medium text-gray-900">₹{item.price * item.quantity}</td>
                </tr>
              ))}
              {(!order.order_items || order.order_items.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500 text-sm">
                    Total order items: 1 (Standard Order)
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Summary */}
          {(() => {
            const itemsSubtotal = order.order_items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || order.total_amount;
            const discount = order.discount_amount || (order.coupon_code ? Math.max(0, itemsSubtotal - order.total_amount) : 0);

            return (
              <div className="flex justify-end border-t border-gray-200 pt-6">
                <div className="w-full max-w-sm space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{itemsSubtotal}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Tax (0%)</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-100">
                    <span>Total Paid</span>
                    <span>₹{order.total_amount}</span>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm print:mt-8">
            <p className="font-medium text-gray-700 mb-1">Thank you for choosing Vedhathiri's!</p>
            <p>100% Chemical-free & Natural Personal Care • Chetpet, Chennai</p>
          </div>
        </div>
      </div>
    </div>
  );
}
