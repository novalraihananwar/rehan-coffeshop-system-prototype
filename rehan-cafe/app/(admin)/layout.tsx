'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import Sidebar from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [user, pathname, router])

  if (pathname === '/admin/login') return <>{children}</>
  if (!user) return null

  return (
    <div className="flex h-screen bg-cream-base overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
