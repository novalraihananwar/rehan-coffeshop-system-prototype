import { StaffMember } from '../types'

export const mockStaff: StaffMember[] = [
  { id: 'staff-001', name: 'Ahmad Barista', email: 'barista01@rehancafe.com', role: 'barista', branch: 'branch-001', isActive: true, phone: '08123456001', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AB&backgroundColor=5C6B52&textColor=fff', joinedAt: new Date('2024-01-15') },
  { id: 'staff-002', name: 'Budi Kitchen', email: 'kitchen01@rehancafe.com', role: 'kitchen', branch: 'branch-001', isActive: true, phone: '08123456002', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BK&backgroundColor=6B4226&textColor=fff', joinedAt: new Date('2024-02-01') },
  { id: 'staff-003', name: 'Cinta Kasir', email: 'cashier01@rehancafe.com', role: 'cashier', branch: 'branch-001', isActive: true, phone: '08123456003', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CK&backgroundColor=D4A96A&textColor=3D2314', joinedAt: new Date('2024-01-20') },
  { id: 'staff-004', name: 'Doni Manager', email: 'manager.kedungkandang@rehancafe.com', role: 'manager', branch: 'branch-001', isActive: true, phone: '08123456004', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DM&backgroundColor=8B6240&textColor=fff', joinedAt: new Date('2023-11-01') },
  { id: 'staff-005', name: 'Eka Gudang', email: 'inventory@rehancafe.com', role: 'inventory', branch: 'branch-001', isActive: true, phone: '08123456005', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=EG&backgroundColor=A08060&textColor=fff', joinedAt: new Date('2024-03-01') },
  { id: 'staff-006', name: 'Farhan Barista', email: 'barista02@rehancafe.com', role: 'barista', branch: 'branch-002', isActive: true, phone: '08123456006', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FB&backgroundColor=5C6B52&textColor=fff', joinedAt: new Date('2024-04-01') },
  { id: 'staff-007', name: 'Gita Kasir', email: 'cashier02@rehancafe.com', role: 'cashier', branch: 'branch-002', isActive: false, phone: '08123456007', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GK&backgroundColor=D4A96A&textColor=3D2314', joinedAt: new Date('2024-02-15') },
]
