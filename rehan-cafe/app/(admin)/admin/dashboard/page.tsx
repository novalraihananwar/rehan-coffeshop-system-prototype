'use client'
import { useEffect, useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import StatCard from '@/components/admin/StatCard'
import { useAdminStore } from '@/lib/store/admin.store'
import { useOrderStore } from '@/lib/store/order.store'
import { formatRupiah, formatTime, generateId, generateOrderNumber } from '@/lib/utils/format'
import { Order } from '@/lib/types'
import { mockOrders } from '@/lib/mock-data/orders'
import { menuItems } from '@/lib/mock-data/menu'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const hourlyData = Array.from({ length: 12 }, (_, i) => ({
  hour: `${8 + i}:00`,
  revenue: Math.floor(Math.random() * 800000 + 100000),
  orders: Math.floor(Math.random() * 20 + 3),
}))

const topMenus = menuItems
  .filter((m) => m.isBestseller)
  .slice(0, 5)
  .map((m, i) => ({ name: m.name, orders: Math.floor(Math.random() * 50 + 20 - i * 5) }))
  .sort((a, b) => b.orders - a.orders)

export default function DashboardPage() {
  const { orders, tables, inventory, notifications, addIncomingOrder, todayRevenue, todayOrders, activeTablesCount, lowStockCount } = useAdminStore()
  const [chartData, setChartData] = useState(hourlyData)
  const [tick, setTick] = useState(0)

  // Simulated realtime: incoming orders every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMenu = menuItems[Math.floor(Math.random() * 10)]
      const tableNum = Math.floor(Math.random() * 40) + 1
      const newOrder: Order = {
        id: generateId('ord'),
        orderNumber: generateOrderNumber(),
        tableId: `table-${String(tableNum).padStart(3, '0')}`,
        tableNumber: tableNum,
        type: 'dine_in',
        items: [{ menuItemId: randomMenu.id, menuItemName: randomMenu.name, menuItemImage: randomMenu.image, size: 'M', quantity: Math.floor(Math.random() * 2) + 1, notes: '', unitPrice: randomMenu.prices.M, subtotal: randomMenu.prices.M * 2 }],
        status: 'confirmed',
        totalAmount: randomMenu.prices.M * (Math.floor(Math.random() * 2) + 1),
        paymentMethod: 'qris',
        createdAt: new Date(), updatedAt: new Date(), estimatedTime: 15,
        notes: '', customerName: 'Customer', branch: 'branch-001',
      }
      addIncomingOrder(newOrder)
      setTick((t) => t + 1)
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  // Update chart every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => prev.map((d, i) =>
        i === prev.length - 1
          ? { ...d, revenue: d.revenue + Math.floor(Math.random() * 50000), orders: d.orders + Math.floor(Math.random() * 3) }
          : d
      ))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const recentOrders = orders.slice(0, 6)

  return (
    <div className="min-h-screen">
      <AdminHeader title="Dashboard" subtitle="Overview operasional hari ini" />

      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard dark title="Total Pendapatan" value={formatRupiah(todayRevenue() + 3200000)} icon="💰" trend={{ value: '+12% vs kemarin', positive: true }} />
          <StatCard title="Total Order" value={String(todayOrders() + 82)} icon="🛒" trend={{ value: '+8 order', positive: true }} />
          <StatCard title="Meja Aktif" value={`${activeTablesCount()}/100`} icon="🪑" />
          <StatCard title="Customer" value="312" icon="👥" trend={{ value: '+24 hari ini', positive: true }} />
          <StatCard title="Avg Order" value="Rp 68.000" icon="📊" />
          {lowStockCount() > 0
            ? <StatCard title="Stock Menipis" value={String(lowStockCount())} icon="⚠️" subtitle="Segera restok" />
            : <StatCard title="Stock" value="Aman" icon="✅" subtitle="Semua terpenuhi" />}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display font-semibold text-espresso-deep">Penjualan Per Jam</p>
                <p className="text-cafe-muted text-xs mt-0.5">Update realtime setiap 5 detik</p>
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

          {/* Top Menus */}
          <div className="bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
            <p className="font-display font-semibold text-espresso-deep mb-4">Menu Terlaris</p>
            <div className="space-y-3">
              {topMenus.map((m, i) => (
                <div key={m.name} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-espresso-dark text-warm-white' : 'bg-cream-base text-espresso-mid'}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-espresso-deep text-xs font-semibold truncate">{m.name}</p>
                    <div className="h-1.5 bg-cream-base rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-espresso-light rounded-full transition-all" style={{ width: `${(m.orders / topMenus[0].orders) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-cafe-muted text-xs flex-shrink-0">{m.orders}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders + Hourly Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
            <div className="flex items-center justify-between mb-4">
              <p className="font-display font-semibold text-espresso-deep">Order Terbaru</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-olive-sage rounded-full animate-pulse" />
                <span className="text-cafe-muted text-xs">Live</span>
              </div>
            </div>
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
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      order.status === 'completed' ? 'bg-olive-sage/15 text-olive-sage' :
                      order.status === 'preparing' ? 'bg-espresso-light/20 text-espresso-mid' :
                      order.status === 'ready' ? 'bg-blue-100 text-blue-600' :
                      'bg-cream-base text-cafe-muted'
                    }`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Orders Bar */}
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

        {/* Low Stock Alert */}
        {lowStockCount() > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
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
