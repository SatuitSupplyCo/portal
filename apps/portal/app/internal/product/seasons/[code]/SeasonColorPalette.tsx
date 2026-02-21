'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@repo/ui/button'
import { Check, Pencil } from 'lucide-react'
import { confirmSeasonColor } from '../../actions'
import { ColorDetailDialog } from '@/components/ColorDetailDialog'
import {
  getHex,
  getPantone,
  textColorForBg,
  type ColorDetailData,
  type SeasonColorEntry,
} from '@/lib/color'

export type { SeasonColorEntry }

// ─── Types ───────────────────────────────────────────────────────────

interface SeasonColorPaletteProps {
  seasonId: string
  colors: SeasonColorEntry[]
  totalConcepts: number
  /** When true, only render the header + swatch bar (no detail chips) */
  compact?: boolean
  /** Called when the user clicks the edit pencil */
  onEdit?: () => void
  /** Shown when a dimension filter is active */
  filterNote?: string
}

// ─── Component ───────────────────────────────────────────────────────

export function SeasonColorPalette({ seasonId, colors: propColors, totalConcepts, compact, onEdit, filterNote }: SeasonColorPaletteProps) {
  const [colors, setColors] = useState(propColors)
  const [selectedColor, setSelectedColor] = useState<ColorDetailData | null>(null)

  useEffect(() => { setColors(propColors) }, [propColors])

  const handleColorSaved = useCallback((updated: ColorDetailData) => {
    setColors(prev => prev.map(c => {
      if (c.studioEntry.id !== updated.id) return c
      return {
        ...c,
        studioEntry: {
          ...c.studioEntry,
          title: updated.title,
          categoryMetadata: {
            ...(c.studioEntry.categoryMetadata ?? {}),
            hex: updated.hex,
            pantone: updated.pantone,
          },
          tags: updated.tags ?? c.studioEntry.tags,
        },
      }
    }))
    setSelectedColor(updated)
  }, [])

  if (colors.length === 0) return null

  const confirmed = colors.filter((c) => c.status === 'confirmed')
  const proposed = colors.filter((c) => c.status === 'proposed')
  const totalSkuRefs = colors.reduce((sum, c) => sum + c.skuCount, 0)

  function openColorDetail(color: SeasonColorEntry) {
    const hex = getHex(color.studioEntry.categoryMetadata)
    const pantone = getPantone(color.studioEntry.categoryMetadata)
    setSelectedColor({
      id: color.studioEntry.id,
      title: color.studioEntry.title,
      hex,
      pantone,
      tags: color.studioEntry.tags,
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <p className="depot-label" style={{ marginBottom: 0 }}>
          Color Palette
        </p>
        {onEdit && !compact && (
          <button
            type="button"
            onClick={onEdit}
            className="text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
            title="Edit Color Palette"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
        <span className="text-[10px] text-[var(--depot-faint)] ml-1">
          {confirmed.length} confirmed · {proposed.length} proposed
        </span>
        {filterNote && (
          <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm ml-1">
            {filterNote}
          </span>
        )}
      </div>

      {/* Weighted swatch bar */}
      <WeightView colors={colors} totalConcepts={totalConcepts} totalSkuRefs={totalSkuRefs} onColorClick={openColorDetail} />

      {/* Detail chips — hidden in compact mode (picker grid replaces them) */}
      {!compact && (
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const hex = getHex(color.studioEntry.categoryMetadata)
            const pantone = getPantone(color.studioEntry.categoryMetadata)
            const isConfirmed = color.status === 'confirmed'

            return (
              <button
                key={color.id}
                type="button"
                onClick={() => openColorDetail(color)}
                className={`group flex items-center gap-2 rounded-md border px-2 py-1.5 text-[11px] transition-colors cursor-pointer text-left hover:border-[var(--depot-ink)]/40 ${
                  isConfirmed
                    ? 'border-[var(--depot-ink)]/20 bg-card'
                    : 'border-dashed border-[var(--depot-border)] bg-card/50'
                }`}
              >
                <div
                  className="h-5 w-5 rounded-sm shrink-0 border border-black/10"
                  style={{ backgroundColor: hex ?? '#e5e7eb' }}
                />
                <div className="min-w-0">
                  <p className="font-medium truncate max-w-[120px]">
                    {color.studioEntry.title}
                  </p>
                  <p className="text-[9px] text-[var(--depot-faint)] font-mono">
                    {[pantone, hex?.toUpperCase()].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
                {isConfirmed ? (
                  <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                ) : (
                  <span
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                  >
                    <ConfirmButton seasonId={seasonId} studioEntryId={color.studioEntryId} />
                  </span>
                )}
                {color.skuCount > 0 && (
                  <span className="text-[9px] text-[var(--depot-faint)] tabular-nums shrink-0">
                    {color.skuCount} SKU{color.skuCount !== 1 ? 's' : ''}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <ColorDetailDialog
        color={selectedColor}
        open={!!selectedColor}
        onOpenChange={(open) => { if (!open) setSelectedColor(null) }}
        onColorSaved={handleColorSaved}
      />
    </div>
  )
}

// ─── Weight view ─────────────────────────────────────────────────────

function WeightView({
  colors,
  totalConcepts,
  totalSkuRefs,
  onColorClick,
}: {
  colors: SeasonColorEntry[]
  totalConcepts: number
  totalSkuRefs: number
  onColorClick?: (color: SeasonColorEntry) => void
}) {
  const hasWeightData = totalSkuRefs > 0

  return (
    <div className="space-y-1.5">
      <div className="flex rounded-lg overflow-hidden border border-[var(--depot-border)] h-12">
        {colors.map((color) => {
          const hex = getHex(color.studioEntry.categoryMetadata)
          const weight = hasWeightData
            ? Math.max(color.skuCount / totalSkuRefs, 0.05)
            : 1 / colors.length
          const pct = hasWeightData
            ? Math.round((color.skuCount / totalSkuRefs) * 100)
            : Math.round(100 / colors.length)
          const isProposed = color.status === 'proposed'

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onColorClick?.(color)}
              className="relative group/swatch transition-transform hover:scale-y-110 hover:z-10 cursor-pointer"
              style={{
                backgroundColor: hex ?? '#e5e7eb',
                flex: `${weight} 0 0%`,
                minWidth: '24px',
              }}
              title={color.studioEntry.title}
            >
              {isProposed && (
                <div className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 6px)',
                  }}
                />
              )}
              <span
                className="absolute inset-x-0 bottom-0.5 text-[7px] font-mono text-center opacity-0 group-hover/swatch:opacity-100 transition-opacity pointer-events-none"
                style={{ color: hex ? textColorForBg(hex) : '#666' }}
              >
                {pct}%
              </span>
            </button>
          )
        })}
      </div>
      {!hasWeightData && (
        <p className="text-[9px] text-[var(--depot-faint)] italic">
          Weight reflects SKU distribution — assign colors to concepts to see proportional view
        </p>
      )}
    </div>
  )
}

// ─── Confirm button ──────────────────────────────────────────────────

function ConfirmButton({ seasonId, studioEntryId }: { seasonId: string; studioEntryId: string }) {
  const [pending, setPending] = useState(false)

  async function handleConfirm() {
    setPending(true)
    await confirmSeasonColor(seasonId, studioEntryId)
    setPending(false)
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={pending}
      className="text-[9px] text-[var(--depot-faint)] hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
      title="Confirm this color"
    >
      {pending ? '...' : 'confirm'}
    </button>
  )
}
