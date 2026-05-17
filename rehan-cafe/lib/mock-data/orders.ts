import { Order, OrderStatus } from '../types'

export const mockOrders: Order[] = []

export const getOrderById = (id: string): Order | undefined =>
  mockOrders.find((o) => o.id === id)

export const getOrdersByStatus = (status: OrderStatus): Order[] =>
  mockOrders.filter((o) => o.status === status)

export const getOrdersByTable = (tableId: string): Order[] =>
  mockOrders.filter((o) => o.tableId === tableId)
