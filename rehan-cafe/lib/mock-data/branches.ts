import { Branch } from '../types'

export const mockBranches: Branch[] = [
  { id: 'all', name: 'Semua Cabang', address: '-', phone: '-', isActive: true },
  { id: 'branch-001', name: 'Cabang Utama', address: 'Jl. Sudirman No. 88, Malang', phone: '0341-123456', isActive: true, managerId: 'user-003' },
  { id: 'branch-002', name: 'Cabang Selatan', address: 'Jl. Fatmawati No. 22, Malang', phone: '0341-234567', isActive: true, managerId: 'staff-006' },
  { id: 'branch-003', name: 'Cabang Timur', address: 'Ruko Grand Galaxy, Bekasi', phone: '021-345678', isActive: true },
]
