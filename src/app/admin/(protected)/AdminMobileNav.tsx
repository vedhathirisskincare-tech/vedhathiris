'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Users, Package, LogOut, Tag, Mail, Menu, X, Star, Ticket, Sparkles, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminLogout } from '../login/actions'
import { toggleVisitorPopupSetting } from './actions'
import { useToast } from '@/components/Toast'

export function AdminMobileNav({ initialPopupEnabled = false }: { initialPopupEnabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
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

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <div className="md:hidden">
      {/* Top Mobile Bar */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <span className="text-lg font-bold text-gray-800 tracking-tight">Admin Panel</span>
        <button
          onClick={toggleMenu}
          className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
          aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col p-6 z-10"
            >
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <span className="font-bold text-xl text-gray-800">Admin Panel</span>
                <button
                  onClick={closeMenu}
                  className="p-1.5 hover:bg-violet-50 rounded-full transition-all text-gray-600"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const isUsersItem = item.href === '/admin/users'
                  return (
                    <div key={item.href} className="space-y-1">
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-base ${
                          isActive
                            ? 'bg-violet-50 text-violet-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="flex-1">{item.label}</span>
                        {isUsersItem && (
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            popupEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {popupEnabled ? 'ON' : 'OFF'}
                          </span>
                        )}
                      </Link>

                      {/* Dynamic Popup Toggle Button right under Users in Mobile Sidebar */}
                      {isUsersItem && (
                        <div className="mx-2 p-2.5 rounded-xl bg-violet-50/70 border border-violet-100 flex items-center justify-between gap-2 shadow-2xs">
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
                      )}
                    </div>
                  )
                })}
              </nav>

              {/* Sign Out Section at bottom */}
              <div className="border-t pt-4 mt-auto">
                <form action={adminLogout}>
                  <button
                    onClick={closeMenu}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-base cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
