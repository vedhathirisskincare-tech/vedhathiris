import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { logout } from '../login/actions'
import { ShoppingBag, LogOut, FileText, Package, Clock, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Profile & Orders',
  robots: {
    index: false,
    follow: false,
  },
}

function parseProductImages(images: any): string[] {
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      if (images.startsWith('{') && images.endsWith('}')) {
        return images.slice(1, -1).split(',').map((s) => s.replace(/^"|"$/g, '').trim());
      }
    }
  }
  return [];
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  const params = await searchParams;

  if (error || !user) {
    redirect('/login')
  }

  // Ensure profile is fetched safely
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // If profile doesn't exist, create it via admin client
  if (!profile) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const adminDb = createAdminClient(supabaseUrl, supabaseServiceKey);
      
      const newProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || 'Customer',
        phone: user.user_metadata?.phone_number || null,
        role: 'user',
      };
      await adminDb.from('profiles').upsert(newProfile, { onConflict: 'id' });
      profile = newProfile as any;
    } catch (e) {
      console.warn('Could not auto-create missing profile in profile page:', e);
    }
  }

  // Fetch orders by user_id or matching phone
  const userPhone = profile?.phone || user.user_metadata?.phone_number;
  let ordersQuery = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (userPhone && typeof userPhone === 'string' && userPhone.trim().length >= 8) {
    ordersQuery = ordersQuery.or(`user_id.eq.${user.id},contact_number.eq.${userPhone.trim()}`);
  } else {
    ordersQuery = ordersQuery.eq('user_id', user.id);
  }

  const { data: ordersData } = await ordersQuery;
  let orders = ordersData || [];

  if (orders.length > 0) {
    const productIds = new Set<string>();
    orders.forEach((o: any) => o.order_items?.forEach((item: any) => {
      if (item.product_id) productIds.add(item.product_id);
    }));
    
    if (productIds.size > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, images, category')
        .in('id', Array.from(productIds));
        
      if (products) {
        orders = orders.map((order: any) => ({
          ...order,
          order_items: order.order_items?.map((item: any) => {
            const product = products.find(p => p.id === item.product_id);
            const imgs = product ? parseProductImages(product.images) : [];
            return {
              ...item,
              products: product ? {
                name: product.name,
                image: imgs[0] || null,
                category: product.category,
              } : null
            };
          })
        }));
      }
    }
  }

  const activeTab = params.tab || 'orders';

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-6rem)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r flex flex-col sm:flex-row md:flex-col justify-between sm:items-center md:items-stretch shrink-0">
        <div className="p-4 md:p-6 border-b sm:border-b-0 md:border-b flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-lg shrink-0">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : (user.email?.charAt(0).toUpperCase() || 'U')}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 truncate w-36 sm:w-28 md:w-32" title={profile?.full_name || 'Customer'}>
              {profile?.full_name || 'Customer'}
            </h2>
            <p className="text-xs text-gray-500 truncate w-36 sm:w-28 md:w-32" title={user.email}>{user.email}</p>
          </div>
        </div>
        
        <nav className="p-4 flex flex-row md:flex-col gap-2 md:gap-1 items-center md:items-stretch border-t sm:border-t-0 md:border-t border-gray-100 sm:border-l md:border-l-0 flex-1 justify-start sm:justify-end md:justify-start">
          <Link
            href="/profile?tab=orders"
            className={`flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-violet-50 text-violet-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Order History
          </Link>

          <form action={logout} className="md:mt-4 md:pt-4 md:border-t md:border-gray-100 w-auto sm:w-auto md:w-full">
            <button className="flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm whitespace-nowrap w-full cursor-pointer">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track your past purchases, delivery status, and view official invoices</p>
          </div>
        </div>

        {activeTab === 'orders' && (
          <div>
            {!orders || orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 shadow-xs">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-800">You haven't placed any orders yet.</p>
                <p className="text-sm text-gray-400 mt-1 mb-6">Discover our 100% natural handmade soaps and herbal hair rituals.</p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                >
                  Shop The Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-gray-50/80 px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                            order.delivery_status === 'Delivered'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : order.delivery_status === 'Packed'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : order.delivery_status === 'Arriving in next days'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {order.delivery_status || 'Processing'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Total Amount</span>
                          <span className="font-extrabold text-base sm:text-lg text-gray-900">₹{order.total_amount}</span>
                        </div>
                        <Link
                          href={`/invoice/${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-violet-700 hover:bg-violet-50 border border-violet-200 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Invoice
                        </Link>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="p-5">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</h4>
                      <div className="space-y-3">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {item.products?.image ? (
                                  <Image
                                    src={item.products.image}
                                    alt={item.products?.name || 'Product'}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm text-gray-900 truncate">
                                  {item.products?.name || `Product ID: ${item.product_id}`}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  {item.size && (
                                    <span className="text-[11px] font-bold text-violet-700 bg-violet-100/80 px-2 py-0.5 rounded-md">
                                      {item.size}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    Qty: <strong className="text-gray-700">{item.quantity}</strong> × ₹{item.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-gray-900 shrink-0 ml-3">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address Details */}
                      {order.shipping_address && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between text-xs text-gray-600 gap-3">
                          <div>
                            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Delivering To</span>
                            <p className="font-semibold text-gray-900">{order.customer_name || 'Customer'}</p>
                            {order.contact_number && (
                              <p className="text-gray-500 mt-0.5">Contact: {order.contact_number}</p>
                            )}
                            <p className="text-gray-500 whitespace-pre-line mt-1">{order.shipping_address}</p>
                          </div>
                          {order.razorpay_payment_id && (
                            <div className="sm:text-right shrink-0">
                              <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Payment Reference</span>
                              <p className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded-md inline-block">
                                {order.razorpay_payment_id}
                              </p>
                              <span className="block text-emerald-600 font-semibold mt-1">✓ Paid via Razorpay</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
