'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'

const categories = [
  { key: 'food', label: 'Makanan', icon: '🍝' },
  { key: 'drink', label: 'Minuman', icon: '☕' },
  { key: 'service', label: 'Pelayanan', icon: '😊' },
  { key: 'ambience', label: 'Suasana', icon: '✨' },
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => onChange(star)} className={`text-2xl transition-all ${star <= value ? 'opacity-100' : 'opacity-30'}`}>⭐</button>
      ))}
    </div>
  )
}

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const tableId = params.tableId as string
  const [ratings, setRatings] = useState({ food: 0, drink: 0, service: 0, ambience: 0 })
  const [comment, setComment] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const setRating = (key: string, val: number) => setRatings((r) => ({ ...r, [key]: val }))

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setDone(true)
  }

  if (done) return (
    <div className="min-h-screen bg-cream-base flex flex-col items-center justify-center px-6 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
        className="w-24 h-24 bg-espresso-light/20 rounded-full flex items-center justify-center mb-5 border-2 border-espresso-light/40">
        <span className="text-5xl">🙏</span>
      </motion.div>
      <h2 className="font-display text-2xl font-bold text-espresso-deep mb-2">Terima Kasih!</h2>
      <p className="text-cafe-muted text-sm mb-1">Ulasanmu sangat berarti bagi kami</p>
      <p className="text-cafe-muted text-sm mb-8">Sampai jumpa lagi di Rehan Cafe ☕</p>
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
        <div>
          <h1 className="font-display text-xl font-bold text-espresso-deep">Beri Ulasan</h1>
          <p className="text-cafe-muted text-xs">Pengalamanmu hari ini</p>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {categories.map((cat) => (
          <div key={cat.key} className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{cat.icon}</span>
              <p className="font-semibold text-espresso-deep">{cat.label}</p>
            </div>
            <StarRating value={ratings[cat.key as keyof typeof ratings]} onChange={(v) => setRating(cat.key, v)} />
          </div>
        ))}

        <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40">
          <p className="font-semibold text-espresso-deep mb-2">Ceritakan Pengalamanmu</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis ulasan kamu di sini... (opsional)"
            rows={4}
            className="w-full text-sm text-espresso-deep placeholder:text-cafe-muted focus:outline-none resize-none"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-warm-white/95 backdrop-blur border-t border-latte">
        <button
          onClick={handleSubmit}
          disabled={Object.values(ratings).every((r) => r === 0) || loading}
          className="w-full bg-espresso-dark text-warm-white py-4 rounded-2xl font-display font-bold text-base shadow-warm disabled:opacity-50"
        >
          {loading ? 'Mengirim...' : 'Kirim Ulasan ⭐'}
        </button>
      </div>
    </div>
  )
}
