'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Users, Package, LogOut, Tag, Mail, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminLogout } from '../login/actions'

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/enquiries', label: 'Enquiries', icon: Mail },
    { href: '/admin/offer', label: 'Offers', icon: Tag },
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
              <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-base ${
                        isActive
                          ? 'bg-violet-50 text-violet-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
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
