'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCustomerAuthStore } from '@/lib/store/customer-auth.store'
import Link from 'next/link'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/member'
  const { register, isLoading } = useCustomerAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [err, setErr] = useState<string | null>(null)

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) return
    setErr(null)
    const result = await register(form)
    if (result.success) {
      router.push(redirect)
    } else {
      setErr(result.error || 'Gagal mendaftar.')
    }
  }

  return (
    <div className="min-h-screen bg-cream-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-espresso-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎁</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-espresso-deep">Daftar Member</h1>
          <p className="text-cafe-muted text-sm mt-1">Kumpulkan poin setiap kali order</p>
        </div>

        {/* Benefits teaser */}
        <div className="bg-espresso-dark rounded-2xl p-4 mb-5 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-warm-white font-bold text-sm">1 poin</p>
            <p className="text-espresso-light/70 text-[10px]">per Rp 1.000</p>
          </div>
          <div>
            <p className="text-warm-white font-bold text-sm">Rp 50</p>
            <p className="text-espresso-light/70 text-[10px]">nilai 1 poin</p>
          </div>
          <div>
            <p className="text-warm-white font-bold text-sm">3 Tier</p>
            <p className="text-espresso-light/70 text-[10px]">Bronze→Gold</p>
          </div>
        </div>

        <div className="bg-warm-white rounded-3xl p-6 shadow-warm-sm border border-latte/40 space-y-4">
          {err && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{err}</div>}
          <div>
            <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Nama Lengkap</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-latte rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-espresso-light" />
          </div>
          <div>
            <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-latte rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-espresso-light" />
          </div>
          <div>
            <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">No. HP (opsional)</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
              className="w-full border border-latte rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-espresso-light" />
          </div>
          <div>
            <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-latte rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-espresso-light" />
          </div>
          <button onClick={handleRegister} disabled={isLoading || !form.name || !form.email || !form.password}
            className="w-full bg-espresso-dark text-warm-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-50">
            {isLoading ? 'Mendaftar...' : 'Daftar & Mulai Kumpulkan Poin'}
          </button>
        </div>

        <p className="text-center text-sm text-cafe-muted mt-5">
          Sudah punya akun?{' '}
          <Link href={`/member/login${redirect !== '/member' ? `?redirect=${redirect}` : ''}`}
            className="text-espresso-dark font-semibold underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-base flex items-center justify-center"><p className="text-cafe-muted">Loading...</p></div>}>
      <RegisterContent />
    </Suspense>
  )
}
