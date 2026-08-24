'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Users, Package, LogOut, Tag, Mail, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { adminLogout } from '../login/actions'

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/enquiries', label: 'Enquiries', icon: Mail },
    { href: '/admin/offer', label: 'Offers', icon: Tag },
    { href: '/admin/reviews', label: 'Reviews', icon: Star },
  ]

  return (
    <aside className={`bg-white border-r hidden md:flex flex-col transition-all duration-300 sticky top-0 h-[100dvh] ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 border-b flex items-center justify-between">
        {!isCollapsed && <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className={`p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2 flex flex-col overflow-hidden">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive ? 'bg-violet-50 text-violet-600' : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
        <div className="mt-auto pt-4 border-t">
          <form action={adminLogout}>
            <button 
              className={`w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </form>
        </div>
      </nav>
    </aside>
  )
}
