'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser } from '../types'
import { findCredential, roleDefaultPage } from '../mock-data/auth'

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
        await new Promise((r) => setTimeout(r, 800))
        const credential = findCredential(email, password)
        if (!credential) {
          set({ isLoading: false, error: 'Email atau password salah.' })
          return ''
        }
        set({ user: credential.user, isLoading: false, error: null })
        return roleDefaultPage[credential.user.role]
      },

      logout: () => set({ user: null, error: null }),

      hasAccess: (page) => {
        const { user } = get()
        if (!user) return false
        return user.allowedPages.includes(page)
      },
    }),
    { name: 'rehan-auth' }
  )
)
