import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Users, Package, LogOut, Tag, Mail } from 'lucide-react'
import { adminLogout } from '../login/actions'
import { AdminMobileNav } from './AdminMobileNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (!adminSession || adminSession.value !== 'authenticated') {
    redirect('/admin/login')
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Nav Bar */}
      <AdminMobileNav />

      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-violet-50 hover:text-violet-600 rounded-lg transition-colors font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-violet-50 hover:text-violet-600 rounded-lg transition-colors font-medium">
            <ShoppingBag className="w-5 h-5" />
            Orders
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-violet-50 hover:text-violet-600 rounded-lg transition-colors font-medium">
            <Package className="w-5 h-5" />
            Products
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-violet-50 hover:text-violet-600 rounded-lg transition-colors font-medium">
            <Users className="w-5 h-5" />
            Users
          </Link>
          <Link href="/admin/enquiries" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-violet-50 hover:text-violet-600 rounded-lg transition-colors font-medium">
            <Mail className="w-5 h-5" />
            Enquiries
          </Link>
          <Link href="/admin/offer" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-violet-50 hover:text-violet-600 rounded-lg transition-colors font-medium">
            <Tag className="w-5 h-5" />
            Offers
          </Link>
          <div className="mt-auto pt-4 border-t">
            <form action={adminLogout}>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </form>
          </div>
        </nav>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
