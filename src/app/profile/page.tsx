import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { logout } from '../login/actions'
import { ShoppingBag, CreditCard, LogOut, User } from 'lucide-react'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: ordersData } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  let orders = ordersData || [];

  if (orders.length > 0) {
    const productIds = new Set();
    orders.forEach((o: any) => o.order_items?.forEach((item: any) => productIds.add(item.product_id)));
    
    if (productIds.size > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', Array.from(productIds));
        
      if (products) {
        orders = orders.map((order: any) => ({
          ...order,
          order_items: order.order_items?.map((item: any) => {
            const product = products.find(p => p.id === item.product_id);
            return { ...item, products: product ? { name: product.name } : null };
          })
        }));
      }
    }
  }

  const activeTab = params.tab || 'orders'

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-6rem)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r flex flex-col sm:flex-row md:flex-col justify-between sm:items-center md:items-stretch shrink-0">
        <div className="p-4 md:p-6 border-b sm:border-b-0 md:border-b flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold text-lg shrink-0">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 truncate w-36 sm:w-28 md:w-32" title={profile?.full_name || 'User'}>
              {profile?.full_name || 'User'}
            </h2>
            <p className="text-xs text-gray-500 truncate w-36 sm:w-28 md:w-32" title={user.email}>{user.email}</p>
          </div>
        </div>
        
        <nav className="p-4 flex flex-row md:flex-col gap-2 md:gap-1 items-center md:items-stretch border-t sm:border-t-0 md:border-t border-gray-100 sm:border-l md:border-l-0 flex-1 justify-start sm:justify-end md:justify-start">
          <a href="?tab=orders" className={`flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm whitespace-nowrap ${activeTab === 'orders' ? 'bg-violet-50 text-violet-600' : 'text-gray-700 hover:bg-gray-50'}`}>
            <ShoppingBag className="w-4 h-4" />
            Order History
          </a>

          <form action={logout} className="md:mt-4 md:pt-4 md:border-t md:border-gray-100 w-auto sm:w-auto md:w-full">
            <button className="flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm whitespace-nowrap w-full cursor-pointer">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 capitalize">
          Your Orders
        </h1>

        {activeTab === 'orders' && (
          <div>
            {!orders || orders.length === 0 ? (
              <div className="bg-white rounded-2xl border p-12 text-center text-gray-500 shadow-sm">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                          ${order.delivery_status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                            order.delivery_status === 'Packed' ? 'bg-blue-100 text-blue-800' : 
                            order.delivery_status === 'Arriving in next days' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          Delivery: {order.delivery_status || 'Processing'}
                        </span>

                        <p className="font-bold text-lg text-gray-900 ml-2">₹{order.total_amount}</p>
                        <a 
                          href={`/invoice/${order.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-3 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-lg text-sm font-medium transition-colors sm:ml-2"
                        >
                          Invoice
                        </a>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Items</h4>
                      <div className="space-y-2">
                        {order.order_items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-800">
                              <span className="text-gray-500 mr-2">{item.quantity}x</span> 
                              {item.products?.name || `Product ID: ${item.product_id}`}
                            </span>
                            <span className="text-gray-900 font-medium">₹{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {order.shipping_address && (
                      <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery Details</h4>
                        <div className="bg-gray-50 rounded-xl p-3 text-gray-600">
                          <p className="font-semibold text-gray-800">{order.customer_name || 'N/A'}</p>
                          <p className="text-xs mt-0.5 font-medium">Phone: <span className="font-normal text-gray-500">{order.contact_number || 'N/A'}</span></p>
                          <p className="text-xs mt-1 text-gray-500 whitespace-pre-line">{order.shipping_address}</p>
                        </div>
                      </div>
                    )}
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
