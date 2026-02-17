'use client'

import { useState, useCallback } from 'react'
import { Pencil } from 'lucide-react'
import { PlanningTargetsPanel, type DimensionConfig } from './PlanningTargetsPanel'
import { EditTargetsDialog, type EditTargetsTab, type DimensionOption } from './EditTargetsDialog'
import { useDimensionFilter } from './DimensionFilterProvider'

// ─── Dimension key → dialog tab mapping ──────────────────────────────

const TAB_MAP: Record<string, EditTargetsTab> = {
  category: 'category',
  construction: 'construction',
  weightClass: 'weightClass',
  sellingWindow: 'sellingWindow',
  tenure: 'tenure',
  useCase: 'useCase',
  gender: 'gender',
  ageGroup: 'ageGroup',
}

// ─── Types ──────────────────────────────────────────────────────────

interface AssortmentMixSectionProps {
  dimensions: DimensionConfig[]
  totalSlots: number
  seasonId: string
  seasonName: string
  currentTargetSlotCount: number
  currentCategoryTargets: Record<string, number>
  currentConstructionTargets: Record<string, number>
  currentWeightClassTargets: Record<string, number>
  currentSellingWindowTargets: Record<string, number>
  currentTenureTargets: Record<string, number>
  currentUseCaseTargets: Record<string, number>
  currentGenderTargets: Record<string, number>
  currentAgeGroupTargets: Record<string, number>
  dimensionOptions: {
    category: DimensionOption[]
    construction: DimensionOption[]
    weightClass: DimensionOption[]
    sellingWindow: DimensionOption[]
    tenure: DimensionOption[]
    useCase: DimensionOption[]
    gender: DimensionOption[]
    ageGroup: DimensionOption[]
  }
}

// ─── Component ──────────────────────────────────────────────────────

export function AssortmentMixSection({
  dimensions,
  totalSlots,
  seasonId,
  seasonName,
  currentTargetSlotCount,
  currentCategoryTargets,
  currentConstructionTargets,
  currentWeightClassTargets,
  currentSellingWindowTargets,
  currentTenureTargets,
  currentUseCaseTargets,
  currentGenderTargets,
  currentAgeGroupTargets,
  dimensionOptions,
}: AssortmentMixSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTab, setDialogTab] = useState<EditTargetsTab>('category')
  const [dialogFocus, setDialogFocus] = useState<EditTargetsTab | undefined>(undefined)

  const { filter, setFilter } = useDimensionFilter()

  // Global: show all dimension tabs, start on category
  const openAll = useCallback(() => {
    setDialogTab('category')
    setDialogFocus(undefined)
    setDialogOpen(true)
  }, [])

  // Per-dimension: show only Overall + that dimension
  const handleEditTargets = useCallback(
    (dimensionKey: string) => {
      const tab = TAB_MAP[dimensionKey] ?? 'category'
      setDialogTab(tab)
      setDialogFocus(tab)
      setDialogOpen(true)
    },
    [],
  )

  const handleFilterSelect = useCallback(
    (dimensionKey: string, valueCode: string) => {
      setFilter({ dimensionKey, valueCode })
    },
    [setFilter],
  )

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <p className="depot-label" style={{ marginBottom: 0 }}>
          Assortment Mix
        </p>
        <button
          type="button"
          onClick={openAll}
          className="text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
          title="Edit Assortment Targets"
        >
          <Pencil className="h-3 w-3" />
        </button>
      </div>

      {/* Dimension breakdown with per-dimension CTAs */}
      <PlanningTargetsPanel
        dimensions={dimensions}
        totalSlots={totalSlots}
        targetSlotCount={currentTargetSlotCount}
        onEditTargets={handleEditTargets}
        selectedFilter={filter}
        onFilterSelect={handleFilterSelect}
      />

      {/* Single shared dialog instance */}
      <EditTargetsDialog
        seasonId={seasonId}
        seasonName={seasonName}
        currentTargetSlotCount={currentTargetSlotCount}
        currentCategoryTargets={currentCategoryTargets}
        currentConstructionTargets={currentConstructionTargets}
        currentWeightClassTargets={currentWeightClassTargets}
        currentSellingWindowTargets={currentSellingWindowTargets}
        currentTenureTargets={currentTenureTargets}
        currentUseCaseTargets={currentUseCaseTargets}
        currentGenderTargets={currentGenderTargets}
        currentAgeGroupTargets={currentAgeGroupTargets}
        dimensionOptions={dimensionOptions}
        initialTab={dialogTab}
        focusedDimension={dialogFocus}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
