'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Order, Table, InventoryItem, ActivityLog, OrderStatus } from '../types'
import { mockOrders } from '../mock-data/orders'
import { mockTables } from '../mock-data/tables'
import { mockInventory } from '../mock-data/inventory'

interface AdminStore {
  orders: Order[]
  tables: Table[]
  inventory: InventoryItem[]
  activityLog: ActivityLog[]
  selectedBranch: string
  notifications: string[]

  setSelectedBranch: (branch: string) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  updateTableStatus: (tableId: string, status: Table['status']) => void
  addActivity: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void
  addNotification: (message: string) => void
  clearNotification: (index: number) => void
  addIncomingOrder: (order: Order) => void

  todayRevenue: () => number
  todayOrders: () => number
  activeTablesCount: () => number
  lowStockCount: () => number
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      orders: [...mockOrders],
      tables: [...mockTables],
      inventory: [...mockInventory],
      activityLog: [],
      selectedBranch: 'branch-001',
      notifications: [],

      setSelectedBranch: (branch) => set({ selectedBranch: branch }),

      updateOrderStatus: (orderId, status) =>
        set({
          orders: get().orders.map((o) =>
            o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
          ),
        }),

      updateTableStatus: (tableId, status) =>
        set({
          tables: get().tables.map((t) => (t.id === tableId ? { ...t, status } : t)),
        }),

      addActivity: (log) =>
        set({
          activityLog: [
            { ...log, id: `log-${Date.now()}`, timestamp: new Date() },
            ...get().activityLog,
          ],
        }),

      addNotification: (message) =>
        set({ notifications: [message, ...get().notifications].slice(0, 20) }),

      clearNotification: (index) =>
        set({ notifications: get().notifications.filter((_, i) => i !== index) }),

      addIncomingOrder: (order) => {
        const { orders, tables } = get()
        set({
          orders: [order, ...orders],
          tables: tables.map((t) =>
            t.id === order.tableId ? { ...t, status: 'occupied', currentOrderId: order.id } : t
          ),
        })
        get().addActivity({
          userId: 'system', userName: 'System', userRole: 'cashier',
          action: 'Order Masuk', target: `Meja ${order.tableNumber}`,
          details: `Order ${order.orderNumber} — Rp ${order.totalAmount.toLocaleString('id-ID')}`,
          branch: order.branch,
        })
        get().addNotification(`Order baru masuk — Meja ${order.tableNumber} (${order.orderNumber})`)
      },

      todayRevenue: () =>
        get().orders
          .filter((o) => o.status === 'completed')
          .reduce((sum, o) => sum + o.totalAmount, 0),

      todayOrders: () => get().orders.filter((o) => o.status !== 'cancelled').length,

      activeTablesCount: () => get().tables.filter((t) => t.status === 'occupied').length,

      lowStockCount: () => get().inventory.filter((i) => i.currentStock <= i.minStock).length,
    }),
    {
      name: 'rehan-cafe-admin',
      partialize: (state) => ({ orders: state.orders, tables: state.tables }),
    }
  )
)

// Sync cross-tab: when another tab updates localStorage, rehydrate this store
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'rehan-cafe-admin') {
      useAdminStore.persist.rehydrate()
    }
  })
}
