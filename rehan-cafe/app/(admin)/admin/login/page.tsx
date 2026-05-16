'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/store/auth.store'
import { mockCredentials } from '@/lib/mock-data/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showHint, setShowHint] = useState(true)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const redirectTo = await login(email, password)
    if (redirectTo) router.push(redirectTo)
  }

  return (
    <div className="min-h-screen bg-espresso-deep flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-espresso-black via-espresso-deep to-espresso-mid opacity-80" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #D4A96A 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative text-center">
          <div className="w-24 h-24 rounded-3xl bg-espresso-light/15 border border-espresso-light/25 flex items-center justify-center mx-auto mb-8">
            <span className="text-5xl">☕</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-warm-white mb-3">Rehan Cafe</h1>
          <p className="text-espresso-light text-lg mb-2">& Eatery</p>
          <p className="text-warm-white/40 text-sm max-w-xs">Sistem manajemen cafe premium — realtime, modern, dan mudah digunakan.</p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {['📊 Dashboard', '🛒 Orders', '👨‍🍳 Kitchen'].map((f) => (
              <div key={f} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center">
                <p className="text-warm-white/60 text-xs">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-espresso-light/20 border border-espresso-light/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">☕</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-warm-white">Rehan Admin</h1>
          </div>

          <div className="bg-warm-white/8 backdrop-blur border border-warm-white/10 rounded-3xl p-8">
            <h2 className="font-display text-2xl font-bold text-warm-white mb-1">Selamat Datang</h2>
            <p className="text-cafe-muted text-sm mb-7">Masuk ke panel admin Rehan Cafe</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@rehancafe.com"
                  required
                  className="w-full bg-white/8 border border-white/15 text-warm-white placeholder:text-cafe-muted/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-espresso-light transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/8 border border-white/15 text-warm-white placeholder:text-cafe-muted/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-espresso-light transition-colors"
                />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-espresso-light text-espresso-deep py-3.5 rounded-xl font-display font-bold text-sm hover:bg-espresso-light/90 transition-all disabled:opacity-60 mt-2"
              >
                {isLoading ? 'Masuk...' : 'Masuk ke Dashboard'}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-espresso-light uppercase tracking-wider">Akun Demo — Klik untuk Login</p>
                <button onClick={() => setShowHint(!showHint)} className="text-cafe-muted text-[10px] hover:text-espresso-light transition-colors">
                  {showHint ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              {showHint && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {mockCredentials.filter(c => c.user.role !== 'member').map((c) => (
                    <button
                      key={c.email}
                      onClick={() => { setEmail(c.email); setPassword(c.password) }}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-white/5 hover:bg-white/12 border border-white/8 hover:border-espresso-light/30 rounded-xl transition-all text-left group"
                    >
                      <div>
                        <p className="text-warm-white/90 text-xs font-semibold group-hover:text-warm-white transition-colors">{c.user.name}</p>
                        <p className="text-cafe-muted text-[10px] mt-0.5">{c.email}</p>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-1 rounded-lg bg-espresso-light/15 text-espresso-light capitalize flex-shrink-0">
                        {c.user.role.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
