'use client'
import { useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminStore } from '@/lib/store/admin.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { InventoryItem } from '@/lib/types'
import { formatRupiah, formatDate } from '@/lib/utils/format'

const canManage = (role?: string) => ['super_admin', 'owner', 'manager', 'inventory'].includes(role ?? '')

const emptyItem = (): Omit<InventoryItem, 'id'> => ({
  name: '',
  unit: 'gram',
  currentStock: 0,
  minStock: 0,
  maxStock: 0,
  expiryDate: undefined,
  supplierId: '',
  supplierName: '',
  costPerUnit: 0,
  category: 'raw_material',
})

export default function InventoryPage() {
  const { inventory, suppliers, addInventoryItem, updateInventoryItem } = useAdminStore()
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'expiring'>('all')
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [addMode, setAddMode] = useState(false)
  const [form, setForm] = useState<Omit<InventoryItem, 'id'>>(emptyItem())
  const [expiryStr, setExpiryStr] = useState('')

  const now = new Date()
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const filtered = inventory.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'low' && i.currentStock <= i.minStock) ||
      (filter === 'expiring' && i.expiryDate && new Date(i.expiryDate) <= threeDays)
    return matchSearch && matchFilter
  })

  const lowCount = inventory.filter((i) => i.currentStock <= i.minStock).length
  const expiringCount = inventory.filter((i) => i.expiryDate && new Date(i.expiryDate) <= threeDays).length

  const openAdd = () => {
    setForm(emptyItem())
    setExpiryStr('')
    setAddMode(true)
  }

  const openEdit = (item: InventoryItem) => {
    setEditItem(item)
    setForm({ ...item })
    setExpiryStr(item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '')
  }

  const closeModal = () => { setAddMode(false); setEditItem(null) }

  const handleSupplierSelect = (supId: string) => {
    const sup = suppliers.find((s) => s.id === supId)
    setForm((f) => ({ ...f, supplierId: supId, supplierName: sup?.name ?? '' }))
  }

  const handleSave = () => {
    const expiry = expiryStr ? new Date(expiryStr) : undefined
    if (addMode) {
      const id = `inv-${Date.now()}`
      addInventoryItem({ id, ...form, expiryDate: expiry })
    } else if (editItem) {
      updateInventoryItem(editItem.id, { ...form, expiryDate: expiry })
    }
    closeModal()
  }

  const modalOpen = addMode || !!editItem

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

        {/* Filters + Add Button */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari bahan..."
            className="flex-1 min-w-48 px-4 py-2.5 bg-warm-white border border-latte rounded-xl text-sm text-espresso-deep placeholder:text-cafe-muted focus:outline-none focus:border-espresso-light"
          />
          {(['all', 'low', 'expiring'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${filter === f ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'}`}>
              {f === 'all' ? 'Semua' : f === 'low' ? 'Stok Menipis' : 'Akan Expired'}
            </button>
          ))}
          {canManage(user?.role) && (
            <button onClick={openAdd} className="bg-espresso-dark text-warm-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5">
              + Tambah Bahan
            </button>
          )}
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
                {canManage(user?.role) && <th className="text-center px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isLow = item.currentStock <= item.minStock
                const isExpiring = item.expiryDate && new Date(item.expiryDate) <= threeDays
                const pct = item.maxStock > 0 ? Math.min(100, (item.currentStock / item.maxStock) * 100) : 0
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
                          {isExpiring && '⚠️ '}{formatDate(new Date(item.expiryDate))}
                        </span>
                      ) : <span className="text-cafe-muted text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-espresso-mid">{item.supplierName}</td>
                    <td className="px-4 py-3 text-right text-xs text-espresso-mid">{formatRupiah(Math.round(item.costPerUnit * 1000))}/{item.unit}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        isLow ? 'bg-red-50 text-red-500' : isExpiring ? 'bg-amber-50 text-amber-600' : 'bg-olive-sage/10 text-olive-sage'
                      }`}>
                        {isLow ? 'Menipis' : isExpiring ? 'Segera Exp' : 'Aman'}
                      </span>
                    </td>
                    {canManage(user?.role) && (
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => openEdit(item)} className="text-xs font-semibold text-espresso-mid bg-cream-base px-3 py-1 rounded-lg border border-latte hover:bg-latte/30 transition-colors">
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Bahan */}
      {modalOpen && (
        <div className="fixed inset-0 bg-espresso-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-warm-white rounded-3xl p-6 w-full max-w-lg shadow-warm-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display font-bold text-espresso-deep text-lg">
                {addMode ? 'Tambah Bahan Baru' : `Edit — ${editItem?.name}`}
              </p>
              <button onClick={closeModal} className="text-cafe-muted text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Nama Bahan</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Satuan</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-espresso-light">
                    {['gram', 'ml', 'pcs', 'kg', 'liter', 'sachet', 'botol'].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Kategori</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as InventoryItem['category'] })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-espresso-light">
                    <option value="raw_material">Bahan Baku</option>
                    <option value="packaging">Packaging</option>
                    <option value="consumable">Consumable</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Stok Saat Ini</label>
                  <input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Stok Minimum</label>
                  <input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Stok Maksimum</label>
                  <input type="number" value={form.maxStock} onChange={(e) => setForm({ ...form, maxStock: Number(e.target.value) })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Harga per Unit (Rp)</label>
                  <input type="number" step="0.001" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: Number(e.target.value) })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Tanggal Expired (opsional)</label>
                  <input type="date" value={expiryStr} onChange={(e) => setExpiryStr(e.target.value)}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Supplier</label>
                  <select value={form.supplierId} onChange={(e) => handleSupplierSelect(e.target.value)}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-espresso-light">
                    <option value="">-- Pilih Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={closeModal} className="flex-1 border border-latte text-espresso-mid py-2.5 rounded-xl text-sm font-semibold">Batal</button>
              <button onClick={handleSave} disabled={!form.name}
                className="flex-1 bg-espresso-dark text-warm-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
