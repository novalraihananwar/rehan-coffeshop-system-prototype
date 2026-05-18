'use client'
import { useEffect, useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { supabase } from '@/lib/supabase'
import { formatRupiah, formatDate } from '@/lib/utils/format'

type Tier = 'bronze' | 'silver' | 'gold'

interface CustomerRow {
  id: string
  name: string
  email: string
  phone: string
  loyalty_points: number
  total_points_earned: number
  tier: Tier
  total_orders: number
  total_spent: number
  joined_at: string
  last_visit: string
  avatar: string
}

const tierConfig: Record<Tier, { label: string; color: string; bg: string; icon: string }> = {
  bronze: { label: 'Bronze', color: 'text-espresso-mid', bg: 'bg-espresso-mid/10', icon: '🥉' },
  silver: { label: 'Silver', color: 'text-slate-500', bg: 'bg-slate-100', icon: '🥈' },
  gold:   { label: 'Gold',   color: 'text-amber-600', bg: 'bg-amber-50',   icon: '🥇' },
}

export default function LoyaltyPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('customers').select('*').order('loyalty_points', { ascending: false })
      .then(({ data }) => {
        if (data) setCustomers(data as CustomerRow[])
        setLoading(false)
      })
  }, [])

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalPoints = customers.reduce((s, c) => s + c.loyalty_points, 0)
  const goldCount = customers.filter((c) => c.tier === 'gold').length
  const silverCount = customers.filter((c) => c.tier === 'silver').length

  return (
    <div className="min-h-screen">
      <AdminHeader title="Loyalty & Customer" subtitle={`${customers.length} member terdaftar`} />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40 text-center">
            <p className="text-cafe-muted text-xs uppercase tracking-wider mb-1">Total Member</p>
            <p className="font-display text-2xl font-bold text-espresso-deep">{customers.length}</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 shadow-warm-sm border border-amber-200 text-center">
            <p className="text-amber-700 text-xs uppercase tracking-wider mb-1">Gold Member</p>
            <p className="font-display text-2xl font-bold text-amber-600">{goldCount} 🥇</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 shadow-warm-sm border border-slate-200 text-center">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Silver Member</p>
            <p className="font-display text-2xl font-bold text-slate-600">{silverCount} 🥈</p>
          </div>
          <div className="bg-espresso-deep rounded-2xl p-4 text-center">
            <p className="text-espresso-light/70 text-xs uppercase tracking-wider mb-1">Total Poin Aktif</p>
            <p className="font-display text-2xl font-bold text-espresso-light">{totalPoints.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Search */}
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari member..."
          className="w-full max-w-sm px-4 py-2.5 bg-warm-white border border-latte rounded-xl text-sm focus:outline-none focus:border-espresso-light" />

        {/* Customer Table */}
        <div className="bg-warm-white rounded-2xl shadow-warm-sm border border-latte/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-latte">
            <p className="font-display font-semibold text-espresso-deep">Daftar Member</p>
          </div>
          {loading ? (
            <p className="text-center py-8 text-cafe-muted text-sm">Memuat data...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-cafe-muted text-sm">
              {customers.length === 0 ? 'Belum ada member terdaftar' : 'Tidak ada member yang cocok'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-latte bg-cream-base/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Customer</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Tier</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Poin Aktif</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Total Poin</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Total Order</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Total Spend</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-cafe-muted uppercase tracking-wider">Kunjungan Terakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const tc = tierConfig[c.tier] || tierConfig.bronze
                    return (
                      <tr key={c.id} className="border-b border-latte/30 hover:bg-cream-base/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}&backgroundColor=6B4226&textColor=FFFAF4`}
                              alt={c.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-espresso-deep text-sm">{c.name}</p>
                              <p className="text-cafe-muted text-xs">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tc.bg} ${tc.color}`}>
                            {tc.icon} {tc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-espresso-dark text-sm">{c.loyalty_points.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-right text-cafe-muted text-sm">{c.total_points_earned.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-right text-espresso-mid text-sm">{c.total_orders}x</td>
                        <td className="px-4 py-3 text-right font-semibold text-espresso-deep text-sm">{formatRupiah(c.total_spent)}</td>
                        <td className="px-4 py-3 text-xs text-cafe-muted">{c.last_visit ? formatDate(new Date(c.last_visit)) : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
