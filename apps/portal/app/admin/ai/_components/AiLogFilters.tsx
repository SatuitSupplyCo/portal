'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const FEATURES = ['all', 'assortment-mix', 'field-suggestion'] as const
const OUTCOMES = ['all', 'selected', 'rejected', 'regenerated'] as const

export function AiLogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFeature = searchParams.get('feature') ?? 'all'
  const currentOutcome = searchParams.get('outcome') ?? 'all'

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('cursor')
    router.push(`/admin/ai?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <FilterSelect
        label="Feature"
        value={currentFeature}
        options={FEATURES}
        onChange={(v) => update('feature', v)}
      />
      <FilterSelect
        label="Outcome"
        value={currentOutcome}
        options={OUTCOMES}
        onChange={(v) => update('outcome', v)}
      />
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="flex items-center gap-1.5 text-sm">
      <span className="text-muted-foreground text-xs">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === 'all' ? 'All' : opt}
          </option>
        ))}
      </select>
    </label>
  )
}
