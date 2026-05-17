'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { generateId, formatRupiah } from '@/lib/utils/format'
import { supabase } from '@/lib/supabase'

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

const TABLES = Array.from({ length: 100 }, (_, i) => {
  const n = i + 1
  const capacity = n % 10 === 0 ? 8 : n % 5 === 0 ? 6 : n % 3 === 0 ? 4 : 2
  const minSpend = capacity <= 2 ? 75000 : capacity <= 4 ? 150000 : capacity <= 6 ? 300000 : 1000000
  return { number: n, capacity, minSpend }
})

export default function ReservationPage() {
  const params = useParams()
  const router = useRouter()
  const tableId = params.tableId as string

  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(2)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tableInfo = TABLES.find((t) => t.number === selectedTable)

  const handleSubmit = async () => {
    if (!selectedTable || !name || !date || !time) return
    setLoading(true)
    setError('')

    const { error: sbError } = await supabase.from('reservations').insert({
      id: generateId('rsv'),
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
    })

    setLoading(false)
    if (sbError) {
      setError('Gagal menyimpan reservasi. Coba lagi.')
      return
    }
    setDone(true)
  }

  if (done) return (
    <div className="min-h-screen bg-cream-base flex flex-col items-center justify-center px-6 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
        className="w-20 h-20 bg-olive-sage/20 rounded-full flex items-center justify-center mb-5 border-2 border-olive-sage/40">
        <span className="text-4xl">🪑</span>
      </motion.div>
      <h2 className="font-display text-2xl font-bold text-espresso-deep mb-2">Reservasi Terkonfirmasi!</h2>
      <p className="text-cafe-muted text-sm mb-1">Meja <strong>{selectedTable}</strong> — {guests} tamu</p>
      <p className="text-cafe-muted text-sm mb-1">{date} pukul {time}</p>
      {tableInfo && <p className="text-espresso-mid text-sm font-semibold mb-6">Min. pembelian: {formatRupiah(tableInfo.minSpend)}</p>}
      <button onClick={() => router.push(`/table/${tableId}`)}
        className="bg-espresso-dark text-warm-white px-8 py-3.5 rounded-2xl font-semibold">
        Kembali ke Menu
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream-base pb-36">
      <div className="bg-warm-white border-b border-latte px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-espresso-dark font-bold text-lg">←</button>
        <h1 className="font-display text-xl font-bold text-espresso-deep">Reservasi Meja</h1>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Table Picker */}
        <div>
          <p className="font-display font-semibold text-espresso-deep mb-1">Pilih Meja</p>
          <p className="text-cafe-muted text-xs mb-3">Kapasitas & minimum pembelian tercantum</p>
          <div className="grid grid-cols-5 gap-2">
            {TABLES.slice(0, 30).map((table) => (
              <button
                key={table.number}
                onClick={() => { setSelectedTable(table.number); setGuests(Math.min(guests, table.capacity)) }}
                className={`rounded-xl p-2 text-center transition-all border-2 ${
                  selectedTable === table.number
                    ? 'border-espresso-dark bg-espresso-dark text-warm-white'
                    : 'border-latte bg-warm-white text-espresso-deep'
                }`}
              >
                <p className="font-bold text-sm">{table.number}</p>
                <p className="text-[9px] opacity-70">{table.capacity}p</p>
              </button>
            ))}
          </div>
        </div>

        {/* Min Spend Info */}
        {tableInfo && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <p className="text-xs font-semibold text-amber-800">Meja {selectedTable} — kapasitas {tableInfo.capacity} orang</p>
            <p className="text-sm font-bold text-amber-900 mt-0.5">Minimum pembelian: {formatRupiah(tableInfo.minSpend)}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40 space-y-4">
          <div>
            <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Nama</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu..." className="w-full text-sm text-espresso-deep placeholder:text-cafe-muted border-b border-latte pb-1.5 focus:outline-none focus:border-espresso-light" />
          </div>
          <div>
            <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">No. HP</p>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xx..." type="tel" className="w-full text-sm text-espresso-deep placeholder:text-cafe-muted border-b border-latte pb-1.5 focus:outline-none focus:border-espresso-light" />
          </div>
          <div>
            <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Jumlah Tamu</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full bg-cream-base border border-latte font-bold text-espresso-dark">−</button>
              <span className="font-bold text-espresso-deep w-6 text-center">{guests}</span>
              <button onClick={() => setGuests(Math.min(tableInfo?.capacity ?? 8, guests + 1))} className="w-8 h-8 rounded-full bg-espresso-dark text-warm-white font-bold">+</button>
            </div>
            {tableInfo && <p className="text-xs text-cafe-muted mt-1">Maks. {tableInfo.capacity} tamu untuk meja ini</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Tanggal</p>
            <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} className="w-full text-sm text-espresso-deep border-b border-latte pb-1.5 focus:outline-none focus:border-espresso-light" />
          </div>
          <div>
            <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-2">Waktu</p>
            <div className="flex gap-2 flex-wrap">
              {timeSlots.map((t) => (
                <button key={t} onClick={() => setTime(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${time === t ? 'bg-espresso-dark text-warm-white' : 'bg-cream-base text-espresso-mid border border-latte'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Catatan (opsional)</p>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ulang tahun, alergi, dll..." className="w-full text-sm text-espresso-deep placeholder:text-cafe-muted border-b border-latte pb-1.5 focus:outline-none focus:border-espresso-light" />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-warm-white/95 backdrop-blur border-t border-latte">
        <button
          onClick={handleSubmit}
          disabled={!selectedTable || !name || !date || !time || loading}
          className="w-full bg-espresso-dark text-warm-white py-4 rounded-2xl font-display font-bold text-base shadow-warm disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : selectedTable ? `Reservasi Meja ${selectedTable}` : 'Pilih Meja Dulu'}
        </button>
      </div>
    </div>
  )
}
