import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/components/ProductCard'
import type { Coupon } from '@/app/actions/coupon'

export interface CartItem extends Product {
  quantity: number
  selectedSize?: string
  cartItemId: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  appliedCoupon: Coupon | null
  setIsOpen: (isOpen: boolean) => void
  addItem: (product: Product, selectedSize?: string, selectedPrice?: number) => void
  removeItem: (cartItemIdOrId: string) => void
  updateQuantity: (cartItemIdOrId: string, quantity: number) => void
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
      addItem: (product, selectedSize, selectedPrice) =>
        set((state) => {
          let chosenSize = selectedSize
          let chosenPrice = selectedPrice ?? product.price

          // If no size explicitly passed, but product has sizes, pick the first size
          if (!chosenSize && product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
            chosenSize = product.sizes[0].size
            chosenPrice = product.sizes[0].price
          }

          const cartKey = chosenSize ? `${product.id}-${chosenSize}` : `${product.id}-default`

          const existingItem = state.items.find(
            (item) => item.cartItemId === cartKey || (!item.cartItemId && item.id === product.id && item.selectedSize === chosenSize)
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item === existingItem
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }

          const newItem: CartItem = {
            ...product,
            price: chosenPrice,
            selectedSize: chosenSize,
            cartItemId: cartKey,
            quantity: 1,
          }

          return { items: [...state.items, newItem] }
        }),
      removeItem: (cartItemIdOrId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.cartItemId !== cartItemIdOrId && item.id !== cartItemIdOrId
          ),
        })),
      updateQuantity: (cartItemIdOrId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemIdOrId || item.id === cartItemIdOrId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
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
