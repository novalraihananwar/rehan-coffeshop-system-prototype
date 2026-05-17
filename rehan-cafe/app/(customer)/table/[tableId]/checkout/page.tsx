'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart.store'
import { useOrderStore } from '@/lib/store/order.store'
import { useAdminStore } from '@/lib/store/admin.store'
import { formatRupiah, generateOrderNumber, generateId } from '@/lib/utils/format'
import { PaymentMethod, Order } from '@/lib/types'
import { supabase } from '@/lib/supabase'

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
  const { addIncomingOrder, deductInventory } = useAdminStore()

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('qris')
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customerName, setCustomerName] = useState('')

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
      totalAmount: totalPrice(),
      paymentMethod: selectedPayment,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedTime: estimatedTime(),
      notes,
      customerName: customerName || 'Customer',
      branch: 'branch-001',
    }

    addOrder(order)
    addIncomingOrder(order)
    deductInventory(order)

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

    clearCart()
    setLoading(false)
    router.push(`/table/${tableId}/success?order=${order.id}&num=${orderNumber}&time=${estimatedTime()}`)
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
        {/* Order Summary */}
        <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40">
          <p className="font-display font-semibold text-espresso-deep mb-3">Ringkasan Pesanan</p>
          {items.map((item) => (
            <div key={`${item.menuItem.id}-${item.size}`} className="flex justify-between text-sm text-cafe-muted py-1">
              <span>{item.menuItem.name} ({item.size}) × {item.quantity}</span>
              <span>{formatRupiah(item.menuItem.prices[item.size] * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-latte mt-2 pt-2 flex justify-between font-bold text-espresso-deep">
            <span>Total</span>
            <span>{formatRupiah(totalPrice())}</span>
          </div>
        </div>

        {/* Customer Name */}
        <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40">
          <p className="font-display font-semibold text-espresso-deep mb-2">Nama (opsional)</p>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Masukkan nama kamu..."
            className="w-full text-sm text-espresso-deep placeholder:text-cafe-muted focus:outline-none border-b border-latte pb-1"
          />
        </div>

        {/* Payment Methods */}
        <div>
          <p className="font-display font-semibold text-espresso-deep mb-3">Metode Pembayaran</p>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((pm) => (
              <button
                key={pm.key}
                onClick={() => setSelectedPayment(pm.key)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                  selectedPayment === pm.key
                    ? 'border-espresso-dark bg-espresso-dark/5'
                    : 'border-latte bg-warm-white'
                }`}
              >
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-warm-white rounded-2xl p-6 text-center shadow-warm border border-latte/40"
          >
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
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5 }}
                className="h-full bg-espresso-light"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-warm-white/95 backdrop-blur border-t border-latte">
        <motion.button
          onClick={handleOrder}
          disabled={loading || showQR}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-espresso-dark text-warm-white py-4 rounded-2xl font-display font-bold text-base shadow-warm disabled:opacity-60"
        >
          {loading || showQR ? 'Memproses...' : `Pesan Sekarang — ${formatRupiah(totalPrice())}`}
        </motion.button>
      </div>
    </div>
  )
}
