'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart.store'
import { useCustomerAuthStore } from '@/lib/store/customer-auth.store'
import { menuItems, getMenuByCategory } from '@/lib/mock-data/menu'
import { MenuItem, MenuCategory } from '@/lib/types'
import MenuCard from '@/components/customer/MenuCard'
import CategoryTabs from '@/components/customer/CategoryTabs'
import CartBar from '@/components/customer/CartBar'
import SplashScreen from '@/components/customer/SplashScreen'
import Link from 'next/link'

const categories = [
  { key: 'all', label: 'Semua', emoji: '✨' },
  { key: 'coffee', label: 'Kopi', emoji: '☕' },
  { key: 'non-coffee', label: 'Non-Kopi', emoji: '🍵' },
  { key: 'food', label: 'Makanan', emoji: '🍝' },
  { key: 'dessert', label: 'Dessert', emoji: '🍰' },
  { key: 'bundle', label: 'Paket', emoji: '🎁' },
]

const filters = ['Semua', 'Bestseller', 'New', 'Promo']

export default function MenuPage() {
  const params = useParams()
  const tableId = params.tableId as string
  const tableNumber = parseInt(tableId.replace('table-', '')) || parseInt(tableId)

  const { setTable } = useCartStore()
  const { customer } = useCustomerAuthStore()

  const [showSplash, setShowSplash] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setTable(tableId, tableNumber)
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [tableId, tableNumber, setTable])

  const filtered = menuItems.filter((item) => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory
    const matchFilter =
      activeFilter === 'Semua' ||
      (activeFilter === 'Bestseller' && item.isBestseller) ||
      (activeFilter === 'New' && item.isNew) ||
      (activeFilter === 'Promo' && item.isPromo)
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchFilter && matchSearch
  })

  if (showSplash) return <SplashScreen tableNumber={tableNumber} />

  return (
    <div className="min-h-screen bg-cream-base pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-warm-white border-b border-latte">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-espresso-light tracking-widest uppercase">Rehan Cafe & Eatery</p>
              <h1 className="font-display text-xl font-bold text-espresso-deep">
                Meja {tableNumber}
              </h1>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 bg-espresso-dark/10 text-espresso-dark text-xs font-semibold px-3 py-1.5 rounded-full">
                🪑 Dine In
              </span>
            </div>
          </div>

          {/* Member Banner */}
          {customer ? (
            <Link href="/member" className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🎁</span>
                <div>
                  <p className="text-xs font-bold text-amber-900">{customer.name}</p>
                  <p className="text-[10px] text-amber-700">{customer.loyalty_points.toLocaleString('id-ID')} poin aktif · {customer.tier.charAt(0).toUpperCase()+customer.tier.slice(1)}</p>
                </div>
              </div>
              <span className="text-amber-800 text-xs font-semibold">→</span>
            </Link>
          ) : (
            <Link href={`/member/login?redirect=/table/${tableId}`} className="flex items-center justify-between bg-espresso-dark/5 border border-espresso-dark/15 rounded-xl px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🎁</span>
                <div>
                  <p className="text-xs font-bold text-espresso-deep">Kumpulkan Poin Loyalty</p>
                  <p className="text-[10px] text-cafe-muted">Login atau daftar sebagai member</p>
                </div>
              </div>
              <span className="text-espresso-mid text-xs font-semibold">→</span>
            </Link>
          )}

          {/* Reservation Banner */}
          <a href={`/table/${tableId}/reservation`} className="flex items-center justify-between bg-espresso-dark/5 border border-espresso-dark/15 rounded-xl px-3 py-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🪑</span>
              <div>
                <p className="text-xs font-bold text-espresso-deep">Reservasi Meja</p>
                <p className="text-[10px] text-cafe-muted">Pesan meja untuk kunjungan berikutnya</p>
              </div>
            </div>
            <span className="text-espresso-mid text-xs font-semibold">→</span>
          </a>

          {/* Search */}
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cafe-muted text-sm">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu favorit..."
              className="w-full pl-9 pr-4 py-2.5 bg-cream-base rounded-xl text-sm text-espresso-deep placeholder:text-cafe-muted border border-latte focus:outline-none focus:border-espresso-light transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <CategoryTabs
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                activeFilter === f
                  ? 'bg-espresso-dark text-warm-white'
                  : 'bg-cream-base text-espresso-mid border border-latte'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="px-4 pt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-cafe-muted">
            <p className="text-4xl mb-3">☕</p>
            <p className="font-semibold">Menu tidak ditemukan</p>
            <p className="text-sm mt-1">Coba kata kunci lain</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-3"
          >
            <AnimatePresence>
              {filtered.map((item) => (
                <MenuCard key={item.id} item={item} tableId={tableId} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <CartBar tableId={tableId} />
    </div>
  )
}
