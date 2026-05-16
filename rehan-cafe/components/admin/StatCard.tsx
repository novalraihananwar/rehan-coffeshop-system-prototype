interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: string
  trend?: { value: string; positive: boolean }
  dark?: boolean
}

export default function StatCard({ title, value, subtitle, icon, trend, dark }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-5 ${dark ? 'bg-espresso-deep text-warm-white' : 'bg-warm-white border border-latte/60'} shadow-warm-sm`}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-espresso-light/70' : 'text-cafe-muted'}`}>{title}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`font-display text-2xl font-bold mb-1 ${dark ? 'text-espresso-light' : 'text-espresso-deep'}`}>{value}</p>
      {subtitle && <p className={`text-xs ${dark ? 'text-warm-white/40' : 'text-cafe-muted'}`}>{subtitle}</p>}
      {trend && (
        <div className="mt-2">
          <span className={`text-xs font-semibold ${trend.positive ? 'text-olive-sage' : 'text-red-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        </div>
      )}
    </div>
  )
}
