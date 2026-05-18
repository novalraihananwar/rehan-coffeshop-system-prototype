'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { getMenuById } from '@/lib/mock-data/menu'
import { menuItems } from '@/lib/mock-data/menu'
import { MenuSize } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { formatRupiah } from '@/lib/utils/format'
import MenuCard from '@/components/customer/MenuCard'

const drinkSizes: { key: MenuSize; label: string; oz: string; ml: string }[] = [
  { key: 'S', label: 'Small', oz: '8oz', ml: '240ml' },
  { key: 'M', label: 'Medium', oz: '12oz', ml: '355ml' },
  { key: 'L', label: 'Large', oz: '16oz', ml: '470ml' },
]

const foodSizes: { key: MenuSize; label: string }[] = [
  { key: 'S', label: 'Reguler' },
  { key: 'L', label: 'Besar' },
]

export default function MenuDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tableId = params.tableId as string
  const menuId = params.menuId as string
  const item = getMenuById(menuId)

  const { addItem } = useCartStore()
  const isDrink = item?.category === 'coffee' || item?.category === 'non-coffee'
  const isFood = item?.category === 'food' || item?.category === 'dessert'
  const [selectedSize, setSelectedSize] = useState<MenuSize>(isFood ? 'S' : 'M')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [added, setAdded] = useState(false)

  if (!item) return (
    <div className="min-h-screen bg-cream-base flex items-center justify-center">
      <p className="text-cafe-muted">Menu tidak ditemukan</p>
    </div>
  )

  const pairs = item.pairsWith.map((id) => getMenuById(id)).filter(Boolean)

  const handleAdd = () => {
    addItem(item, selectedSize, quantity, notes)
    setAdded(true)
    setTimeout(() => router.back(), 800)
  }

  const price = item.prices[selectedSize] * quantity

  return (
    <div className="min-h-screen bg-cream-base pb-32">
      {/* Hero Image */}
      <div className="relative h-72">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-deep/80 via-transparent to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-warm-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-warm-sm text-espresso-deep font-bold"
        >
          ←
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex gap-1.5 mb-2">
            {item.isBestseller && <span className="bg-espresso-light/20 text-espresso-light text-[10px] font-bold px-2.5 py-1 rounded-full border border-espresso-light/30">⭐ Bestseller</span>}
            {item.isNew && <span className="bg-olive-sage/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">✨ New</span>}
          </div>
          <h1 className="font-display text-2xl font-bold text-warm-white">{item.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-espresso-light text-sm">⭐ {item.rating}</span>
            <span className="text-warm-white/50 text-xs">({item.reviewCount} ulasan)</span>
            <span className="text-warm-white/50 text-xs">·</span>
            <span className="text-warm-white/70 text-xs">~{item.preparationTime} menit</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Description */}
        <p className="text-cafe-muted text-sm leading-relaxed">{item.description}</p>

        {/* Size Selector */}
        {isDrink && (
          <div>
            <p className="font-display font-semibold text-espresso-deep mb-3">Pilih Ukuran</p>
            <div className="flex gap-3">
              {drinkSizes.map(({ key, label, oz, ml }) => (
                <button
                  key={key}
                  onClick={() => setSelectedSize(key)}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                    selectedSize === key
                      ? 'border-espresso-dark bg-espresso-dark text-warm-white'
                      : 'border-latte bg-warm-white text-espresso-mid'
                  }`}
                >
                  <p className="font-bold text-sm">{key}</p>
                  <p className="text-xs font-semibold opacity-90">{oz}</p>
                  <p className="text-[10px] opacity-60">{ml}</p>
                  <p className="font-semibold text-xs mt-1">{formatRupiah(item.prices[key])}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {isFood && (
          <div>
            <p className="font-display font-semibold text-espresso-deep mb-3">Pilih Porsi</p>
            <div className="flex gap-3">
              {foodSizes.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedSize(key)}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                    selectedSize === key
                      ? 'border-espresso-dark bg-espresso-dark text-warm-white'
                      : 'border-latte bg-warm-white text-espresso-mid'
                  }`}
                >
                  <p className="font-bold text-sm">{label}</p>
                  <p className="font-semibold text-xs mt-1">{formatRupiah(item.prices[key])}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isDrink && !isFood && (
          <div>
            <p className="font-display font-semibold text-espresso-deep mb-3">Pilih Paket</p>
            <div className="flex gap-3">
              {drinkSizes.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedSize(key)}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                    selectedSize === key
                      ? 'border-espresso-dark bg-espresso-dark text-warm-white'
                      : 'border-latte bg-warm-white text-espresso-mid'
                  }`}
                >
                  <p className="font-bold text-sm">{key}</p>
                  <p className="text-xs opacity-70">{label}</p>
                  <p className="font-semibold text-xs mt-1">{formatRupiah(item.prices[key])}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <p className="font-display font-semibold text-espresso-deep mb-3">Jumlah</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full bg-cream-base border border-latte text-espresso-dark font-bold flex items-center justify-center"
            >
              −
            </button>
            <span className="font-display font-bold text-espresso-deep text-xl w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full bg-espresso-dark text-warm-white font-bold flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="font-display font-semibold text-espresso-deep mb-2">Catatan (opsional)</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Misal: less sweet, no ice, extra shot..."
            rows={3}
            className="w-full px-4 py-3 bg-warm-white border border-latte rounded-xl text-sm text-espresso-deep placeholder:text-cafe-muted focus:outline-none focus:border-espresso-light resize-none"
          />
        </div>

        {/* Pair suggestions */}
        {pairs.length > 0 && (
          <div>
            <p className="font-display font-semibold text-espresso-deep mb-3">Cocok Dimakan Dengan</p>
            <div className="grid grid-cols-2 gap-3">
              {pairs.map((p) => p && <MenuCard key={p.id} item={p} tableId={tableId} />)}
            </div>
          </div>
        )}
      </div>

      {/* Add to Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-warm-white/95 backdrop-blur border-t border-latte">
        <motion.button
          onClick={handleAdd}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-4 rounded-2xl font-display font-bold text-base transition-all ${
            added
              ? 'bg-olive-sage text-warm-white'
              : 'bg-espresso-dark text-warm-white shadow-warm'
          }`}
        >
          {added ? '✓ Ditambahkan!' : `Tambah ke Keranjang — ${formatRupiah(price)}`}
        </motion.button>
      </div>
    </div>
  )
}
