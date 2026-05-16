'use client'
import { useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminStore } from '@/lib/store/admin.store'
import { formatRupiah } from '@/lib/utils/format'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const weeklyData = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => ({
  day, revenue: Math.floor(Math.random() * 3000000 + 1000000), orders: Math.floor(Math.random() * 80 + 20),
}))

const categoryData = [
  { name: 'Kopi', value: 42, color: '#6B4226' },
  { name: 'Non-Kopi', value: 18, color: '#D4A96A' },
  { name: 'Makanan', value: 28, color: '#8B6240' },
  { name: 'Dessert', value: 8, color: '#D4B896' },
  { name: 'Bundle', value: 4, color: '#5C6B52' },
]

const branchData = [
  { branch: 'Utama', revenue: 4200000, orders: 87 },
  { branch: 'Selatan', revenue: 2800000, orders: 58 },
  { branch: 'Timur', revenue: 1900000, orders: 42 },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const { orders } = useAdminStore()
  const totalRevenue = weeklyData.reduce((s, d) => s + d.revenue, 0)

  return (
    <div className="min-h-screen">
      <AdminHeader title="Laporan & Analitik" subtitle="Performa penjualan multi cabang" />
      <div className="p-6 space-y-5">
        {/* Period selector */}
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all capitalize ${period === p ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'}`}>
              {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-espresso-deep rounded-2xl p-5"><p className="text-espresso-light/70 text-xs uppercase tracking-wider mb-1">Total Pendapatan</p><p className="font-display text-2xl font-bold text-espresso-light">{formatRupiah(totalRevenue)}</p></div>
          <div className="bg-warm-white rounded-2xl p-5 border border-latte/40"><p className="text-cafe-muted text-xs uppercase tracking-wider mb-1">Total Order</p><p className="font-display text-2xl font-bold text-espresso-deep">{weeklyData.reduce((s, d) => s + d.orders, 0)}</p></div>
          <div className="bg-warm-white rounded-2xl p-5 border border-latte/40"><p className="text-cafe-muted text-xs uppercase tracking-wider mb-1">Avg per Order</p><p className="font-display text-2xl font-bold text-espresso-deep">{formatRupiah(Math.floor(totalRevenue / weeklyData.reduce((s, d) => s + d.orders, 0)))}</p></div>
          <div className="bg-warm-white rounded-2xl p-5 border border-latte/40"><p className="text-cafe-muted text-xs uppercase tracking-wider mb-1">Hari Terbaik</p><p className="font-display text-2xl font-bold text-espresso-deep">{weeklyData.reduce((best, d) => d.revenue > best.revenue ? d : best, weeklyData[0]).day}</p></div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
          <p className="font-display font-semibold text-espresso-deep mb-4">Pendapatan Mingguan</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs><linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6B4226" stopOpacity={0.2} /><stop offset="95%" stopColor="#6B4226" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE0CC" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#A08060' }} />
              <YAxis tick={{ fontSize: 10, fill: '#A08060' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
              <Tooltip formatter={(v) => [formatRupiah(Number(v)), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #EDE0CC', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6B4226" strokeWidth={2.5} fill="url(#grad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category + Branch */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Category Breakdown */}
          <div className="bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
            <p className="font-display font-semibold text-espresso-deep mb-4">Distribusi Kategori Menu</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={categoryData} cx={75} cy={75} innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
                    {categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-espresso-mid text-sm">{c.name}</span>
                    </div>
                    <span className="font-bold text-espresso-deep text-sm">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Branch Comparison */}
          <div className="bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
            <p className="font-display font-semibold text-espresso-deep mb-4">Performa Per Cabang</p>
            <div className="space-y-4">
              {branchData.map((b) => (
                <div key={b.branch}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-espresso-deep">{b.branch}</span>
                    <span className="text-espresso-dark font-bold">{formatRupiah(b.revenue)}</span>
                  </div>
                  <div className="h-2 bg-cream-base rounded-full overflow-hidden">
                    <div className="h-full bg-espresso-dark rounded-full transition-all" style={{ width: `${(b.revenue / branchData[0].revenue) * 100}%` }} />
                  </div>
                  <p className="text-cafe-muted text-xs mt-1">{b.orders} order</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
