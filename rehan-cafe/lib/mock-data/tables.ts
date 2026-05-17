import { Table } from '../types'

export const generateTables = (): Table[] => {
  const tables: Table[] = []
  for (let i = 1; i <= 100; i++) {
    const section = i <= 60 ? 'indoor' : i <= 85 ? 'outdoor' : 'private'
    const capacity = i % 10 === 0 ? 8 : i % 5 === 0 ? 6 : i % 3 === 0 ? 4 : 2
    tables.push({
      id: `table-${String(i).padStart(3, '0')}`,
      number: i,
      capacity,
      status: 'empty',
      section,
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
