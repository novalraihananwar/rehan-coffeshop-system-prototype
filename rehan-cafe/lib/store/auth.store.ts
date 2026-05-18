'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser, UserRole } from '../types'
import { findCredential, roleDefaultPage, roleAccess } from '../mock-data/auth'
import { supabase } from '../supabase'

interface AuthStore {
  user: AuthUser | null
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<string>
  logout: () => void
  hasAccess: (page: string) => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        await new Promise((r) => setTimeout(r, 600))

        // 1. Cek mock credentials (staff lama)
        const mockCred = findCredential(email, password)
        if (mockCred) {
          set({ user: mockCred.user, isLoading: false, error: null })
          return roleDefaultPage[mockCred.user.role]
        }

        // 2. Cek Supabase staff_accounts (staff baru yang ditambah via UI)
        const { data, error } = await supabase
          .from('staff_accounts')
          .select('*')
          .eq('email', email.toLowerCase().trim())
          .eq('password', password)
          .eq('is_active', true)
          .maybeSingle()

        if (!error && data) {
          const role = data.role as UserRole
          const staffUser: AuthUser = {
            id: data.id,
            email: data.email,
            name: data.name,
            role,
            branch: data.branch || 'branch-001',
            avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=6B4226&textColor=FFFAF4`,
            allowedPages: roleAccess[role] || [],
          }
          set({ user: staffUser, isLoading: false, error: null })
          return roleDefaultPage[role] || '/admin/dashboard'
        }

        set({ isLoading: false, error: 'Email atau password salah.' })
        return ''
      },

      logout: () => set({ user: null, error: null }),

      hasAccess: (page): boolean => {
        const { user } = get()
        if (!user) return false
        return user.allowedPages.includes(page)
      },
    }),
    { name: 'rehan-auth' }
  )
)
