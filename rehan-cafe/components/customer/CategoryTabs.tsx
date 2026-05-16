'use client'

interface Category {
  key: string
  label: string
  emoji: string
}

interface CategoryTabsProps {
  categories: Category[]
  active: string
  onChange: (key: string) => void
}

export default function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full transition-all duration-200 ${
            active === cat.key
              ? 'bg-espresso-dark text-warm-white shadow-warm-sm'
              : 'bg-cream-base text-espresso-mid border border-latte hover:border-espresso-mid'
          }`}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  )
}
