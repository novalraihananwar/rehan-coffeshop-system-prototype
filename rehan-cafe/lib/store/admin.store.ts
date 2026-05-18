'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Order, Table, InventoryItem, ActivityLog, OrderStatus, MenuItem, Supplier } from '../types'
import { mockTables } from '../mock-data/tables'
import { mockInventory } from '../mock-data/inventory'
import { menuItems as mockMenuItems } from '../mock-data/menu'
import { mockSuppliers } from '../mock-data/suppliers'
import { supabase } from '../supabase'

// Convert Supabase row → InventoryItem
const rowToInventory = (row: Record<string, unknown>): InventoryItem => ({
  id: row.id as string,
  name: row.name as string,
  unit: row.unit as string,
  currentStock: Number(row.current_stock),
  minStock: Number(row.min_stock),
  maxStock: Number(row.max_stock),
  expiryDate: row.expiry_date ? new Date(row.expiry_date as string) : undefined,
  supplierId: (row.supplier_id as string) || '',
  supplierName: (row.supplier_name as string) || '',
  costPerUnit: Number(row.cost_per_unit),
  category: (row.category as InventoryItem['category']) || 'raw_material',
})

const inventoryToRow = (item: InventoryItem) => ({
  id: item.id,
  name: item.name,
  unit: item.unit,
  current_stock: item.currentStock,
  min_stock: item.minStock,
  max_stock: item.maxStock,
  expiry_date: item.expiryDate ? item.expiryDate.toISOString() : null,
  supplier_id: item.supplierId,
  supplier_name: item.supplierName,
  cost_per_unit: item.costPerUnit,
  category: item.category,
})

interface AdminStore {
  orders: Order[]
  tables: Table[]
  inventory: InventoryItem[]
  menuItems: MenuItem[]
  suppliers: Supplier[]
  activityLog: ActivityLog[]
  selectedBranch: string
  notifications: string[]
  tableEmptyNums: number[]
  tableCleaningNums: number[]
  deductedOrderIds: string[]

  setSelectedBranch: (branch: string) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  updateTableStatus: (tableId: string, status: Table['status']) => void
  addActivity: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void
  addNotification: (message: string) => void
  clearNotification: (index: number) => void
  addIncomingOrder: (order: Order) => void
  deductInventory: (order: Order) => void

  addInventoryItem: (item: InventoryItem) => void
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void

  addMenuItem: (item: MenuItem) => void
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void
  toggleMenuAvailable: (id: string) => void

  addSupplier: (supplier: Supplier) => void
  updateSupplier: (id: string, updates: Partial<Supplier>) => void

  markTableEmpty: (tableNumber: number) => void
  markTableCleaning: (tableNumber: number) => void
  clearTableOverride: (tableNumber: number) => void

  addTable: (table: Omit<Table, 'id' | 'status'>) => void
  removeTable: (tableId: string) => void

  loadInventoryFromSupabase: () => Promise<void>
  seedInventoryToSupabase: () => Promise<void>

  syncWithMockData: () => void

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
      menuItems: [...mockMenuItems],
      suppliers: [...mockSuppliers],
      activityLog: [],
      selectedBranch: 'branch-001',
      notifications: [],
      tableEmptyNums: [],
      tableCleaningNums: [],
      deductedOrderIds: [],

      setSelectedBranch: (branch) => set({ selectedBranch: branch }),

      updateOrderStatus: (orderId, status) =>
        set({
          orders: get().orders.map((o) =>
            o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
          ),
        }),

