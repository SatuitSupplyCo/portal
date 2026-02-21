import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import { hasResourceAccess } from "@/lib/permissions"
import {
  seasons,
  studioEntries,
  productCategories,
  collections as collectionsTable,
  audienceGenders as audienceGendersTable,
  audienceAgeGroups as audienceAgeGroupsTable,
  sellingWindows as sellingWindowsTable,
  assortmentTenures as assortmentTenuresTable,
  materialWeightClasses as materialWeightClassesTable,
  useCases as useCasesTable,
  constructions as constructionsTable,
  fitBlocks as fitBlocksTable,
  sizeScales as sizeScalesTable,
  brandContext as brandContextTable,
} from "@repo/db/schema"
import { eq, asc } from "drizzle-orm"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { AddSlotDialog } from "./AddSlotDialog"
import { AssortmentMixSection } from "./AssortmentMixSection"
import { SeasonPlanSection } from "./SeasonPlanSection"
import { type DimensionConfig } from "./PlanningTargetsPanel"
import { type SeasonColorEntry } from "./SeasonColorPalette"
import { SeasonColorPicker } from "./SeasonColorPicker"
import { DimensionFilterProvider, type SlotFilterDatum } from "./DimensionFilterProvider"
import { FilteredSlotGrid, type SlotGridEntry } from "./FilteredSlotGrid"
import { InfoTooltip, type GlossaryEntry } from "@/components/InfoTooltip"
import { glossaryTerms } from "@repo/db/schema"

// ─── Metadata ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<Metadata> {
  const { code } = await params
  return { title: `${code} Season | Satuit Supply Co.` }
}

const seasonStatusColors: Record<string, string> = {
  planning: "bg-amber-100 text-amber-800",
  locked: "bg-blue-100 text-blue-800",
  active: "bg-emerald-100 text-emerald-800",
  closed: "bg-zinc-100 text-zinc-500",
}

// ─── Helpers ────────────────────────────────────────────────────────

type SlotWithTaxonomy = {
  status: string
  audienceGender: { code: string; label: string } | null
  audienceAgeGroup: { code: string; label: string } | null
  sellingWindow: { code: string; label: string } | null
  assortmentTenure: { code: string; label: string } | null
  productType: {
    code: string
    name: string
    subcategory: { code: string; name: string; category: { code: string; name: string } }
  }
  collection: { code: string; name: string } | null
  skuConcept: {
    materialWeightClass: { code: string; label: string } | null
    useCase: { code: string; label: string } | null
    construction: { code: string; label: string } | null
    metadataSnapshot: unknown
  } | null
}

function increment(map: Record<string, number>, key: string) {
  map[key] = (map[key] || 0) + 1
}

function computeAssortmentMix(slots: SlotWithTaxonomy[]) {
  const category: Record<string, number> = {}
  const construction: Record<string, number> = {}
  const weightClass: Record<string, number> = {}
  const sellingWindow: Record<string, number> = {}
  const tenure: Record<string, number> = {}
  const useCase: Record<string, number> = {}
  const gender: Record<string, number> = {}
  const ageGroup: Record<string, number> = {}

  for (const slot of slots) {
    // Slot-level dimensions
    increment(category, slot.productType.subcategory.category.code)
    if (slot.audienceGender?.code) increment(gender, slot.audienceGender.code)
    if (slot.audienceAgeGroup?.code) increment(ageGroup, slot.audienceAgeGroup.code)
    if (slot.sellingWindow?.code) increment(sellingWindow, slot.sellingWindow.code)
    if (slot.assortmentTenure?.code) increment(tenure, slot.assortmentTenure.code)

    // Concept-level dimensions (filled slots only)
    if (slot.skuConcept?.construction?.code) increment(construction, slot.skuConcept.construction.code)
    if (slot.skuConcept?.materialWeightClass?.code) increment(weightClass, slot.skuConcept.materialWeightClass.code)
    if (slot.skuConcept?.useCase?.code) increment(useCase, slot.skuConcept.useCase.code)
  }

  return { category, construction, weightClass, sellingWindow, tenure, useCase, gender, ageGroup }
}

