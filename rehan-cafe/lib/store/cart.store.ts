'use client'
import { create } from 'zustand'
import { CartItem, MenuItem, MenuSize, OrderType } from '../types'

interface CartStore {
  items: CartItem[]
  orderType: OrderType
  tableId: string
  tableNumber: number
  notes: string

  setTable: (tableId: string, tableNumber: number) => void
  setOrderType: (type: OrderType) => void
  addItem: (menuItem: MenuItem, size: MenuSize, quantity: number, notes: string) => void
  removeItem: (menuItemId: string, size: MenuSize) => void
  updateQuantity: (menuItemId: string, size: MenuSize, quantity: number) => void
  clearCart: () => void
  setNotes: (notes: string) => void

  totalItems: () => number
  totalPrice: () => number
  estimatedTime: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  orderType: 'dine_in',
  tableId: '',
  tableNumber: 0,
  notes: '',

  setTable: (tableId, tableNumber) => set({ tableId, tableNumber }),
  setOrderType: (orderType) => set({ orderType }),
  setNotes: (notes) => set({ notes }),

  addItem: (menuItem, size, quantity, notes) => {
    const { items } = get()
    const existing = items.find((i) => i.menuItem.id === menuItem.id && i.size === size)
    if (existing) {
      set({ items: items.map((i) => i.menuItem.id === menuItem.id && i.size === size ? { ...i, quantity: i.quantity + quantity } : i) })
    } else {
      set({ items: [...items, { menuItem, size, quantity, notes }] })
    }
  },

  removeItem: (menuItemId, size) =>
    set({ items: get().items.filter((i) => !(i.menuItem.id === menuItemId && i.size === size)) }),

  updateQuantity: (menuItemId, size, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId, size)
      return
    }
    set({ items: get().items.map((i) => i.menuItem.id === menuItemId && i.size === size ? { ...i, quantity } : i) })
  },

  clearCart: () => set({ items: [], notes: '' }),

  totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

  totalPrice: () => get().items.reduce((acc, i) => acc + i.menuItem.prices[i.size] * i.quantity, 0),

  estimatedTime: () => Math.max(...get().items.map((i) => i.menuItem.preparationTime), 0),
}))
