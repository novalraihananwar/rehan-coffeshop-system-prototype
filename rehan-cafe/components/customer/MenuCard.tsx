'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { MenuItem } from '@/lib/types'
import { formatRupiah } from '@/lib/utils/format'
import { useCartStore } from '@/lib/store/cart.store'

interface MenuCardProps {
  item: MenuItem
  tableId: string
}

export default function MenuCard({ item, tableId }: MenuCardProps) {
  const { addItem, items } = useCartStore()
  const [added, setAdded] = useState(false)

  const cartQty = items.filter((i) => i.menuItem.id === item.id).reduce((s, i) => s + i.quantity, 0)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(item, 'M', 1, '')
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
    >
      <Link href={`/table/${tableId}/detail/${item.id}`}>
        <div className={`relative bg-warm-white rounded-2xl overflow-hidden shadow-warm-sm border border-latte/50 ${!item.isAvailable ? 'opacity-60' : ''}`}>
          {/* Image */}
          <div className="relative h-36 bg-cream-base overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {item.isBestseller && (
                <span className="bg-espresso-dark text-warm-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  ⭐ LARIS
                </span>
              )}
              {item.isNew && (
                <span className="bg-olive-sage text-warm-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  ✨ NEW
                </span>
              )}
              {item.isPromo && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  🔥 PROMO
                </span>
              )}
            </div>
            {!item.isAvailable && (
              <div className="absolute inset-0 bg-espresso-deep/50 flex items-center justify-center">
                <span className="text-warm-white text-xs font-semibold">Habis</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            <h3 className="font-display font-semibold text-espresso-deep text-sm leading-tight mb-1 line-clamp-1">
              {item.name}
            </h3>
            <p className="text-cafe-muted text-[11px] line-clamp-2 mb-2 leading-relaxed">
              {item.description}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-espresso-dark font-bold text-sm">
                  {formatRupiah(item.prices.M)}
                </p>
                <p className="text-cafe-muted text-[10px]">⭐ {item.rating}</p>
              </div>

              {item.isAvailable && (
                <motion.button
                  onClick={handleQuickAdd}
                  whileTap={{ scale: 0.9 }}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 ${
                    added
                      ? 'bg-olive-sage text-warm-white'
                      : 'bg-espresso-dark text-warm-white shadow-warm-sm'
                  }`}
                >
                  {added ? '✓' : '+'}
                  {cartQty > 0 && !added && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-espresso-light text-espresso-deep text-[9px] font-bold rounded-full flex items-center justify-center">
                      {cartQty}
                    </span>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
