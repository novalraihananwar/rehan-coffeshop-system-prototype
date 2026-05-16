'use client'
import { useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { menuItems as initialMenus } from '@/lib/mock-data/menu'
import { MenuItem, MenuCategory } from '@/lib/types'
import { formatRupiah } from '@/lib/utils/format'

const categories = ['Semua', 'coffee', 'non-coffee', 'food', 'dessert', 'bundle']
const catLabel: Record<string, string> = { 'Semua': 'Semua', coffee: 'Kopi', 'non-coffee': 'Non-Kopi', food: 'Makanan', dessert: 'Dessert', bundle: 'Paket' }

export default function MenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>(initialMenus)
  const [cat, setCat] = useState('Semua')
  const [search, setSearch] = useState('')
  const [editItem, setEditItem] = useState<MenuItem | null>(null)

  const filtered = menus.filter((m) => {
    const matchCat = cat === 'Semua' || m.category === cat
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const toggleAvailable = (id: string) =>
    setMenus((prev) => prev.map((m) => m.id === id ? { ...m, isAvailable: !m.isAvailable } : m))

  return (
    <div className="min-h-screen">
      <AdminHeader title="Manajemen Menu" subtitle={`${menus.length} menu terdaftar`} />
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari menu..."
            className="flex-1 px-4 py-2.5 bg-warm-white border border-latte rounded-xl text-sm text-espresso-deep placeholder:text-cafe-muted focus:outline-none focus:border-espresso-light"
          />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${cat === c ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'}`}>
                {catLabel[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className={`bg-warm-white rounded-2xl overflow-hidden shadow-warm-sm border border-latte/40 ${!item.isAvailable ? 'opacity-60' : ''}`}>
              <div className="relative h-32">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {item.isBestseller && <span className="bg-espresso-dark text-warm-white text-[9px] font-bold px-2 py-0.5 rounded-full">⭐</span>}
                  {item.isNew && <span className="bg-olive-sage text-warm-white text-[9px] font-bold px-2 py-0.5 rounded-full">NEW</span>}
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-espresso-deep text-sm line-clamp-1 mb-1">{item.name}</p>
                <p className="text-espresso-dark font-bold text-sm mb-2">{formatRupiah(item.prices.M)}</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => toggleAvailable(item.id)}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${item.isAvailable ? 'bg-olive-sage/15 text-olive-sage' : 'bg-red-50 text-red-500'}`}
                  >
                    {item.isAvailable ? 'Tersedia' : 'Habis'}
                  </button>
                  <button
                    onClick={() => setEditItem(item)}
                    className="px-2 py-1.5 text-[10px] font-bold bg-cream-base text-espresso-mid rounded-lg border border-latte"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Edit Modal */}
        {editItem && (
          <div className="fixed inset-0 bg-espresso-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-warm-white rounded-3xl p-6 w-full max-w-md shadow-warm-lg">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-bold text-espresso-deep">Edit Menu</p>
                <button onClick={() => setEditItem(null)} className="text-cafe-muted">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Nama Menu</p>
                  <input
                    value={editItem.name}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm text-espresso-deep focus:outline-none focus:border-espresso-light"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['S', 'M', 'L'] as const).map((size) => (
                    <div key={size}>
                      <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Harga {size}</p>
                      <input
                        type="number"
                        value={editItem.prices[size]}
                        onChange={(e) => setEditItem({ ...editItem, prices: { ...editItem.prices, [size]: parseInt(e.target.value) } })}
                        className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm text-espresso-deep focus:outline-none focus:border-espresso-light"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <label className="flex items-center gap-2 text-sm text-espresso-mid cursor-pointer">
                    <input type="checkbox" checked={editItem.isBestseller} onChange={(e) => setEditItem({ ...editItem, isBestseller: e.target.checked })} />
                    Bestseller
                  </label>
                  <label className="flex items-center gap-2 text-sm text-espresso-mid cursor-pointer">
                    <input type="checkbox" checked={editItem.isNew} onChange={(e) => setEditItem({ ...editItem, isNew: e.target.checked })} />
                    New
                  </label>
                  <label className="flex items-center gap-2 text-sm text-espresso-mid cursor-pointer">
                    <input type="checkbox" checked={editItem.isPromo} onChange={(e) => setEditItem({ ...editItem, isPromo: e.target.checked })} />
                    Promo
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setEditItem(null)} className="flex-1 border border-latte text-espresso-mid py-2.5 rounded-xl text-sm font-semibold">Batal</button>
                <button
                  onClick={() => { setMenus((prev) => prev.map((m) => m.id === editItem.id ? editItem : m)); setEditItem(null) }}
                  className="flex-1 bg-espresso-dark text-warm-white py-2.5 rounded-xl text-sm font-bold"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