      updateTableStatus: (tableId, status) =>
        set({
          tables: get().tables.map((t) =>
            t.id === tableId ? { ...t, status, currentOrderId: status === 'empty' ? undefined : t.currentOrderId } : t
          ),
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
        const { orders, tables, tableEmptyNums, tableCleaningNums } = get()
        set({
          orders: [order, ...orders],
          tables: tables.map((t) =>
            t.id === order.tableId ? { ...t, status: 'occupied', currentOrderId: order.id } : t
          ),
          tableEmptyNums: tableEmptyNums.filter((n) => n !== order.tableNumber),
          tableCleaningNums: tableCleaningNums.filter((n) => n !== order.tableNumber),
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
        const { inventory, menuItems, deductedOrderIds } = get()
        if (deductedOrderIds.includes(order.id)) return
        const inv = [...inventory]
        // Size multiplier hanya untuk minuman (coffee/non-coffee)
        const sizeMultiplier: Record<string, number> = { S: 0.8, M: 1.0, L: 1.2 }
        order.items.forEach((item) => {
          const menu = menuItems.find((m) => m.id === item.menuItemId)
          const isDrink = menu?.category === 'coffee' || menu?.category === 'non-coffee'
          const multiplier = isDrink ? (sizeMultiplier[item.size] ?? 1.0) : 1.0
          const ingredients = menu?.ingredients
          if (ingredients && ingredients.length > 0) {
            ingredients.forEach(({ inventoryItemId, amount }) => {
              const idx = inv.findIndex((i) => i.id === inventoryItemId)
              if (idx >= 0) {
                inv[idx] = {
                  ...inv[idx],
                  currentStock: Math.max(0, inv[idx].currentStock - amount * multiplier * item.quantity),
                }
              }
            })
          } else {
            const key = item.menuItemId.includes('matcha') ? 'matcha'
              : item.menuItemId.includes('mocha') || item.menuItemId.includes('chocolate') ? 'mocha'
              : item.menuItemId.includes('latte') || item.menuItemId.includes('coffee') || item.menuItemId.includes('brew') || item.menuItemId.includes('cappuccino') || item.menuItemId.includes('espresso') ? 'latte'
              : item.menuItemId.includes('chicken') || item.menuItemId.includes('katsu') ? 'chicken'
              : 'default'
            const fallback: Record<string, { id: string; amount: number }[]> = {
              coffee: [{ id: 'inv-001', amount: 18 }, { id: 'inv-002', amount: 200 }, { id: 'inv-008', amount: 1 }],
              latte: [{ id: 'inv-001', amount: 18 }, { id: 'inv-002', amount: 250 }, { id: 'inv-008', amount: 1 }],
              mocha: [{ id: 'inv-001', amount: 18 }, { id: 'inv-002', amount: 200 }, { id: 'inv-005', amount: 20 }, { id: 'inv-008', amount: 1 }],
              matcha: [{ id: 'inv-004', amount: 15 }, { id: 'inv-002', amount: 250 }, { id: 'inv-008', amount: 1 }],
              chicken: [{ id: 'inv-012', amount: 150 }, { id: 'inv-011', amount: 1 }],
              default: [{ id: 'inv-006', amount: 10 }, { id: 'inv-011', amount: 1 }],
            }
            const deductions = fallback[key] || fallback.default
            deductions.forEach(({ id, amount }) => {
              const idx = inv.findIndex((i) => i.id === id)
              if (idx >= 0) {
                inv[idx] = {
                  ...inv[idx],
                  currentStock: Math.max(0, inv[idx].currentStock - amount * multiplier * item.quantity),
                }
              }
            })
          }
        })
        set({ inventory: inv, deductedOrderIds: [...deductedOrderIds, order.id] })
        // Fire-and-forget: push changed items to Supabase
        const changedItems = inv.filter((item, idx) => item.currentStock !== inventory[idx]?.currentStock)
        changedItems.forEach((item) => {
          void supabase.from('inventory').update({ current_stock: item.currentStock }).eq('id', item.id)
        })
      },

      addInventoryItem: (item) => {
        set({ inventory: [...get().inventory, item] })
        void supabase.from('inventory').insert(inventoryToRow(item))
      },

      updateInventoryItem: (id, updates) => {
        const updated = get().inventory.map((i) => (i.id === id ? { ...i, ...updates } : i))
        set({ inventory: updated })
        const item = updated.find((i) => i.id === id)
        if (item) void supabase.from('inventory').update(inventoryToRow(item)).eq('id', id)
      },

      addMenuItem: (item) =>
        set({ menuItems: [...get().menuItems, item] }),

      updateMenuItem: (id, updates) =>
        set({
          menuItems: get().menuItems.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }),

      toggleMenuAvailable: (id) =>
        set({
          menuItems: get().menuItems.map((m) =>
            m.id === id ? { ...m, isAvailable: !m.isAvailable } : m
          ),
        }),

      addSupplier: (supplier) =>
        set({ suppliers: [...get().suppliers, supplier] }),

      updateSupplier: (id, updates) =>
        set({
          suppliers: get().suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }),

      markTableEmpty: (tableNumber) =>
        set({
          tableEmptyNums: [...get().tableEmptyNums.filter((n) => n !== tableNumber), tableNumber],
          tableCleaningNums: get().tableCleaningNums.filter((n) => n !== tableNumber),
        }),

      markTableCleaning: (tableNumber) =>
        set({
          tableCleaningNums: [...get().tableCleaningNums.filter((n) => n !== tableNumber), tableNumber],
          tableEmptyNums: get().tableEmptyNums.filter((n) => n !== tableNumber),
        }),

      clearTableOverride: (tableNumber) =>
        set({
          tableEmptyNums: get().tableEmptyNums.filter((n) => n !== tableNumber),
          tableCleaningNums: get().tableCleaningNums.filter((n) => n !== tableNumber),
        }),

      addTable: (tableData) => {
        const { tables } = get()
        const maxNum = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) : 0
        const num = tableData.number > 0 ? tableData.number : maxNum + 1
        const id = `table-${String(num).padStart(3, '0')}`
        if (tables.find((t) => t.id === id || t.number === num)) return // cegah duplikat
        set({ tables: [...tables, { ...tableData, id, number: num, status: 'empty' }] })
      },

      removeTable: (tableId) =>
        set({ tables: get().tables.filter((t) => t.id !== tableId) }),

      loadInventoryFromSupabase: async () => {
        const { data } = await supabase.from('inventory').select('*').order('name')
        if (data && data.length > 0) {
          set({ inventory: data.map(rowToInventory) })
        }
      },

      seedInventoryToSupabase: async () => {
        const { count } = await supabase.from('inventory').select('*', { count: 'exact', head: true })
        if (count === 0) {
          const { inventory } = get()
          await supabase.from('inventory').insert(inventory.map(inventoryToRow))
        }
      },

      syncWithMockData: () => {
        const { inventory, menuItems, suppliers } = get()
        const storedInvIds = new Set(inventory.map((i) => i.id))
        const newInv = mockInventory.filter((i) => !storedInvIds.has(i.id))
        const storedMenuIds = new Set(menuItems.map((m) => m.id))
        const newMenus = mockMenuItems.filter((m) => !storedMenuIds.has(m.id))
        const storedSupIds = new Set(suppliers.map((s) => s.id))
        const newSups = mockSuppliers.filter((s) => !storedSupIds.has(s.id))
        const updates: Partial<AdminStore> = {}
        if (newInv.length > 0) updates.inventory = [...inventory, ...newInv]
        if (newMenus.length > 0) updates.menuItems = [...menuItems, ...newMenus]
        if (newSups.length > 0) updates.suppliers = [...suppliers, ...newSups]
        if (Object.keys(updates).length > 0) set(updates as Partial<ReturnType<typeof get>>)
      },

      todayRevenue: () =>
        get().orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0),

      todayOrders: () => get().orders.filter((o) => o.status !== 'cancelled').length,

      activeTablesCount: () => get().tables.filter((t) => t.status === 'occupied').length,

      lowStockCount: () => get().inventory.filter((i) => i.currentStock <= i.minStock).length,
    }),
    {
      name: 'rehan-cafe-admin',
      partialize: (state) => ({
        tables: state.tables,
        inventory: state.inventory,
        menuItems: state.menuItems,
        suppliers: state.suppliers,
        tableEmptyNums: state.tableEmptyNums,
        tableCleaningNums: state.tableCleaningNums,
        deductedOrderIds: state.deductedOrderIds,
      }),
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
