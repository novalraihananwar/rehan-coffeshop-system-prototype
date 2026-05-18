'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart.store'
import { useOrderStore } from '@/lib/store/order.store'
import { useAdminStore } from '@/lib/store/admin.store'
import { useCustomerAuthStore, MIN_REDEEM_POINTS, POINTS_TO_RUPIAH, calcPointsEarned } from '@/lib/store/customer-auth.store'
import { formatRupiah, generateOrderNumber, generateId } from '@/lib/utils/format'
import { PaymentMethod, Order } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const paymentMethods: { key: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { key: 'qris', label: 'QRIS', icon: '📱', desc: 'Scan QR Code' },
  { key: 'gopay', label: 'GoPay', icon: '🟢', desc: 'Saldo GoPay' },
  { key: 'ovo', label: 'OVO', icon: '🟣', desc: 'Saldo OVO' },
  { key: 'dana', label: 'DANA', icon: '🔵', desc: 'Saldo DANA' },
  { key: 'debit', label: 'Kartu Debit', icon: '💳', desc: 'ATM / Debit' },
  { key: 'credit', label: 'Kartu Kredit', icon: '💳', desc: 'Visa / Mastercard' },
  { key: 'cash', label: 'Tunai', icon: '💵', desc: 'Bayar langsung' },
  { key: 'cashier', label: 'Bayar di Kasir', icon: '🏪', desc: 'Ke counter kasir' },
]

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const tableId = params.tableId as string
  const tableNumber = parseInt(tableId.replace('table-', '')) || parseInt(tableId)

  const { items, totalPrice, estimatedTime, notes, clearCart } = useCartStore()
  const { addOrder } = useOrderStore()
  const { addIncomingOrder } = useAdminStore()
  const { customer, processOrder } = useCustomerAuthStore()

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('qris')
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customerName, setCustomerName] = useState(customer?.name || '')
  const [usePoints, setUsePoints] = useState(false)
  const [pointsInput, setPointsInput] = useState(
    customer ? Math.min(customer.loyalty_points, Math.floor(totalPrice() / POINTS_TO_RUPIAH)) : 0
  )

  const canRedeem = customer && customer.loyalty_points >= MIN_REDEEM_POINTS
  const maxRedeemPoints = customer ? Math.min(customer.loyalty_points, Math.floor(totalPrice() / POINTS_TO_RUPIAH)) : 0
  const redeemPoints = usePoints ? Math.max(MIN_REDEEM_POINTS, Math.min(pointsInput, maxRedeemPoints)) : 0
  const discount = redeemPoints * POINTS_TO_RUPIAH
  const finalTotal = Math.max(0, totalPrice() - discount)
  const willEarn = customer ? calcPointsEarned(finalTotal, customer.tier) : 0

  const handleOrder = async () => {
    setLoading(true)
    if (selectedPayment === 'qris') {
      setShowQR(true)
      await new Promise((r) => setTimeout(r, 2500))
      setShowQR(false)
    } else {
      await new Promise((r) => setTimeout(r, 1000))
    }

    const orderNumber = generateOrderNumber()
    const order: Order = {
      id: generateId('ord'),
      orderNumber,
      tableId,
      tableNumber,
      type: 'dine_in',
      items: items.map((i) => ({
        menuItemId: i.menuItem.id,
        menuItemName: i.menuItem.name,
        menuItemImage: i.menuItem.image,
        size: i.size,
        quantity: i.quantity,
        notes: i.notes,
        unitPrice: i.menuItem.prices[i.size],
        subtotal: i.menuItem.prices[i.size] * i.quantity,
      })),
      status: 'confirmed',
      totalAmount: finalTotal,
      paymentMethod: selectedPayment,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedTime: estimatedTime(),
      notes,
      customerName: customerName || customer?.name || 'Customer',
      branch: 'branch-001',
    }

    addOrder(order)
    addIncomingOrder(order)

    await supabase.from('orders').insert({
      id: order.id,
      order_number: order.orderNumber,
      table_id: order.tableId,
      table_number: order.tableNumber,
      type: order.type,
      status: order.status,
      total_amount: order.totalAmount,
      payment_method: order.paymentMethod,
      customer_name: order.customerName,
      notes: order.notes,
      estimated_time: order.estimatedTime,
      branch: order.branch,
      items: order.items,
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString(),
    })

    // Process loyalty points if logged in
    let earned = 0
    if (customer) {
      earned = await processOrder(finalTotal, redeemPoints)
    }

    clearCart()
    setLoading(false)
    router.push(`/table/${tableId}/success?order=${order.id}&num=${orderNumber}&time=${estimatedTime()}&earned=${earned}&redeemed=${redeemPoints}`)
  }

  return (
    <div className="min-h-screen bg-cream-base pb-36">
      <div className="bg-warm-white border-b border-latte px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-espresso-dark font-bold text-lg">←</button>
          <h1 className="font-display text-xl font-bold text-espresso-deep">Pembayaran</h1>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Member Points Banner */}
        {customer ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎁</span>
                <div>
                  <p className="font-semibold text-amber-900 text-sm">{customer.name}</p>
                  <p className="text-amber-700 text-xs">{customer.loyalty_points.toLocaleString('id-ID')} poin aktif</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full capitalize">{customer.tier}</span>
            </div>

            {/* Earn info */}
            <p className="text-amber-700 text-xs mb-3">
              ✨ Order ini kamu akan dapat <strong>{willEarn} poin</strong>
              {customer.tier !== 'bronze' && ` (+${customer.tier === 'silver' ? 5 : 10}% bonus tier)`}
            </p>

            {/* Redeem toggle */}
            {canRedeem && (
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setUsePoints(!usePoints)}
                    className={`w-10 h-5 rounded-full transition-colors ${usePoints ? 'bg-amber-600' : 'bg-gray-300'} relative`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${usePoints ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-semibold text-amber-900">Gunakan poin untuk diskon</span>
                </label>

                {usePoints && (
                  <div className="mt-3 bg-white rounded-xl p-3 border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-amber-800">Jumlah poin yang digunakan</label>
                      <span className="text-xs text-amber-700">max {maxRedeemPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={pointsInput}
                        onChange={(e) => setPointsInput(Math.min(maxRedeemPoints, Math.max(MIN_REDEEM_POINTS, Number(e.target.value))))}
                        step={MIN_REDEEM_POINTS}
                        min={MIN_REDEEM_POINTS}
                        max={maxRedeemPoints}
                        className="flex-1 border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none text-center font-bold"
                      />
                      <span className="text-xs text-amber-700 flex-shrink-0">= {formatRupiah(redeemPoints * POINTS_TO_RUPIAH)} diskon</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!canRedeem && (
              <p className="text-amber-600 text-xs">Butuh min. {MIN_REDEEM_POINTS} poin untuk redeem · kamu punya {customer.loyalty_points} poin</p>
            )}
          </div>
        ) : (
          <Link href={`/member/login?redirect=/table/${tableId}/checkout`} className="flex items-center gap-3 bg-espresso-dark/5 border border-espresso-dark/15 rounded-2xl p-4">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="font-semibold text-espresso-deep text-sm">Login untuk kumpulkan poin</p>
              <p className="text-cafe-muted text-xs">Setiap Rp 1.000 = 1 poin loyalty</p>
            </div>
            <span className="ml-auto text-espresso-mid text-sm font-bold">→</span>
          </Link>
        )}

        {/* Order Summary */}
        <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40">
          <p className="font-display font-semibold text-espresso-deep mb-3">Ringkasan Pesanan</p>
          {items.map((item) => (
            <div key={`${item.menuItem.id}-${item.size}`} className="flex justify-between text-sm text-cafe-muted py-1">
              <span>{item.menuItem.name} ({item.size}) × {item.quantity}</span>
              <span>{formatRupiah(item.menuItem.prices[item.size] * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-latte mt-2 pt-2 space-y-1">
            <div className="flex justify-between text-sm text-espresso-mid">
              <span>Subtotal</span>
              <span>{formatRupiah(totalPrice())}</span>
            </div>
            {usePoints && redeemPoints > 0 && (
              <div className="flex justify-between text-sm text-amber-700 font-semibold">
                <span>Diskon Poin ({redeemPoints} poin)</span>
                <span>−{formatRupiah(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-espresso-deep text-base pt-1 border-t border-latte">
              <span>Total Bayar</span>
              <span>{formatRupiah(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* Customer Name */}
        {!customer && (
          <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40">
            <p className="font-display font-semibold text-espresso-deep mb-2">Nama (opsional)</p>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama kamu..."
              className="w-full text-sm text-espresso-deep placeholder:text-cafe-muted focus:outline-none border-b border-latte pb-1"
            />
          </div>
        )}

        {/* Payment Methods */}
        <div>
          <p className="font-display font-semibold text-espresso-deep mb-3">Metode Pembayaran</p>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((pm) => (
              <button key={pm.key} onClick={() => setSelectedPayment(pm.key)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${selectedPayment === pm.key ? 'border-espresso-dark bg-espresso-dark/5' : 'border-latte bg-warm-white'}`}>
                <span className="text-xl">{pm.icon}</span>
                <div className="text-left">
                  <p className="font-semibold text-espresso-deep text-xs">{pm.label}</p>
                  <p className="text-cafe-muted text-[10px]">{pm.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* QR Code Mock */}
        {showQR && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-warm-white rounded-2xl p-6 text-center shadow-warm border border-latte/40">
            <p className="font-semibold text-espresso-deep mb-3">Scan QRIS</p>
            <div className="w-40 h-40 bg-espresso-deep mx-auto rounded-xl flex items-center justify-center mb-3">
              <div className="grid grid-cols-3 gap-1 p-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-warm-white' : 'bg-espresso-deep'}`} />
                ))}
              </div>
            </div>
            <p className="text-cafe-muted text-xs">Menunggu konfirmasi pembayaran...</p>
            <div className="mt-2 h-1 bg-cream-base rounded-full overflow-hidden">
              <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2.5 }} className="h-full bg-espresso-light" />
            </div>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-warm-white/95 backdrop-blur border-t border-latte">
        <motion.button onClick={handleOrder} disabled={loading || showQR} whileTap={{ scale: 0.97 }}
          className="w-full bg-espresso-dark text-warm-white py-4 rounded-2xl font-display font-bold text-base shadow-warm disabled:opacity-60">
          {loading || showQR ? 'Memproses...' : `Pesan Sekarang — ${formatRupiah(finalTotal)}`}
        </motion.button>
      </div>
    </div>
  )
}
