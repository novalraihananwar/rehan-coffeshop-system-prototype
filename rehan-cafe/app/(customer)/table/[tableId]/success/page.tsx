'use client'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Suspense } from 'react'
import { formatRupiah } from '@/lib/utils/format'
import { useOrderStore } from '@/lib/store/order.store'
import { useCustomerAuthStore } from '@/lib/store/customer-auth.store'

function SuccessContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableId = params.tableId as string
  const orderNum = searchParams.get('num') || 'A-001'
  const estimatedTime = parseInt(searchParams.get('time') || '15')
  const orderId = searchParams.get('order') || ''
  const pointsEarned = parseInt(searchParams.get('earned') || '0')
  const pointsRedeemed = parseInt(searchParams.get('redeemed') || '0')
  const { orders } = useOrderStore()
  const { customer } = useCustomerAuthStore()
  const order = orders.find((o) => o.id === orderId)

  return (
    <div className="min-h-screen bg-cream-base flex flex-col">
      {/* Success Hero */}
      <div className="bg-espresso-deep px-6 pt-16 pb-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-20 h-20 bg-espresso-light/20 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-espresso-light/40"
        >
          <span className="text-4xl">✓</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-espresso-light text-sm font-semibold tracking-widest uppercase mb-1">Pesanan Berhasil!</p>
          <h1 className="font-display text-5xl font-bold text-warm-white mb-1">{orderNum}</h1>
          <p className="text-cafe-muted text-sm">Nomor Antrian</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5 inline-flex items-center gap-2 bg-espresso-light/15 border border-espresso-light/25 px-5 py-2.5 rounded-full"
        >
          <span className="text-espresso-light">⏱</span>
          <span className="text-warm-white text-sm font-semibold">Siap dalam ~{estimatedTime} menit</span>
        </motion.div>
      </div>

      {/* Receipt */}
      <div className="flex-1 px-4 py-5 space-y-4">
        {/* Order Details */}
        {order && (
          <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40">
            <p className="font-display font-semibold text-espresso-deep mb-3">Detail Pesanan</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1.5 border-b border-latte/40 last:border-0">
                <span className="text-espresso-mid">{item.menuItemName} ({item.size}) × {item.quantity}</span>
                <span className="text-espresso-deep font-semibold">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-espresso-deep mt-2 pt-2">
              <span>Total</span>
              <span>{formatRupiah(order.totalAmount)}</span>
            </div>
          </div>
        )}

        {/* WiFi Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📶</span>
            <p className="font-display font-semibold text-espresso-deep text-sm">Akses WiFi Gratis</p>
          </div>
          <div className="bg-cream-base rounded-xl px-4 py-3 font-mono text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-cafe-muted">WiFi Access</span>
              <span className="text-espresso-deep font-semibold">REHAN-GUEST</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cafe-muted">Password</span>
              <span className="text-espresso-deep font-semibold">ngopidulu2026</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href={`/table/${tableId}/tracking?order=${orderId}`} className="flex-1">
            <div className="bg-espresso-dark text-warm-white py-3.5 rounded-2xl text-center font-semibold text-sm shadow-warm">
              Lacak Pesanan
            </div>
          </Link>
          <Link href={`/table/${tableId}`} className="flex-1">
            <div className="bg-warm-white text-espresso-dark py-3.5 rounded-2xl text-center font-semibold text-sm border-2 border-latte">
              Pesan Lagi
            </div>
          </Link>
        </div>

        {/* Points earned or member prompt */}
        {customer && pointsEarned > 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bold text-amber-900 text-sm">+{pointsEarned} poin loyalty!</p>
            {pointsRedeemed > 0 && <p className="text-amber-700 text-xs">({pointsRedeemed} poin digunakan sebagai diskon)</p>}
            <p className="text-amber-700 text-xs mt-1">Total poin kamu: <strong>{customer.loyalty_points.toLocaleString('id-ID')}</strong></p>
            <Link href="/member" className="inline-block mt-2 text-xs font-bold text-amber-800 underline">Lihat dashboard member →</Link>
          </motion.div>
        ) : !customer ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Link href={`/member/register`} className="block bg-espresso-dark/5 border border-espresso-dark/15 rounded-2xl p-4 text-center">
              <p className="text-lg mb-1">🎁</p>
              <p className="font-semibold text-espresso-deep text-sm">Daftar Member & Kumpulkan Poin</p>
              <p className="text-cafe-muted text-xs mt-0.5">Setiap Rp 1.000 = 1 poin · bisa ditukar diskon</p>
            </Link>
          </motion.div>
        ) : null}

        {/* Review prompt */}
        <Link href={`/table/${tableId}/review`}>
          <div className="text-center py-3">
            <p className="text-cafe-muted text-sm">Selesai makan? <span className="text-espresso-dark font-semibold underline">Beri ulasan ←</span></p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-base flex items-center justify-center"><p className="text-cafe-muted">Loading...</p></div>}>
      <SuccessContent />
    </Suspense>
  )
}
