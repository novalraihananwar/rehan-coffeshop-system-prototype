'use client'
import { useEffect, useState } from 'react'
import { useAdminStore } from '@/lib/store/admin.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { Order, OrderStatus } from '@/lib/types'
import { formatTime } from '@/lib/utils/format'
import { supabase } from '@/lib/supabase'

function minutesAgo(date: Date | string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 60000)
}

function scheduledTimeLabel(scheduledTime: string): string {
  const t = scheduledTime.includes('T') ? scheduledTime.split('T')[1]?.slice(0, 5) : scheduledTime
  return t ?? scheduledTime
}

function isScheduledNow(scheduledTime: string): boolean {
  return new Date() >= new Date(scheduledTime)
}

const toOrder = (row: Record<string, unknown>): Order => ({
  id: row.id as string,
  orderNumber: row.order_number as string,
  tableId: row.table_id as string,
  tableNumber: row.table_number as number,
  type: row.type as Order['type'],
  status: row.status as OrderStatus,
  totalAmount: row.total_amount as number,
  paymentMethod: row.payment_method as Order['paymentMethod'],
  customerName: row.customer_name as string,
  notes: row.notes as string,
  estimatedTime: row.estimated_time as number,
  branch: row.branch as string,
  items: row.items as Order['items'],
  createdAt: new Date(row.created_at as string),
  updatedAt: new Date(row.updated_at as string),
  scheduledTime: row.scheduled_time as string | undefined,
  reservationId: row.reservation_id as string | undefined,
})

export default function KitchenPage() {
  const { updateOrderStatus } = useAdminStore()
  const { user } = useAuthStore()
  const [dbOrders, setDbOrders] = useState<Order[]>([])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const fetchOrders = () => {
      supabase.from('orders').select('*').in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: true })
        .then(({ data }) => { if (data) setDbOrders(data.map(toOrder)) })
    }
    fetchOrders()

    const channel = supabase.channel('kitchen-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()

    const ticker = setInterval(() => setTick((t) => t + 1), 30000)
    return () => { supabase.removeChannel(channel); clearInterval(ticker) }
  }, [])

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status)
    supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId).then(() => {
      setDbOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o))
    })
  }

  const filterByRole = (order: Order) => {
    if (user?.role === 'barista') {
      return order.items.some((i) => i.menuItemId.includes('latte') || i.menuItemId.includes('coffee') || i.menuItemId.includes('brew') || i.menuItemId.includes('mocha') || i.menuItemId.includes('chocolate') || i.menuItemId.includes('tea') || i.menuItemId.includes('mojito') || i.menuItemId.includes('matcha'))
    }
    if (user?.role === 'kitchen') {
      return order.items.some((i) => i.menuItemId.includes('chicken') || i.menuItemId.includes('pasta') || i.menuItemId.includes('beef') || i.menuItemId.includes('fries') || i.menuItemId.includes('croissant') || i.menuItemId.includes('steak') || i.menuItemId.includes('salmon') || i.menuItemId.includes('cheesecake') || i.menuItemId.includes('croffle') || i.menuItemId.includes('tiramisu'))
    }
    return true
  }

  const scheduled = dbOrders.filter((o) => o.type === 'reservation' && o.status === 'pending' && filterByRole(o))
  const queued = dbOrders.filter((o) => o.status === 'confirmed' && filterByRole(o))
  const preparing = dbOrders.filter((o) => o.status === 'preparing' && filterByRole(o))
  const ready = dbOrders.filter((o) => o.status === 'ready' && filterByRole(o))

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
        <button onClick={onAction} className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${isUrgent ? 'bg-red-500 text-white' : 'bg-espresso-dark text-warm-white'}`}>
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
          <span className="text-espresso-light/70 text-sm">Live · Supabase</span>
        </div>
      </div>

      {/* Scheduled Reservations Banner */}
      {scheduled.length > 0 && (
        <div className="bg-purple-900 border-b border-purple-700 px-6 py-3 flex items-center gap-3 overflow-x-auto">
          <span className="text-purple-200 text-xs font-bold flex-shrink-0">🪑 Reservasi Terjadwal:</span>
          {scheduled.map((o) => (
            <div key={o.id} className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold ${o.scheduledTime && isScheduledNow(o.scheduledTime) ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-700 text-purple-100'}`}>
              Meja {o.tableNumber} · {o.scheduledTime ? scheduledTimeLabel(o.scheduledTime) : '-'} · {o.customerName}
              {o.scheduledTime && isScheduledNow(o.scheduledTime) && (
                <button onClick={() => handleStatusChange(o.id, 'confirmed')} className="ml-2 bg-white text-red-600 rounded px-1.5 font-bold">Mulai!</button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 h-[calc(100vh-72px)] divide-x divide-espresso-light/10">
        <div className="p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-espresso-light text-lg">Antrian</h2>
            <span className="bg-espresso-light/20 text-espresso-light text-xs font-bold px-3 py-1 rounded-full">{queued.length}</span>
          </div>
          <div className="space-y-3">
            {queued.map((order) => (
              <OrderCard key={order.id} order={order} actionLabel="Mulai Masak →" onAction={() => handleStatusChange(order.id, 'preparing')} />
            ))}
            {queued.length === 0 && <p className="text-espresso-light/30 text-center py-8">Tidak ada antrian</p>}
          </div>
        </div>

        <div className="p-4 overflow-y-auto bg-espresso-deep/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-espresso-light text-lg">Sedang Dibuat</h2>
            <span className="bg-espresso-light/20 text-espresso-light text-xs font-bold px-3 py-1 rounded-full">{preparing.length}</span>
          </div>
          <div className="space-y-3">
            {preparing.map((order) => (
              <OrderCard key={order.id} order={order} actionLabel="Tandai Siap ✓" onAction={() => handleStatusChange(order.id, 'ready')} />
            ))}
            {preparing.length === 0 && <p className="text-espresso-light/30 text-center py-8">Tidak ada yang diproses</p>}
          </div>
        </div>

        <div className="p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-olive-sage text-lg">Siap Disajikan</h2>
            <span className="bg-olive-sage/20 text-olive-sage text-xs font-bold px-3 py-1 rounded-full">{ready.length}</span>
          </div>
          <div className="space-y-3">
            {ready.map((order) => (
              <OrderCard key={order.id} order={order} actionLabel="Selesai 🎉" onAction={() => handleStatusChange(order.id, 'completed')} />
            ))}
            {ready.length === 0 && <p className="text-olive-sage/30 text-center py-8">Belum ada yang siap</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
