'use client'
import { useAuthStore } from '@/lib/store/auth.store'
import { useAdminStore } from '@/lib/store/admin.store'
import { mockBranches } from '@/lib/mock-data/branches'
import { formatDate } from '@/lib/utils/format'
import { useState } from 'react'

interface AdminHeaderProps {
  title: string
  subtitle?: string
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { user } = useAuthStore()
  const { selectedBranch, setSelectedBranch, notifications, clearNotification } = useAdminStore()
  const [showNotif, setShowNotif] = useState(false)

  const branches = user?.role === 'super_admin' || user?.role === 'owner'
    ? mockBranches
    : mockBranches.filter((b) => b.id === user?.branch || b.id === 'all')

  const currentBranch = mockBranches.find((b) => b.id === selectedBranch)

  return (
    <header className="bg-warm-white border-b border-latte px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="font-display text-xl font-bold text-espresso-deep">{title}</h1>
        <p className="text-cafe-muted text-xs mt-0.5">{subtitle || formatDate(new Date())}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Branch Selector */}
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="text-xs font-semibold text-espresso-deep bg-cream-base border border-latte rounded-xl px-3 py-2 focus:outline-none focus:border-espresso-light cursor-pointer"
        >
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 bg-cream-base rounded-xl flex items-center justify-center border border-latte hover:border-espresso-light transition-all"
          >
            <span className="text-base">🔔</span>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-espresso-dark text-warm-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-11 w-72 bg-warm-white border border-latte rounded-2xl shadow-warm-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-latte">
                <p className="font-semibold text-espresso-deep text-sm">Notifikasi</p>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-cafe-muted text-sm">Tidak ada notifikasi</div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n, i) => (
                    <div key={i} className="px-4 py-3 border-b border-latte/40 flex items-start justify-between gap-2 hover:bg-cream-base">
                      <p className="text-xs text-espresso-mid">{n}</p>
                      <button onClick={() => clearNotification(i)} className="text-cafe-muted text-xs flex-shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-xl border-2 border-latte" />
      </div>
    </header>
  )
}
