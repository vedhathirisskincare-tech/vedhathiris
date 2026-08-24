import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Users, Package, LogOut, Tag, Mail, Star } from 'lucide-react'
import { adminLogout } from '../login/actions'
import { AdminMobileNav } from './AdminMobileNav'
import { AdminSidebar } from './AdminSidebar'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
}

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
      <AdminSidebar />

      {/* Admin Content */}
      <main className="flex-1 p-4 md:p-8 min-w-0">
        {children}
      </main>
    </div>
  )
}
