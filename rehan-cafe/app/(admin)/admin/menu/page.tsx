'use client'
import { useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminStore } from '@/lib/store/admin.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { MenuItem, MenuCategory, MenuIngredient } from '@/lib/types'
import { formatRupiah } from '@/lib/utils/format'

const categories = ['Semua', 'coffee', 'non-coffee', 'food', 'dessert', 'bundle']
const catLabel: Record<string, string> = {
  Semua: 'Semua', coffee: 'Kopi', 'non-coffee': 'Non-Kopi', food: 'Makanan', dessert: 'Dessert', bundle: 'Paket',
}

const canManage = (role?: string) => ['super_admin', 'owner', 'manager'].includes(role ?? '')

const emptyMenu = (): Omit<MenuItem, 'id'> => ({
  name: '',
  description: '',
  category: 'coffee',
  image: '',
  prices: { S: 0, M: 0, L: 0 },
  rating: 5.0,
  reviewCount: 0,
  isAvailable: true,
  isBestseller: false,
  isNew: true,
  isPromo: false,
  tags: [],
  pairsWith: [],
  preparationTime: 5,
  ingredients: [],
})

export default function MenuPage() {
  const { menuItems, inventory, toggleMenuAvailable, updateMenuItem, addMenuItem } = useAdminStore()
  const { user } = useAuthStore()
  const [cat, setCat] = useState('Semua')
  const [search, setSearch] = useState('')
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [addMode, setAddMode] = useState(false)
  const [form, setForm] = useState<Omit<MenuItem, 'id'>>(emptyMenu())
  const [ingredientEdit, setIngredientEdit] = useState<MenuIngredient[]>([])
  const [ingredientTab, setIngredientTab] = useState(false)

  const filtered = menuItems.filter((m) => {
    const matchCat = cat === 'Semua' || m.category === cat
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const openAdd = () => {
    setForm(emptyMenu())
    setIngredientEdit([])
    setAddMode(true)
    setIngredientTab(false)
  }

  const openEdit = (item: MenuItem) => {
    setEditItem(item)
    setForm({ ...item })
    setIngredientEdit([...(item.ingredients ?? [])])
    setIngredientTab(false)
  }

  const closeModal = () => { setAddMode(false); setEditItem(null) }

  const addIngredientRow = () => setIngredientEdit((prev) => [...prev, { inventoryItemId: '', amount: 0 }])
  const removeIngredientRow = (idx: number) => setIngredientEdit((prev) => prev.filter((_, i) => i !== idx))
  const updateIngredientRow = (idx: number, field: keyof MenuIngredient, value: string | number) =>
    setIngredientEdit((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))

  const handleSave = () => {
    const ingredientsToSave = ingredientEdit.filter((r) => r.inventoryItemId && r.amount > 0)
    if (addMode) {
      const id = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
      addMenuItem({ id, ...form, ingredients: ingredientsToSave })
    } else if (editItem) {
      updateMenuItem(editItem.id, { ...form, ingredients: ingredientsToSave })
    }
    closeModal()
  }

  const modalOpen = addMode || !!editItem

  return (
    <div className="min-h-screen">
      <AdminHeader title="Manajemen Menu" subtitle={`${menuItems.length} menu terdaftar`} />
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari menu..."
            className="flex-1 px-4 py-2.5 bg-warm-white border border-latte rounded-xl text-sm text-espresso-deep placeholder:text-cafe-muted focus:outline-none focus:border-espresso-light"
          />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-wrap">
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${cat === c ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'}`}>
                {catLabel[c]}
              </button>
            ))}
            {canManage(user?.role) && (
              <button onClick={openAdd} className="flex-shrink-0 bg-olive-sage text-warm-white text-xs font-bold px-4 py-2 rounded-xl">
                + Tambah Menu
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className={`bg-warm-white rounded-2xl overflow-hidden shadow-warm-sm border border-latte/40 ${!item.isAvailable ? 'opacity-60' : ''}`}>
              <div className="relative h-32">
                <img src={item.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {item.isBestseller && <span className="bg-espresso-dark text-warm-white text-[9px] font-bold px-2 py-0.5 rounded-full">⭐</span>}
                  {item.isNew && <span className="bg-olive-sage text-warm-white text-[9px] font-bold px-2 py-0.5 rounded-full">NEW</span>}
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-espresso-deep text-sm line-clamp-1 mb-1">{item.name}</p>
                <p className="text-espresso-dark font-bold text-sm mb-2">{formatRupiah(item.prices.M)}</p>
                {item.ingredients && item.ingredients.length > 0 && (
                  <p className="text-cafe-muted text-[10px] mb-1.5">🧪 {item.ingredients.length} bahan</p>
                )}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => toggleMenuAvailable(item.id)}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${item.isAvailable ? 'bg-olive-sage/15 text-olive-sage' : 'bg-red-50 text-red-500'}`}
                  >
                    {item.isAvailable ? 'Tersedia' : 'Habis'}
                  </button>
                  {canManage(user?.role) && (
                    <button
                      onClick={() => openEdit(item)}
                      className="px-2 py-1.5 text-[10px] font-bold bg-cream-base text-espresso-mid rounded-lg border border-latte"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Tambah / Edit Menu */}
      {modalOpen && (
        <div className="fixed inset-0 bg-espresso-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-warm-white rounded-3xl w-full max-w-xl shadow-warm-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-warm-white px-6 pt-6 pb-3 border-b border-latte/40 z-10">
              <div className="flex items-center justify-between mb-3">
                <p className="font-display font-bold text-espresso-deep text-lg">
                  {addMode ? 'Tambah Menu Baru' : `Edit — ${editItem?.name}`}
                </p>
                <button onClick={closeModal} className="text-cafe-muted text-xl">✕</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIngredientTab(false)}
                  className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all ${!ingredientTab ? 'bg-espresso-dark text-warm-white' : 'bg-cream-base text-espresso-mid'}`}>
                  Info Menu
                </button>
                <button onClick={() => setIngredientTab(true)}
                  className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all ${ingredientTab ? 'bg-espresso-dark text-warm-white' : 'bg-cream-base text-espresso-mid'}`}>
                  Bahan ({ingredientEdit.length})
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {!ingredientTab ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Nama Menu</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Deskripsi</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                      className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Kategori</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MenuCategory })}
                        className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-espresso-light">
                        <option value="coffee">Kopi</option>
                        <option value="non-coffee">Non-Kopi</option>
                        <option value="food">Makanan</option>
                        <option value="dessert">Dessert</option>
                        <option value="bundle">Bundle</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Waktu Prep (menit)</label>
                      <input type="number" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: Number(e.target.value) })}
                        className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">URL Gambar</label>
                    <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Harga (Rp)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['S', 'M', 'L'] as const).map((size) => (
                        <div key={size}>
                          <p className="text-[10px] text-cafe-muted mb-1">Size {size}</p>
                          <input type="number" value={form.prices[size]}
                            onChange={(e) => setForm({ ...form, prices: { ...form.prices, [size]: Number(e.target.value) } })}
                            className="w-full border border-latte rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-espresso-light" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { key: 'isBestseller', label: 'Bestseller' },
                      { key: 'isNew', label: 'New' },
                      { key: 'isPromo', label: 'Promo' },
                      { key: 'isAvailable', label: 'Tersedia' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-espresso-mid cursor-pointer">
                        <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                          onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
                        {label}
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {(form.category === 'coffee' || form.category === 'non-coffee') ? (
                    <p className="text-xs text-cafe-muted">
                      Input jumlah bahan untuk <span className="font-semibold text-espresso-mid">ukuran M (12oz / 355ml)</span>. Ukuran S otomatis <strong>80%</strong> dan L otomatis <strong>120%</strong> dari jumlah ini saat order masuk.
                    </p>
                  ) : (
                    <p className="text-xs text-cafe-muted">
                      Input jumlah bahan untuk <span className="font-semibold text-espresso-mid">satu porsi standar</span>. Jumlah tidak berubah terlepas dari pilihan Reguler/Besar.
                    </p>
                  )}
                  <div className="space-y-2">
                    {ingredientEdit.map((ing, idx) => {
                      const invItem = inventory.find((i) => i.id === ing.inventoryItemId)
                      return (
                        <div key={idx} className="flex items-center gap-2 bg-cream-base/50 rounded-xl p-2.5">
                          <select value={ing.inventoryItemId}
                            onChange={(e) => updateIngredientRow(idx, 'inventoryItemId', e.target.value)}
                            className="flex-1 border border-latte rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none">
                            <option value="">-- Pilih Bahan --</option>
                            {inventory.map((i) => (
                              <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <input type="number" value={ing.amount} onChange={(e) => updateIngredientRow(idx, 'amount', Number(e.target.value))}
                              className="w-20 border border-latte rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none" />
                            <span className="text-xs text-cafe-muted w-8">{invItem?.unit ?? ''}</span>
                          </div>
                          <button onClick={() => removeIngredientRow(idx)} className="text-red-400 font-bold text-sm flex-shrink-0">✕</button>
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={addIngredientRow}
                    className="w-full border-2 border-dashed border-latte text-espresso-mid text-xs font-semibold py-2.5 rounded-xl hover:bg-cream-base/50 transition-colors">
                    + Tambah Bahan
                  </button>
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-warm-white px-6 pb-6 pt-3 border-t border-latte/40">
              <div className="flex gap-2">
                <button onClick={closeModal} className="flex-1 border border-latte text-espresso-mid py-2.5 rounded-xl text-sm font-semibold">Batal</button>
                <button onClick={handleSave} disabled={!form.name}
                  className="flex-1 bg-espresso-dark text-warm-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
                  Simpan Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
