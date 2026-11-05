'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Users, Package, LogOut, Tag, Mail, Star, Ticket, ChevronLeft, ChevronRight, Sparkles, SlidersHorizontal } from 'lucide-react'
import { adminLogout } from '../login/actions'
import { toggleVisitorPopupSetting } from './actions'
import { useToast } from '@/components/Toast'

export function AdminSidebar({ initialPopupEnabled = false }: { initialPopupEnabled?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [popupEnabled, setPopupEnabled] = useState(initialPopupEnabled)
  const [isUpdating, setIsUpdating] = useState(false)
  const pathname = usePathname()
  const toast = useToast()

  const handleTogglePopup = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const nextState = !popupEnabled
    setPopupEnabled(nextState)
    setIsUpdating(true)
    try {
      await toggleVisitorPopupSetting(nextState)
      toast.success(nextState ? 'Visitor login popup turned ON (appears in 3s)' : 'Visitor login popup turned OFF (hidden)')
    } catch (err: any) {
      setPopupEnabled(!nextState)
      toast.error(err.message || 'Failed to update popup setting')
    } finally {
      setIsUpdating(false)
    }
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/customize-products', label: 'Customize Products', icon: SlidersHorizontal },
    { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
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
          className={`p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-all cursor-pointer ${isCollapsed ? 'mx-auto' : ''}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2 flex flex-col overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isUsersItem = item.href === '/admin/users'

          return (
            <div key={item.href} className="space-y-1.5">
              <Link 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive ? 'bg-violet-50 text-violet-600' : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.label}</span>
                    {isUsersItem && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        popupEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {popupEnabled ? 'ON' : 'OFF'}
                      </span>
                    )}
                  </div>
                )}
              </Link>

              {/* Dynamic Popup Toggle Button right under Users in Sidebar */}
              {isUsersItem && (
                !isCollapsed ? (
                  <div className="mx-1.5 p-2 rounded-xl bg-violet-50/70 border border-violet-100 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                        <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                        <span className="truncate">Visitor Popup</span>
                      </div>
                      <span className="text-[10px] text-gray-500 block truncate mt-0.5">
                        {popupEnabled ? '🟢 Appears in 3s' : '⚪ Hidden'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleTogglePopup}
                      disabled={isUpdating}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        popupEnabled ? 'bg-violet-600' : 'bg-gray-300'
                      } ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
                      title={popupEnabled ? 'Click to Turn OFF (Hide Popup)' : 'Click to Turn ON (Show in 3s)'}
                      aria-label="Toggle visitor popup on or off"
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          popupEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTogglePopup}
                    disabled={isUpdating}
                    className={`mx-auto flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
                      popupEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={popupEnabled ? 'Visitor Popup: ON (Click to Turn OFF)' : 'Visitor Popup: OFF (Click to Turn ON)'}
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
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
