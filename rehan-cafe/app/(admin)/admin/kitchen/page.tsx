'use client'
import { useEffect, useState } from 'react'
import { useAdminStore } from '@/lib/store/admin.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { Order, OrderStatus } from '@/lib/types'
import { formatTime } from '@/lib/utils/format'

const COFFEE_CATEGORY = ['coffee', 'non-coffee']
const FOOD_CATEGORY = ['food', 'dessert', 'bundle']

function minutesAgo(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 60000)
}

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useAdminStore()
  const { user } = useAuthStore()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  const activeOrders = orders.filter((o) => ['confirmed', 'preparing', 'ready'].includes(o.status))

  const filterByRole = (order: Order) => {
    if (user?.role === 'barista') {
      return order.items.some((i) => {
        const menuCat = i.menuItemId.includes('latte') || i.menuItemId.includes('coffee') || i.menuItemId.includes('brew') || i.menuItemId.includes('mocha') || i.menuItemId.includes('chocolate') || i.menuItemId.includes('tea') || i.menuItemId.includes('mojito')
        return menuCat
      })
    }
    if (user?.role === 'kitchen') {
      return order.items.some((i) => {
        const menuCat = i.menuItemId.includes('chicken') || i.menuItemId.includes('pasta') || i.menuItemId.includes('beef') || i.menuItemId.includes('spaghetti') || i.menuItemId.includes('rice') || i.menuItemId.includes('fries') || i.menuItemId.includes('croissant') || i.menuItemId.includes('steak') || i.menuItemId.includes('salmon') || i.menuItemId.includes('cheesecake') || i.menuItemId.includes('croffle') || i.menuItemId.includes('tiramisu') || i.menuItemId.includes('chocolate-lava')
        return menuCat
      })
    }
    return true
  }

  const queued = activeOrders.filter((o) => o.status === 'confirmed' && filterByRole(o))
  const preparing = activeOrders.filter((o) => o.status === 'preparing' && filterByRole(o))
  const ready = activeOrders.filter((o) => o.status === 'ready' && filterByRole(o))

  const OrderCard = ({ order, onAction, actionLabel }: { order: Order; onAction: () => void; actionLabel: string }) => {
    const elapsed = minutesAgo(order.createdAt)
    const isUrgent = elapsed >= 15
    return (
      <div className={`rounded-2xl p-4 border-2 transition-all ${isUrgent ? 'border-red-400 bg-red-50' : 'border-latte/60 bg-warm-white'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${isUrgent ? 'bg-red-500 text-white' : 'bg-espresso-dark text-espresso-light'}`}>
              {order.tableNumber}
            </div>
            <div>
              <p className="font-bold text-espresso-deep text-lg">{order.orderNumber}</p>
              <p className="text-cafe-muted text-xs">{formatTime(order.createdAt)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-xl font-bold ${isUrgent ? 'text-red-500' : 'text-cafe-muted'}`}>{elapsed}m</p>
            <p className="text-xs text-cafe-muted">berlalu</p>
          </div>
        </div>
        <div className="space-y-1.5 mb-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-espresso-mid text-sm font-semibold">×{item.quantity}</span>
              <span className="text-espresso-deep font-medium">{item.menuItemName}</span>
              <span className="text-cafe-muted text-xs">({item.size})</span>
              {item.notes && <span className="text-cafe-muted text-xs italic">· {item.notes}</span>}
            </div>
          ))}
        </div>
        <button
          onClick={onAction}
          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${isUrgent ? 'bg-red-500 text-white' : 'bg-espresso-dark text-warm-white'}`}
        >
          {actionLabel}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-espresso-black text-warm-white">
      <div className="bg-espresso-deep border-b border-espresso-light/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-warm-white">Kitchen Display</h1>
          <p className="text-espresso-light/60 text-sm">
            {user?.role === 'barista' ? '☕ Bar — Minuman' : user?.role === 'kitchen' ? '🍳 Kitchen — Makanan' : '👨‍🍳 Semua Pesanan'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-olive-sage rounded-full animate-pulse" />
          <span className="text-espresso-light/70 text-sm">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-3 h-[calc(100vh-72px)] divide-x divide-espresso-light/10">
        {/* Antrian */}
        <div className="p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-espresso-light text-lg">Antrian</h2>
            <span className="bg-espresso-light/20 text-espresso-light text-xs font-bold px-3 py-1 rounded-full">{queued.length}</span>
          </div>
          <div className="space-y-3">
            {queued.map((order) => (
              <OrderCard key={order.id} order={order} actionLabel="Mulai Masak →" onAction={() => updateOrderStatus(order.id, 'preparing')} />
            ))}
            {queued.length === 0 && <p className="text-espresso-light/30 text-center py-8">Tidak ada antrian</p>}
          </div>
        </div>

        {/* Sedang Dibuat */}
        <div className="p-4 overflow-y-auto bg-espresso-deep/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-espresso-light text-lg">Sedang Dibuat</h2>
            <span className="bg-espresso-light/20 text-espresso-light text-xs font-bold px-3 py-1 rounded-full">{preparing.length}</span>
          </div>
          <div className="space-y-3">
            {preparing.map((order) => (
              <OrderCard key={order.id} order={order} actionLabel="Tandai Siap ✓" onAction={() => updateOrderStatus(order.id, 'ready')} />
            ))}
            {preparing.length === 0 && <p className="text-espresso-light/30 text-center py-8">Tidak ada yang diproses</p>}
          </div>
        </div>

        {/* Siap */}
        <div className="p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-olive-sage text-lg">Siap Disajikan</h2>
            <span className="bg-olive-sage/20 text-olive-sage text-xs font-bold px-3 py-1 rounded-full">{ready.length}</span>
          </div>
          <div className="space-y-3">
            {ready.map((order) => (
              <OrderCard key={order.id} order={order} actionLabel="Selesai 🎉" onAction={() => updateOrderStatus(order.id, 'completed')} />
            ))}
            {ready.length === 0 && <p className="text-olive-sage/30 text-center py-8">Belum ada yang siap</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
