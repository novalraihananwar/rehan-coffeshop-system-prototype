'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Order, Table, InventoryItem, ActivityLog, OrderStatus } from '../types'
import { mockTables } from '../mock-data/tables'
import { mockInventory } from '../mock-data/inventory'

// Simple ingredient deduction per order item (units match inventory)
const DEDUCTIONS: Record<string, { id: string; amount: number }[]> = {
  coffee: [{ id: 'inv-001', amount: 18 }, { id: 'inv-002', amount: 200 }, { id: 'inv-008', amount: 1 }],
  latte: [{ id: 'inv-001', amount: 18 }, { id: 'inv-002', amount: 250 }, { id: 'inv-008', amount: 1 }],
  mocha: [{ id: 'inv-001', amount: 18 }, { id: 'inv-002', amount: 200 }, { id: 'inv-005', amount: 20 }, { id: 'inv-008', amount: 1 }],
  matcha: [{ id: 'inv-004', amount: 15 }, { id: 'inv-002', amount: 250 }, { id: 'inv-008', amount: 1 }],
  chocolate: [{ id: 'inv-005', amount: 25 }, { id: 'inv-002', amount: 200 }, { id: 'inv-008', amount: 1 }],
  chicken: [{ id: 'inv-012', amount: 150 }, { id: 'inv-011', amount: 1 }],
  default: [{ id: 'inv-006', amount: 10 }, { id: 'inv-011', amount: 1 }],
}

function getDeductionKey(menuItemId: string): string {
  if (menuItemId.includes('matcha')) return 'matcha'
  if (menuItemId.includes('mocha') || menuItemId.includes('chocolate')) return 'mocha'
  if (menuItemId.includes('latte') || menuItemId.includes('coffee') || menuItemId.includes('brew') || menuItemId.includes('cappuccino') || menuItemId.includes('espresso')) return 'latte'
  if (menuItemId.includes('chicken') || menuItemId.includes('katsu')) return 'chicken'
  return 'default'
}

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
  deductInventory: (order: Order) => void

  todayRevenue: () => number
  todayOrders: () => number
  activeTablesCount: () => number
  lowStockCount: () => number
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      orders: [],
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
          tables: get().tables.map((t) => (t.id === tableId ? { ...t, status, currentOrderId: status === 'empty' ? undefined : t.currentOrderId } : t)),
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

      deductInventory: (order) => {
        const inventory = [...get().inventory]
        order.items.forEach((item) => {
          const key = getDeductionKey(item.menuItemId)
          const deductions = DEDUCTIONS[key] || DEDUCTIONS.default
          deductions.forEach(({ id, amount }) => {
            const idx = inventory.findIndex((i) => i.id === id)
            if (idx >= 0) {
              inventory[idx] = {
                ...inventory[idx],
                currentStock: Math.max(0, inventory[idx].currentStock - amount * item.quantity),
              }
            }
          })
        })
        set({ inventory })
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
      partialize: (state) => ({ tables: state.tables, inventory: state.inventory }),
    }
  )
)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'rehan-cafe-admin') {
      useAdminStore.persist.rehydrate()
    }
  })
}
