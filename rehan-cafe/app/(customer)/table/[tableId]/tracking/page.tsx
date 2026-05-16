'use client'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useOrderStore } from '@/lib/store/order.store'
import { OrderStatus } from '@/lib/types'
import Link from 'next/link'

const steps: { status: OrderStatus; label: string; icon: string; desc: string }[] = [
  { status: 'confirmed', label: 'Pesanan Diterima', icon: '✓', desc: 'Pesananmu sudah masuk ke sistem' },
  { status: 'preparing', label: 'Sedang Diproses', icon: '👨‍🍳', desc: 'Dapur sedang menyiapkan pesananmu' },
  { status: 'ready', label: 'Siap Diambil', icon: '🔔', desc: 'Pesananmu sudah siap!' },
  { status: 'completed', label: 'Selesai', icon: '🎉', desc: 'Selamat menikmati!' },
]

const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed']

function TrackingContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const tableId = params.tableId as string
  const orderId = searchParams.get('order') || ''
  const { orders, updateStatus } = useOrderStore()
  const order = orders.find((o) => o.id === orderId)
  const [countdown, setCountdown] = useState(order?.estimatedTime ? order.estimatedTime * 60 : 900)

  useEffect(() => {
    if (!order) return
    const currentIdx = statusOrder.indexOf(order.status)
    if (currentIdx < statusOrder.length - 2) {
      const timer = setInterval(() => {
        const nextStatus = statusOrder[currentIdx + 1]
        if (nextStatus && nextStatus !== 'cancelled') {
          updateStatus(orderId, nextStatus)
        }
        clearInterval(timer)
      }, 12000)
      return () => clearInterval(timer)
    }
  }, [order?.status])

  useEffect(() => {
    const interval = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!order) return (
    <div className="min-h-screen bg-cream-base flex items-center justify-center">
      <p className="text-cafe-muted">Order tidak ditemukan</p>
    </div>
  )

  const currentStatusIdx = statusOrder.indexOf(order.status)
  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60

  return (
    <div className="min-h-screen bg-cream-base pb-10">
      <div className="bg-espresso-deep px-6 pt-14 pb-8 text-center">
        <p className="text-espresso-light text-xs tracking-widest uppercase mb-2">Tracking Pesanan</p>
        <h1 className="font-display text-3xl font-bold text-warm-white mb-1">{order.orderNumber}</h1>
        <p className="text-cafe-muted text-sm">Meja {order.tableNumber}</p>
        {order.status !== 'completed' && (
          <div className="mt-4 inline-flex items-center gap-2 bg-espresso-light/15 border border-espresso-light/20 px-5 py-2.5 rounded-full">
            <span className="text-espresso-light">⏱</span>
            <span className="text-warm-white font-mono font-bold">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
          </div>
        )}
      </div>

      <div className="px-5 py-6 space-y-1">
        {steps.map((step, idx) => {
          const stepStatusIdx = statusOrder.indexOf(step.status)
          const isDone = currentStatusIdx >= stepStatusIdx
          const isActive = currentStatusIdx === stepStatusIdx

          return (
            <div key={step.status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                  transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    isDone ? 'bg-espresso-dark text-warm-white' : 'bg-latte/50 text-cafe-muted'
                  }`}
                >
                  {step.icon}
                </motion.div>
                {idx < steps.length - 1 && (
                  <div className={`w-0.5 flex-1 min-h-[32px] my-1 rounded-full transition-all ${isDone ? 'bg-espresso-dark' : 'bg-latte/50'}`} />
                )}
              </div>
              <div className="pt-2 pb-6">
                <p className={`font-semibold text-sm ${isDone ? 'text-espresso-deep' : 'text-cafe-muted'}`}>{step.label}</p>
                <p className="text-cafe-muted text-xs mt-0.5">{step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Items */}
      <div className="px-4 space-y-3">
        <p className="font-display font-semibold text-espresso-deep px-1">Item Pesanan</p>
        {order.items.map((item, i) => (
          <div key={i} className="bg-warm-white rounded-2xl p-3 flex gap-3 shadow-warm-sm border border-latte/40">
            <img src={item.menuItemImage} alt={item.menuItemName} className="w-12 h-12 rounded-xl object-cover" />
            <div>
              <p className="font-semibold text-espresso-deep text-sm">{item.menuItemName}</p>
              <p className="text-cafe-muted text-xs">Ukuran {item.size} × {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 mt-5">
        <Link href={`/table/${tableId}`}>
          <div className="w-full bg-warm-white border-2 border-latte text-espresso-dark py-3.5 rounded-2xl text-center font-semibold text-sm">
            ← Kembali ke Menu
          </div>
        </Link>
      </div>
    </div>
  )
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-base flex items-center justify-center"><p className="text-cafe-muted">Loading...</p></div>}>
      <TrackingContent />
    </Suspense>
  )
}
