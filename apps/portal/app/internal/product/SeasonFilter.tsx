'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@repo/ui/utils'

interface SeasonOption {
  code: string
  name: string
  seasonType: string
}

export function SeasonFilter({ seasons }: { seasons: SeasonOption[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('season') ?? ''

  function select(code: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (code) {
      params.set('season', code)
    } else {
      params.delete('season')
    }
    router.push(`/internal/product?${params.toString()}`)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-4 border-b border-[var(--depot-border)] overflow-x-auto">
      <div className="flex items-center gap-2 min-w-max">
        <span className="text-[10px] uppercase tracking-wider text-[var(--depot-faint)] mr-2">
          Filter
        </span>

        {/* "All" pill */}
        <button
          type="button"
          onClick={() => select('')}
          className={cn(
            'px-3 py-1 text-[11px] tracking-[0.04em] rounded-sm transition-colors whitespace-nowrap',
            active === ''
              ? 'bg-[var(--depot-ink)] text-white font-medium'
              : 'bg-[var(--depot-surface-alt)] text-[var(--depot-muted)] hover:text-[var(--depot-ink)] hover:bg-[var(--depot-surface-alt)]',
          )}
        >
          All Seasons
        </button>

        {/* Season pills */}
        {seasons.map((s) => (
          <button
            key={s.code}
            type="button"
            onClick={() => select(s.code)}
            className={cn(
              'px-3 py-1 text-[11px] tracking-[0.04em] rounded-sm transition-colors whitespace-nowrap',
              active === s.code
                ? 'bg-[var(--depot-ink)] text-white font-medium'
                : 'bg-[var(--depot-surface-alt)] text-[var(--depot-muted)] hover:text-[var(--depot-ink)] hover:bg-[var(--depot-surface-alt)]',
            )}
            title={s.name}
          >
            {s.code}
            <span className="ml-1 text-[9px] opacity-60">
              {s.seasonType === 'minor' ? 'drop' : ''}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
