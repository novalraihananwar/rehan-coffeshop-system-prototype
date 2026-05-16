import { Customer } from '../types'

export const mockCustomers: Customer[] = [
  { id: 'cust-001', name: 'Rina Dewi', email: 'rina@email.com', phone: '08111000001', loyaltyPoints: 2450, tier: 'gold', totalOrders: 48, totalSpent: 2340000, joinedAt: new Date('2024-01-10'), lastVisit: new Date('2026-05-10'), avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RD&backgroundColor=D4A96A&textColor=3D2314' },
  { id: 'cust-002', name: 'Budi Santoso', email: 'budi@email.com', phone: '08111000002', loyaltyPoints: 1200, tier: 'silver', totalOrders: 24, totalSpent: 1150000, joinedAt: new Date('2024-03-15'), lastVisit: new Date('2026-05-09'), avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BS&backgroundColor=8B6240&textColor=fff' },
  { id: 'cust-003', name: 'Sinta Lestari', email: 'sinta@email.com', phone: '08111000003', loyaltyPoints: 380, tier: 'bronze', totalOrders: 8, totalSpent: 420000, joinedAt: new Date('2025-01-20'), lastVisit: new Date('2026-05-08'), avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SL&backgroundColor=6B4226&textColor=fff' },
  { id: 'cust-004', name: 'Hendra Wijaya', email: 'hendra@email.com', phone: '08111000004', loyaltyPoints: 3100, tier: 'gold', totalOrders: 62, totalSpent: 3800000, joinedAt: new Date('2023-11-05'), lastVisit: new Date('2026-05-11'), avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=HW&backgroundColor=3D2314&textColor=D4A96A' },
  { id: 'cust-005', name: 'Dian Putri', email: 'dian@email.com', phone: '08111000005', loyaltyPoints: 890, tier: 'silver', totalOrders: 18, totalSpent: 950000, joinedAt: new Date('2024-06-01'), lastVisit: new Date('2026-05-07'), avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DP&backgroundColor=5C6B52&textColor=fff' },
]
