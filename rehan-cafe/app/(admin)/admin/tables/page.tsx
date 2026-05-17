'use client'
import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminStore } from '@/lib/store/admin.store'
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

export default function TablesPage() {
  const { tables, updateTableStatus } = useAdminStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [sectionFilter, setSectionFilter] = useState<string>('all')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tab, setTab] = useState<'tables' | 'reservations'>('tables')

  useEffect(() => {
    supabase.from('reservations').select('*').order('date', { ascending: true }).order('time', { ascending: true })
      .then(({ data }) => { if (data) setReservations(data as Reservation[]) })

    const channel = supabase.channel('reservations-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        supabase.from('reservations').select('*').order('date', { ascending: true })
          .then(({ data }) => { if (data) setReservations(data as Reservation[]) })
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filtered = sectionFilter === 'all' ? tables : tables.filter((t) => t.section === sectionFilter)
  const selectedTable = tables.find((t) => t.id === selected)

  const counts = {
    empty: tables.filter((t) => t.status === 'empty').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    cleaning: tables.filter((t) => t.status === 'cleaning').length,
  }

  const handleMarkEmpty = (tableId: string) => {
    updateTableStatus(tableId, 'empty')
    setSelected(null)
  }

  const handleNextStatus = (tableId: string, current: TableStatus) => {
    const next: Partial<Record<TableStatus, TableStatus>> = {
      occupied: 'cleaning',
      cleaning: 'empty',
      reserved: 'occupied',
    }
    if (next[current]) {
      updateTableStatus(tableId, next[current]!)
      setSelected(null)
    }
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Denah Meja" subtitle={`${counts.occupied} terisi · ${counts.empty} kosong · ${counts.reserved} reserved`} />
      <div className="p-6">
        {/* Tab */}
        <div className="flex gap-2 mb-5">
          <button onClick={() => setTab('tables')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${tab === 'tables' ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'}`}>Denah Meja</button>
          <button onClick={() => setTab('reservations')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${tab === 'reservations' ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'}`}>
            Reservasi {reservations.length > 0 && <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">{reservations.length}</span>}
          </button>
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

        {tab === 'tables' && <>
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
          {['all', 'indoor', 'outdoor', 'private'].map((s) => (
            <button key={s} onClick={() => setSectionFilter(s)}
              className={`text-xs font-semibold px-4 py-2 rounded-full transition-all capitalize ${sectionFilter === s ? 'bg-espresso-dark text-warm-white' : 'bg-warm-white border border-latte text-espresso-mid'}`}>
              {s === 'all' ? 'Semua' : s}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          {/* Table Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-12 gap-2">
              {filtered.map((table) => {
                const cfg = statusConfig[table.status]
                const isSelected = selected === table.id
                return (
                  <button
                    key={table.id}
                    onClick={() => setSelected(isSelected ? null : table.id)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all ${isSelected ? 'ring-2 ring-espresso-dark ring-offset-1' : ''} ${cfg.bg} text-warm-white`}
                    title={`Meja ${table.number} — ${cfg.label} (${table.capacity} orang)`}
                  >
                    <span className="text-sm">{table.number}</span>
                    <span className="text-[8px] opacity-70">{table.capacity}p</span>
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
                {selectedTable.reservedBy && (
                  <div className="flex justify-between">
                    <span className="text-cafe-muted">Reserved by</span>
                    <span className="font-semibold text-espresso-deep text-xs">{selectedTable.reservedBy}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {selectedTable.status === 'occupied' && (
                  <>
                    <button
                      onClick={() => handleNextStatus(selectedTable.id, selectedTable.status)}
                      className="w-full bg-latte text-espresso-deep py-2 rounded-xl text-xs font-bold"
                    >
                      → Tandai Cleaning
                    </button>
                    <button
                      onClick={() => handleMarkEmpty(selectedTable.id)}
                      className="w-full bg-olive-sage text-warm-white py-2 rounded-xl text-xs font-bold"
                    >
                      ✓ Konfirmasi Meja Kosong
                    </button>
                  </>
                )}
                {selectedTable.status === 'cleaning' && (
                  <button
                    onClick={() => handleMarkEmpty(selectedTable.id)}
                    className="w-full bg-olive-sage text-warm-white py-2 rounded-xl text-xs font-bold"
                  >
                    ✓ Selesai — Meja Kosong
                  </button>
                )}
                {selectedTable.status === 'reserved' && (
                  <button
                    onClick={() => handleNextStatus(selectedTable.id, selectedTable.status)}
                    className="w-full bg-espresso-dark text-warm-white py-2 rounded-xl text-xs font-bold"
                  >
                    → Customer Datang (Terisi)
                  </button>
                )}
                {selectedTable.status === 'empty' && (
                  <p className="text-center text-olive-sage text-xs font-semibold py-2">Meja siap digunakan</p>
                )}
              </div>
            </div>
          )}
        </div>}
      </div>
    </div>
  )
}
