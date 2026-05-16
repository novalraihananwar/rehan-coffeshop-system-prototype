'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart.store'
import { formatRupiah } from '@/lib/utils/format'

export default function CartBar({ tableId }: { tableId: string }) {
  const { totalItems, totalPrice } = useCartStore()
  const count = totalItems()
  const total = totalPrice()

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2"
        >
          <Link href={`/table/${tableId}/cart`}>
            <div className="bg-espresso-dark rounded-2xl px-5 py-4 flex items-center justify-between shadow-warm-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-espresso-light/20 rounded-xl flex items-center justify-center">
                  <span className="text-espresso-light font-bold text-sm">{count}</span>
                </div>
                <div>
                  <p className="text-warm-white font-semibold text-sm">Lihat Keranjang</p>
                  <p className="text-espresso-light/70 text-xs">{count} item</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-espresso-light font-bold text-base">{formatRupiah(total)}</p>
                <p className="text-warm-white/50 text-xs">→</p>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
