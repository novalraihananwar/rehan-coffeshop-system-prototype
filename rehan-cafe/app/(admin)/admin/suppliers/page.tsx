'use client'
import { useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminStore } from '@/lib/store/admin.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { Supplier } from '@/lib/types'

const canManage = (role?: string) => ['super_admin', 'owner', 'manager', 'inventory'].includes(role ?? '')

const emptySupplier = (): Omit<Supplier, 'id'> => ({
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  products: [],
  isActive: true,
  rating: 4.5,
})

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier } = useAdminStore()
  const { user } = useAuthStore()
  const [editItem, setEditItem] = useState<Supplier | null>(null)
  const [addMode, setAddMode] = useState(false)
  const [form, setForm] = useState<Omit<Supplier, 'id'>>(emptySupplier())
  const [productInput, setProductInput] = useState('')

  const openAdd = () => {
    setForm(emptySupplier())
    setProductInput('')
    setAddMode(true)
  }

  const openEdit = (s: Supplier) => {
    setEditItem(s)
    setForm({ ...s })
    setProductInput(s.products.join(', '))
  }

  const closeModal = () => { setAddMode(false); setEditItem(null) }

  const handleSave = () => {
    const products = productInput.split(',').map((p) => p.trim()).filter(Boolean)
    if (addMode) {
      const id = `sup-${Date.now()}`
      addSupplier({ id, ...form, products })
    } else if (editItem) {
      updateSupplier(editItem.id, { ...form, products })
    }
    closeModal()
  }

  const modalOpen = addMode || !!editItem

  return (
    <div className="min-h-screen">
      <AdminHeader title="Supplier" subtitle={`${suppliers.length} supplier terdaftar`} />
      <div className="p-6">
        {canManage(user?.role) && (
          <div className="mb-5 flex justify-end">
            <button onClick={openAdd} className="bg-espresso-dark text-warm-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5">
              + Tambah Supplier
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-espresso-dark/10 rounded-xl flex items-center justify-center text-xl">🚚</div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.isActive ? 'bg-olive-sage/15 text-olive-sage' : 'bg-red-50 text-red-500'}`}>
                    {s.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  {canManage(user?.role) && (
                    <button onClick={() => openEdit(s)} className="text-xs text-cafe-muted bg-cream-base px-2.5 py-1 rounded-lg border border-latte">Edit</button>
                  )}
                </div>
              </div>
              <p className="font-display font-bold text-espresso-deep mb-0.5">{s.name}</p>
              <p className="text-cafe-muted text-xs mb-3">PIC: {s.contactPerson}</p>
              <div className="space-y-1 text-xs text-cafe-muted mb-3">
                {s.email && <p>📧 {s.email}</p>}
                {s.phone && <p>📞 {s.phone}</p>}
                {s.address && <p>📍 {s.address}</p>}
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-espresso-mid uppercase tracking-wider">Produk</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-xs ${star <= s.rating ? 'text-espresso-light' : 'text-latte'}`}>★</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {s.products.slice(0, 3).map((p) => (
                  <span key={p} className="bg-cream-base text-espresso-mid text-[10px] font-semibold px-2 py-0.5 rounded-full">{p}</span>
                ))}
                {s.products.length > 3 && (
                  <span className="bg-cream-base text-cafe-muted text-[10px] px-2 py-0.5 rounded-full">+{s.products.length - 3}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Tambah / Edit Supplier */}
      {modalOpen && (
        <div className="fixed inset-0 bg-espresso-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-warm-white rounded-3xl p-6 w-full max-w-md shadow-warm-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display font-bold text-espresso-deep text-lg">
                {addMode ? 'Tambah Supplier Baru' : `Edit — ${editItem?.name}`}
              </p>
              <button onClick={closeModal} className="text-cafe-muted text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Nama Perusahaan / Supplier</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
              </div>
              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Nama PIC / Contact Person</label>
                <input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">No. Telepon</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Alamat Lengkap</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2}
                  className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Produk yang Disuplai</label>
                <input value={productInput} onChange={(e) => setProductInput(e.target.value)}
                  placeholder="Contoh: Biji Kopi Arabica, Susu Full Cream"
                  className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                <p className="text-[10px] text-cafe-muted mt-1">Pisahkan dengan koma</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Rating (1-5)</label>
                  <input type="number" min={1} max={5} step={0.1} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Status</label>
                  <select value={form.isActive ? 'active' : 'inactive'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-espresso-light">
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
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
