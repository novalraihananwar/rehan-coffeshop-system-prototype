'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../supabase'

export interface CustomerUser {
  id: string
  name: string
  email: string
  phone: string
  loyalty_points: number
  total_points_earned: number
  tier: 'bronze' | 'silver' | 'gold'
  total_orders: number
  total_spent: number
  joined_at: string
  avatar: string
}

export function getTier(totalEarned: number): 'bronze' | 'silver' | 'gold' {
  if (totalEarned >= 1500) return 'gold'
  if (totalEarned >= 500) return 'silver'
  return 'bronze'
}

export function calcPointsEarned(paidAmount: number, tier: 'bronze' | 'silver' | 'gold'): number {
  const base = Math.floor(paidAmount / 1000)
  const mult = tier === 'gold' ? 1.10 : tier === 'silver' ? 1.05 : 1.0
  return Math.floor(base * mult)
}

export const POINTS_TO_RUPIAH = 50   // 1 poin = Rp 50
export const MIN_REDEEM_POINTS = 100 // minimum redeem

interface CustomerAuthStore {
  customer: CustomerUser | null
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<boolean>
  register: (data: { name: string; email: string; password: string; phone: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshCustomer: () => Promise<void>
  processOrder: (paidAmount: number, redeemedPoints: number) => Promise<number>
}

export const useCustomerAuthStore = create<CustomerAuthStore>()(
  persist(
    (set, get) => ({
      customer: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('email', email.toLowerCase().trim())
          .eq('password', password)
          .maybeSingle()

        if (error || !data) {
          set({ isLoading: false, error: 'Email atau password salah.' })
          return false
        }
        set({ customer: data as CustomerUser, isLoading: false, error: null })
        return true
      },

      register: async ({ name, email, password, phone }) => {
        set({ isLoading: true, error: null })
        const exists = await supabase.from('customers').select('id').eq('email', email.toLowerCase().trim()).maybeSingle()
        if (exists.data) {
          set({ isLoading: false })
          return { success: false, error: 'Email sudah terdaftar.' }
        }
        const id = `cust-${Date.now()}`
        const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6B4226&textColor=FFFAF4`
        const { error } = await supabase.from('customers').insert({
          id, name, email: email.toLowerCase().trim(), password, phone, avatar,
          loyalty_points: 0, total_points_earned: 0, tier: 'bronze',
          total_orders: 0, total_spent: 0,
        })
        if (error) {
          set({ isLoading: false })
          return { success: false, error: 'Gagal mendaftar. Coba lagi.' }
        }
        const { data } = await supabase.from('customers').select('*').eq('id', id).maybeSingle()
        set({ customer: data as CustomerUser, isLoading: false, error: null })
        return { success: true }
      },

      logout: () => set({ customer: null, error: null }),

      refreshCustomer: async () => {
        const { customer } = get()
        if (!customer) return
        const { data } = await supabase.from('customers').select('*').eq('id', customer.id).maybeSingle()
        if (data) set({ customer: data as CustomerUser })
      },

      // Returns points earned in this order
      processOrder: async (paidAmount, redeemedPoints) => {
        const { customer } = get()
        if (!customer) return 0

        const earned = calcPointsEarned(paidAmount, customer.tier)
        const newPoints = Math.max(0, customer.loyalty_points - redeemedPoints + earned)
        const newTotalEarned = customer.total_points_earned + earned
        const newTier = getTier(newTotalEarned)

        await supabase.from('customers').update({
          loyalty_points: newPoints,
          total_points_earned: newTotalEarned,
          tier: newTier,
          total_orders: customer.total_orders + 1,
          total_spent: customer.total_spent + paidAmount,
          last_visit: new Date().toISOString(),
        }).eq('id', customer.id)

        set({
          customer: {
            ...customer,
            loyalty_points: newPoints,
            total_points_earned: newTotalEarned,
            tier: newTier,
            total_orders: customer.total_orders + 1,
            total_spent: customer.total_spent + paidAmount,
          },
        })
        return earned
      },
    }),
    { name: 'rehan-customer-auth' }
  )
)
