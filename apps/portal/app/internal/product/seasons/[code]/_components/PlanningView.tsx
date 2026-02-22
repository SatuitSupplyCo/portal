"use client"

import { AssortmentMixSection } from "../AssortmentMixSection"
import type { DimensionConfig } from "../PlanningTargetsPanel"
import type { DimensionOptions } from "../_data/load-season"

interface PlanningViewProps {
  assortmentDimensions: DimensionConfig[]
  activeSlotsCount: number
  seasonId: string
  seasonName: string
  currentTargetSlotCount: number | null
  categoryTargets: Record<string, number>
  constructionTargets: Record<string, number>
  weightClassTargets: Record<string, number>
  sellingWindowTargets: Record<string, number>
  tenureTargets: Record<string, number>
  useCaseTargets: Record<string, number>
  genderTargets: Record<string, number>
  ageGroupTargets: Record<string, number>
  dimensionOptions: DimensionOptions
  seasonContext: {
    code: string
    name: string
    type: string
    description: string | null
    launchDate: string | null
    targetSlotCount: number | null
    marginTarget: number | null
    targetEvergreenPct: number | null
  }
  allDimensionTargets: Record<string, Record<string, number>>
  brandBrief: string | null
  collectionBriefs: Array<{ name: string; brief: string; slotCount: number }>
  slotSummary: { totalSlots: number; filledSlots: number; openSlots: number }
  glossary: Record<string, { slug: string; term: string; definition: string }>
}

export function PlanningView({
  assortmentDimensions,
  activeSlotsCount,
  seasonId,
  seasonName,
  currentTargetSlotCount,
  categoryTargets,
  constructionTargets,
  weightClassTargets,
  sellingWindowTargets,
  tenureTargets,
  useCaseTargets,
  genderTargets,
  ageGroupTargets,
  dimensionOptions,
  seasonContext,
  allDimensionTargets,
  brandBrief,
  collectionBriefs,
  slotSummary,
  glossary,
}: PlanningViewProps) {
  return (
    <section className="px-12 py-6 border-b border-[var(--depot-border)]">
      <AssortmentMixSection
        dimensions={assortmentDimensions}
        totalSlots={activeSlotsCount}
        seasonId={seasonId}
        seasonName={seasonName}
        currentTargetSlotCount={currentTargetSlotCount ?? 0}
        currentCategoryTargets={categoryTargets}
        currentConstructionTargets={constructionTargets}
        currentWeightClassTargets={weightClassTargets}
        currentSellingWindowTargets={sellingWindowTargets}
        currentTenureTargets={tenureTargets}
        currentUseCaseTargets={useCaseTargets}
        currentGenderTargets={genderTargets}
        currentAgeGroupTargets={ageGroupTargets}
        dimensionOptions={dimensionOptions}
        seasonContext={seasonContext}
        allDimensionTargets={allDimensionTargets}
        brandBrief={brandBrief}
        collectionBriefs={collectionBriefs}
        slotSummary={slotSummary}
        glossary={glossary}
      />
    </section>
  )
}
