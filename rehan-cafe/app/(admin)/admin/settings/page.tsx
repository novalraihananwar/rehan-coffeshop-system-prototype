'use client'
import { useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminStore } from '@/lib/store/admin.store'
import { mockBranches } from '@/lib/mock-data/branches'

const branches = mockBranches.filter((b) => b.id !== 'all')

export default function SettingsPage() {
  const { branchGpsSettings, setBranchGps } = useAdminStore()

  const [cafeName, setCafeName] = useState('Rehan Cafe & Eatery')
  const [phone, setPhone] = useState('0341-123456')
  const [wifiName, setWifiName] = useState('REHAN-GUEST')
  const [wifiPass, setWifiPass] = useState('ngopidulu2026')
  const [openTime, setOpenTime] = useState('08:00')
  const [closeTime, setCloseTime] = useState('22:00')
  const [saved, setSaved] = useState(false)

  // GPS settings local state per branch
  const [gpsForm, setGpsForm] = useState<Record<string, { lat: string; lng: string; radius: string; shiftStart: string }>>(
    () => Object.fromEntries(
      branches.map((b) => [
        b.id,
        {
          lat: String(branchGpsSettings[b.id]?.lat || ''),
          lng: String(branchGpsSettings[b.id]?.lng || ''),
          radius: String(branchGpsSettings[b.id]?.radius || '200'),
          shiftStart: branchGpsSettings[b.id]?.shiftStart || '08:00',
        },
      ])
    )
  )
  const [gpsSaved, setGpsSaved] = useState<string | null>(null)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveGps = (branchId: string) => {
    const f = gpsForm[branchId]
    setBranchGps(branchId, {
      lat: parseFloat(f.lat) || 0,
      lng: parseFloat(f.lng) || 0,
      radius: parseInt(f.radius) || 200,
      shiftStart: f.shiftStart || '08:00',
    })
    setGpsSaved(branchId)
    setTimeout(() => setGpsSaved(null), 2000)
  }

  const handleGetMyLocation = async (branchId: string) => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      setGpsForm((prev) => ({
        ...prev,
        [branchId]: {
          ...prev[branchId],
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        },
      }))
    })
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Settings" subtitle="Konfigurasi sistem cafe" />
      <div className="p-6 max-w-2xl space-y-5">

        {/* Cafe Info */}
        <div className="bg-warm-white rounded-2xl p-6 shadow-warm-sm border border-latte/40">
          <p className="font-display font-semibold text-espresso-deep mb-4">Informasi Cafe</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Nama Cafe</label>
              <input value={cafeName} onChange={(e) => setCafeName(e.target.value)} className="w-full border border-latte rounded-xl px-4 py-2.5 text-sm text-espresso-deep focus:outline-none focus:border-espresso-light" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">No. Telepon</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-latte rounded-xl px-4 py-2.5 text-sm text-espresso-deep focus:outline-none focus:border-espresso-light" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Buka</label>
                <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="w-full border border-latte rounded-xl px-4 py-2.5 text-sm text-espresso-deep focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Tutup</label>
                <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="w-full border border-latte rounded-xl px-4 py-2.5 text-sm text-espresso-deep focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* WiFi */}
        <div className="bg-warm-white rounded-2xl p-6 shadow-warm-sm border border-latte/40">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📶</span>
            <p className="font-display font-semibold text-espresso-deep">Konfigurasi WiFi</p>
          </div>
          <p className="text-cafe-muted text-xs mb-4">Info WiFi ini akan tampil di struk digital setelah pembayaran.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Nama WiFi (SSID)</label>
              <input value={wifiName} onChange={(e) => setWifiName(e.target.value)} className="w-full border border-latte rounded-xl px-4 py-2.5 text-sm text-espresso-deep font-mono focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cafe-muted uppercase tracking-wider mb-1.5">Password WiFi</label>
              <input value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} className="w-full border border-latte rounded-xl px-4 py-2.5 text-sm text-espresso-deep font-mono focus:outline-none" />
            </div>
          </div>
          <div className="mt-4 bg-cream-base rounded-xl px-4 py-3 font-mono text-sm">
            <p className="text-cafe-muted text-[10px] uppercase tracking-wider mb-1">Preview di struk</p>
            <div className="flex justify-between text-xs"><span className="text-cafe-muted">WiFi</span><span className="text-espresso-deep font-semibold">{wifiName}</span></div>
            <div className="flex justify-between text-xs mt-0.5"><span className="text-cafe-muted">Password</span><span className="text-espresso-deep font-semibold">{wifiPass}</span></div>
          </div>
        </div>

        {/* GPS Absensi */}
        <div className="bg-warm-white rounded-2xl p-6 shadow-warm-sm border border-latte/40">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📍</span>
            <p className="font-display font-semibold text-espresso-deep">Lokasi Absensi (GPS)</p>
          </div>
          <p className="text-cafe-muted text-xs mb-5">
            Koordinat ini digunakan untuk validasi lokasi saat staff check-in/out.
            Staff harus berada dalam radius yang ditentukan.
            Jika lat/lng dikosongkan, validasi GPS dinonaktifkan.
          </p>

          <div className="space-y-5">
            {branches.map((branch) => {
              const f = gpsForm[branch.id] || { lat: '', lng: '', radius: '200', shiftStart: '08:00' }
              return (
                <div key={branch.id} className="border border-latte/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-espresso-deep text-sm">{branch.name}</p>
                      <p className="text-cafe-muted text-xs">{branch.address}</p>
                    </div>
                    <button
                      onClick={() => handleGetMyLocation(branch.id)}
                      className="text-[10px] font-bold bg-cream-base border border-latte text-espresso-mid px-3 py-1.5 rounded-lg hover:bg-latte/20 transition-colors"
                    >
                      📍 Gunakan Lokasiku
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] font-bold text-cafe-muted uppercase tracking-wider block mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={f.lat}
                        onChange={(e) => setGpsForm((prev) => ({ ...prev, [branch.id]: { ...prev[branch.id], lat: e.target.value } }))}
                        placeholder="-7.979700"
                        className="w-full border border-latte rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-espresso-light"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-cafe-muted uppercase tracking-wider block mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={f.lng}
                        onChange={(e) => setGpsForm((prev) => ({ ...prev, [branch.id]: { ...prev[branch.id], lng: e.target.value } }))}
                        placeholder="112.630400"
                        className="w-full border border-latte rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-espresso-light"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-cafe-muted uppercase tracking-wider block mb-1">Radius (meter)</label>
                      <input
                        type="number"
                        value={f.radius}
                        onChange={(e) => setGpsForm((prev) => ({ ...prev, [branch.id]: { ...prev[branch.id], radius: e.target.value } }))}
                        className="w-full border border-latte rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-espresso-light"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-cafe-muted uppercase tracking-wider block mb-1">Jam Masuk (batas terlambat)</label>
                      <input
                        type="time"
                        value={f.shiftStart}
                        onChange={(e) => setGpsForm((prev) => ({ ...prev, [branch.id]: { ...prev[branch.id], shiftStart: e.target.value } }))}
                        className="w-full border border-latte rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-espresso-light"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveGps(branch.id)}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${gpsSaved === branch.id ? 'bg-olive-sage text-warm-white' : 'bg-espresso-dark text-warm-white'}`}
                  >
                    {gpsSaved === branch.id ? '✓ Tersimpan' : 'Simpan Lokasi'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cabang */}
        <div className="bg-warm-white rounded-2xl p-6 shadow-warm-sm border border-latte/40">
          <p className="font-display font-semibold text-espresso-deep mb-4">Daftar Cabang</p>
          <div className="space-y-3">
            {branches.map((branch) => (
              <div key={branch.id} className="flex items-center justify-between p-3 bg-cream-base rounded-xl">
                <div>
                  <p className="font-semibold text-espresso-deep text-sm">{branch.name}</p>
                  <p className="text-cafe-muted text-xs">{branch.address}</p>
                  <p className="text-cafe-muted text-xs">{branch.phone}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${branch.isActive ? 'bg-olive-sage/15 text-olive-sage' : 'bg-red-50 text-red-500'}`}>
                  {branch.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-display font-bold text-base transition-all ${saved ? 'bg-olive-sage text-warm-white' : 'bg-espresso-dark text-warm-white shadow-warm'}`}
        >
          {saved ? '✓ Tersimpan!' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  )
}
