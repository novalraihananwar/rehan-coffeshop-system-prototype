'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerAuthStore, getTier, POINTS_TO_RUPIAH, MIN_REDEEM_POINTS } from '@/lib/store/customer-auth.store'
import { formatRupiah, formatDate } from '@/lib/utils/format'
import Link from 'next/link'

const tierConfig = {
  bronze: { label: 'Bronze', icon: '🥉', color: 'text-espresso-mid', bg: 'bg-espresso-mid/10', next: 'silver', nextAt: 500, bonus: 0 },
  silver: { label: 'Silver', icon: '🥈', color: 'text-slate-600', bg: 'bg-slate-100', next: 'gold', nextAt: 1500, bonus: 5 },
  gold:   { label: 'Gold',   icon: '🥇', color: 'text-amber-600', bg: 'bg-amber-50',   next: null,   nextAt: null, bonus: 10 },
}

export default function MemberPage() {
  const router = useRouter()
  const { customer, logout, refreshCustomer } = useCustomerAuthStore()

  useEffect(() => {
    if (!customer) { router.push('/member/login'); return }
    refreshCustomer()
  }, [])

  if (!customer) return null

  const tier = tierConfig[customer.tier]
  const redeemValue = Math.floor(customer.loyalty_points / MIN_REDEEM_POINTS) * MIN_REDEEM_POINTS * POINTS_TO_RUPIAH
  const nextTierAt = tier.next ? tierConfig[tier.next as keyof typeof tierConfig]?.nextAt || tier.nextAt : null
  const progressPct = nextTierAt ? Math.min(100, (customer.total_points_earned / nextTierAt) * 100) : 100

  return (
    <div className="min-h-screen bg-cream-base pb-10">
      {/* Hero */}
      <div className="bg-espresso-deep px-6 pt-12 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <img src={customer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customer.name)}&backgroundColor=6B4226&textColor=FFFAF4`}
            alt={customer.name} className="w-16 h-16 rounded-2xl border-2 border-espresso-light/30" />
          <div>
            <p className="text-espresso-light/60 text-xs font-semibold uppercase tracking-wider">Rehan Member</p>
            <h1 className="font-display text-xl font-bold text-warm-white">{customer.name}</h1>
            <p className="text-espresso-light/70 text-xs">{customer.email}</p>
          </div>
        </div>

        {/* Points Card */}
        <div className="bg-espresso-mid/20 border border-espresso-light/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-espresso-light/60 text-xs uppercase tracking-wider">Poin Aktif</p>
              <p className="font-display text-4xl font-bold text-warm-white">{customer.loyalty_points.toLocaleString('id-ID')}</p>
              <p className="text-espresso-light/60 text-xs">≈ {formatRupiah(customer.loyalty_points * POINTS_TO_RUPIAH)} cashback</p>
            </div>
            <span className={`text-3xl px-3 py-3 rounded-2xl ${tier.bg}`}>{tier.icon}</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold ${tier.color}`}>{tier.label}</span>
            {tier.next && <span className="text-xs text-espresso-light/50">{tier.label} → {tier.next.charAt(0).toUpperCase()+tier.next.slice(1)}</span>}
          </div>
          {tier.next && (
            <div className="h-1.5 bg-espresso-light/20 rounded-full overflow-hidden">
              <div className="h-full bg-espresso-light rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          )}
          {tier.next && nextTierAt && (
            <p className="text-espresso-light/50 text-[10px] mt-1">
              {nextTierAt - customer.total_points_earned} poin lagi untuk naik ke {tier.next}
            </p>
          )}
          {!tier.next && <p className="text-amber-400 text-xs mt-1 font-semibold">✨ Kamu sudah di tier tertinggi!</p>}
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-warm-white rounded-2xl p-4 text-center shadow-warm-sm border border-latte/40">
            <p className="text-espresso-dark font-bold text-xl">{customer.total_orders}</p>
            <p className="text-cafe-muted text-xs mt-0.5">Total Order</p>
          </div>
          <div className="bg-warm-white rounded-2xl p-4 text-center shadow-warm-sm border border-latte/40">
            <p className="text-espresso-dark font-bold text-lg leading-tight">{formatRupiah(customer.total_spent)}</p>
            <p className="text-cafe-muted text-xs mt-0.5">Total Belanja</p>
          </div>
          <div className="bg-warm-white rounded-2xl p-4 text-center shadow-warm-sm border border-latte/40">
            <p className="text-espresso-dark font-bold text-xl">{customer.total_points_earned}</p>
            <p className="text-cafe-muted text-xs mt-0.5">Total Poin</p>
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
          <p className="font-display font-semibold text-espresso-deep mb-3">Keuntungan Tier</p>
          <div className="space-y-2">
            {[
              { t: 'bronze', icon: '🥉', label: 'Bronze', min: 0, max: 499, bonus: 0 },
              { t: 'silver', icon: '🥈', label: 'Silver', min: 500, max: 1499, bonus: 5 },
              { t: 'gold',   icon: '🥇', label: 'Gold',   min: 1500, max: null, bonus: 10 },
            ].map((t) => (
              <div key={t.t} className={`flex items-center justify-between p-3 rounded-xl ${customer.tier === t.t ? 'bg-espresso-dark text-warm-white' : 'bg-cream-base'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{t.icon}</span>
                  <div>
                    <p className={`text-sm font-bold ${customer.tier === t.t ? 'text-warm-white' : 'text-espresso-deep'}`}>{t.label}</p>
                    <p className={`text-xs ${customer.tier === t.t ? 'text-espresso-light/70' : 'text-cafe-muted'}`}>
                      {t.max ? `${t.min}–${t.max} total poin` : `${t.min}+ total poin`}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${customer.tier === t.t ? 'bg-espresso-light/20 text-espresso-light' : 'bg-olive-sage/10 text-olive-sage'}`}>
                  {t.bonus === 0 ? 'Standar' : `+${t.bonus}% bonus poin`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cara Redeem */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="font-semibold text-amber-900 text-sm mb-2">💡 Cara Pakai Poin</p>
          <ul className="text-amber-800 text-xs space-y-1">
            <li>• Min. redeem: {MIN_REDEEM_POINTS} poin = {formatRupiah(MIN_REDEEM_POINTS * POINTS_TO_RUPIAH)} diskon</li>
            <li>• 1 poin = {formatRupiah(POINTS_TO_RUPIAH)}</li>
            <li>• Pilih "Gunakan Poin" saat checkout</li>
            {customer.loyalty_points >= MIN_REDEEM_POINTS && (
              <li className="font-bold text-amber-900 pt-1">✅ Kamu bisa redeem hingga {formatRupiah(redeemValue)}!</li>
            )}
          </ul>
        </div>

        <button onClick={logout}
          className="w-full border border-red-200 text-red-500 py-3 rounded-2xl text-sm font-semibold hover:bg-red-50 transition-colors">
          Logout dari Akun Member
        </button>

        <Link href="/" className="block text-center text-espresso-dark text-sm font-semibold underline">
          ← Kembali ke Menu
        </Link>
      </div>
    </div>
  )
}