// ─── Page ────────────────────────────────────────────────────────────

export default async function SeasonDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  const season = await db.query.seasons.findFirst({
    where: eq(seasons.code, code.toUpperCase()),
    with: {
      slots: {
        with: {
          productType: {
            with: { subcategory: { with: { category: true } } },
          },
          collection: true,
          audienceGender: true,
          audienceAgeGroup: true,
          sellingWindow: true,
          assortmentTenure: true,
          skuConcept: {
            with: {
              sourceStudioEntry: true,
              construction: true,
              materialWeightClass: true,
              useCase: true,
            },
          },
        },
      },
      coreRefs: {
        with: { coreProgram: true },
      },
      colors: {
        with: { studioEntry: true },
        orderBy: (c, { asc: a }) => [a(c.sortOrder)],
      },
    },
  })

  if (!season) notFound()

  // Check resource-level access
  const session = await auth()
  if (session?.user) {
    const user = {
      id: session.user.id,
      role: session.user.role,
      permissions: session.user.permissions ?? [],
      orgId: session.user.orgId,
    }
    const canAccess = await hasResourceAccess(user, 'season', season.id)
    if (!canAccess) notFound()
  }

  // Fetch taxonomy data for AddSlotDialog and Assortment Mix
  const [
    taxonomyCategories,
    taxonomyCollections,
    taxonomyGenders,
    taxonomyAgeGroups,
    taxonomySellingWindows,
    taxonomyAssortmentTenures,
    taxonomyWeightClasses,
    taxonomyUseCases,
    taxonomyConstructions,
    taxonomyFitBlocks,
    taxonomySizeScales,
    allSeasons,
    brandContextRows,
    glossaryRows,
  ] = await Promise.all([
    db.query.productCategories.findMany({
      with: {
        subcategories: {
          with: { productTypes: { orderBy: (pt, { asc: a }) => [a(pt.sortOrder)] } },
          orderBy: (sc, { asc: a }) => [a(sc.sortOrder)],
        },
      },
      orderBy: (c, { asc: a }) => [a(c.sortOrder)],
    }),
    db.select().from(collectionsTable).orderBy(asc(collectionsTable.sortOrder)),
    db.select().from(audienceGendersTable).orderBy(asc(audienceGendersTable.sortOrder)),
    db.select().from(audienceAgeGroupsTable).orderBy(asc(audienceAgeGroupsTable.sortOrder)),
    db.select().from(sellingWindowsTable).orderBy(asc(sellingWindowsTable.sortOrder)),
    db.select().from(assortmentTenuresTable).orderBy(asc(assortmentTenuresTable.sortOrder)),
    db.select().from(materialWeightClassesTable).orderBy(asc(materialWeightClassesTable.sortOrder)),
    db.select().from(useCasesTable).orderBy(asc(useCasesTable.sortOrder)),
    db.select().from(constructionsTable).orderBy(asc(constructionsTable.sortOrder)),
    db.select().from(fitBlocksTable).orderBy(asc(fitBlocksTable.sortOrder)),
    db.select().from(sizeScalesTable).orderBy(asc(sizeScalesTable.sortOrder)),
    db.query.seasons.findMany({ orderBy: (s, { desc }) => [desc(s.createdAt)] }),
    db.query.brandContext.findMany({ limit: 1 }),
    db.select().from(glossaryTerms),
  ])

  const glossary: Record<string, GlossaryEntry> = Object.fromEntries(
    glossaryRows.map((t) => [t.slug, { slug: t.slug, term: t.term, definition: t.definition }]),
  )

  const productHierarchy = taxonomyCategories.map((cat) => ({
    id: cat.id,
    code: cat.code,
    name: cat.name,
    subcategories: cat.subcategories.map((sub) => ({
      id: sub.id,
      code: sub.code,
      name: sub.name,
      productTypes: sub.productTypes.map((pt) => ({
        id: pt.id,
        code: pt.code,
        name: pt.name,
      })),
    })),
  }))

  const toDimension = (r: { id: string; code: string; label: string }) => ({
    id: r.id,
    code: r.code,
    label: r.label,
  })
  const collectionsDimension = taxonomyCollections.map((c) => ({
    id: c.id,
    code: c.code,
    label: c.name,
  }))
  const gendersDimension = taxonomyGenders.map(toDimension)
  const ageGroupsDimension = taxonomyAgeGroups.map(toDimension)
  const sellingWindowsDimension = taxonomySellingWindows.map(toDimension)
  const assortmentTenuresDimension = taxonomyAssortmentTenures.map(toDimension)
  const constructionsDimension = taxonomyConstructions.map(toDimension)
  const weightClassesDimension = taxonomyWeightClasses.map(toDimension)
  const fitBlocksDimension = taxonomyFitBlocks.map(toDimension)
  const useCasesDimension = taxonomyUseCases.map(toDimension)
  const sizeScalesDimension = taxonomySizeScales.map((s) => ({
    id: s.id,
    code: s.code,
    label: s.label,
  }))

  // Build label lookup maps from taxonomy data
  const COLLECTION_LABELS: Record<string, string> = Object.fromEntries(
    taxonomyCollections.map((c) => [c.code, c.name]),
  )
  const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
    taxonomyCategories.map((c) => [c.code, c.name]),
  )
  const CONSTRUCTION_LABELS: Record<string, string> = Object.fromEntries(
    taxonomyConstructions.map((c) => [c.code, c.label]),
  )
  const WEIGHT_CLASS_LABELS: Record<string, string> = Object.fromEntries(
    taxonomyWeightClasses.map((w) => [w.code, w.label]),
  )
  const SELLING_WINDOW_LABELS: Record<string, string> = Object.fromEntries(
    taxonomySellingWindows.map((s) => [s.code, s.label]),
  )
  const TENURE_LABELS: Record<string, string> = Object.fromEntries(
    taxonomyAssortmentTenures.map((a) => [a.code, a.label]),
  )
  const USE_CASE_LABELS: Record<string, string> = Object.fromEntries(
    taxonomyUseCases.map((u) => [u.code, u.label]),
  )
  const GENDER_LABELS: Record<string, string> = Object.fromEntries(
    taxonomyGenders.map((g) => [g.code, g.label]),
  )
  const AGE_GROUP_LABELS: Record<string, string> = Object.fromEntries(
    taxonomyAgeGroups.map((a) => [a.code, a.label]),
  )

  const seasonOptions = allSeasons.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
  }))

  // Fetch all color entries for the picker
  const allColorEntries = await db.query.studioEntries.findMany({
    where: eq(studioEntries.category, 'color'),
    orderBy: (e, { desc }) => [desc(e.createdAt)],
  })

  // IDs of colors proposed for this season (targeted in Studio)
  const proposedForSeasonIds = allColorEntries
    .filter((e) => e.targetSeasonId === season.id)
    .map((e) => e.id)

  // Build color data for palette component
  const seasonColorData: SeasonColorEntry[] = season.colors.map((c) => ({
    id: c.id,
    studioEntryId: c.studioEntryId,
    status: c.status as 'confirmed' | 'proposed',
    sortOrder: c.sortOrder,
    studioEntry: {
      id: c.studioEntry.id,
      title: c.studioEntry.title,
      categoryMetadata: c.studioEntry.categoryMetadata as Record<string, unknown> | null,
      tags: c.studioEntry.tags as string[] | null,
    },
    skuCount: 0,
  }))

  const currentColorIds = season.colors.map((c) => c.studioEntryId)

  const pickerOptions = allColorEntries.map((e) => {
    const meta = e.categoryMetadata as Record<string, unknown> | null
    return {
      id: e.id,
      title: e.title,
      hex: typeof meta?.hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(meta.hex) ? meta.hex : null,
      pantone: typeof meta?.pantone === 'string' ? meta.pantone : null,
      tags: (e.tags as string[]) ?? [],
      targetSeasonId: e.targetSeasonId,
    }
  })

  const activeSlots = season.slots.filter(s => s.status !== 'removed')
  const filledSlots = activeSlots.filter(s => s.status === 'filled')
  const openSlots = activeSlots.filter(s => s.status === 'open')
  const fillRate = activeSlots.length > 0
    ? Math.round((filledSlots.length / activeSlots.length) * 100)
    : 0

  // Collection mix (only count slots that have a collection assigned)
  const collectionMix: Record<string, { filled: number; total: number }> = {}
  const unassignedCount = activeSlots.filter(s => !s.collection).length
  for (const slot of activeSlots) {
    const col = slot.collection?.code
    if (!col) continue
    if (!collectionMix[col]) {
      collectionMix[col] = { filled: 0, total: 0 }
    }
    collectionMix[col].total++
    if (slot.status === 'filled') collectionMix[col].filled++
  }

  // Complexity (actual sum)
  const complexityUsed = filledSlots.reduce((sum, slot) => {
    const snapshot = slot.skuConcept?.metadataSnapshot as Record<string, unknown> | undefined
    return sum + ((snapshot?.estimatedComplexity as number) ?? 0)
  }, 0)

  // Compute Assortment Mix actuals
  const mix = computeAssortmentMix(activeSlots)
  const categoryTargets = (season.categoryTargets as Record<string, number>) ?? {}
  const constructionTargets = (season.constructionTargets as Record<string, number>) ?? {}
  const weightClassTargets = (season.weightClassTargets as Record<string, number>) ?? {}
  const sellingWindowTargets = (season.sellingWindowTargets as Record<string, number>) ?? {}
  const tenureTargets = (season.tenureTargets as Record<string, number>) ?? {}
  const useCaseTargets = (season.useCaseTargets as Record<string, number>) ?? {}
  const genderTargets = (season.genderTargets as Record<string, number>) ?? {}
  const ageGroupTargets = (season.ageGroupTargets as Record<string, number>) ?? {}
  const mixTargets = (season.mixTargets as Record<string, number>) ?? {}

  // Evergreen % for Season Plan (tenure = evergreen or multi_season)
  const evergreenCount = (mix.tenure['evergreen'] ?? 0) + (mix.tenure['multi_season'] ?? 0)
  const evergreenPct = activeSlots.length > 0
    ? Math.round((evergreenCount / activeSlots.length) * 100)
    : 0

  const assortmentDimensions: DimensionConfig[] = [
    { key: 'category', label: 'Category', targets: categoryTargets, actuals: { counts: mix.category, pcts: {} }, labels: CATEGORY_LABELS, editTab: 'category' },
    { key: 'construction', label: 'Construction', targets: constructionTargets, actuals: { counts: mix.construction, pcts: {} }, labels: CONSTRUCTION_LABELS, editTab: 'construction' },
    { key: 'weightClass', label: 'Weight', targets: weightClassTargets, actuals: { counts: mix.weightClass, pcts: {} }, labels: WEIGHT_CLASS_LABELS, editTab: 'weightClass' },
    { key: 'sellingWindow', label: 'Selling Window', targets: sellingWindowTargets, actuals: { counts: mix.sellingWindow, pcts: {} }, labels: SELLING_WINDOW_LABELS, editTab: 'sellingWindow' },
    { key: 'tenure', label: 'Tenure', targets: tenureTargets, actuals: { counts: mix.tenure, pcts: {} }, labels: TENURE_LABELS, editTab: 'tenure' },
    { key: 'useCase', label: 'Use Case', targets: useCaseTargets, actuals: { counts: mix.useCase, pcts: {} }, labels: USE_CASE_LABELS, editTab: 'useCase' },
    { key: 'gender', label: 'Gender', targets: genderTargets, actuals: { counts: mix.gender, pcts: {} }, labels: GENDER_LABELS, editTab: 'gender' },
    { key: 'ageGroup', label: 'Age', targets: ageGroupTargets, actuals: { counts: mix.ageGroup, pcts: {} }, labels: AGE_GROUP_LABELS, editTab: 'ageGroup' },
  ]

  // Build dimension options for the EditTargetsDialog
  const dimensionOptions = {
    category: taxonomyCategories.map((c) => ({ key: c.code, label: c.name })),
    construction: taxonomyConstructions.map((c) => ({ key: c.code, label: c.label })),
    weightClass: taxonomyWeightClasses.map((w) => ({ key: w.code, label: w.label })),
    sellingWindow: taxonomySellingWindows.map((s) => ({ key: s.code, label: s.label })),
    tenure: taxonomyAssortmentTenures.map((a) => ({ key: a.code, label: a.label })),
    useCase: taxonomyUseCases.map((u) => ({ key: u.code, label: u.label })),
    gender: taxonomyGenders.map((g) => ({ key: g.code, label: g.label })),
    ageGroup: taxonomyAgeGroups.map((a) => ({ key: a.code, label: a.label })),
  }

  const isPlanning = season.status === 'planning'

  // Build lean slot data for DimensionFilterProvider
  const slotFilterData: SlotFilterDatum[] = activeSlots.map((slot) => ({
    id: slot.id,
    colorwayIds: (slot.colorwayIds as string[]) ?? [],
    dimensionValues: {
      category: slot.productType.subcategory.category.code,
      construction: slot.skuConcept?.construction?.code ?? null,
      weightClass: slot.skuConcept?.materialWeightClass?.code ?? null,
      sellingWindow: slot.sellingWindow?.code ?? null,
      tenure: slot.assortmentTenure?.code ?? null,
      useCase: slot.skuConcept?.useCase?.code ?? null,
      gender: slot.audienceGender?.code ?? null,
      ageGroup: slot.audienceAgeGroup?.code ?? null,
    },
  }))

  // Build serializable slot entries for FilteredSlotGrid
  const slotGridEntries: SlotGridEntry[] = activeSlots.map((slot) => ({
    id: slot.id,
    status: slot.status,
    replacementFlag: slot.replacementFlag,
    colorwayIds: (slot.colorwayIds as string[]) ?? [],
    collection: slot.collection ? { code: slot.collection.code, name: slot.collection.name } : null,
    productType: {
      code: slot.productType.code,
      name: slot.productType.name,
      subcategory: {
        code: slot.productType.subcategory.code,
        name: slot.productType.subcategory.name,
        category: {
          code: slot.productType.subcategory.category.code,
          name: slot.productType.subcategory.category.name,
        },
      },
    },
    audienceGender: slot.audienceGender ? { code: slot.audienceGender.code, label: slot.audienceGender.label } : null,
    audienceAgeGroup: slot.audienceAgeGroup ? { code: slot.audienceAgeGroup.code, label: slot.audienceAgeGroup.label } : null,
    sellingWindow: slot.sellingWindow ? { code: slot.sellingWindow.code, label: slot.sellingWindow.label } : null,
    assortmentTenure: slot.assortmentTenure ? { code: slot.assortmentTenure.code, label: slot.assortmentTenure.label } : null,
    skuConcept: slot.skuConcept
      ? {
          id: slot.skuConcept.id,
          status: slot.skuConcept.status,
          metadataSnapshot: (slot.skuConcept.metadataSnapshot as Record<string, unknown>) ?? {},
          construction: slot.skuConcept.construction ? { code: slot.skuConcept.construction.code, label: slot.skuConcept.construction.label } : null,
          materialWeightClass: slot.skuConcept.materialWeightClass ? { code: slot.skuConcept.materialWeightClass.code, label: slot.skuConcept.materialWeightClass.label } : null,
          useCase: slot.skuConcept.useCase ? { code: slot.skuConcept.useCase.code, label: slot.skuConcept.useCase.label } : null,
        }
      : null,
  }))

  // All dimension labels for the filter badge in FilteredSlotGrid
  const allDimensionLabels: Record<string, Record<string, string>> = {
    category: CATEGORY_LABELS,
    construction: CONSTRUCTION_LABELS,
    weightClass: WEIGHT_CLASS_LABELS,
    sellingWindow: SELLING_WINDOW_LABELS,
    tenure: TENURE_LABELS,
    useCase: USE_CASE_LABELS,
    gender: GENDER_LABELS,
    ageGroup: AGE_GROUP_LABELS,
  }

  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Product", href: "/internal/product" },
        { label: "Seasons", href: "/internal/product/seasons" },
        { label: season.name },
      ]}
    >
      <main className="flex-1 overflow-y-auto" style={{ fontFamily: "var(--depot-font)" }}>
        {/* ─── Header ──────────────────────────────────────────── */}
        <div className="depot-header">
          {/* Top row: title + badges */}
          <div className="flex items-center gap-3 mb-3">
            <h1 className="depot-heading text-xl">{season.name}</h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase tracking-wider ${seasonStatusColors[season.status] ?? ''}`}>
              {season.status}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase tracking-wider bg-zinc-100 text-zinc-600">
              {season.seasonType}
            </span>
          </div>

          {/* Two-column header body — stacks on small screens */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12">
            {/* Left column: narrative context */}
            <div>
              {/* Meta line: code, launch date, minor cap */}
              <div className="flex items-center gap-3 text-xs font-light text-[var(--depot-muted)] tracking-wide mb-4">
                <span>{season.code}</span>
                {season.launchDate && (
                  <>
                    <span className="text-[var(--depot-hairline)]">·</span>
                    <span>
                      Launch{' '}
                      <time dateTime={season.launchDate.toISOString()} className="font-medium text-[var(--depot-ink-light)]">
                        {season.launchDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </time>
                    </span>
                  </>
                )}
                {season.seasonType === 'minor' && season.minorMaxSkus && (
                  <>
                    <span className="text-[var(--depot-hairline)]">·</span>
                    <span className="inline-flex items-center gap-1">
                      Hard cap: {season.minorMaxSkus} SKUs
                      <InfoTooltip slug="hard-cap" glossary={glossary} />
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              {season.description && (
                <p className="text-[13px] leading-relaxed text-[var(--depot-ink-light)] mb-5">
                  {season.description}
                </p>
              )}

              {/* Color swatches */}
              {seasonColorData.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-0.5">
                    {seasonColorData.slice(0, 12).map((color) => {
                      const meta = color.studioEntry.categoryMetadata
                      const hex = meta && typeof meta.hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(meta.hex as string)
                        ? (meta.hex as string)
                        : null

                      return (
                        <div
                          key={color.id}
                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: hex ?? '#e5e7eb' }}
                          title={color.studioEntry.title}
                        />
                      )
                    })}
                    {seasonColorData.length > 12 && (
                      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-zinc-100 flex items-center justify-center">
                        <span className="text-[8px] font-medium text-zinc-500">+{seasonColorData.length - 12}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--depot-faint)] tracking-wide">
                    {seasonColorData.length} color{seasonColorData.length !== 1 ? 's' : ''}
                    {seasonColorData.filter(c => c.status === 'confirmed').length > 0 && (
                      <> · {seasonColorData.filter(c => c.status === 'confirmed').length} confirmed</>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Right column: KPIs */}
            {isPlanning && (
              <div className="lg:border-l lg:border-[var(--depot-hairline)] lg:pl-10">
                <SeasonPlanSection
                  seasonId={season.id}
                  seasonName={season.name}
                  totalSlots={activeSlots.length}
                  filledSlots={filledSlots.length}
                  openSlotCount={openSlots.length}
                  evergreenPct={evergreenPct}
                  evergreenCount={evergreenCount}
                  targetSlotCount={season.targetSkuCount}
                  marginTarget={season.marginTarget}
                  targetEvergreenPct={season.targetEvergreenPct}
                  glossary={glossary}
                />
              </div>
            )}
          </div>
        </div>

        <DimensionFilterProvider slotFilterData={slotFilterData}>
          {isPlanning ? (
            <>
              {/* ══════════════════════════════════════════════════════
                  PLANNING LAYOUT
                 ══════════════════════════════════════════════════════ */}

              {/* ─── Assortment Mix · "What Shape?" ─────────────── */}
              <section className="px-12 py-6 border-b border-[var(--depot-border)]">
                <AssortmentMixSection
                  dimensions={assortmentDimensions}
                  totalSlots={activeSlots.length}
                  seasonId={season.id}
                  seasonName={season.name}
                  currentTargetSlotCount={season.targetSkuCount}
                  currentCategoryTargets={categoryTargets}
                  currentConstructionTargets={constructionTargets}
                  currentWeightClassTargets={weightClassTargets}
                  currentSellingWindowTargets={sellingWindowTargets}
                  currentTenureTargets={tenureTargets}
                  currentUseCaseTargets={useCaseTargets}
                  currentGenderTargets={genderTargets}
                  currentAgeGroupTargets={ageGroupTargets}
                  dimensionOptions={dimensionOptions}
                  seasonContext={{
                    code: season.code,
                    name: season.name,
                    type: season.seasonType,
                    description: season.description ?? null,
                    launchDate: season.launchDate?.toISOString().split('T')[0] ?? null,
                    targetSlotCount: season.targetSkuCount,
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
                  brandBrief={brandContextRows[0]?.contextBrief ?? null}
                  collectionBriefs={
                    (() => {
                      const colCounts: Record<string, number> = {}
                      for (const slot of activeSlots) {
                        const code = slot.collection?.code
                        if (code) colCounts[code] = (colCounts[code] ?? 0) + 1
                      }
                      return taxonomyCollections
                        .filter((c) => colCounts[c.code] && c.contextBrief)
                        .map((c) => ({
                          name: c.name,
                          brief: c.contextBrief!,
                          slotCount: colCounts[c.code] ?? 0,
                        }))
                    })()
                  }
                  slotSummary={{
                    totalSlots: activeSlots.length,
                    filledSlots: filledSlots.length,
                    openSlots: openSlots.length,
                  }}
                  glossary={glossary}
                />
              </section>
            </>
          ) : (
            <>
              {/* ══════════════════════════════════════════════════════
                  EXECUTION LAYOUT (locked / active / closed)
                 ══════════════════════════════════════════════════════ */}

              {/* ─── Metrics Row ──────────────────────────────────── */}
              <section className="px-12 py-6 border-b border-[var(--depot-border)]">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                  <MetricBlock label="Target Slots" value={season.targetSkuCount} glossarySlug="target-slots" glossary={glossary} />
                  <MetricBlock label="Filled" value={filledSlots.length} />
                  <MetricBlock label="Open" value={openSlots.length} />
                  <MetricBlock label="Fill Rate" value={`${fillRate}%`} glossarySlug="fill-rate" glossary={glossary} />
                  {season.marginTarget && (
                    <MetricBlock label="Margin Target" value={`${season.marginTarget}%`} glossarySlug="margin-target" glossary={glossary} />
                  )}
                  <MetricBlock label="Complexity" value={complexityUsed} glossarySlug="complexity" glossary={glossary} />
                </div>
              </section>

              {/* ─── Mix Simulation ──────────────────────────────── */}
              {(Object.keys(collectionMix).length > 0 || unassignedCount > 0) && (
                <section className="px-12 py-6 border-b border-[var(--depot-border)]">
                  <p className="depot-label mb-4 flex items-center gap-1.5">
                    Collection Mix
                    <InfoTooltip slug="collection-mix" glossary={glossary} />
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {Object.entries(COLLECTION_LABELS).map(([key, label]) => {
                      const data = collectionMix[key]
                      if (!data) return null
                      const targetCount = mixTargets[key]

                      return (
                        <div key={key} className="pillar-block text-center py-3">
                          <p className="text-sm font-medium text-[var(--depot-ink)] tabular-nums">
                            {data.filled}/{data.total}
                          </p>
                          <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider mt-1">
                            {label}
                          </p>
                          {targetCount !== undefined && targetCount > 0 && (
                            <p className="text-[9px] text-[var(--depot-faint)] mt-0.5">
                              Target: {targetCount}
                            </p>
                          )}
                        </div>
                      )
                    })}
                    {unassignedCount > 0 && (
                      <div className="pillar-block text-center py-3 border-dashed">
                        <p className="text-sm font-medium text-amber-600 tabular-nums">
                          {unassignedCount}
                        </p>
                        <p className="text-[10px] text-amber-500 uppercase tracking-wider mt-1">
                          Unassigned
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ─── Color Strategy (both modes) ────────────────────── */}
          <section className="px-12 py-6 border-b border-[var(--depot-border)]">
            <SeasonColorPicker
              seasonId={season.id}
              seasonName={season.name}
              currentColorIds={currentColorIds}
              allColorEntries={pickerOptions}
              proposedForSeasonIds={proposedForSeasonIds}
              seasonOptions={seasonOptions}
              collectionOptions={collectionsDimension.map((c) => ({ id: c.id, name: c.label }))}
              seasonColorData={seasonColorData}
              totalConcepts={filledSlots.length}
            />
          </section>

          {/* ─── Slot Grid (both modes) ─────────────────────────── */}
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
              editProps={isPlanning ? {
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
                  genders: Object.fromEntries(taxonomyGenders.map(g => [g.code, g.id])),
                  ageGroups: Object.fromEntries(taxonomyAgeGroups.map(a => [a.code, a.id])),
                  sellingWindows: Object.fromEntries(taxonomySellingWindows.map(s => [s.code, s.id])),
                  assortmentTenures: Object.fromEntries(taxonomyAssortmentTenures.map(a => [a.code, a.id])),
                  collections: Object.fromEntries(taxonomyCollections.map(c => [c.code, c.id])),
                },
              } : undefined}
            />
          </section>
        </DimensionFilterProvider>

        {/* ─── Core Program References ──────────────────────────── */}
        {season.coreRefs.length > 0 && (
          <section className="px-12 py-8">
            <p className="depot-label mb-6 flex items-center gap-1.5">
              Evergreen Programs
              <InfoTooltip slug="core-program" glossary={glossary} />
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {season.coreRefs.map((ref) => (
                <Link
                  key={ref.id}
                  href={`/internal/product/core/${ref.coreProgramId}`}
                  className="block"
                >
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

// ─── Components ─────────────────────────────────────────────────────

function MetricBlock({
  label,
  value,
  glossarySlug,
  glossary,
}: {
  label: string
  value: string | number
  glossarySlug?: string
  glossary?: Record<string, GlossaryEntry>
}) {
  return (
    <div>
      <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider flex items-center gap-1">
        {label}
        {glossarySlug && glossary && (
          <InfoTooltip slug={glossarySlug} glossary={glossary} />
        )}
      </p>
      <p className="text-sm font-medium text-[var(--depot-ink)] tabular-nums mt-0.5">{String(value)}</p>
    </div>
  )
}

