'use client'
import { useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminStore } from '@/lib/store/admin.store'
import { formatRupiah, formatDate } from '@/lib/utils/format'

export default function InventoryPage() {
  const { inventory } = useAdminStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'expiring'>('all')

  const now = new Date()
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const filtered = inventory.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'low' && i.currentStock <= i.minStock) ||
      (filter === 'expiring' && i.expiryDate && i.expiryDate <= threeDays)
    return matchSearch && matchFilter
  })

  const lowCount = inventory.filter((i) => i.currentStock <= i.minStock).length
  const expiringCount = inventory.filter((i) => i.expiryDate && i.expiryDate <= threeDays).length

  return (
    <div className="min-h-screen">
      <AdminHeader title="Inventori" subtitle={`${inventory.length} bahan baku terdaftar`} />
      <div className="p-6">
        {/* Alerts */}
        {(lowCount > 0 || expiringCount > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {lowCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red-700 text-sm">{lowCount} stok menipis</p>
                  <p className="text-red-500 text-xs">Segera restok ke supplier</p>
                </div>
              </div>
            )}
            {expiringCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="font-semibold text-amber-700 text-sm">{expiringCount} mendekati expired</p>
                  <p className="text-amber-500 text-xs">Habiskan dalam 3 hari</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari bahan..."
            className="flex-1 px-4 py-2.5 bg-warm-white border border-latte rounded-xl text-sm text-espresso-deep placeholder:text-cafe-muted focus:outline-none focus:border-espresso-light"
          />
          {(['all', 'low', 'expiring'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${filter === f ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'}`}>
              {f === 'all' ? 'Semua' : f === 'low' ? 'Stok Menipis' : 'Akan Expired'}
            </button>
          ))}
        </div>

        <div className="bg-warm-white rounded-2xl shadow-warm-sm border border-latte/40 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-latte">
                <th className="text-left px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Bahan</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Stok</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Min</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Expired</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Supplier</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Harga/unit</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isLow = item.currentStock <= item.minStock
                const isExpiring = item.expiryDate && item.expiryDate <= threeDays
                const pct = Math.min(100, (item.currentStock / item.maxStock) * 100)

                return (
                  <tr key={item.id} className="border-b border-latte/30 hover:bg-cream-base/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-espresso-deep text-sm">{item.name}</p>
                      <p className="text-cafe-muted text-xs capitalize">{item.category.replace('_', ' ')}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className={`font-bold text-sm ${isLow ? 'text-red-500' : 'text-espresso-deep'}`}>
                        {item.currentStock.toLocaleString()} {item.unit}
                      </p>
                      <div className="w-16 h-1.5 bg-cream-base rounded-full mt-1 ml-auto overflow-hidden">
                        <div className={`h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-olive-sage'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-cafe-muted">{item.minStock.toLocaleString()} {item.unit}</td>
                    <td className="px-4 py-3">
                      {item.expiryDate ? (
                        <span className={`text-xs font-semibold ${isExpiring ? 'text-red-500' : 'text-cafe-muted'}`}>
                          {isExpiring && '⚠️ '}{formatDate(item.expiryDate)}
                        </span>
                      ) : <span className="text-cafe-muted text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-espresso-mid">{item.supplierName}</td>
                    <td className="px-4 py-3 text-right text-xs text-espresso-mid">{formatRupiah(item.costPerUnit * 1000)}/kg</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        isLow ? 'bg-red-50 text-red-500' : isExpiring ? 'bg-amber-50 text-amber-600' : 'bg-olive-sage/10 text-olive-sage'
                      }`}>
                        {isLow ? 'Menipis' : isExpiring ? 'Segera Exp' : 'Aman'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
