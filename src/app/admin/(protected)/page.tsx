import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { DeliveryStatusSelect } from './DeliveryStatusSelect'
import { DeleteOrderButton } from './orders/DeleteOrderButton'
import { StoreControlsCard } from './StoreControlsCard'
import { getVisitorPopupSetting, getAiAssistantSetting } from './actions'
import { FileText, Package } from 'lucide-react'

export default async function AdminDashboard() {
  // Use service role key to bypass RLS because admin is authenticated via custom admin_session cookie
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: reviewsCount } = await supabase
    .from('product_reviews')
    .select('*', { count: 'exact', head: true })

  const { data: recentOrdersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (ordersError) {
    console.error("Error fetching orders for admin:", ordersError)
  }

  // Fetch profiles, order items, and products for rich order details
  let recentOrders: any[] = []
  if (recentOrdersData && recentOrdersData.length > 0) {
    const userIds = [...new Set(recentOrdersData.map(o => o.user_id).filter(Boolean))]
    const orderIds = recentOrdersData.map(o => o.id)

    // Parallel fetch customer profiles and order items
    const [profilesRes, orderItemsRes] = await Promise.all([
      userIds.length > 0
        ? supabase.from('profiles').select('id, full_name, email, phone').in('id', userIds)
        : Promise.resolve({ data: [] }),
      supabase.from('order_items').select('*').in('order_id', orderIds),
    ])

    const profiles = profilesRes.data || []
    const orderItems = orderItemsRes.data || []

    // Fetch product details for all product_ids
    const productIds = [...new Set(orderItems.map((item: any) => item.product_id).filter(Boolean))]
    const { data: products } = productIds.length > 0
      ? await supabase.from('products').select('id, name, images, category').in('id', productIds)
      : { data: [] }

    const productMap = new Map((products || []).map((p: any) => [p.id, p]))

    // Group items by order_id
    const itemsByOrder: Record<string, any[]> = {}
    orderItems.forEach((item: any) => {
      const prod = productMap.get(item.product_id)
      const enriched = {
        ...item,
        product_name: prod?.name || `Product (${item.product_id?.slice(0, 8)}...)`,
        product_image: prod?.images?.[0] || null,
        category: prod?.category || '',
      }
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = []
      }
      itemsByOrder[item.order_id].push(enriched)
    })

    recentOrders = recentOrdersData.map(order => {
      const profile = profiles.find(p => p.id === order.user_id)
      return {
        ...order,
        profiles: profile,
        order_items: itemsByOrder[order.id] || [],
      }
    })
  }

  const [initialPopupEnabled, initialAiChatEnabled] = await Promise.all([
    getVisitorPopupSetting(),
    getAiAssistantSetting(),
  ])

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-2">Users</h3>
          <p className="text-3xl font-bold text-gray-900">{usersCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-2">Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{ordersCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-2">Reviews</h3>
          <p className="text-3xl font-bold text-gray-900">{reviewsCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-green-600">₹{recentOrders?.reduce((acc: number, order: any) => acc + (order.total_amount || 0), 0) || 0}</p>
        </div>
      </div>

      {/* Interactive Store Feature Controls (AI Chat Bot, Visitor Popup) */}
      <StoreControlsCard
        initialAiChatEnabled={initialAiChatEnabled}
        initialPopupEnabled={initialPopupEnabled}
      />

      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Order ID</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Customer</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Items Ordered</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Date</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Payment</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Amount</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Delivery Status</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentOrders?.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50/70 transition-colors align-top">
                {/* Order ID */}
                <td className="px-4 md:px-6 py-4 text-sm font-mono text-gray-600 whitespace-nowrap">#{order.id.slice(0, 8)}</td>

                {/* Customer */}
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-semibold text-gray-900">{order.customer_name || order.profiles?.full_name || 'Guest User'}</p>
                  <p className="text-xs text-gray-500">{order.profiles?.email || 'N/A'}</p>
                  {(order.contact_number || order.profiles?.phone) && (
                    <p className="text-xs text-gray-600 font-medium mt-0.5">{order.contact_number || order.profiles?.phone}</p>
                  )}
                </td>

                {/* Items Ordered */}
                <td className="px-4 md:px-6 py-4 min-w-[220px]">
                  {order.order_items && order.order_items.length > 0 ? (
                    <div className="space-y-1.5">
                      {order.order_items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-1.5 bg-gray-50/80 rounded-lg border border-gray-100">
                          <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white shrink-0 border border-gray-200">
                            {item.product_image ? (
                              <Image
                                src={item.product_image}
                                alt={item.product_name}
                                fill
                                sizes="32px"
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-violet-50 text-violet-600">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-900 truncate" title={item.product_name}>
                              {item.product_name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                              {item.size && (
                                <span className="font-semibold bg-violet-100 text-violet-800 px-1 rounded text-[10px]">
                                  {item.size}
                                </span>
                              )}
                              <span className="font-bold text-gray-800">×{item.quantity}</span>
                              <span>•</span>
                              <span className="text-gray-700 font-medium">₹{item.price * item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No items detailed</span>
                  )}
                </td>

                {/* Date */}
                <td className="px-4 md:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>

                {/* Payment */}
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize
                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                  </span>
                </td>

                {/* Amount */}
                <td className="px-4 md:px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">₹{order.total_amount}</td>

                {/* Delivery Status */}
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <DeliveryStatusSelect orderId={order.id} initialStatus={order.delivery_status} />
                </td>

                {/* Actions */}
                <td className="px-4 md:px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/invoice/${order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg font-semibold text-xs transition-colors border border-violet-200"
                      title="View & Print Invoice"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Invoice
                    </a>
                    <DeleteOrderButton orderId={order.id} orderNumber={order.id.slice(0, 8)} />
                  </div>
                </td>
              </tr>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <tr>
                <td colSpan={8} className="px-4 md:px-6 py-8 text-center text-gray-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
