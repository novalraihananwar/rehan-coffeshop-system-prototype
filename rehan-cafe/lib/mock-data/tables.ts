import { Table, TableStatus } from '../types'

const sections: Array<'indoor' | 'outdoor' | 'private'> = ['indoor', 'indoor', 'indoor', 'outdoor', 'private']

export const generateTables = (): Table[] => {
  const tables: Table[] = []
  const statuses: TableStatus[] = ['empty', 'occupied', 'reserved', 'cleaning', 'empty', 'empty', 'occupied', 'empty', 'empty', 'empty']

  for (let i = 1; i <= 100; i++) {
    const section = i <= 60 ? 'indoor' : i <= 85 ? 'outdoor' : 'private'
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    tables.push({
      id: `table-${String(i).padStart(3, '0')}`,
      number: i,
      capacity: i % 10 === 0 ? 8 : i % 5 === 0 ? 6 : i % 3 === 0 ? 4 : 2,
      status,
      section,
      currentOrderId: status === 'occupied' ? `order-mock-${i}` : undefined,
      reservedBy: status === 'reserved' ? 'Customer Reserved' : undefined,
    })
  }
  return tables
}

export const mockTables: Table[] = generateTables()

export const getTableById = (id: string): Table | undefined =>
  mockTables.find((t) => t.id === id)

export const getTableByNumber = (number: number): Table | undefined =>
  mockTables.find((t) => t.number === number)

export const getEmptyTables = (): Table[] =>
  mockTables.filter((t) => t.status === 'empty')
