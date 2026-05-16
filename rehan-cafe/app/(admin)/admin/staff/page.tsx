'use client'
import AdminHeader from '@/components/admin/AdminHeader'
import { mockStaff } from '@/lib/mock-data/staff'
import { roleLabel } from '@/lib/mock-data/auth'

export default function StaffPage() {
  return (
    <div className="min-h-screen">
      <AdminHeader title="Staff & Roles" subtitle={`${mockStaff.length} staff terdaftar`} />
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockStaff.map((staff) => (
            <div key={staff.id} className="bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40 flex items-start gap-4">
              <img src={staff.avatar} alt={staff.name} className="w-12 h-12 rounded-2xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-espresso-deep">{staff.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${staff.isActive ? 'bg-olive-sage/15 text-olive-sage' : 'bg-red-50 text-red-500'}`}>
                    {staff.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-espresso-light text-xs font-semibold mt-0.5 capitalize">{roleLabel[staff.role]}</p>
                <p className="text-cafe-muted text-xs mt-1 truncate">{staff.email}</p>
                <p className="text-cafe-muted text-xs">{staff.phone}</p>
                <div className="flex gap-2 mt-3">
                  <span className="bg-cream-base text-espresso-mid text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize">{staff.branch.replace('branch-', 'Cabang ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
