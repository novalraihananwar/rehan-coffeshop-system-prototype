'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { useAdminStore } from '@/lib/store/admin.store'
import Sidebar from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const { syncWithMockData, seedInventoryToSupabase, loadInventoryFromSupabase } = useAdminStore()
  const router = useRouter()
  const pathname = usePathname()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    syncWithMockData()
    // Seed inventory ke Supabase (hanya jika kosong), lalu load dari Supabase
    seedInventoryToSupabase().then(() => loadInventoryFromSupabase())
  }, [])

  useEffect(() => {
    if (hydrated && !user && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [hydrated, user, pathname, router])

  if (pathname === '/admin/login') return <>{children}</>
  if (!hydrated) return null
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
