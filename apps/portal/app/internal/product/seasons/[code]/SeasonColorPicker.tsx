'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/button'
import { Pencil, Check, Plus, X } from 'lucide-react'
import { updateSeasonColors } from '../../actions'
import { AddColorDialog } from '../../../studio/color/AddColorDialog'
import { SeasonColorPalette, type SeasonColorEntry } from './SeasonColorPalette'
import { useDimensionFilter } from './DimensionFilterProvider'
import type { ColorOption } from '@/lib/color'

// ─── Types ───────────────────────────────────────────────────────────

interface SeasonOption {
  id: string
  code: string
  name: string
}

interface CollectionOption {
  id: string
  name: string
}

interface SeasonColorPickerProps {
  seasonId: string
  seasonName: string
  currentColorIds: string[]
  allColorEntries: ColorOption[]
  proposedForSeasonIds: string[]
  seasonOptions: SeasonOption[]
  collectionOptions: CollectionOption[]
  /** Saved palette data — the picker renders this and drives it live when editing */
  seasonColorData: SeasonColorEntry[]
  totalConcepts: number
}

// ─── Component ───────────────────────────────────────────────────────

export function SeasonColorPicker({
  seasonId,
  seasonName,
  currentColorIds,
  allColorEntries,
  proposedForSeasonIds,
  seasonOptions,
  collectionOptions,
  seasonColorData,
  totalConcepts,
}: SeasonColorPickerProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set(currentColorIds))
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleColorCreated(entryId: string) {
    setSelected((prev) => new Set([...prev, entryId]))
  }

  function handleExpand() {
    setSelected(new Set(currentColorIds))
    setError(null)
    setExpanded(true)
  }

  function handleCancel() {
    setExpanded(false)
    setError(null)
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await updateSeasonColors(seasonId, Array.from(selected))
      if (!result.success) {
        setError(result.error ?? 'Something went wrong.')
      } else {
        setExpanded(false)
        router.refresh()
      }
    })
  }

  // Build a color option lookup for fast access
  const colorLookup = useMemo(() => {
    const map = new Map<string, ColorOption>()
    for (const c of allColorEntries) map.set(c.id, c)
    return map
  }, [allColorEntries])

  // Build the existing season color lookup
  const savedColorLookup = useMemo(() => {
    const map = new Map<string, SeasonColorEntry>()
    for (const c of seasonColorData) map.set(c.studioEntryId, c)
    return map
  }, [seasonColorData])

  // Live palette: reflects current selection in real time
  const livePaletteColors = useMemo((): SeasonColorEntry[] => {
    if (!expanded) return seasonColorData

    const entries: SeasonColorEntry[] = []
    let sortIdx = 0

    for (const id of selected) {
      const existing = savedColorLookup.get(id)
      if (existing) {
        entries.push(existing)
      } else {
        // Newly added — synthesize from allColorEntries
        const opt = colorLookup.get(id)
        if (opt) {
          entries.push({
            id: `new-${id}`,
            studioEntryId: id,
            status: 'proposed',
            sortOrder: 1000 + sortIdx++,
            studioEntry: {
              id: opt.id,
              title: opt.title,
              categoryMetadata: {
                ...(opt.hex ? { hex: opt.hex } : {}),
                ...(opt.pantone ? { pantone: opt.pantone } : {}),
              },
              tags: opt.tags,
            },
            skuCount: 0,
          })
        }
      }
    }

    return entries.sort((a, b) => a.sortOrder - b.sortOrder)
  }, [expanded, selected, seasonColorData, savedColorLookup, colorLookup])

  // Picker groups — always show all sections when editing
  const groups = useMemo(() => {
    const currentSet = new Set(currentColorIds)
    const proposedSet = new Set(proposedForSeasonIds)

    const inSeason: ColorOption[] = []
    const proposedForSeason: ColorOption[] = []
    const otherSeasons: ColorOption[] = []
    const unattached: ColorOption[] = []

    for (const color of allColorEntries) {
      if (currentSet.has(color.id)) {
        inSeason.push(color)
      } else if (proposedSet.has(color.id) || color.targetSeasonId === seasonId) {
        proposedForSeason.push(color)
      } else if (color.targetSeasonId) {
        otherSeasons.push(color)
      } else {
        unattached.push(color)
      }
    }

    return [
      { label: 'In Season', description: 'Currently in this season\u2019s palette', items: inSeason, showNew: true },
      { label: 'Proposed for Season', description: 'Targeted to this season in Studio', items: proposedForSeason, showNew: true },
      { label: 'Unattached', description: 'Colors not linked to any season', items: unattached, showNew: true },
      { label: 'Other Seasons', description: 'Colors attached to other seasons', items: otherSeasons, showNew: false },
    ]
  }, [allColorEntries, currentColorIds, proposedForSeasonIds, seasonId])

  const addedCount = Array.from(selected).filter((id) => !currentColorIds.includes(id)).length
  const removedCount = currentColorIds.filter((id) => !selected.has(id)).length
  const hasChanges = addedCount > 0 || removedCount > 0

  // ─── Filter context ─────────────────────────────────────────────
  const { filter, filteredColorwayIds } = useDimensionFilter()

  const displayPaletteColors = useMemo((): SeasonColorEntry[] => {
    if (!filteredColorwayIds || expanded) return livePaletteColors
    return livePaletteColors.filter((c) => filteredColorwayIds.has(c.studioEntryId))
  }, [livePaletteColors, filteredColorwayIds, expanded])

  const isColorFiltered = !!filter && !expanded && displayPaletteColors.length !== livePaletteColors.length

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div>
      {/* Palette bar — always visible, driven by live selection when editing */}
      {displayPaletteColors.length > 0 ? (
        <SeasonColorPalette
          seasonId={seasonId}
          colors={displayPaletteColors}
          totalConcepts={totalConcepts}
          compact={expanded}
          onEdit={handleExpand}
          filterNote={
            isColorFiltered
              ? `Showing ${displayPaletteColors.length} of ${livePaletteColors.length} colors`
              : undefined
          }
        />
      ) : filter && !expanded && livePaletteColors.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="depot-label" style={{ marginBottom: 0 }}>Color Palette</p>
            <button
              type="button"
              onClick={handleExpand}
              className="text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
              title="Edit Color Palette"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs text-[var(--depot-muted)] mt-2">
            No colors are assigned to slots matching the current filter.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-1">
          <p className="depot-label" style={{ marginBottom: 0 }}>Color Palette</p>
          <button
            type="button"
            onClick={handleExpand}
            className="text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
            title="Edit Color Palette"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Collapsed: empty state hint */}
      {!expanded && livePaletteColors.length === 0 && (
        <p className="text-xs text-[var(--depot-muted)] mt-2">
          No colors assigned yet. Click the pencil to define this season&apos;s palette direction.
        </p>
      )}

      {/* Expanded: inline selection panel */}
      {expanded && (
        <div className="mt-4 rounded-lg border border-[var(--depot-border)] bg-card/50 overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--depot-border)] bg-card">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--depot-ink)]">
                Edit Palette
              </p>
              <p className="text-[10px] text-[var(--depot-faint)] mt-0.5">
                Click swatches to add or remove. Changes preview live above.
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-1 rounded-md text-[var(--depot-faint)] hover:text-[var(--depot-ink)] hover:bg-[var(--depot-hairline)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Selection grid */}
          <div className="px-5 py-4 space-y-5 max-h-[50vh] overflow-y-auto">
            {groups.map((group) => (
              <div key={group.label}>
                <div className="mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--depot-faint)]">
                    {group.label}
                  </p>
                  <p className="text-[9px] text-[var(--depot-faint)]/60">
                    {group.description}
                  </p>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2">
                  {group.items.map((color) => {
                    const isSelected = selected.has(color.id)

                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => toggle(color.id)}
                        className={`group relative rounded-lg border-2 transition-all overflow-hidden ${
                          isSelected
                            ? 'border-[var(--depot-ink)] ring-1 ring-[var(--depot-ink)]/20 scale-[1.02]'
                            : 'border-transparent hover:border-[var(--depot-border)]'
                        }`}
                      >
                        <div
                          className="h-12 w-full"
                          style={{ backgroundColor: color.hex ?? '#e5e7eb' }}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--depot-ink)] flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="px-1.5 py-1 bg-card">
                          <p className="text-[8px] font-medium truncate leading-tight">
                            {color.title}
                          </p>
                          <p className="text-[7px] text-[var(--depot-faint)] font-mono truncate">
                            {color.pantone ?? color.hex?.toUpperCase() ?? '—'}
                          </p>
                        </div>
                      </button>
                    )
                  })}

                  {/* New color swatch tile */}
                  {group.showNew && (
                    <AddColorDialog
                      seasons={seasonOptions}
                      collections={collectionOptions}
                      defaultSeasonId={seasonId}
                      onCreated={handleColorCreated}
                      trigger={
                        <button
                          type="button"
                          className="rounded-lg border-2 border-dashed border-[var(--depot-border)] hover:border-[var(--depot-faint)] transition-all overflow-hidden group"
                        >
                          <div className="h-12 w-full flex items-center justify-center bg-[var(--depot-hairline)] group-hover:bg-[var(--depot-border)] transition-colors">
                            <Plus className="h-3.5 w-3.5 text-[var(--depot-faint)]/50 group-hover:text-[var(--depot-faint)] transition-colors" />
                          </div>
                          <div className="px-1.5 py-1 bg-card">
                            <p className="text-[8px] font-medium text-[var(--depot-faint)]/60 truncate leading-tight">
                              New
                            </p>
                            <p className="text-[7px] font-mono truncate">
                              &nbsp;
                            </p>
                          </div>
                        </button>
                      }
                    />
                  )}
                </div>
              </div>
            ))}

          </div>

          {/* Footer with save/cancel */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--depot-border)] bg-card">
            <p className="text-[10px] text-[var(--depot-faint)] tabular-nums">
              {selected.size} selected
              {hasChanges && (
                <span className="ml-1.5 text-[var(--depot-ink)]">
                  ({addedCount > 0 && `+${addedCount}`}
                  {addedCount > 0 && removedCount > 0 && ', '}
                  {removedCount > 0 && `−${removedCount}`})
                </span>
              )}
            </p>
            {error && <p className="text-[10px] text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isPending || !hasChanges}
              >
                {isPending ? 'Saving...' : 'Save Palette'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
