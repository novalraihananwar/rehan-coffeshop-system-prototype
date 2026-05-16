'use client'
import { motion } from 'framer-motion'

export default function SplashScreen({ tableNumber }: { tableNumber: number }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-espresso-deep"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-espresso-light/20 border border-espresso-light/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">☕</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-warm-white mb-1">Rehan Cafe</h1>
        <p className="text-espresso-light text-sm tracking-widest uppercase mb-8">& Eatery</p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 bg-espresso-light/15 border border-espresso-light/25 px-5 py-2.5 rounded-full"
        >
          <span className="text-espresso-light text-sm">🪑</span>
          <span className="text-warm-white text-sm font-semibold">Meja {tableNumber}</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-cafe-muted text-xs mt-8"
        >
          Memuat menu...
        </motion.p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '80px' }}
          transition={{ delay: 0.8, duration: 1.2, ease: 'easeInOut' }}
          className="h-0.5 bg-espresso-light/50 rounded-full mx-auto mt-2"
        />
      </motion.div>
    </motion.div>
  )
}
