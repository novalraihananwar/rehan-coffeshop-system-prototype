'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊', page: 'dashboard' },
  { href: '/admin/orders', label: 'Orders', icon: '🛒', page: 'orders' },
  { href: '/admin/kitchen', label: 'Kitchen', icon: '👨‍🍳', page: 'kitchen' },
  { href: '/admin/menu', label: 'Menu', icon: '🍽️', page: 'menu' },
  { href: '/admin/tables', label: 'Meja', icon: '🪑', page: 'tables' },
  { href: '/admin/inventory', label: 'Inventori', icon: '📦', page: 'inventory' },
  { href: '/admin/staff', label: 'Staff', icon: '👥', page: 'staff' },
  { href: '/admin/loyalty', label: 'Loyalty', icon: '⭐', page: 'loyalty' },
  { href: '/admin/reports', label: 'Laporan', icon: '📈', page: 'reports' },
  { href: '/admin/suppliers', label: 'Supplier', icon: '🚚', page: 'suppliers' },
  { href: '/admin/activity', label: 'Aktivitas', icon: '📋', page: 'activity' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️', page: 'settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout, hasAccess } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const visibleItems = navItems.filter((item) => hasAccess(item.page))

  return (
    <aside className="w-56 flex-shrink-0 bg-gradient-to-b from-espresso-black to-espresso-deep flex flex-col h-screen sticky top-0 overflow-y-auto scrollbar-hide">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-espresso-light/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-espresso-light/20 border border-espresso-light/30 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">☕</span>
          </div>
          <div>
            <p className="font-display font-bold text-warm-white text-sm leading-tight">Rehan Cafe</p>
            <p className="text-espresso-light/60 text-[10px] uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-espresso-light/15 border border-espresso-light/20 text-espresso-light'
                  : 'text-warm-white/50 hover:text-warm-white/80 hover:bg-white/5'
              }`}>
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-espresso-light" />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-espresso-light/10">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 mb-2">
          <img src={user?.avatar} alt={user?.name} className="w-7 h-7 rounded-full flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-warm-white/90 text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-espresso-light/60 text-[10px] capitalize">{user?.role.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-warm-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs"
        >
          <span>🚪</span>
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
