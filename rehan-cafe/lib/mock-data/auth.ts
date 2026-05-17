import { AuthUser, UserRole } from '../types'

export interface MockCredential {
  email: string
  password: string
  user: AuthUser
}

export const roleAccess: Record<UserRole, string[]> = {
  super_admin: ['dashboard', 'orders', 'kitchen', 'menu', 'tables', 'inventory', 'staff', 'loyalty', 'reports', 'suppliers', 'activity', 'settings'],
  owner: ['dashboard', 'orders', 'menu', 'tables', 'loyalty', 'reports', 'activity'],
  manager: ['dashboard', 'orders', 'kitchen', 'menu', 'tables', 'inventory', 'staff', 'loyalty', 'reports', 'suppliers'],
  cashier: ['dashboard', 'orders', 'kitchen', 'tables', 'loyalty'],
  barista: ['kitchen'],
  kitchen: ['kitchen'],
  inventory: ['inventory', 'suppliers'],
  supplier: ['suppliers'],
  member: [],
}

export const roleDefaultPage: Record<UserRole, string> = {
  super_admin: '/admin/dashboard',
  owner: '/admin/dashboard',
  manager: '/admin/dashboard',
  cashier: '/admin/dashboard',
  barista: '/admin/kitchen',
  kitchen: '/admin/kitchen',
  inventory: '/admin/inventory',
  supplier: '/admin/suppliers',
  member: '/',
}

export const roleLabel: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  owner: 'Owner',
  manager: 'Manager Cabang',
  cashier: 'Kasir',
  barista: 'Barista',
  kitchen: 'Kitchen Staff',
  inventory: 'Staff Gudang',
  supplier: 'Supplier Portal',
  member: 'Customer Member',
}

export const mockCredentials: MockCredential[] = [
  {
    email: 'superadmin@rehancafe.com',
    password: 'RehanMaster#2026',
    user: {
      id: 'user-001',
      email: 'superadmin@rehancafe.com',
      name: 'Rehan Superadmin',
      role: 'super_admin',
      branch: 'all',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RS&backgroundColor=6B4226&textColor=F5EDD8',
      allowedPages: roleAccess.super_admin,
    },
  },
  {
    email: 'owner@rehancafe.com',
    password: 'OwnerCafe#2026',
    user: {
      id: 'user-002',
      email: 'owner@rehancafe.com',
      name: 'Owner Rehan',
      role: 'owner',
      branch: 'all',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=OR&backgroundColor=3D2314&textColor=D4A96A',
      allowedPages: roleAccess.owner,
    },
  },
  {
    email: 'manager.kedungkandang@rehancafe.com',
    password: 'ManagerCafe#2026',
    user: {
      id: 'user-003',
      email: 'manager.kedungkandang@rehancafe.com',
      name: 'Manager Kedungkandang',
      role: 'manager',
      branch: 'branch-001',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MK&backgroundColor=8B6240&textColor=FFFAF4',
      allowedPages: roleAccess.manager,
    },
  },
  {
    email: 'cashier01@rehancafe.com',
    password: 'Cashier#2026',
    user: {
      id: 'user-004',
      email: 'cashier01@rehancafe.com',
      name: 'Kasir 01',
      role: 'cashier',
      branch: 'branch-001',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=K1&backgroundColor=D4A96A&textColor=3D2314',
      allowedPages: roleAccess.cashier,
    },
  },
  {
    email: 'barista01@rehancafe.com',
    password: 'BrewCoffee#2026',
    user: {
      id: 'user-005',
      email: 'barista01@rehancafe.com',
      name: 'Barista Ahmad',
      role: 'barista',
      branch: 'branch-001',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BA&backgroundColor=5C6B52&textColor=FFFAF4',
      allowedPages: roleAccess.barista,
    },
  },
  {
    email: 'kitchen01@rehancafe.com',
    password: 'KitchenPrep#2026',
    user: {
      id: 'user-006',
      email: 'kitchen01@rehancafe.com',
      name: 'Kitchen Budi',
      role: 'kitchen',
      branch: 'branch-001',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=KB&backgroundColor=6B4226&textColor=FFFAF4',
      allowedPages: roleAccess.kitchen,
    },
  },
  {
    email: 'inventory@rehancafe.com',
    password: 'Inventory#2026',
    user: {
      id: 'user-007',
      email: 'inventory@rehancafe.com',
      name: 'Staff Gudang',
      role: 'inventory',
      branch: 'branch-001',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SG&backgroundColor=A08060&textColor=FFFAF4',
      allowedPages: roleAccess.inventory,
    },
  },
  {
    email: 'supplier.arabica@rehancafe.com',
    password: 'Supplier#2026',
    user: {
      id: 'user-008',
      email: 'supplier.arabica@rehancafe.com',
      name: 'Supplier Arabica',
      role: 'supplier',
      branch: 'external',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SA2&backgroundColor=3D2314&textColor=D4B896',
      allowedPages: roleAccess.supplier,
    },
  },
  {
    email: 'member@guest.com',
    password: 'GuestCafe#2026',
    user: {
      id: 'user-009',
      email: 'member@guest.com',
      name: 'Guest Member',
      role: 'member',
      branch: 'all',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GM&backgroundColor=D4B896&textColor=3D2314',
      allowedPages: roleAccess.member,
    },
  },
]

export const findCredential = (email: string, password: string): MockCredential | undefined =>
  mockCredentials.find((c) => c.email === email && c.password === password)
