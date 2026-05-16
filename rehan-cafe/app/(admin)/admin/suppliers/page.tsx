'use client'
import AdminHeader from '@/components/admin/AdminHeader'
import { mockSuppliers } from '@/lib/mock-data/suppliers'

export default function SuppliersPage() {
  return (
    <div className="min-h-screen">
      <AdminHeader title="Supplier" subtitle={`${mockSuppliers.length} supplier aktif`} />
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockSuppliers.map((s) => (
            <div key={s.id} className="bg-warm-white rounded-2xl p-5 shadow-warm-sm border border-latte/40">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-espresso-dark/10 rounded-xl flex items-center justify-center text-xl">🚚</div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.isActive ? 'bg-olive-sage/15 text-olive-sage' : 'bg-red-50 text-red-500'}`}>
                  {s.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <p className="font-display font-bold text-espresso-deep mb-0.5">{s.name}</p>
              <p className="text-cafe-muted text-xs mb-3">PIC: {s.contactPerson}</p>
              <div className="space-y-1 text-xs text-cafe-muted mb-3">
                <p>📧 {s.email}</p>
                <p>📞 {s.phone}</p>
                <p>📍 {s.address}</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-espresso-mid uppercase tracking-wider">Produk</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-xs ${star <= s.rating ? 'text-espresso-light' : 'text-latte'}`}>★</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {s.products.slice(0, 3).map((p) => (
                  <span key={p} className="bg-cream-base text-espresso-mid text-[10px] font-semibold px-2 py-0.5 rounded-full">{p}</span>
                ))}
                {s.products.length > 3 && (
                  <span className="bg-cream-base text-cafe-muted text-[10px] px-2 py-0.5 rounded-full">+{s.products.length - 3}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
