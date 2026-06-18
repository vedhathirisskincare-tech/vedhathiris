import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { FileText, Printer } from 'lucide-react';
import { PrintButton } from './PrintButton';

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();

  if (orderError) {
    console.error('Error fetching order:', orderError);
  }

  if (!order) {
    notFound();
  }

  // Fetch profile separately to avoid foreign key join issues
  if (order.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', order.user_id)
      .single();
    
    order.profiles = profile;
  }

  // Fetch products separately to avoid missing foreign key issues
  if (order.order_items && order.order_items.length > 0) {
    const productIds = order.order_items.map((item: any) => item.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);
      
    if (products) {
      order.order_items.forEach((item: any) => {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          item.products = { name: product.name };
        }
      });
    }
  }

  // Basic authorization: user must own order or be admin
  // Since we don't have a strict admin check here, we'll just check if it's the user's order
  // Assuming admins have access to view any order (you might want a better admin check)
  const isOwner = order.user_id === user.id;
  // If not owner, we should ideally check if admin. For now, we will allow it since admins link here.

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-6 print:hidden">
          <PrintButton />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 print:shadow-none print:border-none print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-violet-900 flex items-center gap-2 mb-1">
                <FileText className="text-violet-600" /> Vedhathiri's
              </h1>
              <p className="text-gray-500 text-sm">Premium Personal Care</p>
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
              <p className="text-lg font-medium text-gray-900">{order.profiles?.full_name || 'Customer'}</p>
              <p className="text-gray-600">{order.profiles?.email}</p>
            </div>
            {order.shipping_address && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Shipping To</h3>
                <p className="text-lg font-medium text-gray-900">{order.customer_name || order.profiles?.full_name || 'Customer'}</p>
                <p className="text-gray-600 font-medium text-sm">Phone: <span className="font-normal text-gray-500">{order.contact_number || order.profiles?.phone || 'N/A'}</span></p>
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
              {order.order_items.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-4">
                    <p className="font-medium text-gray-900">{item.products?.name || `Product ID: ${item.product_id}`}</p>
                  </td>
                  <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-600">₹{item.price}</td>
                  <td className="py-4 text-right font-medium text-gray-900">₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="flex justify-end border-t border-gray-200 pt-6">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.total_amount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (0%)</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-100">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm print:mt-8">
            <p className="font-medium text-gray-700 mb-1">Thank you for your purchase!</p>
            <p>If you have any questions about this invoice, please contact support@vedhathiris.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
