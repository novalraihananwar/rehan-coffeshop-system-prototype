'use client'
import { useState, useEffect, useMemo } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminStore } from '@/lib/store/admin.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { TableStatus } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { formatRupiah } from '@/lib/utils/format'

interface Reservation {
  id: string
  table_number: number
  table_capacity: number
  customer_name: string
  customer_phone: string
  guest_count: number
  date: string
  time: string
  notes: string
  min_spend: number
  status: string
}

const statusConfig: Record<TableStatus, { label: string; color: string; bg: string; dot: string }> = {
  empty: { label: 'Kosong', color: 'text-olive-sage', bg: 'bg-olive-sage', dot: 'bg-olive-sage' },
  occupied: { label: 'Terisi', color: 'text-espresso-mid', bg: 'bg-espresso-mid', dot: 'bg-espresso-mid' },
  reserved: { label: 'Reserved', color: 'text-espresso-light', bg: 'bg-espresso-light', dot: 'bg-espresso-light' },
  cleaning: { label: 'Cleaning', color: 'text-latte', bg: 'bg-latte', dot: 'bg-latte' },
}

const sectionLabel: Record<string, string> = { indoor: 'Indoor', outdoor: 'Outdoor', private: 'Private' }
const canManage = (role?: string) => ['super_admin', 'owner', 'manager'].includes(role ?? '')

