'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateId, generateOrderNumber, formatRupiah } from '@/lib/utils/format'
import { supabase } from '@/lib/supabase'
import { menuItems } from '@/lib/mock-data/menu'
import { MenuItem, MenuSize, PaymentMethod } from '@/lib/types'

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

const TABLES = Array.from({ length: 100 }, (_, i) => {
  const n = i + 1
  const capacity = n % 10 === 0 ? 8 : n % 5 === 0 ? 6 : n % 3 === 0 ? 4 : 2
  const minSpend = capacity <= 2 ? 75000 : capacity <= 4 ? 150000 : capacity <= 6 ? 300000 : 1000000
  return { number: n, capacity, minSpend }
})

const paymentMethods: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: 'qris', label: 'QRIS', icon: '📱' },
  { key: 'gopay', label: 'GoPay', icon: '🟢' },
  { key: 'ovo', label: 'OVO', icon: '🟣' },
  { key: 'dana', label: 'DANA', icon: '🔵' },
  { key: 'cash', label: 'Tunai', icon: '💵' },
  { key: 'cashier', label: 'Bayar di Kasir', icon: '🏪' },
]

interface LocalCartItem { item: MenuItem; size: MenuSize; qty: number }

export default function ReservationPage() {
  const params = useParams()
  const router = useRouter()
  const tableId = params.tableId as string

  const [step, setStep] = useState(1)
  // Step 1
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(2)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  // Step 2
  const [cart, setCart] = useState<LocalCartItem[]>([])
  const [menuSearch, setMenuSearch] = useState('')
  // Step 3
  const [payment, setPayment] = useState<PaymentMethod>('qris')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tableInfo = TABLES.find((t) => t.number === selectedTable)
  const totalSpend = cart.reduce((sum, c) => sum + c.item.prices[c.size] * c.qty, 0)
  const minMet = totalSpend >= (tableInfo?.minSpend ?? 0)

  const addToCart = (item: MenuItem, size: MenuSize) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.item.id === item.id && c.size === size)
      if (idx >= 0) return prev.map((c, i) => i === idx ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { item, size, qty: 1 }]
    })
  }

  const removeFromCart = (itemId: string, size: MenuSize) => {
    setCart((prev) => prev.map((c) => c.item.id === itemId && c.size === size ? { ...c, qty: Math.max(0, c.qty - 1) } : c).filter((c) => c.qty > 0))
  }

  const getQty = (itemId: string, size: MenuSize) => cart.find((c) => c.item.id === itemId && c.size === size)?.qty ?? 0

  const handleConfirm = async () => {
    if (!selectedTable || !name || !date || !time || !minMet) return
    setLoading(true)
    setError('')

    const rsvId = generateId('rsv')
    const orderId = generateId('ord')
    const orderNumber = generateOrderNumber()
    const tableIdStr = `table-${String(selectedTable).padStart(3, '0')}`

    const orderItems = cart.map((c) => ({
      menuItemId: c.item.id,
      menuItemName: c.item.name,
      menuItemImage: c.item.image,
      size: c.size,
      quantity: c.qty,
      notes: '',
      unitPrice: c.item.prices[c.size],
      subtotal: c.item.prices[c.size] * c.qty,
    }))

    const scheduledTime = `${date}T${time}:00`

    const [{ error: rsvErr }, { error: ordErr }] = await Promise.all([
      supabase.from('reservations').insert({
        id: rsvId,
        table_number: selectedTable,
        table_capacity: tableInfo?.capacity ?? 2,
        customer_name: name,
        customer_phone: phone,
        guest_count: guests,
        date,
        time,
        notes,
        status: 'confirmed',
        min_spend: tableInfo?.minSpend ?? 75000,
        branch: 'branch-001',
      }),
      supabase.from('orders').insert({
        id: orderId,
        order_number: orderNumber,
        table_id: tableIdStr,
        table_number: selectedTable,
        type: 'reservation',
        status: 'pending',
        total_amount: totalSpend,
        payment_method: payment,
        customer_name: name,
        notes: `Reservasi ${date} jam ${time}${notes ? ' — ' + notes : ''}`,
        estimated_time: 0,
        branch: 'branch-001',
        items: orderItems,
        scheduled_time: scheduledTime,
        reservation_id: rsvId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    ])

    setLoading(false)
    if (rsvErr || ordErr) { setError('Gagal menyimpan. Coba lagi.'); return }

    // Send WhatsApp confirmation if phone provided
    if (phone) {
      fetch('/api/send-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'confirmation',
          phone,
          name,
          table: selectedTable,
          date,
          time,
          guests,
          total: totalSpend,
          items: cart.map((c) => ({ name: `${c.item.name} (${c.size}) x${c.qty}`, price: c.item.prices[c.size] * c.qty })),
        }),
      }).catch(() => {}) // Non-blocking, don't fail reservation if WA fails
    }

    setStep(4)
  }

  const filteredMenu = menuItems.filter((m) => m.isAvailable && m.name.toLowerCase().includes(menuSearch.toLowerCase()))

  if (step === 4) return (
    <div className="min-h-screen bg-cream-base flex flex-col items-center justify-center px-6 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
        className="w-20 h-20 bg-olive-sage/20 rounded-full flex items-center justify-center mb-5 border-2 border-olive-sage/40">
        <span className="text-4xl">🪑</span>
      </motion.div>
      <h2 className="font-display text-2xl font-bold text-espresso-deep mb-2">Reservasi Terkonfirmasi!</h2>
      <p className="text-cafe-muted text-sm mb-1">Meja <strong>{selectedTable}</strong> — {guests} tamu</p>
      <p className="text-cafe-muted text-sm mb-1">{date} pukul {time}</p>
      <p className="text-espresso-mid text-sm font-semibold mb-1">Total: {formatRupiah(totalSpend)}</p>
      <p className="text-cafe-muted text-xs mb-6">Pesananmu akan diproses pada {time} — tim kami akan menyiapkan semuanya</p>
      <button onClick={() => router.push(`/table/${tableId}`)} className="bg-espresso-dark text-warm-white px-8 py-3.5 rounded-2xl font-semibold">
        Kembali ke Menu
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream-base pb-36">
      {/* Header */}
      <div className="bg-warm-white border-b border-latte px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="text-espresso-dark font-bold text-lg">←</button>
        <div>
          <h1 className="font-display text-xl font-bold text-espresso-deep">Reservasi Meja</h1>
          <div className="flex gap-1 mt-0.5">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1 rounded-full transition-all ${s === step ? 'w-6 bg-espresso-dark' : s < step ? 'w-4 bg-espresso-light' : 'w-4 bg-latte'}`} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Table + Details */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-5 space-y-5">
            <div>
              <p className="font-display font-semibold text-espresso-deep mb-1">Pilih Meja</p>
              <div className="grid grid-cols-5 gap-2">
                {TABLES.slice(0, 30).map((t) => (
                  <button key={t.number} onClick={() => { setSelectedTable(t.number); setGuests(Math.min(guests, t.capacity)) }}
                    className={`rounded-xl p-2 text-center border-2 transition-all ${selectedTable === t.number ? 'border-espresso-dark bg-espresso-dark text-warm-white' : 'border-latte bg-warm-white text-espresso-deep'}`}>
                    <p className="font-bold text-sm">{t.number}</p>
                    <p className="text-[9px] opacity-70">{t.capacity}p</p>
                  </button>
                ))}
              </div>
            </div>

            {tableInfo && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <p className="text-xs font-semibold text-amber-800">Meja {selectedTable} — kapasitas {tableInfo.capacity} orang</p>
                <p className="text-sm font-bold text-amber-900">Min. pembelian: {formatRupiah(tableInfo.minSpend)}</p>
              </div>
            )}

            <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40 space-y-4">
              {[
                { label: 'Nama', value: name, set: setName, placeholder: 'Nama kamu...', type: 'text' },
                { label: 'No. HP', value: phone, set: setPhone, placeholder: '08xx...', type: 'tel' },
              ].map(({ label, value, set, placeholder, type }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">{label}</p>
                  <input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} type={type}
                    className="w-full text-sm text-espresso-deep placeholder:text-cafe-muted border-b border-latte pb-1.5 focus:outline-none focus:border-espresso-light" />
                </div>
              ))}
              <div>
                <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Jumlah Tamu</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full bg-cream-base border border-latte font-bold text-espresso-dark">−</button>
                  <span className="font-bold text-espresso-deep w-6 text-center">{guests}</span>
                  <button onClick={() => setGuests(Math.min(tableInfo?.capacity ?? 8, guests + 1))} className="w-8 h-8 rounded-full bg-espresso-dark text-warm-white font-bold">+</button>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Tanggal</p>
                <input type="date" value={date}
                  min={new Date().toISOString().split('T')[0]}
                  max={(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0] })()}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm text-espresso-deep border-b border-latte pb-1.5 focus:outline-none" />
              </div>
              <div>
                <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-2">Waktu</p>
                <div className="flex gap-2 flex-wrap">
                  {timeSlots.map((t) => (
                    <button key={t} onClick={() => setTime(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${time === t ? 'bg-espresso-dark text-warm-white' : 'bg-cream-base text-espresso-mid border border-latte'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Catatan</p>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ulang tahun, alergi, dll..."
                  className="w-full text-sm text-espresso-deep placeholder:text-cafe-muted border-b border-latte pb-1.5 focus:outline-none" />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Menu Selection */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-5 space-y-4">
            {/* Min spend progress */}
            <div className="bg-warm-white rounded-2xl p-4 border border-latte/40 shadow-warm-sm">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-cafe-muted">Total Pesanan</span>
                <span className={minMet ? 'text-olive-sage' : 'text-espresso-mid'}>{formatRupiah(totalSpend)} / {formatRupiah(tableInfo?.minSpend ?? 0)}</span>
              </div>
              <div className="h-2 bg-cream-base rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${minMet ? 'bg-olive-sage' : 'bg-espresso-light'}`}
                  style={{ width: `${Math.min(100, (totalSpend / (tableInfo?.minSpend ?? 1)) * 100)}%` }} />
              </div>
              {!minMet && <p className="text-xs text-cafe-muted mt-1">Tambah {formatRupiah((tableInfo?.minSpend ?? 0) - totalSpend)} lagi untuk memenuhi minimum</p>}
              {minMet && <p className="text-xs text-olive-sage mt-1 font-semibold">✓ Minimum pembelian terpenuhi</p>}
            </div>

            {/* Cart summary */}
            {cart.length > 0 && (
              <div className="bg-espresso-dark/5 rounded-2xl p-3 border border-espresso-dark/10">
                <p className="text-xs font-bold text-espresso-deep mb-2">Pesananmu ({cart.reduce((s, c) => s + c.qty, 0)} item)</p>
                <div className="space-y-1">
                  {cart.map((c) => (
                    <div key={`${c.item.id}-${c.size}`} className="flex items-center justify-between text-xs">
                      <span className="text-espresso-mid">{c.item.name} ({c.size}) ×{c.qty}</span>
                      <span className="font-semibold text-espresso-deep">{formatRupiah(c.item.prices[c.size] * c.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} placeholder="Cari menu..."
              className="w-full px-4 py-2.5 bg-warm-white rounded-xl text-sm border border-latte focus:outline-none focus:border-espresso-light" />

            <div className="space-y-2">
              {filteredMenu.slice(0, 30).map((item) => (
                <div key={item.id} className="bg-warm-white rounded-2xl p-3 border border-latte/40 flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-espresso-deep text-sm truncate">{item.name}</p>
                    <p className="text-cafe-muted text-xs">S: {formatRupiah(item.prices.S)} · M: {formatRupiah(item.prices.M)} · L: {formatRupiah(item.prices.L)}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {(['S', 'M', 'L'] as MenuSize[]).map((size) => {
                      const qty = getQty(item.id, size)
                      return (
                        <div key={size} className="flex flex-col items-center gap-0.5">
                          <span className="text-[9px] text-cafe-muted font-semibold">{size}</span>
                          <div className="flex items-center gap-0.5">
                            {qty > 0 && <button onClick={() => removeFromCart(item.id, size)} className="w-5 h-5 rounded-full bg-red-100 text-red-500 text-xs font-bold flex items-center justify-center">−</button>}
                            {qty > 0 && <span className="text-xs font-bold text-espresso-deep w-4 text-center">{qty}</span>}
                            <button onClick={() => addToCart(item, size)} className="w-5 h-5 rounded-full bg-espresso-dark text-warm-white text-xs font-bold flex items-center justify-center">+</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Payment */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-5 space-y-4">
            <div className="bg-warm-white rounded-2xl p-4 border border-latte/40 shadow-warm-sm">
              <p className="font-display font-semibold text-espresso-deep mb-3">Ringkasan Reservasi</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-cafe-muted">Meja</span><span className="font-semibold">{selectedTable} ({tableInfo?.capacity}p)</span></div>
                <div className="flex justify-between"><span className="text-cafe-muted">Jadwal</span><span className="font-semibold">{date} · {time}</span></div>
                <div className="flex justify-between"><span className="text-cafe-muted">Tamu</span><span className="font-semibold">{guests} orang</span></div>
                <div className="flex justify-between"><span className="text-cafe-muted">Nama</span><span className="font-semibold">{name}</span></div>
              </div>
              <div className="border-t border-latte mt-3 pt-3 space-y-1">
                {cart.map((c) => (
                  <div key={`${c.item.id}-${c.size}`} className="flex justify-between text-xs text-cafe-muted">
                    <span>{c.item.name} ({c.size}) ×{c.qty}</span>
                    <span>{formatRupiah(c.item.prices[c.size] * c.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-espresso-deep mt-2 pt-2 border-t border-latte">
                <span>Total</span><span>{formatRupiah(totalSpend)}</span>
              </div>
            </div>

            <div>
              <p className="font-display font-semibold text-espresso-deep mb-3">Metode Pembayaran</p>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((pm) => (
                  <button key={pm.key} onClick={() => setPayment(pm.key)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${payment === pm.key ? 'border-espresso-dark bg-espresso-dark/5' : 'border-latte bg-warm-white'}`}>
                    <span className="text-xl">{pm.icon}</span>
                    <span className="font-semibold text-espresso-deep text-xs">{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-warm-white/95 backdrop-blur border-t border-latte">
        {step === 1 && (
          <button onClick={() => setStep(2)} disabled={!selectedTable || !name || !date || !time}
            className="w-full bg-espresso-dark text-warm-white py-4 rounded-2xl font-display font-bold text-base disabled:opacity-50">
            Lanjut — Pilih Menu →
          </button>
        )}
        {step === 2 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-cafe-muted px-1">
              <span>{cart.reduce((s, c) => s + c.qty, 0)} item dipilih</span>
              <span className={minMet ? 'text-olive-sage font-semibold' : ''}>{formatRupiah(totalSpend)}</span>
            </div>
            <button onClick={() => setStep(3)} disabled={!minMet}
              className="w-full bg-espresso-dark text-warm-white py-4 rounded-2xl font-display font-bold text-base disabled:opacity-50">
              {minMet ? 'Lanjut — Pembayaran →' : `Kurang ${formatRupiah((tableInfo?.minSpend ?? 0) - totalSpend)}`}
            </button>
          </div>
        )}
        {step === 3 && (
          <button onClick={handleConfirm} disabled={loading}
            className="w-full bg-espresso-dark text-warm-white py-4 rounded-2xl font-display font-bold text-base disabled:opacity-60">
            {loading ? 'Memproses...' : `Konfirmasi Reservasi — ${formatRupiah(totalSpend)}`}
          </button>
        )}
      </div>
    </div>
  )
}
