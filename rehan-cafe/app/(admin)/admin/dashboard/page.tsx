'use client'
import { useEffect, useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import StatCard from '@/components/admin/StatCard'
import { useAdminStore } from '@/lib/store/admin.store'
import { formatRupiah, formatTime } from '@/lib/utils/format'
import { Order } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const hourlyBase = Array.from({ length: 12 }, (_, i) => ({
  hour: `${8 + i}:00`,
  revenue: 0,
  orders: 0,
}))

const toOrder = (row: Record<string, unknown>): Order => ({
  id: row.id as string,
  orderNumber: row.order_number as string,
  tableId: row.table_id as string,
  tableNumber: row.table_number as number,
  type: row.type as Order['type'],
  status: row.status as Order['status'],
  totalAmount: row.total_amount as number,
  paymentMethod: row.payment_method as Order['paymentMethod'],
  customerName: row.customer_name as string,
  notes: row.notes as string,
  estimatedTime: row.estimated_time as number,
  branch: row.branch as string,
  items: row.items as Order['items'],
  createdAt: new Date(row.created_at as string),
  updatedAt: new Date(row.updated_at as string),
})

export default function DashboardPage() {
  const { inventory, lowStockCount, tableEmptyNums, tableCleaningNums } = useAdminStore()
  const [dbOrders, setDbOrders] = useState<Order[]>([])
  const [occupiedTableNums, setOccupiedTableNums] = useState<Set<number>>(new Set())
  const [chartData, setChartData] = useState(hourlyBase)

  // Hitung meja aktif secara reaktif: occupied dari Supabase dikurangi yang sudah dikonfirmasi kosong/cleaning oleh kasir
  const emptySet = new Set(tableEmptyNums)
  const cleaningSet = new Set(tableCleaningNums)
  const activeTableCount = [...occupiedTableNums].filter((n) => !emptySet.has(n) && !cleaningSet.has(n)).length

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    const fetchOrders = () => {
      supabase.from('orders').select('*').order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) {
            const orders = data.map(toOrder)
            setDbOrders(orders)
            const hourly = Array.from({ length: 12 }, (_, i) => ({ hour: `${8 + i}:00`, revenue: 0, orders: 0 }))
            orders.forEach((o) => {
              const h = new Date(o.createdAt).getHours()
              const idx = h - 8
              if (idx >= 0 && idx < 12) {
                hourly[idx].revenue += o.totalAmount
                hourly[idx].orders += 1
              }
            })
            setChartData(hourly)
          }
        })
    }

    const fetchActiveTables = () => {
      supabase.from('orders').select('table_number')
        .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'completed'])
        .gte('created_at', today)
        .then(({ data }) => {
          if (data) {
            setOccupiedTableNums(new Set(data.map((r: { table_number: number }) => r.table_number)))
          }
        })
    }

    fetchOrders()
    fetchActiveTables()

    const channel = supabase.channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
        fetchActiveTables()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const todayRevenue = dbOrders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.totalAmount, 0)
  const todayOrderCount = dbOrders.filter((o) => o.status !== 'cancelled').length
  const recentOrders = dbOrders.slice(0, 6)

  // Hitung menu terlaris dari data real
  const menuCount: Record<string, { name: string; count: number }> = {}
  dbOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!menuCount[item.menuItemId]) {
        menuCount[item.menuItemId] = { name: item.menuItemName, count: 0 }
      }
      menuCount[item.menuItemId].count += item.quantity
    })
  })
  const topMenus = Object.values(menuCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="min-h-screen">
      <AdminHeader title="Dashboard" subtitle="Overview operasional hari ini" />

      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard dark title="Total Pendapatan" value={formatRupiah(todayRevenue)} icon="💰" />
          <StatCard title="Total Order" value={String(todayOrderCount)} icon="🛒" />
          <StatCard title="Meja Aktif" value={`${activeTableCount}/100`} icon="🪑" />
          <StatCard title="Inventori" value={`${inventory.length} item`} icon="📦" />
          <StatCard title="Avg Order" value={todayOrderCount > 0 ? formatRupiah(Math.round(todayRevenue / todayOrderCount)) : 'Rp 0'} icon="📊" />
          {lowStockCount() > 0
            ? <StatCard title="Stock Menipis" value={String(lowStockCount())} icon="⚠️" subtitle="Segera restok" />
            : <StatCard title="Stock" value="Aman" icon="✅" subtitle="Semua terpenuhi" />}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display font-semibold text-espresso-deep">Penjualan Per Jam</p>
                <p className="text-cafe-muted text-xs mt-0.5">Data real dari Supabase</p>
              </div>
              <div className="w-2 h-2 bg-olive-sage rounded-full animate-pulse" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B4226" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6B4226" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE0CC" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#A08060' }} />
                <YAxis tick={{ fontSize: 10, fill: '#A08060' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatRupiah(Number(v)), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #EDE0CC', fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6B4226" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
            <p className="font-display font-semibold text-espresso-deep mb-4">Menu Terlaris</p>
            {topMenus.length === 0 ? (
              <p className="text-cafe-muted text-sm text-center py-8">Belum ada data order</p>
            ) : (
              <div className="space-y-3">
                {topMenus.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-espresso-dark text-warm-white' : 'bg-cream-base text-espresso-mid'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-espresso-deep text-xs font-semibold truncate">{m.name}</p>
                      <div className="h-1.5 bg-cream-base rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-espresso-light rounded-full" style={{ width: `${topMenus[0].count > 0 ? (m.count / topMenus[0].count) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <span className="text-cafe-muted text-xs flex-shrink-0">{m.count}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders + Hourly Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
            <div className="flex items-center justify-between mb-4">
              <p className="font-display font-semibold text-espresso-deep">Order Terbaru</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-olive-sage rounded-full animate-pulse" />
                <span className="text-cafe-muted text-xs">Live</span>
              </div>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-cafe-muted text-sm text-center py-8">Belum ada order masuk hari ini</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-3 py-2 border-b border-latte/40 last:border-0">
                    <div className="w-8 h-8 bg-espresso-dark/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-espresso-dark text-xs font-bold">{order.tableNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-espresso-deep text-sm font-semibold">{order.orderNumber}</p>
                      <p className="text-cafe-muted text-xs truncate">{order.items.map((i) => i.menuItemName).join(', ')}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-espresso-dark text-sm font-bold">{formatRupiah(order.totalAmount)}</p>
                      <p className="text-cafe-muted text-xs">{formatTime(order.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
            <p className="font-display font-semibold text-espresso-deep mb-1">Jam Tersibuk</p>
            <p className="text-cafe-muted text-xs mb-4">Jumlah order per jam</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={12}>
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: '#A08060' }} />
                <YAxis tick={{ fontSize: 9, fill: '#A08060' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #EDE0CC', fontSize: '11px' }} />
                <Bar dataKey="orders" fill="#D4A96A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {lowStockCount() > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-500">⚠️</span>
              <p className="font-semibold text-red-700 text-sm">{lowStockCount()} bahan baku mendekati habis</p>
            </div>
            <p className="text-red-500 text-xs">Segera hubungi supplier atau lakukan restok.</p>
          </div>
        )}
      </div>
    </div>
  )
}
