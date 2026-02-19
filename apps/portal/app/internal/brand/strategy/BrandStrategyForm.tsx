'use client'

import { useState, useTransition } from 'react'
import { Button } from '@repo/ui/button'
import { Sparkles, RefreshCw, Check } from 'lucide-react'
import { upsertBrandContext, regenerateBrandBrief } from '../actions'

interface BrandStrategyFormProps {
  initialValues: {
    positioning: string
    targetCustomer: string
    priceArchitecture: string
    aestheticDirection: string
    categoryStrategy: string
    antiSpec: string
  }
  contextBrief: string | null
  contextBriefUpdatedAt: string | null
}

const FIELDS = [
  {
    key: 'positioning' as const,
    label: 'Positioning',
    placeholder: 'What is the brand\'s market position? e.g. "Premium men\'s apparel focused on understated quality..."',
    rows: 3,
  },
  {
    key: 'targetCustomer' as const,
    label: 'Target Customer',
    placeholder: 'Who is the core customer? Demographics, psychographics, lifestyle...',
    rows: 3,
  },
  {
    key: 'priceArchitecture' as const,
    label: 'Price Architecture',
    placeholder: 'Price range, tier strategy, margin expectations...',
    rows: 2,
  },
  {
    key: 'aestheticDirection' as const,
    label: 'Aesthetic Direction',
    placeholder: 'Design philosophy, visual language, style DNA...',
    rows: 3,
  },
  {
    key: 'categoryStrategy' as const,
    label: 'Category Strategy',
    placeholder: 'Which product categories to emphasize or de-emphasize, target mix...',
    rows: 3,
  },
  {
    key: 'antiSpec' as const,
    label: 'Anti-Spec',
    placeholder: 'What the brand explicitly avoids — trends, aesthetics, price points...',
    rows: 2,
  },
] as const

export function BrandStrategyForm({
  initialValues,
  contextBrief,
  contextBriefUpdatedAt,
}: BrandStrategyFormProps) {
  const [values, setValues] = useState(initialValues)
  const [isPending, startTransition] = useTransition()
  const [isRegenerating, startRegenerate] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(key: keyof typeof values, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }))
    setSaved(false)
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await upsertBrandContext(values)
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(result.error)
      }
    })
  }

  function handleRegenerate() {
    startRegenerate(async () => {
      const result = await regenerateBrandBrief()
      if (!result.success) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-8">
      {FIELDS.map((field) => (
        <div key={field.key}>
          <label
            htmlFor={`brand-${field.key}`}
            className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--depot-muted)] mb-2"
          >
            {field.label}
          </label>
          <textarea
            id={`brand-${field.key}`}
            value={values[field.key]}
            onChange={(e) => handleChange(field.key, e.target.value)}
            rows={field.rows}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-[var(--depot-hairline)] bg-transparent px-3 py-2 text-sm text-[var(--depot-ink)] placeholder:text-[var(--depot-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--depot-ink)] resize-y"
          />
        </div>
      ))}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : saved ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          ) : 'Save Strategy'}
        </Button>
      </div>

      {/* AI Context Brief */}
      <div className="mt-10 pt-8 border-t border-[var(--depot-hairline)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[var(--depot-faint)]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--depot-muted)]">
              AI Context Brief
            </span>
          </div>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.04em] rounded-sm bg-[var(--depot-surface-alt)] text-[var(--depot-muted)] hover:text-[var(--depot-ink)] hover:bg-[var(--depot-surface)] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Generating...' : 'Regenerate'}
          </button>
        </div>

        {contextBrief ? (
          <div className="rounded-md border border-[var(--depot-hairline)] bg-[var(--depot-surface-alt)] px-4 py-3">
            <p className="text-[12px] text-[var(--depot-ink-light)] leading-relaxed whitespace-pre-wrap">
              {contextBrief}
            </p>
            {contextBriefUpdatedAt && (
              <p className="mt-3 text-[10px] text-[var(--depot-faint)]">
                Last generated: {new Date(contextBriefUpdatedAt).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-[var(--depot-hairline)] px-4 py-6 text-center">
            <p className="text-[11px] text-[var(--depot-faint)]">
              No brief generated yet. Save your strategy fields and a brief will be generated automatically.
            </p>
          </div>
        )}

        <p className="mt-3 text-[10px] text-[var(--depot-faint)] leading-relaxed">
          This brief is automatically generated from the strategy fields above
          and included in AI prompts for assortment planning. It preserves key
          constraints and targets in a concise format optimised for the model.
        </p>
      </div>
    </div>
  )
}
