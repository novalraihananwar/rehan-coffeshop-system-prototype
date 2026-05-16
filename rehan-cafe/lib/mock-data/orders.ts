import { Order, OrderStatus, OrderType, PaymentMethod } from '../types'

const now = new Date()
const randomMinutesAgo = (max: number) => new Date(now.getTime() - Math.random() * max * 60000)

export const mockOrders: Order[] = [
  {
    id: 'ord-001', orderNumber: 'A-047', tableId: 'table-012', tableNumber: 12,
    type: 'dine_in', status: 'preparing', totalAmount: 96000, paymentMethod: 'qris',
    createdAt: randomMinutesAgo(15), updatedAt: randomMinutesAgo(10), estimatedTime: 15, notes: '',
    customerName: 'Rina', branch: 'branch-001',
    items: [
      { menuItemId: 'caramel-latte', menuItemName: 'Caramel Latte', menuItemImage: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200&q=80', size: 'M', quantity: 2, notes: 'less sweet', unitPrice: 38000, subtotal: 76000 },
      { menuItemId: 'croffle', menuItemName: 'Croffle', menuItemImage: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200&q=80', size: 'M', quantity: 1, notes: '', unitPrice: 38000, subtotal: 38000 },
    ],
  },
  {
    id: 'ord-002', orderNumber: 'A-048', tableId: 'table-005', tableNumber: 5,
    type: 'dine_in', status: 'ready', totalAmount: 117000, paymentMethod: 'gopay',
    createdAt: randomMinutesAgo(25), updatedAt: randomMinutesAgo(5), estimatedTime: 0, notes: 'birthday',
    customerName: 'Budi', branch: 'branch-001',
    items: [
      { menuItemId: 'chicken-katsu', menuItemName: 'Chicken Katsu', menuItemImage: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=200&q=80', size: 'M', quantity: 1, notes: '', unitPrice: 55000, subtotal: 55000 },
      { menuItemId: 'spanish-latte', menuItemName: 'Spanish Latte', menuItemImage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&q=80', size: 'M', quantity: 1, notes: 'extra shot', unitPrice: 42000, subtotal: 42000 },
      { menuItemId: 'cheesecake', menuItemName: 'Cheesecake', menuItemImage: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=200&q=80', size: 'S', quantity: 1, notes: '', unitPrice: 36000, subtotal: 36000 },
    ],
  },
  {
    id: 'ord-003', orderNumber: 'A-049', tableId: 'table-023', tableNumber: 23,
    type: 'dine_in', status: 'confirmed', totalAmount: 78000, paymentMethod: 'cash',
    createdAt: randomMinutesAgo(5), updatedAt: randomMinutesAgo(2), estimatedTime: 20, notes: '',
    customerName: 'Sinta', branch: 'branch-001',
    items: [
      { menuItemId: 'butterscotch-latte', menuItemName: 'Butterscotch Latte', menuItemImage: 'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=200&q=80', size: 'M', quantity: 1, notes: '', unitPrice: 40000, subtotal: 40000 },
      { menuItemId: 'truffle-fries', menuItemName: 'Truffle Fries', menuItemImage: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&q=80', size: 'M', quantity: 1, notes: 'extra sauce', unitPrice: 45000, subtotal: 45000 },
    ],
  },
  {
    id: 'ord-004', orderNumber: 'A-046', tableId: 'table-031', tableNumber: 31,
    type: 'takeaway', status: 'completed', totalAmount: 175000, paymentMethod: 'qris',
    createdAt: randomMinutesAgo(45), updatedAt: randomMinutesAgo(20), estimatedTime: 0, notes: '',
    customerName: 'Dian', branch: 'branch-001',
    items: [
      { menuItemId: 'dinner-couple-bundle', menuItemName: 'Dinner Couple Package', menuItemImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80', size: 'M', quantity: 1, notes: '', unitPrice: 175000, subtotal: 175000 },
    ],
  },
  {
    id: 'ord-005', orderNumber: 'A-050', tableId: 'table-007', tableNumber: 7,
    type: 'dine_in', status: 'pending', totalAmount: 80000, paymentMethod: 'cashier',
    createdAt: randomMinutesAgo(2), updatedAt: randomMinutesAgo(1), estimatedTime: 25, notes: 'no ice',
    customerName: 'Hendra', branch: 'branch-001',
    items: [
      { menuItemId: 'matcha-latte', menuItemName: 'Matcha Latte', menuItemImage: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=200&q=80', size: 'M', quantity: 2, notes: 'no ice', unitPrice: 40000, subtotal: 80000 },
    ],
  },
]

export const getOrderById = (id: string): Order | undefined =>
  mockOrders.find((o) => o.id === id)

export const getOrdersByStatus = (status: OrderStatus): Order[] =>
  mockOrders.filter((o) => o.status === status)

export const getOrdersByTable = (tableId: string): Order[] =>
  mockOrders.filter((o) => o.tableId === tableId)
