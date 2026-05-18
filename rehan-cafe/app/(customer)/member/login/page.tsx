'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCustomerAuthStore } from '@/lib/store/customer-auth.store'
import Link from 'next/link'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/member'
  const { login, isLoading, error } = useCustomerAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const ok = await login(email, password)
    if (ok) router.push(redirect)
  }

  return (
    <div className="min-h-screen bg-cream-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-espresso-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">☕</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-espresso-deep">Login Member</h1>
          <p className="text-cafe-muted text-sm mt-1">Masuk untuk kumpulkan poin loyalty</p>
        </div>

        <div className="bg-warm-white rounded-3xl p-6 shadow-warm-sm border border-latte/40 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>
          )}
          <div>
            <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full border border-latte rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-espresso-light" />
          </div>
          <div>
            <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full border border-latte rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-espresso-light" />
          </div>
          <button onClick={handleLogin} disabled={isLoading || !email || !password}
            className="w-full bg-espresso-dark text-warm-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-all">
            {isLoading ? 'Masuk...' : 'Masuk'}
          </button>
        </div>

        <p className="text-center text-sm text-cafe-muted mt-5">
          Belum punya akun?{' '}
          <Link href={`/member/register${redirect !== '/member' ? `?redirect=${redirect}` : ''}`}
            className="text-espresso-dark font-semibold underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-base flex items-center justify-center"><p className="text-cafe-muted">Loading...</p></div>}>
      <LoginContent />
    </Suspense>
  )
}
