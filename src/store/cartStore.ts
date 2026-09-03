import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/components/ProductCard'
import type { Coupon } from '@/app/actions/coupon'

export interface CartItem extends Product {
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  appliedCoupon: Coupon | null
  setIsOpen: (isOpen: boolean) => void
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setAppliedCoupon: (coupon: Coupon | null) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id)
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            }
          }
          return { items: [...state.items, { ...product, quantity: 1 }] }
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),
      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
      clearCart: () => set({ items: [], appliedCoupon: null }),
    }),
    {
      name: 'cart-storage',
    }
  )
)
