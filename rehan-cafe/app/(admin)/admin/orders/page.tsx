'use client'
import { useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminStore } from '@/lib/store/admin.store'
import { OrderStatus } from '@/lib/types'
import { formatRupiah, formatTime } from '@/lib/utils/format'

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-cafe-muted', bg: 'bg-cream-base' },
  confirmed: { label: 'Dikonfirmasi', color: 'text-blue-600', bg: 'bg-blue-50' },
  preparing: { label: 'Diproses', color: 'text-espresso-mid', bg: 'bg-espresso-light/15' },
  ready: { label: 'Siap', color: 'text-olive-sage', bg: 'bg-olive-sage/10' },
  completed: { label: 'Selesai', color: 'text-green-600', bg: 'bg-green-50' },
  cancelled: { label: 'Dibatalkan', color: 'text-red-500', bg: 'bg-red-50' },
}

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'completed',
}

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useAdminStore()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)
  const selectedOrder = orders.find((o) => o.id === selected)

  return (
    <div className="min-h-screen">
      <AdminHeader title="Orders" subtitle={`${orders.length} total order`} />
      <div className="p-6">
        {/* Customer Menu Link */}
        <div className="mb-5 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5">
          <div>
            <p className="text-sm font-bold text-amber-900">Menu Digital Customer (via QR Meja)</p>
            <p className="text-xs text-amber-700 mt-0.5">Bagikan link ini ke pelanggan atau scan QR di meja</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {[1, 2, 3].map((n) => (
              <a
                key={n}
                href={`/table/table-${n}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-amber-800 hover:bg-amber-900 text-warm-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
              >
                🪑 Meja {n}
              </a>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
          {['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-all capitalize ${
                filterStatus === s ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'
              }`}
            >
              {s === 'all' ? 'Semua' : statusConfig[s as OrderStatus]?.label}
              {' '}
              <span className="opacity-60">({s === 'all' ? orders.length : orders.filter((o) => o.status === s).length})</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Order List */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map((order) => {
              const cfg = statusConfig[order.status]
              return (
                <div
                  key={order.id}
                  onClick={() => setSelected(selected === order.id ? null : order.id)}
                  className={`bg-warm-white rounded-2xl p-4 shadow-warm-sm border cursor-pointer transition-all ${selected === order.id ? 'border-espresso-dark' : 'border-latte/40 hover:border-espresso-mid/30'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-espresso-dark/10 rounded-xl flex items-center justify-center">
                        <span className="text-espresso-dark font-bold text-sm">{order.tableNumber}</span>
                      </div>
                      <div>
                        <p className="font-bold text-espresso-deep">{order.orderNumber}</p>
                        <p className="text-cafe-muted text-xs">{order.customerName} · {formatTime(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-espresso-dark">{formatRupiah(order.totalAmount)}</p>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  </div>
                  <p className="text-cafe-muted text-xs truncate">{order.items.map((i) => `${i.menuItemName} (${i.size})×${i.quantity}`).join(', ')}</p>
                  {nextStatus[order.status] && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, nextStatus[order.status]!) }}
                      className="mt-3 text-xs font-semibold bg-espresso-dark text-warm-white px-4 py-1.5 rounded-full"
                    >
                      → {statusConfig[nextStatus[order.status]!].label}
                    </button>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-cafe-muted">
                <p className="text-4xl mb-2">🛒</p>
                <p>Tidak ada order dengan status ini</p>
              </div>
            )}
          </div>

          {/* Order Detail */}
          <div className="bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40 h-fit">
            {selectedOrder ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-display font-semibold text-espresso-deep">Detail Order</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[selectedOrder.status].bg} ${statusConfig[selectedOrder.status].color}`}>
                    {statusConfig[selectedOrder.status].label}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-cafe-muted">No. Order</span><span className="font-bold text-espresso-deep">{selectedOrder.orderNumber}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-cafe-muted">Meja</span><span className="font-semibold text-espresso-deep">{selectedOrder.tableNumber}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-cafe-muted">Tipe</span><span className="text-espresso-deep capitalize">{selectedOrder.type.replace('_', ' ')}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-cafe-muted">Pembayaran</span><span className="text-espresso-deep uppercase">{selectedOrder.paymentMethod}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-cafe-muted">Waktu</span><span className="text-espresso-deep">{formatTime(selectedOrder.createdAt)}</span></div>
                </div>
                <div className="border-t border-latte pt-4 space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <img src={item.menuItemImage} alt={item.menuItemName} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-espresso-deep truncate">{item.menuItemName}</p>
                        <p className="text-[10px] text-cafe-muted">{item.size} × {item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-espresso-dark">{formatRupiah(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-latte mt-3 pt-3 flex justify-between font-bold text-espresso-deep">
                  <span>Total</span>
                  <span>{formatRupiah(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-cafe-muted">
                <p className="text-3xl mb-2">👆</p>
                <p className="text-sm">Klik order untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
