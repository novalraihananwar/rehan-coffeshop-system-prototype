'use client'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminStore } from '@/lib/store/admin.store'
import { formatTime } from '@/lib/utils/format'
import { roleLabel } from '@/lib/mock-data/auth'

const actionIcon: Record<string, string> = {
  'Order Masuk': '🛒',
  'Pembayaran': '💰',
  'Status Order': '🔄',
  'Login': '🔐',
  'Menu Update': '🍽️',
  'Stock Update': '📦',
  'default': '📋',
}

export default function ActivityPage() {
  const { activityLog, orders } = useAdminStore()

  const mockLogs = orders.slice(0, 8).map((o, i) => ({
    id: `log-mock-${i}`,
    userId: 'system',
    userName: 'System',
    userRole: 'cashier' as const,
    action: 'Order Masuk',
    target: `Meja ${o.tableNumber}`,
    details: `${o.orderNumber} — Rp ${o.totalAmount.toLocaleString('id-ID')}`,
    timestamp: o.createdAt,
    branch: o.branch,
  }))

  const allLogs = [...activityLog, ...mockLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return (
    <div className="min-h-screen">
      <AdminHeader title="Activity Log" subtitle="Semua aktivitas sistem" />
      <div className="p-6">
        <div className="bg-warm-white rounded-2xl shadow-warm-sm border border-latte/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-latte">
            <p className="font-display font-semibold text-espresso-deep">{allLogs.length} aktivitas tercatat</p>
          </div>
          <div className="divide-y divide-latte/30">
            {allLogs.length === 0 ? (
              <div className="py-12 text-center text-cafe-muted">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-sm">Belum ada aktivitas tercatat</p>
              </div>
            ) : (
              allLogs.map((log, i) => (
                <div key={log.id || i} className="flex items-start gap-4 px-5 py-4 hover:bg-cream-base/30 transition-colors">
                  <div className="w-9 h-9 bg-cream-base rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {actionIcon[log.action] || actionIcon.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-espresso-deep text-sm">{log.action} — {log.target}</p>
                        <p className="text-cafe-muted text-xs mt-0.5">{log.details}</p>
                      </div>
                      <p className="text-cafe-muted text-xs flex-shrink-0">{formatTime(log.timestamp)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-espresso-mid text-xs">{log.userName}</span>
                      <span className="text-cafe-muted text-xs">·</span>
                      <span className="text-cafe-muted text-xs capitalize">{roleLabel[log.userRole] || log.userRole}</span>
                      <span className="text-cafe-muted text-xs">·</span>
                      <span className="text-cafe-muted text-xs capitalize">{log.branch.replace('branch-', 'Cabang ')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
