'use client'

import { useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useDimensionFilter } from './DimensionFilterProvider'
import { SlotDetailPanel } from './SlotDetailPanel'
import { useShell } from '@/components/shell/ShellProvider'
import { InlineSvg } from '@/components/product/InlineSvg'
import type { TaxonomyCategory, TaxonomyDimension } from './AddSlotDialog'
import type { ColorOption } from './SlotColorPicker'

// ─── Types ──────────────────────────────────────────────────────────

export interface SlotGridEntry {
  id: string
  frontFlat: string
  backFlat: string
  status: string
  replacementFlag: boolean
  colorwayIds: string[]
  collection: { code: string; name: string } | null
  productType: {
    code: string
    name: string
    subcategory: {
      code: string
      name: string
      category: { code: string; name: string }
    }
  }
  audienceGender: { code: string; label: string } | null
  audienceAgeGroup: { code: string; label: string } | null
  sellingWindow: { code: string; label: string } | null
  assortmentTenure: { code: string; label: string } | null
  skuConcept: {
    id: string
    status: string
    metadataSnapshot: Record<string, unknown>
    construction: { code: string; label: string } | null
    materialWeightClass: { code: string; label: string } | null
    useCase: { code: string; label: string } | null
  } | null
}

// ─── Status colors ──────────────────────────────────────────────────

const slotStatusColors: Record<string, string> = {
  open: 'bg-amber-100 text-amber-800',
  filled: 'bg-emerald-100 text-emerald-800',
  removed: 'bg-zinc-100 text-zinc-400',
}

const conceptStatusColors: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-600',
  spec: 'bg-blue-100 text-blue-700',
  sampling: 'bg-purple-100 text-purple-700',
  costing: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  production: 'bg-indigo-100 text-indigo-700',
  live: 'bg-green-100 text-green-800',
  retired: 'bg-zinc-100 text-zinc-400',
}

// ─── Dimension label map for filter badge ───────────────────────────

const DIMENSION_LABELS: Record<string, string> = {
  category: 'Category',
  construction: 'Construction',
  weightClass: 'Weight',
  sellingWindow: 'Selling Window',
  tenure: 'Tenure',
  useCase: 'Use Case',
  gender: 'Gender',
  ageGroup: 'Age',
}

const LIST_VIEW_COLUMNS =
  '40px 56px minmax(160px,1fr) minmax(220px,1.1fr) 110px 90px minmax(190px,1fr) 130px'

// ─── Component ──────────────────────────────────────────────────────

interface FilteredSlotGridProps {
  slots: SlotGridEntry[]
  /** Label lookup for filter value display (all dimension labels) */
  allDimensionLabels: Record<string, Record<string, string>>
  /** Color options for displaying colorway swatches in the detail panel */
  colorOptions: ColorOption[]
  /** Taxonomy props for the edit dialog — omit to disable editing */
  editProps?: {
    seasonName: string
    productHierarchy: TaxonomyCategory[]
    collections: TaxonomyDimension[]
    constructions: TaxonomyDimension[]
    weightClasses: TaxonomyDimension[]
    fitBlocks: TaxonomyDimension[]
    sizeScales: TaxonomyDimension[]
    useCases: TaxonomyDimension[]
    audienceGenders: TaxonomyDimension[]
    audienceAgeGroups: TaxonomyDimension[]
    sellingWindows: TaxonomyDimension[]
    assortmentTenures: TaxonomyDimension[]
    seasonColorIds: string[]
    proposedColorIds: string[]
    dimensionIdLookup: {
      genders: Record<string, string>
      ageGroups: Record<string, string>
      sellingWindows: Record<string, string>
      assortmentTenures: Record<string, string>
      collections: Record<string, string>
    }
  }
}

