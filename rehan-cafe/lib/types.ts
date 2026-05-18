export type MenuSize = 'S' | 'M' | 'L'
export type MenuCategory = 'coffee' | 'non-coffee' | 'food' | 'dessert' | 'bundle'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
export type TableStatus = 'empty' | 'occupied' | 'reserved' | 'cleaning'
export type UserRole = 'super_admin' | 'owner' | 'manager' | 'cashier' | 'barista' | 'kitchen' | 'inventory' | 'supplier' | 'member'
export type OrderType = 'dine_in' | 'takeaway' | 'preorder' | 'reservation'
export type LoyaltyTier = 'bronze' | 'silver' | 'gold'
export type PaymentMethod = 'qris' | 'gopay' | 'ovo' | 'dana' | 'debit' | 'credit' | 'cash' | 'cashier'

export interface MenuIngredient {
  inventoryItemId: string
  amount: number
}

export interface MenuItem {
  id: string
  name: string
  description: string
  category: MenuCategory
  image: string
  prices: Record<MenuSize, number>
  rating: number
  reviewCount: number
  isAvailable: boolean
  isBestseller: boolean
  isNew: boolean
  isPromo: boolean
  tags: string[]
  pairsWith: string[]
  preparationTime: number // minutes
  ingredients?: MenuIngredient[]
}

export interface CartItem {
  menuItem: MenuItem
  size: MenuSize
  quantity: number
  notes: string
}

export interface OrderItem {
  menuItemId: string
  menuItemName: string
  menuItemImage: string
  size: MenuSize
  quantity: number
  notes: string
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: string
  orderNumber: string
  tableId: string
  tableNumber: number
  type: OrderType
  items: OrderItem[]
  status: OrderStatus
  totalAmount: number
  paymentMethod: PaymentMethod
  createdAt: Date
  updatedAt: Date
  estimatedTime: number
  notes: string
  customerName: string
  branch: string
  scheduledTime?: string
  reservationId?: string
}

export interface Table {
  id: string
  number: number
  capacity: number
  status: TableStatus
  currentOrderId?: string
  reservedBy?: string
  reservedAt?: Date
  section: 'indoor' | 'outdoor' | 'private'
}

export interface StaffMember {
  id: string
  name: string
  email: string
  role: UserRole
  branch: string
  isActive: boolean
  avatar: string
  phone: string
  joinedAt: Date
}

export interface InventoryItem {
  id: string
  name: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  expiryDate?: Date
  supplierId: string
  supplierName: string
  costPerUnit: number
  category: 'raw_material' | 'packaging' | 'consumable'
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  loyaltyPoints: number
  tier: LoyaltyTier
  totalOrders: number
  totalSpent: number
  joinedAt: Date
  lastVisit: Date
  avatar: string
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  products: string[]
  isActive: boolean
  rating: number
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  branch: string
  avatar: string
  allowedPages: string[]
}

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  isActive: boolean
  managerId?: string
}

export interface ActivityLog {
  id: string
  userId: string
  userName: string
  userRole: UserRole
  action: string
  target: string
  details: string
  timestamp: Date
  branch: string
}

export interface Reservation {
  id: string
  tableId: string
  tableNumber: number
  customerName: string
  customerPhone: string
  guestCount: number
  date: Date
  startTime: string
  notes: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}

export interface Review {
  id: string
  orderId: string
  customerName: string
  foodRating: number
  drinkRating: number
  serviceRating: number
  ambienceRating: number
  comment: string
  createdAt: Date
  branch: string
}

export interface DailyStat {
  hour: number
  revenue: number
  orders: number
}
