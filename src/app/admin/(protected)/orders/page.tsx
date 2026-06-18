import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { DeliveryStatusSelect } from '../DeliveryStatusSelect'

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
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', userIds)
      
    allOrders = recentOrdersData.map(order => {
      const profile = profiles?.find(p => p.id === order.user_id)
      return { ...order, profiles: profile }
    })
  }

  const upcomingOrders = allOrders.filter(o => o.delivery_status !== 'Delivered')
  const closedOrders = allOrders.filter(o => o.delivery_status === 'Delivered')

  const renderTable = (ordersArray: any[], emptyMessage: string) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mb-10">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Order ID</th>
            <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Customer</th>
            <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Delivery Info</th>
            <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Date</th>
            <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Payment</th>
            <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Amount</th>
            <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Delivery Status</th>
            <th className="px-4 md:px-6 py-4 font-medium text-gray-600 text-right whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {ordersArray.map((order: any) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 md:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">#{order.id.slice(0,8)}</td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <p className="text-sm font-medium text-gray-900">{order.customer_name || order.profiles?.full_name || 'Guest User'}</p>
                <p className="text-xs text-gray-500">{order.profiles?.email || 'N/A'}</p>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <p className="text-sm font-semibold text-gray-800">Phone: <span className="font-normal text-gray-600">{order.contact_number || order.profiles?.phone || 'N/A'}</span></p>
                <p className="text-xs text-gray-500 max-w-xs truncate" title={order.shipping_address || 'N/A'}>{order.shipping_address || 'N/A'}</p>
              </td>
              <td className="px-4 md:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize
                  ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-4 md:px-6 py-4 text-sm font-medium whitespace-nowrap">₹{order.total_amount}</td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <DeliveryStatusSelect orderId={order.id} initialStatus={order.delivery_status} />
              </td>
              <td className="px-4 md:px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                <a href={`/invoice/${order.id}`} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-800 transition-colors">
                  Invoice
                </a>
              </td>
            </tr>
          ))}
          {ordersArray.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 md:px-6 py-8 text-center text-gray-500">{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Manage Orders</h1>
      
      <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Orders</h2>
      {renderTable(upcomingOrders, "No upcoming orders.")}

      <h2 className="text-xl font-bold text-gray-900 mb-4">Closed Orders</h2>
      {renderTable(closedOrders, "No closed orders yet.")}
    </div>
  )
}
