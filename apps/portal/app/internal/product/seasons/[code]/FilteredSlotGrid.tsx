'use client'

import { useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useDimensionFilter } from './DimensionFilterProvider'
import { SlotDetailPanel } from './SlotDetailPanel'
import { useShell } from '@/components/shell/ShellProvider'
import type { TaxonomyCategory, TaxonomyDimension } from './AddSlotDialog'
import type { ColorOption } from './SlotColorPicker'

// ─── Types ──────────────────────────────────────────────────────────

export interface SlotGridEntry {
  id: string
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
  const { setRightRailContent, setRightRailOpen, rightRailOpen } = useShell()

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
          {isFiltered && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">
                Filtered by
              </span>
              <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                {DIMENSION_LABELS[filter.dimensionKey] ?? filter.dimensionKey}: {filterLabel}
              </span>
              <span className="text-[10px] text-[var(--depot-faint)] tabular-nums">
                {displaySlots.length} of {slots.length} slot{slots.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {/* Header */}
              <div
                className="manifest-header"
                style={{ gridTemplateColumns: 'auto 1fr 1fr auto auto auto' }}
              >
                <span>#</span>
                <span>Collection</span>
                <span>Product Type</span>
                <span>Gender</span>
                <span>Concept</span>
                <span className="text-right">Status</span>
              </div>

              {/* Rows */}
              {displaySlots.map((slot, i) => {
                const concept = slot.skuConcept
                const snapshot = concept?.metadataSnapshot

                return (
                  <button
                    key={slot.id}
                    type="button"
                    className="manifest-row w-full text-left"
                    style={{ gridTemplateColumns: 'auto 1fr 1fr auto auto auto' }}
                    data-selected={selectedSlot?.id === slot.id && isOpen}
                    onClick={() => openSlotDetail(slot)}
                  >
                    <span className="text-[11px] font-light text-[var(--depot-faint)] tabular-nums tracking-wider w-6">
                      {String(i + 1).padStart(2, '0')}
                    </span>

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
        </>
      )}
    </>
  )
}
