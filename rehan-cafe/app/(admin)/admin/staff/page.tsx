'use client'
import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAuthStore } from '@/lib/store/auth.store'
import { mockStaff } from '@/lib/mock-data/staff'
import { roleLabel, roleAccess } from '@/lib/mock-data/auth'
import { mockBranches } from '@/lib/mock-data/branches'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/lib/types'

interface SupabaseStaff {
  id: string
  name: string
  email: string
  password: string
  role: string
  branch: string
  phone: string
  avatar: string
  is_active: boolean
  joined_at: string
}

const canManage = (role?: string) => ['super_admin', 'owner', 'manager'].includes(role ?? '')

const managableRoles: UserRole[] = ['cashier', 'barista', 'kitchen', 'inventory', 'manager']

const branchOptions = mockBranches.filter((b) => b.id !== 'all')

const generatePassword = (name: string): string => {
  const first = name.split(' ')[0] || 'Staff'
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const rand = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${first}@${rand}`
}

export default function StaffPage() {
  const { user } = useAuthStore()
  const [supabaseStaff, setSupabaseStaff] = useState<SupabaseStaff[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editStaff, setEditStaff] = useState<SupabaseStaff | null>(null)
  const [generatedCreds, setGeneratedCreds] = useState<{ email: string; password: string; name: string } | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'cashier' as UserRole, branch: 'branch-001', phone: '' })
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<'email' | 'pass' | null>(null)

  const fetchStaff = async () => {
    const { data } = await supabase.from('staff_accounts').select('*').order('joined_at', { ascending: false })
    if (data) setSupabaseStaff(data as SupabaseStaff[])
    setLoading(false)
  }

  useEffect(() => { fetchStaff() }, [])

  const totalActive = mockStaff.filter((s) => s.isActive).length + supabaseStaff.filter((s) => s.is_active).length

  const handleAdd = async () => {
    if (!form.name || !form.email) return
    setSaving(true)
    const password = generatePassword(form.name)
    const id = `staff-sb-${Date.now()}`
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.name)}&backgroundColor=6B4226&textColor=FFFAF4`

    const { error } = await supabase.from('staff_accounts').insert({
      id,
      name: form.name,
      email: form.email.toLowerCase().trim(),
      password,
      role: form.role,
      branch: form.branch,
      phone: form.phone,
      avatar,
      is_active: true,
    })

    setSaving(false)
    if (!error) {
      setGeneratedCreds({ email: form.email.toLowerCase().trim(), password, name: form.name })
      setForm({ name: '', email: '', role: 'cashier', branch: 'branch-001', phone: '' })
      setShowAddModal(false)
      fetchStaff()
    }
  }

  const handleToggleActive = async (staff: SupabaseStaff) => {
    await supabase.from('staff_accounts').update({ is_active: !staff.is_active }).eq('id', staff.id)
    fetchStaff()
  }

  const handleSaveEdit = async () => {
    if (!editStaff) return
    setSaving(true)
    await supabase.from('staff_accounts').update({
      name: editStaff.name,
      phone: editStaff.phone,
      role: editStaff.role,
      branch: editStaff.branch,
    }).eq('id', editStaff.id)
    setSaving(false)
    setEditStaff(null)
    fetchStaff()
  }

  const handleResetPassword = async (staff: SupabaseStaff) => {
    const newPass = generatePassword(staff.name)
    await supabase.from('staff_accounts').update({ password: newPass }).eq('id', staff.id)
    setGeneratedCreds({ email: staff.email, password: newPass, name: staff.name })
  }

  const copyText = (text: string, type: 'email' | 'pass') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Staff & Roles" subtitle={`${totalActive} staff aktif · ${supabaseStaff.length} ditambah via sistem`} />
      <div className="p-6">

        {canManage(user?.role) && (
          <div className="flex justify-end mb-5">
            <button onClick={() => setShowAddModal(true)}
              className="bg-espresso-dark text-warm-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2">
              + Tambah Staff Baru
            </button>
          </div>
        )}

        {/* Supabase Staff (bisa dikelola) */}
        {supabaseStaff.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-cafe-muted uppercase tracking-wider mb-3">Staff Terdaftar via Sistem ({supabaseStaff.length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {supabaseStaff.map((staff) => (
                <div key={staff.id} className={`bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40 flex items-start gap-4 ${!staff.is_active ? 'opacity-60' : ''}`}>
                  <img src={staff.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(staff.name)}&backgroundColor=6B4226&textColor=FFFAF4`}
                    alt={staff.name} className="w-12 h-12 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-espresso-deep">{staff.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${staff.is_active ? 'bg-olive-sage/15 text-olive-sage' : 'bg-red-50 text-red-500'}`}>
                        {staff.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <p className="text-espresso-light text-xs font-semibold mt-0.5">{roleLabel[staff.role as UserRole] || staff.role}</p>
                    <p className="text-cafe-muted text-xs mt-1 truncate">{staff.email}</p>
                    {staff.phone && <p className="text-cafe-muted text-xs">{staff.phone}</p>}
                    <div className="flex gap-2 mt-2">
                      <span className="bg-cream-base text-espresso-mid text-[10px] font-semibold px-2.5 py-1 rounded-full">
                        {branchOptions.find((b) => b.id === staff.branch)?.name || staff.branch}
                      </span>
                    </div>
                    {canManage(user?.role) && (
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        <button onClick={() => setEditStaff(staff)}
                          className="text-[10px] font-bold bg-cream-base border border-latte text-espresso-mid px-2.5 py-1 rounded-lg">
                          Edit
                        </button>
                        <button onClick={() => handleToggleActive(staff)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${staff.is_active ? 'bg-red-50 text-red-500' : 'bg-olive-sage/15 text-olive-sage'}`}>
                          {staff.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button onClick={() => handleResetPassword(staff)}
                          className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg">
                          Reset Password
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mock Staff (legacy, read-only) */}
        <div>
          <p className="text-xs font-bold text-cafe-muted uppercase tracking-wider mb-3">Staff Default Sistem ({mockStaff.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockStaff.map((staff) => (
              <div key={staff.id} className={`bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40 flex items-start gap-4 ${!staff.isActive ? 'opacity-60' : ''}`}>
                <img src={staff.avatar} alt={staff.name} className="w-12 h-12 rounded-2xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-espresso-deep">{staff.name}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${staff.isActive ? 'bg-olive-sage/15 text-olive-sage' : 'bg-red-50 text-red-500'}`}>
                        {staff.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream-base text-cafe-muted">Default</span>
                    </div>
                  </div>
                  <p className="text-espresso-light text-xs font-semibold mt-0.5 capitalize">{roleLabel[staff.role]}</p>
                  <p className="text-cafe-muted text-xs mt-1 truncate">{staff.email}</p>
                  <p className="text-cafe-muted text-xs">{staff.phone}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="bg-cream-base text-espresso-mid text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize">
                      {staff.branch.replace('branch-', 'Cabang ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Tambah Staff */}
      {showAddModal && (
        <div className="fixed inset-0 bg-espresso-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-warm-white rounded-3xl p-6 w-full max-w-md shadow-warm-lg">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display font-bold text-espresso-deep text-lg">Tambah Staff Baru</p>
              <button onClick={() => setShowAddModal(false)} className="text-cafe-muted text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Nama Lengkap</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
              </div>
              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Email (untuk login)</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none">
                    {managableRoles.map((r) => (
                      <option key={r} value={r}>{roleLabel[r]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Cabang</label>
                  <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none">
                    {branchOptions.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">No. HP</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
              </div>
              <p className="text-[10px] text-cafe-muted bg-cream-base rounded-xl px-3 py-2">
                Password sementara akan di-generate otomatis. Bagikan ke staff dan minta ganti password nanti.
              </p>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 border border-latte text-espresso-mid py-2.5 rounded-xl text-sm font-semibold">Batal</button>
              <button onClick={handleAdd} disabled={!form.name || !form.email || saving}
                className="flex-1 bg-espresso-dark text-warm-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Tambah Staff'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Staff */}
      {editStaff && (
        <div className="fixed inset-0 bg-espresso-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-warm-white rounded-3xl p-6 w-full max-w-md shadow-warm-lg">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display font-bold text-espresso-deep text-lg">Edit Staff</p>
              <button onClick={() => setEditStaff(null)} className="text-cafe-muted text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Nama Lengkap</label>
                <input value={editStaff.name} onChange={(e) => setEditStaff({ ...editStaff, name: e.target.value })}
                  className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
              </div>
              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Email</label>
                <input value={editStaff.email} disabled
                  className="w-full border border-latte/50 rounded-xl px-3 py-2.5 text-sm bg-cream-base text-cafe-muted" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Role</label>
                  <select value={editStaff.role} onChange={(e) => setEditStaff({ ...editStaff, role: e.target.value })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none">
                    {managableRoles.map((r) => (
                      <option key={r} value={r}>{roleLabel[r]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">Cabang</label>
                  <select value={editStaff.branch} onChange={(e) => setEditStaff({ ...editStaff, branch: e.target.value })}
                    className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none">
                    {branchOptions.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-cafe-muted uppercase tracking-wider block mb-1.5">No. HP</label>
                <input value={editStaff.phone} onChange={(e) => setEditStaff({ ...editStaff, phone: e.target.value })}
                  className="w-full border border-latte rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-espresso-light" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditStaff(null)} className="flex-1 border border-latte text-espresso-mid py-2.5 rounded-xl text-sm font-semibold">Batal</button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="flex-1 bg-espresso-dark text-warm-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Credentials Generated */}
      {generatedCreds && (
        <div className="fixed inset-0 bg-espresso-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-warm-white rounded-3xl p-6 w-full max-w-sm shadow-warm-lg">
            <div className="text-center mb-4">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-display font-bold text-espresso-deep text-lg">Akun {generatedCreds.name} Dibuat!</p>
              <p className="text-cafe-muted text-xs mt-1">Bagikan kredensial ini ke staff. Simpan baik-baik!</p>
            </div>
            <div className="space-y-3">
              <div className="bg-cream-base rounded-xl p-3">
                <p className="text-[10px] font-bold text-cafe-muted uppercase tracking-wider mb-1">Email / Username</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-espresso-deep font-semibold">{generatedCreds.email}</p>
                  <button onClick={() => copyText(generatedCreds.email, 'email')}
                    className="text-[10px] font-bold bg-espresso-dark text-warm-white px-2.5 py-1 rounded-lg">
                    {copied === 'email' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="bg-cream-base rounded-xl p-3">
                <p className="text-[10px] font-bold text-cafe-muted uppercase tracking-wider mb-1">Password Sementara</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-espresso-deep font-semibold">{generatedCreds.password}</p>
                  <button onClick={() => copyText(generatedCreds.password, 'pass')}
                    className="text-[10px] font-bold bg-espresso-dark text-warm-white px-2.5 py-1 rounded-lg">
                    {copied === 'pass' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-red-500 text-center mt-3">Tutup window ini hanya setelah credentials dicatat!</p>
            <button onClick={() => setGeneratedCreds(null)}
              className="w-full mt-4 bg-espresso-dark text-warm-white py-2.5 rounded-xl text-sm font-bold">
              Sudah Dicatat, Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
