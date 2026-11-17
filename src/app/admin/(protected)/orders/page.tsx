import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { DeliveryStatusSelect } from '../DeliveryStatusSelect'
import { DeleteOrderButton } from './DeleteOrderButton'
import { Tag, FileText, Package } from 'lucide-react'

export const metadata = {
  title: 'Manage Orders | Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminOrdersPage() {
  // Use service role key to bypass RLS because admin is authenticated via custom admin_session cookie
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

  const { data: recentOrdersData, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
  }

  let allOrders: any[] = []
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

    allOrders = recentOrdersData.map(order => {
      const profile = profiles.find(p => p.id === order.user_id)
      return {
        ...order,
        profiles: profile,
        order_items: itemsByOrder[order.id] || [],
      }
    })
  }

  const upcomingOrders = allOrders.filter(o => o.delivery_status !== 'Delivered')
  const closedOrders = allOrders.filter(o => o.delivery_status === 'Delivered')

  const renderTable = (ordersArray: any[], emptyMessage: string) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mb-10">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Order ID</th>
            <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Customer</th>
            <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Items Ordered</th>
            <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Delivery Address</th>
            <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Date</th>
            <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Payment</th>
            <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Amount</th>
            <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Delivery Status</th>
            <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {ordersArray.map((order: any) => (
            <tr key={order.id} className="hover:bg-gray-50/70 transition-colors align-top">
              {/* Order ID */}
              <td className="px-4 md:px-6 py-4 text-sm font-mono font-medium text-gray-600 whitespace-nowrap">
                #{order.id.slice(0, 8)}
              </td>

              {/* Customer */}
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <p className="text-sm font-semibold text-gray-900">{order.customer_name || order.profiles?.full_name || 'Guest Customer'}</p>
                <p className="text-xs text-gray-500">{order.profiles?.email || 'N/A'}</p>
                {(order.contact_number || order.profiles?.phone) && (
                  <p className="text-xs text-gray-600 font-medium mt-0.5">{order.contact_number || order.profiles?.phone}</p>
                )}
              </td>

              {/* Items Ordered */}
              <td className="px-4 md:px-6 py-4 min-w-[240px]">
                {order.order_items && order.order_items.length > 0 ? (
                  <div className="space-y-2">
                    {order.order_items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2.5 p-1.5 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 border border-gray-200">
                          {item.product_image ? (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              fill
                              sizes="36px"
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
                              <span className="font-semibold bg-violet-100 text-violet-800 px-1.5 py-0.2 rounded text-[10px]">
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

              {/* Delivery Info */}
              <td className="px-4 md:px-6 py-4 max-w-xs">
                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed" title={order.shipping_address || 'N/A'}>
                  {order.shipping_address || 'N/A'}
                </p>
              </td>

              {/* Date */}
              <td className="px-4 md:px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>

              {/* Payment Status */}
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                  ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'}`}>
                  {order.status}
                </span>
                {order.razorpay_payment_id && (
                  <p className="text-[10px] text-gray-400 font-mono mt-1 truncate max-w-[100px]" title={order.razorpay_payment_id}>
                    {order.razorpay_payment_id}
                  </p>
                )}
              </td>

              {/* Amount */}
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <p className="text-sm font-bold text-gray-900">₹{order.total_amount}</p>
                {order.coupon_code && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium mt-0.5">
                    <Tag className="w-3 h-3" /> {order.coupon_code} {order.discount_amount ? `(-₹${order.discount_amount})` : ''}
                  </span>
                )}
              </td>

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
                    title="View & Print Official Invoice"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Invoice
                  </a>
                  <DeleteOrderButton orderId={order.id} orderNumber={order.id.slice(0, 8)} />
                </div>
              </td>
            </tr>
          ))}
          {ordersArray.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 md:px-6 py-8 text-center text-gray-500">{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Manage Orders</h1>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Orders ({upcomingOrders.length})</h2>
      {renderTable(upcomingOrders, "No upcoming orders.")}

      <h2 className="text-xl font-bold text-gray-900 mb-4">Closed Orders ({closedOrders.length})</h2>
      {renderTable(closedOrders, "No closed orders yet.")}
    </div>
  )
}
