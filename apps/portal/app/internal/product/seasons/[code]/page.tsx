import type { Metadata } from "next"
import Link from "next/link"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { AddSlotDialog } from "./AddSlotDialog"
import { SeasonColorPicker } from "./SeasonColorPicker"
import { DimensionFilterProvider } from "./DimensionFilterProvider"
import { FilteredSlotGrid } from "./FilteredSlotGrid"
import { InfoTooltip } from "@/components/InfoTooltip"
import { loadSeasonData } from "./_data/load-season"
import { SeasonHeader } from "./_components/SeasonHeader"
import { PlanningView } from "./_components/PlanningView"
import { ExecutionView } from "./_components/ExecutionView"

// ─── Metadata ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<Metadata> {
  const { code } = await params
  return { title: `${code} Season | Satuit Supply Co.` }
}

// ─── Page ────────────────────────────────────────────────────────────

export default async function SeasonDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const data = await loadSeasonData(code)

  const {
    season,
    glossary,
    productHierarchy,
    collectionsDimension,
    constructionsDimension,
    weightClassesDimension,
    fitBlocksDimension,
    sizeScalesDimension,
    useCasesDimension,
    gendersDimension,
    ageGroupsDimension,
    sellingWindowsDimension,
    assortmentTenuresDimension,
    taxonomyCollections,
    taxonomyGenders,
    taxonomyAgeGroups,
    taxonomySellingWindows,
    taxonomyAssortmentTenures,
    seasonColorData,
    currentColorIds,
    pickerOptions,
    proposedForSeasonIds,
    activeSlots,
    filledSlots,
    openSlots,
    slotFilterData,
    slotGridEntries,
    allDimensionLabels,
    assortmentDimensions,
    dimensionOptions,
    categoryTargets,
    constructionTargets,
    weightClassTargets,
    sellingWindowTargets,
    tenureTargets,
    useCaseTargets,
    genderTargets,
    ageGroupTargets,
  } = data

  const isPlanning = season.status === "planning"

  const colCounts: Record<string, number> = {}
  for (const slot of activeSlots) {
    const slotCol = slot.collection?.code
    if (slotCol) colCounts[slotCol] = (colCounts[slotCol] ?? 0) + 1
  }
  const collectionBriefs = taxonomyCollections
    .filter((c) => colCounts[c.code] && c.contextBrief)
    .map((c) => ({ name: c.name, brief: c.contextBrief!, slotCount: colCounts[c.code] ?? 0 }))

  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Product", href: "/internal/product" },
        { label: "Seasons", href: "/internal/product/seasons" },
        { label: season.name },
      ]}
    >
      <main className="flex-1 overflow-y-auto" style={{ fontFamily: "var(--depot-font)" }}>
        <SeasonHeader
          season={season}
          seasonColorData={seasonColorData}
          glossary={glossary}
          isPlanning={isPlanning}
          activeSlotsCount={activeSlots.length}
          filledSlotsCount={filledSlots.length}
          openSlotsCount={openSlots.length}
          evergreenPct={data.evergreenPct}
          evergreenCount={data.evergreenCount}
        />

        <DimensionFilterProvider slotFilterData={slotFilterData}>
          {isPlanning ? (
            <PlanningView
              assortmentDimensions={assortmentDimensions}
              activeSlotsCount={activeSlots.length}
              seasonId={season.id}
              seasonName={season.name}
              currentTargetSlotCount={season.targetSkuCount}
              categoryTargets={categoryTargets}
              constructionTargets={constructionTargets}
              weightClassTargets={weightClassTargets}
              sellingWindowTargets={sellingWindowTargets}
              tenureTargets={tenureTargets}
              useCaseTargets={useCaseTargets}
              genderTargets={genderTargets}
              ageGroupTargets={ageGroupTargets}
              dimensionOptions={dimensionOptions}
              seasonContext={{
                code: season.code,
                name: season.name,
                type: season.seasonType,
                description: season.description ?? null,
                launchDate: season.launchDate?.toISOString().split("T")[0] ?? null,
                targetSlotCount: season.targetSkuCount ?? 0,
                marginTarget: season.marginTarget ? Number(season.marginTarget) : null,
                targetEvergreenPct: season.targetEvergreenPct ?? null,
              }}
              allDimensionTargets={{
                category: categoryTargets,
                construction: constructionTargets,
                weightClass: weightClassTargets,
                sellingWindow: sellingWindowTargets,
                tenure: tenureTargets,
                useCase: useCaseTargets,
                gender: genderTargets,
                ageGroup: ageGroupTargets,
              }}
              brandBrief={data.brandContextRows[0]?.contextBrief ?? null}
              collectionBriefs={collectionBriefs}
              slotSummary={{
                totalSlots: activeSlots.length,
                filledSlots: filledSlots.length,
                openSlots: openSlots.length,
              }}
              glossary={glossary}
            />
          ) : (
            <ExecutionView
              season={season}
              filledSlotsCount={filledSlots.length}
              openSlotsCount={openSlots.length}
              fillRate={data.fillRate}
              complexityUsed={data.complexityUsed}
              collectionMix={data.collectionMix}
              unassignedCount={data.unassignedCount}
              mixTargets={data.mixTargets}
              COLLECTION_LABELS={data.COLLECTION_LABELS}
              glossary={glossary}
            />
          )}

          <section className="px-12 py-6 border-b border-[var(--depot-border)]">
            <SeasonColorPicker
              seasonId={season.id}
              seasonName={season.name}
              currentColorIds={currentColorIds}
              allColorEntries={pickerOptions}
              proposedForSeasonIds={proposedForSeasonIds}
              seasonOptions={data.seasonOptions}
              collectionOptions={collectionsDimension.map((c) => ({ id: c.id, name: c.label }))}
              seasonColorData={seasonColorData}
              totalConcepts={filledSlots.length}
            />
          </section>

          <section className="px-12 py-8 border-b border-[var(--depot-border)]">
            <div className="flex items-center justify-between mb-6">
              <p className="depot-label flex items-center gap-1.5" style={{ marginBottom: 0 }}>
                Season Slots
                <InfoTooltip slug="season-slot" glossary={glossary} />
              </p>
              <AddSlotDialog
                seasonId={season.id}
                seasonName={season.name}
                productHierarchy={productHierarchy}
                collections={collectionsDimension}
                constructions={constructionsDimension}
                weightClasses={weightClassesDimension}
                fitBlocks={fitBlocksDimension}
                sizeScales={sizeScalesDimension}
                useCases={useCasesDimension}
                audienceGenders={gendersDimension}
                audienceAgeGroups={ageGroupsDimension}
                sellingWindows={sellingWindowsDimension}
                assortmentTenures={assortmentTenuresDimension}
                colorOptions={pickerOptions}
                seasonColorIds={currentColorIds}
                proposedColorIds={proposedForSeasonIds}
              />
            </div>

            <FilteredSlotGrid
              slots={slotGridEntries}
              allDimensionLabels={allDimensionLabels}
              colorOptions={pickerOptions}
              editProps={
                isPlanning
                  ? {
                      seasonName: season.name,
                      productHierarchy,
                      collections: collectionsDimension,
                      constructions: constructionsDimension,
                      weightClasses: weightClassesDimension,
                      fitBlocks: fitBlocksDimension,
                      sizeScales: sizeScalesDimension,
                      useCases: useCasesDimension,
                      audienceGenders: gendersDimension,
                      audienceAgeGroups: ageGroupsDimension,
                      sellingWindows: sellingWindowsDimension,
                      assortmentTenures: assortmentTenuresDimension,
                      seasonColorIds: currentColorIds,
                      proposedColorIds: proposedForSeasonIds,
                      dimensionIdLookup: {
                        genders: Object.fromEntries(data.taxonomyGenders.map((g) => [g.code, g.id])),
                        ageGroups: Object.fromEntries(data.taxonomyAgeGroups.map((a) => [a.code, a.id])),
                        sellingWindows: Object.fromEntries(data.taxonomySellingWindows.map((s) => [s.code, s.id])),
                        assortmentTenures: Object.fromEntries(
                          data.taxonomyAssortmentTenures.map((a) => [a.code, a.id])
                        ),
                        collections: Object.fromEntries(data.taxonomyCollections.map((c) => [c.code, c.id])),
                      },
                    }
                  : undefined
              }
            />
          </section>
        </DimensionFilterProvider>

        {data.coreRefs.length > 0 && (
          <section className="px-12 py-8">
            <p className="depot-label mb-6 flex items-center gap-1.5">
              Evergreen Programs
              <InfoTooltip slug="core-program" glossary={glossary} />
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {data.coreRefs.map((ref) => (
                <Link key={ref.id} href={`/internal/product/core/${ref.coreProgramId}`} className="block">
                  <div className="pillar-block group hover:border-[var(--depot-ink)] transition-colors cursor-pointer">
                    <p className="depot-subheading text-xs mb-2">{ref.coreProgram.name}</p>
                    {(ref.selectedColorways as string[])?.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {(ref.selectedColorways as string[]).map((color) => (
                          <div
                            key={color}
                            className="w-5 h-5 rounded-sm border border-[var(--depot-hairline)]"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </DocPageShell>
  )
}
