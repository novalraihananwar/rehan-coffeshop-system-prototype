'use client'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart.store'
import { formatRupiah, formatMinutes } from '@/lib/utils/format'

export default function CartPage() {
  const params = useParams()
  const router = useRouter()
  const tableId = params.tableId as string
  const { items, updateQuantity, removeItem, totalPrice, totalItems, estimatedTime, notes, setNotes } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-base flex flex-col items-center justify-center px-6">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="font-display text-xl font-bold text-espresso-deep mb-2">Keranjang Kosong</h2>
        <p className="text-cafe-muted text-sm text-center mb-6">Yuk tambahkan menu favoritmu dulu!</p>
        <button
          onClick={() => router.back()}
          className="bg-espresso-dark text-warm-white px-8 py-3 rounded-2xl font-semibold"
        >
          Lihat Menu
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-base pb-36">
      {/* Header */}
      <div className="bg-warm-white border-b border-latte px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="text-espresso-dark font-bold text-lg">←</button>
          <h1 className="font-display text-xl font-bold text-espresso-deep">Keranjang</h1>
        </div>
        <p className="text-cafe-muted text-sm ml-8">{totalItems()} item · Meja {tableId.replace('table-', '')}</p>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {items.map((item, idx) => (
          <motion.div
            key={`${item.menuItem.id}-${item.size}`}
            layout
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="bg-warm-white rounded-2xl p-4 flex gap-3 shadow-warm-sm border border-latte/40"
          >
            <img src={item.menuItem.image} alt={item.menuItem.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-espresso-deep text-sm leading-tight">{item.menuItem.name}</p>
                  <p className="text-cafe-muted text-xs mt-0.5">Ukuran {item.size}{item.notes && ` · ${item.notes}`}</p>
                </div>
                <button
                  onClick={() => removeItem(item.menuItem.id, item.size)}
                  className="text-cafe-muted text-xs hover:text-red-400 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="font-bold text-espresso-dark text-sm">{formatRupiah(item.menuItem.prices[item.size] * item.quantity)}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.menuItem.id, item.size, item.quantity - 1)} className="w-7 h-7 rounded-full bg-cream-base border border-latte text-espresso-dark font-bold text-sm flex items-center justify-center">−</button>
                  <span className="font-bold text-espresso-deep w-4 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.menuItem.id, item.size, item.quantity + 1)} className="w-7 h-7 rounded-full bg-espresso-dark text-warm-white font-bold text-sm flex items-center justify-center">+</button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Notes */}
        <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40">
          <p className="font-semibold text-espresso-deep text-sm mb-2">Catatan untuk Dapur</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ada permintaan khusus? Tulis di sini..."
            rows={2}
            className="w-full text-sm text-espresso-deep placeholder:text-cafe-muted focus:outline-none resize-none"
          />
        </div>

        {/* Summary */}
        <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40 space-y-2">
          <div className="flex justify-between text-sm text-cafe-muted">
            <span>Subtotal ({totalItems()} item)</span>
            <span>{formatRupiah(totalPrice())}</span>
          </div>
          <div className="flex justify-between text-sm text-cafe-muted">
            <span>Estimasi waktu</span>
            <span>~{estimatedTime()} menit</span>
          </div>
          <div className="border-t border-latte pt-2 flex justify-between font-bold text-espresso-deep">
            <span>Total</span>
            <span>{formatRupiah(totalPrice())}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-warm-white/95 backdrop-blur border-t border-latte">
        <button
          onClick={() => router.push(`/table/${tableId}/checkout`)}
          className="w-full bg-espresso-dark text-warm-white py-4 rounded-2xl font-display font-bold text-base shadow-warm"
        >
          Lanjut ke Pembayaran → {formatRupiah(totalPrice())}
        </button>
      </div>
    </div>
  )
}