export default function TablesPage() {
  const { tables, updateTableStatus, tableEmptyNums, tableCleaningNums, markTableEmpty, markTableCleaning, clearTableOverride, addTable, removeTable } = useAdminStore()
  const { user } = useAuthStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [sectionFilter, setSectionFilter] = useState<string>('all')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tab, setTab] = useState<'tables' | 'reservations'>('tables')
  const today = new Date().toISOString().split('T')[0]
  const dateOptions = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return d.toISOString().split('T')[0]
  })
  const [selectedDate, setSelectedDate] = useState(today)
  const [occupiedNums, setOccupiedNums] = useState<Set<number>>(new Set())

  // Modal tambah meja
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTableForm, setNewTableForm] = useState({ number: 0, capacity: 2, section: 'indoor' as 'indoor' | 'outdoor' | 'private' })

  useEffect(() => {
    const utcMidnight = new Date()
    utcMidnight.setUTCHours(0, 0, 0, 0)
    const since = utcMidnight.toISOString()

    const fetchActive = () => {
      supabase.from('orders').select('table_number, status')
        .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'completed'])
        .gte('created_at', since)
        .then(({ data }) => {
          if (data) {
            setOccupiedNums(new Set(data.map((r: { table_number: number }) => r.table_number)))
            const activeNums = [...new Set(
              data
                .filter((r: { status: string }) => r.status !== 'completed')
                .map((r: { table_number: number }) => r.table_number)
            )]
            activeNums.forEach((n) => clearTableOverride(n))
          }
        })
    }

    const fetchReservations = () => {
      const todayStr = new Date().toISOString().split('T')[0]
      supabase.from('reservations').select('*').gte('date', todayStr)
        .not('status', 'eq', 'completed')
        .order('date').order('time')
        .then(({ data }) => {
          if (data) setReservations(data as Reservation[])
        })
    }

    fetchActive()
    fetchReservations()

    const channel = supabase.channel('tables-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchActive)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, fetchReservations)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [clearTableOverride])

  const reservedNums = useMemo(() => {
    const map = new Map<number, Reservation>()
    reservations
      .filter((r) => r.status === 'confirmed' && r.date === selectedDate)
      .forEach((r) => { if (!map.has(r.table_number)) map.set(r.table_number, r) })
    return map
  }, [reservations, selectedDate])

  const emptySet = new Set(tableEmptyNums)
  const cleaningSet = new Set(tableCleaningNums)
  const mergedTables = tables.map((t) => {
    if (emptySet.has(t.number)) return { ...t, status: 'empty' as TableStatus }
    if (cleaningSet.has(t.number)) return { ...t, status: 'cleaning' as TableStatus }
    if (selectedDate === today && occupiedNums.has(t.number)) return { ...t, status: 'occupied' as TableStatus }
    if (reservedNums.has(t.number)) return { ...t, status: 'reserved' as TableStatus }
    return { ...t, status: 'empty' as TableStatus }
  }).sort((a, b) => a.number - b.number)

  const filtered = sectionFilter === 'all' ? mergedTables : mergedTables.filter((t) => t.section === sectionFilter)
  const selectedTable = mergedTables.find((t) => t.id === selected)

  const counts = {
    empty: mergedTables.filter((t) => t.status === 'empty').length,
    occupied: mergedTables.filter((t) => t.status === 'occupied').length,
    reserved: mergedTables.filter((t) => t.status === 'reserved').length,
    cleaning: mergedTables.filter((t) => t.status === 'cleaning').length,
  }

  const handleMarkCleaning = (tableNumber: number) => {
    markTableCleaning(tableNumber)
    setOccupiedNums((prev) => { const s = new Set(prev); s.delete(tableNumber); return s })
    setSelected(null)
  }

  const handleMarkEmpty = (tableNumber: number) => {
    markTableEmpty(tableNumber)
    setOccupiedNums((prev) => { const s = new Set(prev); s.delete(tableNumber); return s })
    setSelected(null)
  }

  const handleCustomerArrived = (tableNumber: number) => {
    const rsv = reservedNums.get(tableNumber)
    setOccupiedNums((prev) => new Set([...prev, tableNumber]))
    if (rsv) setReservations((prev) => prev.map((r) => r.id === rsv.id ? { ...r, status: 'arrived' } : r))
    clearTableOverride(tableNumber)
    if (rsv) {
      supabase.from('reservations').update({ status: 'arrived' }).eq('id', rsv.id).then(() => {
        supabase.from('orders').update({ status: 'confirmed', updated_at: new Date().toISOString() })
          .eq('reservation_id', rsv.id).eq('status', 'pending').then(() => {})
      })
    }
    setSelected(null)
  }

  const handleAddTable = () => {
    const maxNum = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) : 0
    const num = newTableForm.number > 0 ? newTableForm.number : maxNum + 1
    addTable({ number: num, capacity: newTableForm.capacity, section: newTableForm.section })
    setNewTableForm({ number: 0, capacity: 2, section: 'indoor' })
    setShowAddModal(false)
  }

  const handleRemoveTable = (tableId: string) => {
    removeTable(tableId)
    setSelected(null)
  }

  const nextTableNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Denah Meja"
        subtitle={`${counts.occupied} terisi · ${counts.empty} kosong · ${counts.reserved} reserved · ${tables.length} total meja`}
      />
      <div className="p-6">
        {/* Tab */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div className="flex gap-2">
            <button onClick={() => setTab('tables')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${tab === 'tables' ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'}`}>
              Denah Meja
            </button>
            <button onClick={() => setTab('reservations')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${tab === 'reservations' ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'}`}>
              Reservasi {reservations.length > 0 && <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">{reservations.length}</span>}
            </button>
          </div>
          {canManage(user?.role) && tab === 'tables' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-espresso-dark text-warm-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              + Tambah Meja
            </button>
          )}
        </div>

        {tab === 'reservations' && (
          <div className="space-y-3 mb-6">
            {reservations.length === 0 ? (
              <p className="text-cafe-muted text-sm text-center py-8">Belum ada reservasi</p>
            ) : reservations.map((r) => (
              <div key={r.id} className="bg-warm-white rounded-2xl p-4 shadow-warm-sm border border-latte/40">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-espresso-deep">{r.customer_name}</p>
                    <p className="text-cafe-muted text-xs">{r.customer_phone}</p>
                  </div>
                  <span className="text-xs font-bold bg-espresso-light/20 text-espresso-mid px-2.5 py-1 rounded-full">Meja {r.table_number}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-espresso-mid">
                  <span>📅 {r.date} · {r.time}</span>
                  <span>👥 {r.guest_count} tamu</span>
                  <span>💰 Min. {formatRupiah(r.min_spend)}</span>
                  {r.notes && <span>📝 {r.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'tables' && (
          <div>
            {/* Date selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
              {dateOptions.map((dateStr, i) => {
                const d = new Date(dateStr + 'T12:00:00')
                const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
                const label = i === 0 ? 'Hari ini' : `${dayNames[d.getDay()]} ${d.getDate()}`
                const rsvCount = reservations.filter((r) => r.date === dateStr && r.status === 'confirmed').length
                return (
                  <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedDate === dateStr ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'}`}>
                    {label}
                    {rsvCount > 0 && <span className={`rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold ${selectedDate === dateStr ? 'bg-warm-white/20 text-warm-white' : 'bg-red-100 text-red-600'}`}>{rsvCount}</span>}
                  </button>
                )
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-5">
              {Object.entries(statusConfig).map(([status, cfg]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                  <span className="text-xs font-semibold text-espresso-mid">{cfg.label} ({counts[status as TableStatus]})</span>
                </div>
              ))}
            </div>

            {/* Section filter */}
            <div className="flex gap-2 mb-4">
              {['all', 'indoor', 'outdoor', 'private'].map((s) => {
                const cnt = s === 'all' ? mergedTables.length : mergedTables.filter(t => t.section === s).length
                return (
                  <button key={s} onClick={() => setSectionFilter(s)}
                    className={`text-xs font-semibold px-4 py-2 rounded-full transition-all capitalize ${sectionFilter === s ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'}`}>
                    {s === 'all' ? 'Semua' : s} <span className="opacity-60">({cnt})</span>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-4">
              {/* Table Grid */}
              <div className="flex-1">
                <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-12 gap-2">
                  {filtered.map((table) => {
                    const cfg = statusConfig[table.status]
                    const isSelected = selected === table.id
                    const rsv = reservedNums.get(table.number)
                    return (
                      <button
                        key={table.id}
                        onClick={() => setSelected(isSelected ? null : table.id)}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all ${isSelected ? 'ring-2 ring-espresso-dark ring-offset-1' : ''} ${cfg.bg} text-warm-white`}
                        title={`Meja ${table.number} — ${cfg.label} (${table.capacity} orang, ${table.section})${rsv ? ` | Reservasi ${rsv.time} — ${rsv.customer_name}` : ''}`}
                      >
                        <span className="text-sm">{table.number}</span>
                        {rsv && table.status === 'reserved'
                          ? <span className="text-[7px] opacity-90 leading-tight">{rsv.time}</span>
                          : <span className="text-[8px] opacity-70">{table.capacity}p</span>
                        }
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Detail Panel */}
              {selectedTable && (
                <div className="w-64 bg-warm-white rounded-2xl p-4 shadow-warm border border-latte/40 h-fit flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-display font-bold text-espresso-deep text-xl">Meja {selectedTable.number}</p>
                    <button onClick={() => setSelected(null)} className="text-cafe-muted text-sm">✕</button>
                  </div>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cafe-muted">Status</span>
                      <span className={`font-semibold ${statusConfig[selectedTable.status].color}`}>{statusConfig[selectedTable.status].label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cafe-muted">Kapasitas</span>
                      <span className="font-semibold text-espresso-deep">{selectedTable.capacity} orang</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cafe-muted">Area</span>
                      <span className="font-semibold text-espresso-deep capitalize">{selectedTable.section}</span>
                    </div>
                    {reservedNums.has(selectedTable.number) && (() => {
                      const rsv = reservedNums.get(selectedTable.number)!
                      return <>
                        <div className="flex justify-between"><span className="text-cafe-muted">Atas nama</span><span className="font-semibold text-espresso-deep text-xs">{rsv.customer_name}</span></div>
                        <div className="flex justify-between"><span className="text-cafe-muted">Jadwal</span><span className="font-semibold text-espresso-deep text-xs">{rsv.date} · {rsv.time}</span></div>
                        <div className="flex justify-between"><span className="text-cafe-muted">Tamu</span><span className="font-semibold text-espresso-deep text-xs">{rsv.guest_count} orang</span></div>
                        {rsv.customer_phone && <div className="flex justify-between"><span className="text-cafe-muted">HP</span><span className="font-semibold text-espresso-deep text-xs">{rsv.customer_phone}</span></div>}
                        {rsv.notes && <div className="flex justify-between"><span className="text-cafe-muted">Catatan</span><span className="font-semibold text-espresso-deep text-xs">{rsv.notes}</span></div>}
                      </>
                    })()}
                  </div>

                  <div className="space-y-2">
                    {selectedTable.status === 'occupied' && (
                      <>
                        <button onClick={() => handleMarkCleaning(selectedTable.number)}
                          className="w-full bg-latte text-espresso-deep py-2 rounded-xl text-xs font-bold">
                          🧹 Tandai Cleaning
                        </button>
                        <button onClick={() => handleMarkEmpty(selectedTable.number)}
                          className="w-full bg-olive-sage text-warm-white py-2 rounded-xl text-xs font-bold">
                          ✓ Konfirmasi Meja Kosong
                        </button>
                      </>
                    )}
                    {selectedTable.status === 'cleaning' && (
                      <button onClick={() => handleMarkEmpty(selectedTable.number)}
                        className="w-full bg-olive-sage text-warm-white py-2 rounded-xl text-xs font-bold">
                        ✓ Selesai — Meja Kosong
                      </button>
                    )}
                    {selectedTable.status === 'reserved' && selectedDate === today && (
                      <button onClick={() => handleCustomerArrived(selectedTable.number)}
                        className="w-full bg-espresso-dark text-warm-white py-2 rounded-xl text-xs font-bold">
                        → Customer Datang (Terisi)
                      </button>
                    )}
                    {selectedTable.status === 'empty' && (
                      <p className="text-center text-olive-sage text-xs font-semibold py-2">Meja siap digunakan</p>
                    )}
                    {canManage(user?.role) && selectedTable.status === 'empty' && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus Meja ${selectedTable.number}? Tindakan ini tidak bisa dibatalkan.`)) {
                            handleRemoveTable(selectedTable.id)
                          }
                        }}
                        className="w-full border border-red-200 text-red-500 py-2 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors mt-1"
                      >
                        🗑 Hapus Meja Ini
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah Meja */}
      {showAddModal && (
        <div className="fixed inset-0 bg-espresso-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-warm-white rounded-3xl p-6 w-full max-w-sm shadow-warm-lg">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display font-bold text-espresso-deep text-lg">Tambah Meja Baru</p>
              <button onClick={() => setShowAddModal(false)} className="text-cafe-muted text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">
                  Nomor Meja
                </label>
                <input
                  type="number"
                  value={newTableForm.number || ''}
                  onChange={(e) => setNewTableForm({ ...newTableForm, number: Number(e.target.value) })}
                  placeholder={`Auto: ${nextTableNumber}`}
                  className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light"
                />
                <p className="text-[10px] text-cafe-muted mt-1">Kosongkan untuk auto nomor {nextTableNumber}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">
                  Kapasitas (orang)
                </label>
                <div className="flex gap-2">
                  {[2, 4, 6, 8, 10, 12].map((cap) => (
                    <button
                      key={cap}
                      onClick={() => setNewTableForm({ ...newTableForm, capacity: cap })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${newTableForm.capacity === cap ? 'bg-espresso-dark text-warm-white' : 'bg-cream-base text-espresso-mid border border-latte'}`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">
                  Kategori Area
                </label>
                <div className="flex gap-2">
                  {(['indoor', 'outdoor', 'private'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewTableForm({ ...newTableForm, section: s })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${newTableForm.section === s ? 'bg-espresso-dark text-warm-white' : 'bg-cream-base text-espresso-mid border border-latte'}`}
                    >
                      {sectionLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 border border-latte text-espresso-mid py-2.5 rounded-xl text-sm font-semibold">
                Batal
              </button>
              <button onClick={handleAddTable}
                className="flex-1 bg-espresso-dark text-warm-white py-2.5 rounded-xl text-sm font-bold">
                Tambah Meja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
