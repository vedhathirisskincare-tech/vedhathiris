import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { DeliveryStatusSelect } from './DeliveryStatusSelect'

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

  const { data: recentOrdersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (ordersError) {
    console.error("Error fetching orders for admin:", ordersError)
  }

  // Fetch profiles separately
  let recentOrders = []
  if (recentOrdersData && recentOrdersData.length > 0) {
    const userIds = [...new Set(recentOrdersData.map(o => o.user_id).filter(Boolean))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds)
      
    recentOrders = recentOrdersData.map(order => {
      const profile = profiles?.find(p => p.id === order.user_id)
      return { ...order, profiles: profile }
    })
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900">{usersCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{ordersCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-green-600">₹{recentOrders?.reduce((acc: number, order: any) => acc + (order.total_amount || 0), 0) || 0}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Order ID</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Customer</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Date</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Payment</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Amount</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Delivery Status</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentOrders?.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 md:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">#{order.id.slice(0,8)}</td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-900">{order.profiles?.full_name || 'Guest User'}</p>
                  <p className="text-xs text-gray-500">{order.profiles?.email || 'N/A'}</p>
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
                <td className="px-4 md:px-6 py-4 text-sm font-medium whitespace-nowrap">
                  <a href={`/invoice/${order.id}`} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-800 transition-colors">
                    Invoice
                  </a>
                </td>
              </tr>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 md:px-6 py-8 text-center text-gray-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
