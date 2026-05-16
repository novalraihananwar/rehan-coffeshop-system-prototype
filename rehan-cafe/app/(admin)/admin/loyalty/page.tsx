'use client'
import AdminHeader from '@/components/admin/AdminHeader'
import { mockCustomers } from '@/lib/mock-data/customers'
import { formatRupiah, formatDate } from '@/lib/utils/format'
import { LoyaltyTier } from '@/lib/types'

const tierConfig: Record<LoyaltyTier, { label: string; color: string; bg: string; icon: string }> = {
  bronze: { label: 'Bronze', color: 'text-espresso-mid', bg: 'bg-espresso-mid/10', icon: '🥉' },
  silver: { label: 'Silver', color: 'text-slate-500', bg: 'bg-slate-100', icon: '🥈' },
  gold: { label: 'Gold', color: 'text-amber-600', bg: 'bg-amber-50', icon: '🥇' },
}

export default function LoyaltyPage() {
  const totalPoints = mockCustomers.reduce((s, c) => s + c.loyaltyPoints, 0)

  return (
    <div className="min-h-screen">
      <AdminHeader title="Loyalty & Customer" subtitle={`${mockCustomers.length} member terdaftar`} />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40 text-center">
            <p className="text-cafe-muted text-xs uppercase tracking-wider mb-1">Total Member</p>
            <p className="font-display text-2xl font-bold text-espresso-deep">{mockCustomers.length}</p>
          </div>
          <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40 text-center">
            <p className="text-cafe-muted text-xs uppercase tracking-wider mb-1">Gold Member</p>
            <p className="font-display text-2xl font-bold text-amber-600">{mockCustomers.filter((c) => c.tier === 'gold').length}</p>
          </div>
          <div className="bg-espresso-deep rounded-2xl p-4 text-center">
            <p className="text-espresso-light/70 text-xs uppercase tracking-wider mb-1">Total Poin</p>
            <p className="font-display text-2xl font-bold text-espresso-light">{totalPoints.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-warm-white rounded-2xl shadow-warm-sm border border-latte/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-latte">
            <p className="font-display font-semibold text-espresso-deep">Daftar Member</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-latte bg-cream-base/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Customer</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Tier</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Poin</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Total Order</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Total Spend</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Kunjungan Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {mockCustomers.map((c) => {
                  const tc = tierConfig[c.tier]
                  return (
                    <tr key={c.id} className="border-b border-latte/30 hover:bg-cream-base/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-espresso-deep text-sm">{c.name}</p>
                            <p className="text-cafe-muted text-xs">{c.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tc.bg} ${tc.color}`}>
                          {tc.icon} {tc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-espresso-dark text-sm">{c.loyaltyPoints.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-right text-espresso-mid text-sm">{c.totalOrders}x</td>
                      <td className="px-4 py-3 text-right font-semibold text-espresso-deep text-sm">{formatRupiah(c.totalSpent)}</td>
                      <td className="px-4 py-3 text-xs text-cafe-muted">{formatDate(c.lastVisit)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
