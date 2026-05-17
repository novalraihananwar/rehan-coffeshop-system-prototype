export const formatRupiah = (amount: number): string =>
  `Rp ${amount.toLocaleString('id-ID')}`

const toDate = (date: Date | string | null | undefined): Date | null => {
  if (!date) return null
  const d = new Date(date)
  return isNaN(d.getTime()) ? null : d
}

export const formatDate = (date: Date | string | null | undefined): string => {
  const d = toDate(date)
  return d ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(d) : '-'
}

export const formatDateTime = (date: Date | string | null | undefined): string => {
  const d = toDate(date)
  return d ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d) : '-'
}

export const formatTime = (date: Date | string | null | undefined): string => {
  const d = toDate(date)
  return d ? new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' }).format(d) : '-'
}

export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes} menit`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}j ${m}m` : `${h} jam`
}

export const generateOrderNumber = (): string => {
  const letters = 'ABCDE'
  const letter = letters[Math.floor(Math.random() * letters.length)]
  const number = String(Math.floor(Math.random() * 900) + 100)
  return `${letter}-${number}`
}

export const generateId = (prefix: string = 'id'): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
