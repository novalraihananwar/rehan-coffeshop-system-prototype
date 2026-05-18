import { InventoryItem } from '../types'

const soon = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000)

export const mockInventory: InventoryItem[] = [
  { id: 'inv-001', name: 'Biji Kopi Arabica', unit: 'gram', currentStock: 2400, minStock: 1000, maxStock: 10000, expiryDate: soon(45), supplierId: 'sup-001', supplierName: 'Arabica Prima', costPerUnit: 0.35, category: 'raw_material' },
  { id: 'inv-002', name: 'Susu Full Cream', unit: 'ml', currentStock: 8500, minStock: 5000, maxStock: 30000, expiryDate: soon(3), supplierId: 'sup-002', supplierName: 'Dairy Fresh', costPerUnit: 0.015, category: 'raw_material' },
  { id: 'inv-003', name: 'Sirup Karamel', unit: 'ml', currentStock: 1200, minStock: 500, maxStock: 5000, expiryDate: soon(60), supplierId: 'sup-003', supplierName: 'Monin Indonesia', costPerUnit: 0.08, category: 'raw_material' },
  { id: 'inv-004', name: 'Matcha Powder', unit: 'gram', currentStock: 350, minStock: 400, maxStock: 2000, expiryDate: soon(90), supplierId: 'sup-004', supplierName: 'Matcha House', costPerUnit: 0.5, category: 'raw_material' },
  { id: 'inv-005', name: 'Dark Chocolate', unit: 'gram', currentStock: 1800, minStock: 500, maxStock: 5000, expiryDate: soon(120), supplierId: 'sup-003', supplierName: 'Monin Indonesia', costPerUnit: 0.12, category: 'raw_material' },
  { id: 'inv-006', name: 'Gula Pasir', unit: 'gram', currentStock: 12000, minStock: 3000, maxStock: 20000, supplierId: 'sup-005', supplierName: 'Distributor Lokal', costPerUnit: 0.01, category: 'raw_material' },
  { id: 'inv-007', name: 'Cup 16oz', unit: 'pcs', currentStock: 180, minStock: 200, maxStock: 1000, supplierId: 'sup-006', supplierName: 'Packaging Co', costPerUnit: 850, category: 'packaging' },
  { id: 'inv-008', name: 'Cup 12oz', unit: 'pcs', currentStock: 320, minStock: 200, maxStock: 1000, supplierId: 'sup-006', supplierName: 'Packaging Co', costPerUnit: 650, category: 'packaging' },
  { id: 'inv-009', name: 'Sirup Vanilla', unit: 'ml', currentStock: 800, minStock: 300, maxStock: 3000, expiryDate: soon(2), supplierId: 'sup-003', supplierName: 'Monin Indonesia', costPerUnit: 0.07, category: 'raw_material' },
  { id: 'inv-010', name: 'Oat Milk', unit: 'ml', currentStock: 3200, minStock: 2000, maxStock: 10000, expiryDate: soon(7), supplierId: 'sup-002', supplierName: 'Dairy Fresh', costPerUnit: 0.025, category: 'raw_material' },
  { id: 'inv-011', name: 'Sedotan Kertas', unit: 'pcs', currentStock: 500, minStock: 300, maxStock: 2000, supplierId: 'sup-006', supplierName: 'Packaging Co', costPerUnit: 150, category: 'consumable' },
  { id: 'inv-012', name: 'Ayam Fillet', unit: 'gram', currentStock: 4500, minStock: 2000, maxStock: 10000, expiryDate: soon(2), supplierId: 'sup-007', supplierName: 'Chicken Fresh', costPerUnit: 0.045, category: 'raw_material' },
  { id: 'inv-013', name: 'Sirup Hazelnut', unit: 'ml', currentStock: 1200, minStock: 300, maxStock: 3000, expiryDate: soon(90), supplierId: 'sup-003', supplierName: 'Monin Indonesia', costPerUnit: 0.09, category: 'raw_material' },
  { id: 'inv-014', name: 'Teh Hijau Premium', unit: 'gram', currentStock: 600, minStock: 200, maxStock: 2000, expiryDate: soon(180), supplierId: 'sup-005', supplierName: 'Distributor Lokal', costPerUnit: 0.25, category: 'raw_material' },
  { id: 'inv-015', name: 'Pasta Fettuccine', unit: 'gram', currentStock: 5000, minStock: 1500, maxStock: 10000, supplierId: 'sup-005', supplierName: 'Distributor Lokal', costPerUnit: 0.018, category: 'raw_material' },
  { id: 'inv-016', name: 'Daging Sapi', unit: 'gram', currentStock: 3000, minStock: 1000, maxStock: 8000, expiryDate: soon(2), supplierId: 'sup-005', supplierName: 'Distributor Lokal', costPerUnit: 0.095, category: 'raw_material' },
  { id: 'inv-017', name: 'Kentang', unit: 'gram', currentStock: 8000, minStock: 2000, maxStock: 15000, expiryDate: soon(7), supplierId: 'sup-005', supplierName: 'Distributor Lokal', costPerUnit: 0.012, category: 'raw_material' },
  { id: 'inv-018', name: 'Tepung Panko', unit: 'gram', currentStock: 2500, minStock: 500, maxStock: 5000, supplierId: 'sup-005', supplierName: 'Distributor Lokal', costPerUnit: 0.022, category: 'raw_material' },
  { id: 'inv-019', name: 'Susu Kental Manis', unit: 'ml', currentStock: 2000, minStock: 500, maxStock: 5000, expiryDate: soon(120), supplierId: 'sup-002', supplierName: 'Dairy Fresh Indonesia', costPerUnit: 0.02, category: 'raw_material' },
  { id: 'inv-020', name: 'Whipped Cream', unit: 'ml', currentStock: 1200, minStock: 300, maxStock: 3000, expiryDate: soon(5), supplierId: 'sup-002', supplierName: 'Dairy Fresh Indonesia', costPerUnit: 0.03, category: 'raw_material' },
]

export const getLowStockItems = (): InventoryItem[] =>
  mockInventory.filter((i) => i.currentStock <= i.minStock)

export const getExpiringItems = (days: number = 3): InventoryItem[] =>
  mockInventory.filter((i) => i.expiryDate && i.expiryDate <= new Date(Date.now() + days * 24 * 60 * 60 * 1000))