export function FilteredSlotGrid({ slots, allDimensionLabels, colorOptions, editProps }: FilteredSlotGridProps) {
  const { filter, filteredSlotIds } = useDimensionFilter()
  const [selectedSlot, setSelectedSlot] = useState<SlotGridEntry | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const { setRightRailContent, setRightRailOpen, rightRailOpen } = useShell()
  const colorById = useMemo(
    () => new Map(colorOptions.map((color) => [color.id, color])),
    [colorOptions],
  )

  const isOpen = rightRailOpen && selectedSlot !== null

  const openSlotDetail = useCallback(
    (slot: SlotGridEntry) => {
      setSelectedSlot(slot)
      setRightRailContent(
        <SlotDetailPanel
          key={slot.id}
          slot={slot}
          colorOptions={colorOptions}
          editProps={editProps}
        />,
      )
      setRightRailOpen(true)
    },
    [colorOptions, editProps, setRightRailContent, setRightRailOpen],
  )

  const displaySlots = useMemo(() => {
    if (!filteredSlotIds) return slots
    return slots.filter((s) => filteredSlotIds.has(s.id))
  }, [slots, filteredSlotIds])

  const isFiltered = !!filter
  const filterLabel = filter
    ? allDimensionLabels[filter.dimensionKey]?.[filter.valueCode] ?? filter.valueCode
    : null

  return (
    <>
      {displaySlots.length === 0 ? (
        <div className="pillar-block text-center py-8">
          <p className="text-xs text-[var(--depot-muted)]">
            {isFiltered
              ? `No slots match the current filter.`
              : 'No slots created yet. Add slots to begin assortment planning.'}
          </p>
        </div>
      ) : (
        <>
          {/* Filter indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              {isFiltered && (
                <>
                  <span className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">
                    Filtered by
                  </span>
                  <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                    {DIMENSION_LABELS[filter.dimensionKey] ?? filter.dimensionKey}: {filterLabel}
                  </span>
                </>
              )}
              <span className="text-[10px] text-[var(--depot-faint)] tabular-nums">
                {displaySlots.length} of {slots.length} slot{slots.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex overflow-hidden rounded-sm border border-[var(--depot-hairline)]">
              <button
                type="button"
                className={`px-2.5 py-1 text-[10px] uppercase tracking-wider ${
                  viewMode === 'list'
                    ? 'bg-[var(--depot-ink)] text-white'
                    : 'bg-[var(--depot-surface)] text-[var(--depot-faint)]'
                }`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button
                type="button"
                className={`px-2.5 py-1 text-[10px] uppercase tracking-wider ${
                  viewMode === 'grid'
                    ? 'bg-[var(--depot-ink)] text-white'
                    : 'bg-[var(--depot-surface)] text-[var(--depot-faint)]'
                }`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <div className="min-w-[1120px]">
              {/* Header */}
              <div
                className="manifest-header"
                style={{ gridTemplateColumns: LIST_VIEW_COLUMNS }}
              >
                <span>#</span>
                <span>Flat</span>
                <span>Collection</span>
                <span>Product Type</span>
                <span>Colors</span>
                <span>Gender</span>
                <span>Concept</span>
                <span className="text-right">Status</span>
              </div>

              {/* Rows */}
              {displaySlots.map((slot, i) => {
                const concept = slot.skuConcept
                const snapshot = concept?.metadataSnapshot
                const isSelected = selectedSlot?.id === slot.id && isOpen
                const slotColors = slot.colorwayIds
                  .map((colorId) => colorById.get(colorId))
                  .filter((color): color is ColorOption => !!color)

                return (
                  <button
                    key={slot.id}
                    type="button"
                    className={`manifest-row w-full text-left px-2 ${
                      isSelected
                        ? 'bg-[var(--depot-surface-alt)] outline outline-1 outline-[var(--depot-ink)]'
                        : ''
                    }`}
                    style={{ gridTemplateColumns: LIST_VIEW_COLUMNS }}
                    data-selected={isSelected}
                    onClick={() => openSlotDetail(slot)}
                  >
                    <span className="text-[11px] font-light text-[var(--depot-faint)] tabular-nums tracking-wider w-6">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="w-10 h-10 rounded-sm bg-white overflow-hidden">
                      <InlineSvg
                        src={slot.frontFlat}
                        alt={`${slot.productType.name} front flat`}
                        className="w-full h-full p-1"
                        hideLayers={['GRID', 'ANNOTATION']}
                      />
                    </div>

                    <div>
                      <p
                        className={`manifest-name ${!slot.collection ? 'text-[var(--depot-faint)] italic' : ''}`}
                      >
                        {slot.collection ? slot.collection.name : 'Unassigned'}
                      </p>
                      {slot.replacementFlag && (
                        <p className="text-[9px] text-amber-600 uppercase tracking-wider">
                          Replacement
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] text-[var(--depot-ink-light)] tracking-wide">
                        {slot.productType.name}
                      </p>
                      <p className="text-[9px] text-[var(--depot-faint)] tracking-wide">
                        {slot.productType.subcategory.category.name} /{' '}
                        {slot.productType.subcategory.name}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      {slotColors.length > 0 ? (
                        <>
                          {slotColors.slice(0, 6).map((color) => (
                            <span
                              key={color.id}
                              className="h-3 w-3 rounded-[2px] border border-[var(--depot-hairline)]"
                              style={{ backgroundColor: color.hex ?? '#e5e7eb' }}
                              title={color.title}
                            />
                          ))}
                          {slotColors.length > 6 && (
                            <span className="text-[9px] text-[var(--depot-faint)] tabular-nums">
                              +{slotColors.length - 6}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] text-[var(--depot-faint)]">—</span>
                      )}
                    </div>

                    <p className="text-[11px] text-[var(--depot-ink-light)] tracking-wide">
                      {slot.audienceGender?.label ?? '—'}
                    </p>

                    <div>
                      {concept ? (
                        <Link
                          href={`/internal/product/concepts/${concept.id}`}
                          className="text-[11px] text-[var(--depot-ink)] underline-offset-2 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(snapshot?.title as string) ?? 'Untitled Concept'}
                        </Link>
                      ) : (
                        <span className="text-[11px] text-[var(--depot-faint)]">—</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {concept && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider ${conceptStatusColors[concept.status] ?? ''}`}
                        >
                          {concept.status}
                        </span>
                      )}
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider ${slotStatusColors[slot.status] ?? ''}`}
                      >
                        {slot.status}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
            </div>
          ) : (
            <div
              className="grid gap-4 justify-center sm:justify-start"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 240px))' }}
            >
              {displaySlots.map((slot) => {
                const concept = slot.skuConcept
                const snapshot = concept?.metadataSnapshot
                const isSelected = selectedSlot?.id === slot.id && isOpen
                const slotColors = slot.colorwayIds
                  .map((colorId) => colorById.get(colorId))
                  .filter((color): color is ColorOption => !!color)

                return (
                  <button
                    key={slot.id}
                    type="button"
                    className={`pillar-block text-left p-3 transition-colors ${
                      isSelected
                        ? 'outline outline-1 outline-[var(--depot-ink)] bg-[var(--depot-surface-alt)]'
                        : 'hover:border-[var(--depot-ink)]'
                    }`}
                    data-selected={isSelected}
                    onClick={() => openSlotDetail(slot)}
                  >
                    <div className="aspect-square w-full rounded-sm bg-white overflow-hidden mb-3">
                      <InlineSvg
                        src={slot.frontFlat}
                        alt={`${slot.productType.name} front flat`}
                        className="w-full h-full p-2"
                        hideLayers={['GRID', 'ANNOTATION']}
                      />
                    </div>
                    <p className="manifest-name">{slot.productType.name}</p>
                    <p className="text-[10px] text-[var(--depot-faint)] mt-0.5">
                      {slot.collection?.name ?? 'Unassigned'} · {slot.audienceGender?.label ?? '—'}
                    </p>
                    <p className="text-[9px] text-[var(--depot-faint)] mt-1">
                      {slot.productType.subcategory.category.name} / {slot.productType.subcategory.name}
                    </p>
                    {slotColors.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {slotColors.slice(0, 8).map((color) => (
                          <span
                            key={color.id}
                            className="h-3.5 w-3.5 rounded-[2px] border border-[var(--depot-hairline)]"
                            style={{ backgroundColor: color.hex ?? '#e5e7eb' }}
                            title={color.title}
                          />
                        ))}
                        {slotColors.length > 8 && (
                          <span className="text-[9px] text-[var(--depot-faint)] tabular-nums">
                            +{slotColors.length - 8}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                      {concept && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider ${conceptStatusColors[concept.status] ?? ''}`}
                        >
                          {concept.status}
                        </span>
                      )}
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider ${slotStatusColors[slot.status] ?? ''}`}
                      >
                        {slot.status}
                      </span>
                    </div>
                    {concept && (
                      <div className="mt-2">
                        <Link
                          href={`/internal/product/concepts/${concept.id}`}
                          className="text-[11px] text-[var(--depot-ink)] underline-offset-2 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(snapshot?.title as string) ?? 'Untitled Concept'}
                        </Link>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </>
  )
}
