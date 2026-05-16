'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { mockTables } from '@/lib/mock-data/tables'

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

const statusColor: Record<string, string> = {
  empty: 'bg-olive-sage',
  occupied: 'bg-espresso-mid',
  reserved: 'bg-espresso-light',
  cleaning: 'bg-latte',
}

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
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedTable || !name || !date || !time) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
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
      <p className="text-cafe-muted text-sm mb-6">{date} pukul {time}</p>
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
        {/* Legend */}
        <div className="flex gap-4 text-xs text-cafe-muted">
          <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-olive-sage mr-1" />Kosong</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-espresso-mid mr-1" />Terisi</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-espresso-light mr-1" />Reserved</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-latte mr-1" />Cleaning</span>
        </div>

        {/* Table Map (first 30 shown) */}
        <div>
          <p className="font-display font-semibold text-espresso-deep mb-3">Pilih Meja</p>
          <div className="grid grid-cols-6 gap-2">
            {mockTables.slice(0, 30).map((table) => (
              <button
                key={table.id}
                disabled={table.status !== 'empty'}
                onClick={() => setSelectedTable(table.number)}
                className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  selectedTable === table.number
                    ? 'ring-2 ring-espresso-dark ring-offset-1 bg-espresso-dark text-warm-white'
                    : `${statusColor[table.status]} ${table.status === 'empty' ? 'text-warm-white' : 'text-warm-white/70 cursor-not-allowed opacity-60'}`
                }`}
              >
                {table.number}
              </button>
            ))}
          </div>
        </div>

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
              <button onClick={() => setGuests(Math.min(8, guests + 1))} className="w-8 h-8 rounded-full bg-espresso-dark text-warm-white font-bold">+</button>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Tanggal</p>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full text-sm text-espresso-deep border-b border-latte pb-1.5 focus:outline-none focus:border-espresso-light" />
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
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-warm-white/95 backdrop-blur border-t border-latte">
        <button
          onClick={handleSubmit}
          disabled={!selectedTable || !name || !date || !time || loading}
          className="w-full bg-espresso-dark text-warm-white py-4 rounded-2xl font-display font-bold text-base shadow-warm disabled:opacity-50"
        >
          {loading ? 'Memproses...' : selectedTable ? `Reservasi Meja ${selectedTable}` : 'Pilih Meja Dulu'}
        </button>
      </div>
    </div>
  )
}
