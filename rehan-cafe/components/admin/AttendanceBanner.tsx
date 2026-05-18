'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store/auth.store'
import { useAdminStore } from '@/lib/store/admin.store'
import { supabase } from '@/lib/supabase'
import { formatTime } from '@/lib/utils/format'

const SKIP_ROLES = ['supplier', 'member']

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface AttendanceRecord {
  id: string
  check_in: string | null
  check_out: string | null
  status: string
}

export default function AttendanceBanner() {
  const { user } = useAuthStore()
  const { branchGpsSettings } = useAdminStore()
  const [record, setRecord] = useState<AttendanceRecord | null>(null)
  const [loadingRecord, setLoadingRecord] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const fetchRecord = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('attendance')
      .select('id, check_in, check_out, status')
      .eq('staff_id', user.id)
      .eq('date', today)
      .maybeSingle()
    setRecord(data as AttendanceRecord | null)
    setLoadingRecord(false)
  }, [user, today])

  useEffect(() => { fetchRecord() }, [fetchRecord])

  if (!user || SKIP_ROLES.includes(user.role) || loadingRecord) return null

  const getGPS = (): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GPS tidak tersedia di browser ini'))
        return
      }
      navigator.geolocation.getCurrentPosition(resolve, (e) => {
        reject(new Error(e.code === 1 ? 'Izin GPS ditolak. Aktifkan GPS di browser.' : 'Gagal mendapatkan lokasi GPS.'))
      }, { timeout: 12000, enableHighAccuracy: true })
    })

  const checkLocation = (lat: number, lng: number): { ok: boolean; dist: number } => {
    const cfg = branchGpsSettings[user.branch]
    if (!cfg || !cfg.lat || !cfg.lng) return { ok: true, dist: 0 } // belum dikonfigurasi → skip validasi
    const dist = Math.round(distanceMeters(lat, lng, cfg.lat, cfg.lng))
    return { ok: dist <= cfg.radius, dist }
  }

  const isLate = (cfg: typeof branchGpsSettings[string]): boolean => {
    const [h, m] = (cfg?.shiftStart || '08:00').split(':').map(Number)
    const now = new Date()
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() > (m + 10))
  }

  const handleCheckIn = async () => {
    setProcessing(true)
    setGpsError(null)
    try {
      const pos = await getGPS()
      const { latitude: lat, longitude: lng } = pos.coords
      const { ok, dist } = checkLocation(lat, lng)
      if (!ok) {
        const r = branchGpsSettings[user.branch]?.radius || 200
        setGpsError(`Kamu ${dist}m dari lokasi cafe (radius ${r}m). Harus berada di dalam cafe.`)
        setProcessing(false)
        return
      }
      const cfg = branchGpsSettings[user.branch]
      await supabase.from('attendance').insert({
        id: `att-${Date.now()}`,
        staff_id: user.id,
        staff_name: user.name,
        staff_role: user.role,
        date: today,
        check_in: new Date().toISOString(),
        check_in_lat: lat,
        check_in_lng: lng,
        branch: user.branch,
        status: isLate(cfg) ? 'late' : 'present',
      })
      await fetchRecord()
    } catch (e) {
      setGpsError((e as Error).message)
    }
    setProcessing(false)
  }

  const handleCheckOut = async () => {
    if (!record) return
    setProcessing(true)
    setGpsError(null)
    try {
      const pos = await getGPS()
      const { latitude: lat, longitude: lng } = pos.coords
      const { ok, dist } = checkLocation(lat, lng)
      if (!ok) {
        const r = branchGpsSettings[user.branch]?.radius || 200
        setGpsError(`Kamu ${dist}m dari lokasi cafe (radius ${r}m).`)
        setProcessing(false)
        return
      }
      await supabase.from('attendance').update({
        check_out: new Date().toISOString(),
        check_out_lat: lat,
        check_out_lng: lng,
      }).eq('id', record.id)
      await fetchRecord()
    } catch (e) {
      setGpsError((e as Error).message)
    }
    setProcessing(false)
  }

  const checkIn = record?.check_in ? new Date(record.check_in) : null
  const checkOut = record?.check_out ? new Date(record.check_out) : null

  // Shift sudah selesai
  if (checkOut && checkIn) {
    const durMins = Math.round((checkOut.getTime() - checkIn.getTime()) / 60000)
    const durStr = durMins >= 60 ? `${Math.floor(durMins / 60)}j ${durMins % 60}m` : `${durMins}m`
    return (
      <div className="bg-olive-sage/10 border-b border-olive-sage/20 px-4 py-2 flex items-center gap-3">
        <span className="text-olive-sage text-sm">✓</span>
        <span className="text-olive-sage text-sm font-semibold">Shift selesai</span>
        <span className="text-cafe-muted text-xs">{formatTime(checkIn)} — {formatTime(checkOut)} · {durStr}</span>
      </div>
    )
  }

  // Sedang shift
  if (checkIn) {
    return (
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
          <span className="text-blue-800 text-sm font-semibold">Shift aktif sejak {formatTime(checkIn)}</span>
          {record?.status === 'late' && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Terlambat</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {gpsError && <p className="text-red-500 text-xs">{gpsError}</p>}
          <button onClick={handleCheckOut} disabled={processing}
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
            {processing ? '📍 Cek GPS...' : 'Akhiri Shift'}
          </button>
        </div>
      </div>
    )
  }

  // Belum check-in
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
      <div>
        <p className="text-amber-900 text-sm font-semibold">
          Selamat datang, {user.name.split(' ')[0]}! 👋 Belum mulai shift hari ini.
        </p>
        {gpsError && <p className="text-red-500 text-xs mt-0.5">{gpsError}</p>}
      </div>
      <button onClick={handleCheckIn} disabled={processing}
        className="text-xs font-bold bg-amber-800 hover:bg-amber-900 text-warm-white px-5 py-2 rounded-xl disabled:opacity-50 transition-colors flex-shrink-0">
        {processing ? '📍 Cek GPS...' : '⏱ Mulai Shift'}
      </button>
    </div>
  )
}
