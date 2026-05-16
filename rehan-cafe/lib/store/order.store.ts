'use client'
import { create } from 'zustand'
import { Order, OrderStatus } from '../types'
import { mockOrders } from '../mock-data/orders'

interface OrderStore {
  orders: Order[]
  activeOrderId: string | null

  addOrder: (order: Order) => void
  updateStatus: (orderId: string, status: OrderStatus) => void
  setActiveOrder: (orderId: string) => void
  getActiveOrder: () => Order | undefined
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [...mockOrders],
  activeOrderId: null,

  addOrder: (order) => set({ orders: [order, ...get().orders], activeOrderId: order.id }),

  updateStatus: (orderId, status) =>
    set({
      orders: get().orders.map((o) =>
        o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
      ),
    }),

  setActiveOrder: (orderId) => set({ activeOrderId: orderId }),

  getActiveOrder: () => {
    const { orders, activeOrderId } = get()
    return orders.find((o) => o.id === activeOrderId)
  },
}))
