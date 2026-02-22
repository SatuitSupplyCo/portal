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
  glossaryTerms,
} from "@repo/db/schema"
import { eq, asc } from "drizzle-orm"
import type { GlossaryEntry } from "@/components/InfoTooltip"
import type { DimensionConfig } from "../PlanningTargetsPanel"
import type { SeasonColorEntry } from "../SeasonColorPalette"
import type { SlotFilterDatum } from "../DimensionFilterProvider"
import type { SlotGridEntry } from "../FilteredSlotGrid"

// ─── Types ──────────────────────────────────────────────────────────

export type SlotWithTaxonomy = {
  id: string
  status: string
  colorwayIds: unknown
  replacementFlag: boolean
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
    id: string
    status: string
    materialWeightClass: { code: string; label: string } | null
    useCase: { code: string; label: string } | null
    construction: { code: string; label: string } | null
    metadataSnapshot: unknown
  } | null
}

export interface DimensionOption {
  key: string
  label: string
}

export interface DimensionOptions {
  category: DimensionOption[]
  construction: DimensionOption[]
  weightClass: DimensionOption[]
  sellingWindow: DimensionOption[]
  tenure: DimensionOption[]
  useCase: DimensionOption[]
  gender: DimensionOption[]
  ageGroup: DimensionOption[]
}

export interface LoadedSeasonData {
  season: Awaited<ReturnType<typeof loadSeasonInternal>>["season"]
  coreRefs: Array<{ id: string; coreProgramId: string; coreProgram: { name: string }; selectedColorways: unknown }>
  glossary: Record<string, GlossaryEntry>
  productHierarchy: Array<{
    id: string
    code: string
    name: string
    subcategories: Array<{
      id: string
      code: string
      name: string
      productTypes: Array<{ id: string; code: string; name: string }>
    }>
  }>
  collectionsDimension: Array<{ id: string; code: string; label: string }>
  gendersDimension: Array<{ id: string; code: string; label: string }>
  ageGroupsDimension: Array<{ id: string; code: string; label: string }>
  sellingWindowsDimension: Array<{ id: string; code: string; label: string }>
  assortmentTenuresDimension: Array<{ id: string; code: string; label: string }>
  constructionsDimension: Array<{ id: string; code: string; label: string }>
  weightClassesDimension: Array<{ id: string; code: string; label: string }>
  fitBlocksDimension: Array<{ id: string; code: string; label: string }>
  useCasesDimension: Array<{ id: string; code: string; label: string }>
  sizeScalesDimension: Array<{ id: string; code: string; label: string }>
  taxonomyCategories: Awaited<ReturnType<typeof loadTaxonomy>>[0]
  taxonomyCollections: Awaited<ReturnType<typeof loadTaxonomy>>[1]
  taxonomyGenders: Awaited<ReturnType<typeof loadTaxonomy>>[2]
  taxonomyAgeGroups: Awaited<ReturnType<typeof loadTaxonomy>>[3]
  taxonomySellingWindows: Awaited<ReturnType<typeof loadTaxonomy>>[4]
  taxonomyAssortmentTenures: Awaited<ReturnType<typeof loadTaxonomy>>[5]
  taxonomyWeightClasses: Awaited<ReturnType<typeof loadTaxonomy>>[6]
  taxonomyUseCases: Awaited<ReturnType<typeof loadTaxonomy>>[7]
  taxonomyConstructions: Awaited<ReturnType<typeof loadTaxonomy>>[8]
  seasonOptions: Array<{ id: string; code: string; name: string }>
  seasonColorData: SeasonColorEntry[]
  currentColorIds: string[]
  pickerOptions: Array<{
    id: string
    title: string
    hex: string | null
    pantone: string | null
    tags: string[]
    targetSeasonId: string | null
  }>
  proposedForSeasonIds: string[]
  activeSlots: SlotWithTaxonomy[]
  filledSlots: SlotWithTaxonomy[]
  openSlots: SlotWithTaxonomy[]
  fillRate: number
  collectionMix: Record<string, { filled: number; total: number }>
  unassignedCount: number
  complexityUsed: number
  assortmentDimensions: DimensionConfig[]
  dimensionOptions: DimensionOptions
  slotFilterData: SlotFilterDatum[]
  slotGridEntries: SlotGridEntry[]
  allDimensionLabels: Record<string, Record<string, string>>
  categoryTargets: Record<string, number>
  constructionTargets: Record<string, number>
  weightClassTargets: Record<string, number>
  sellingWindowTargets: Record<string, number>
  tenureTargets: Record<string, number>
  useCaseTargets: Record<string, number>
  genderTargets: Record<string, number>
  ageGroupTargets: Record<string, number>
  mixTargets: Record<string, number>
  evergreenCount: number
  evergreenPct: number
  COLLECTION_LABELS: Record<string, string>
  brandContextRows: Awaited<ReturnType<typeof loadTaxonomy>>[12]
}

// ─── Helpers ────────────────────────────────────────────────────────

function increment(map: Record<string, number>, key: string) {
  map[key] = (map[key] || 0) + 1
}

export function computeAssortmentMix(slots: SlotWithTaxonomy[]) {
  const category: Record<string, number> = {}
  const construction: Record<string, number> = {}
  const weightClass: Record<string, number> = {}
  const sellingWindow: Record<string, number> = {}
  const tenure: Record<string, number> = {}
  const useCase: Record<string, number> = {}
  const gender: Record<string, number> = {}
  const ageGroup: Record<string, number> = {}

  for (const slot of slots) {
    increment(category, slot.productType.subcategory.category.code)
    if (slot.audienceGender?.code) increment(gender, slot.audienceGender.code)
    if (slot.audienceAgeGroup?.code) increment(ageGroup, slot.audienceAgeGroup.code)
    if (slot.sellingWindow?.code) increment(sellingWindow, slot.sellingWindow.code)
    if (slot.assortmentTenure?.code) increment(tenure, slot.assortmentTenure.code)
    if (slot.skuConcept?.construction?.code) increment(construction, slot.skuConcept.construction.code)
    if (slot.skuConcept?.materialWeightClass?.code) increment(weightClass, slot.skuConcept.materialWeightClass.code)
    if (slot.skuConcept?.useCase?.code) increment(useCase, slot.skuConcept.useCase.code)
  }

  return { category, construction, weightClass, sellingWindow, tenure, useCase, gender, ageGroup }
}

// ─── Internal loaders ───────────────────────────────────────────────

async function loadTaxonomy() {
  return Promise.all([
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
}

async function loadSeasonInternal(code: string) {
  const season = await db.query.seasons.findFirst({
    where: eq(seasons.code, code.toUpperCase()),
    with: {
      slots: {
        with: {
          productType: { with: { subcategory: { with: { category: true } } } },
          collection: true,
          audienceGender: true,
          audienceAgeGroup: true,
          sellingWindow: true,
          assortmentTenure: true,
          skuConcept: {
            with: { sourceStudioEntry: true, construction: true, materialWeightClass: true, useCase: true },
          },
        },
      },
      coreRefs: { with: { coreProgram: true } },
      colors: { with: { studioEntry: true }, orderBy: (c, { asc: a }) => [a(c.sortOrder)] },
    },
  })

  if (!season) notFound()

  const session = await auth()
  if (session?.user) {
    const user = {
      id: session.user.id,
      role: session.user.role,
      permissions: session.user.permissions ?? [],
      orgId: session.user.orgId,
    }
    const canAccess = await hasResourceAccess(user, "season", season.id)
    if (!canAccess) notFound()
  }

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
  ] = await loadTaxonomy()

  const allColorEntries = await db.query.studioEntries.findMany({
    where: eq(studioEntries.category, "color"),
    orderBy: (e, { desc }) => [desc(e.createdAt)],
  })

  const glossary: Record<string, GlossaryEntry> = Object.fromEntries(
    glossaryRows.map((t) => [t.slug, { slug: t.slug, term: t.term, definition: t.definition }])
  )

  const toDimension = (r: { id: string; code: string; label: string }) => ({ id: r.id, code: r.code, label: r.label })

  const productHierarchy = taxonomyCategories.map((cat) => ({
    id: cat.id,
    code: cat.code,
    name: cat.name,
    subcategories: cat.subcategories.map((sub) => ({
      id: sub.id,
      code: sub.code,
      name: sub.name,
      productTypes: sub.productTypes.map((pt) => ({ id: pt.id, code: pt.code, name: pt.name })),
    })),
  }))

  const collectionsDimension = taxonomyCollections.map((c) => ({ id: c.id, code: c.code, label: c.name }))
  const gendersDimension = taxonomyGenders.map(toDimension)
  const ageGroupsDimension = taxonomyAgeGroups.map(toDimension)
  const sellingWindowsDimension = taxonomySellingWindows.map(toDimension)
  const assortmentTenuresDimension = taxonomyAssortmentTenures.map(toDimension)
  const constructionsDimension = taxonomyConstructions.map(toDimension)
  const weightClassesDimension = taxonomyWeightClasses.map(toDimension)
  const fitBlocksDimension = taxonomyFitBlocks.map(toDimension)
  const useCasesDimension = taxonomyUseCases.map(toDimension)
  const sizeScalesDimension = taxonomySizeScales.map((s) => ({ id: s.id, code: s.code, label: s.label }))

  const COLLECTION_LABELS: Record<string, string> = Object.fromEntries(taxonomyCollections.map((c) => [c.code, c.name]))
  const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(taxonomyCategories.map((c) => [c.code, c.name]))
  const CONSTRUCTION_LABELS: Record<string, string> = Object.fromEntries(taxonomyConstructions.map((c) => [c.code, c.label]))
  const WEIGHT_CLASS_LABELS: Record<string, string> = Object.fromEntries(taxonomyWeightClasses.map((w) => [w.code, w.label]))
  const SELLING_WINDOW_LABELS: Record<string, string> = Object.fromEntries(taxonomySellingWindows.map((s) => [s.code, s.label]))
  const TENURE_LABELS: Record<string, string> = Object.fromEntries(taxonomyAssortmentTenures.map((a) => [a.code, a.label]))
  const USE_CASE_LABELS: Record<string, string> = Object.fromEntries(taxonomyUseCases.map((u) => [u.code, u.label]))
  const GENDER_LABELS: Record<string, string> = Object.fromEntries(taxonomyGenders.map((g) => [g.code, g.label]))
  const AGE_GROUP_LABELS: Record<string, string> = Object.fromEntries(taxonomyAgeGroups.map((a) => [a.code, a.label]))

  const seasonOptions = allSeasons.map((s) => ({ id: s.id, code: s.code, name: s.name }))
  const proposedForSeasonIds = allColorEntries.filter((e) => e.targetSeasonId === season.id).map((e) => e.id)

  const seasonColorData: SeasonColorEntry[] = season.colors.map((c) => ({
    id: c.id,
    studioEntryId: c.studioEntryId,
    status: c.status as "confirmed" | "proposed",
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
      hex: typeof meta?.hex === "string" && /^#[0-9a-fA-F]{6}$/.test(meta.hex) ? meta.hex : null,
      pantone: typeof meta?.pantone === "string" ? meta.pantone : null,
      tags: (e.tags as string[]) ?? [],
      targetSeasonId: e.targetSeasonId,
    }
  })

  const activeSlots = season.slots.filter((s) => s.status !== "removed") as unknown as SlotWithTaxonomy[]
  const filledSlots = activeSlots.filter((s) => s.status === "filled") as unknown as SlotWithTaxonomy[]
  const openSlots = activeSlots.filter((s) => s.status === "open") as unknown as SlotWithTaxonomy[]
  const fillRate = activeSlots.length > 0 ? Math.round((filledSlots.length / activeSlots.length) * 100) : 0

  const collectionMix: Record<string, { filled: number; total: number }> = {}
  const unassignedCount = activeSlots.filter((s) => !s.collection).length
  for (const slot of activeSlots) {
    const col = slot.collection?.code
    if (!col) continue
    if (!collectionMix[col]) collectionMix[col] = { filled: 0, total: 0 }
    collectionMix[col].total++
    if (slot.status === "filled") collectionMix[col].filled++
  }

  const complexityUsed = filledSlots.reduce((sum, slot) => {
    const snapshot = slot.skuConcept?.metadataSnapshot as Record<string, unknown> | undefined
    return sum + ((snapshot?.estimatedComplexity as number) ?? 0)
  }, 0)

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

  const evergreenCount = (mix.tenure["evergreen"] ?? 0) + (mix.tenure["multi_season"] ?? 0)
  const evergreenPct = activeSlots.length > 0 ? Math.round((evergreenCount / activeSlots.length) * 100) : 0

  const assortmentDimensions: DimensionConfig[] = [
    { key: "category", label: "Category", targets: categoryTargets, actuals: { counts: mix.category, pcts: {} }, labels: CATEGORY_LABELS, editTab: "category" },
    { key: "construction", label: "Construction", targets: constructionTargets, actuals: { counts: mix.construction, pcts: {} }, labels: CONSTRUCTION_LABELS, editTab: "construction" },
    { key: "weightClass", label: "Weight", targets: weightClassTargets, actuals: { counts: mix.weightClass, pcts: {} }, labels: WEIGHT_CLASS_LABELS, editTab: "weightClass" },
    { key: "sellingWindow", label: "Selling Window", targets: sellingWindowTargets, actuals: { counts: mix.sellingWindow, pcts: {} }, labels: SELLING_WINDOW_LABELS, editTab: "sellingWindow" },
    { key: "tenure", label: "Tenure", targets: tenureTargets, actuals: { counts: mix.tenure, pcts: {} }, labels: TENURE_LABELS, editTab: "tenure" },
    { key: "useCase", label: "Use Case", targets: useCaseTargets, actuals: { counts: mix.useCase, pcts: {} }, labels: USE_CASE_LABELS, editTab: "useCase" },
    { key: "gender", label: "Gender", targets: genderTargets, actuals: { counts: mix.gender, pcts: {} }, labels: GENDER_LABELS, editTab: "gender" },
    { key: "ageGroup", label: "Age", targets: ageGroupTargets, actuals: { counts: mix.ageGroup, pcts: {} }, labels: AGE_GROUP_LABELS, editTab: "ageGroup" },
  ]

  const dimensionOptions: DimensionOptions = {
    category: taxonomyCategories.map((c) => ({ key: c.code, label: c.name })),
    construction: taxonomyConstructions.map((c) => ({ key: c.code, label: c.label })),
    weightClass: taxonomyWeightClasses.map((w) => ({ key: w.code, label: w.label })),
    sellingWindow: taxonomySellingWindows.map((s) => ({ key: s.code, label: s.label })),
    tenure: taxonomyAssortmentTenures.map((a) => ({ key: a.code, label: a.label })),
    useCase: taxonomyUseCases.map((u) => ({ key: u.code, label: u.label })),
    gender: taxonomyGenders.map((g) => ({ key: g.code, label: g.label })),
    ageGroup: taxonomyAgeGroups.map((a) => ({ key: a.code, label: a.label })),
  }

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
        category: { code: slot.productType.subcategory.category.code, name: slot.productType.subcategory.category.name },
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

  return {
    season,
    coreRefs: season.coreRefs,
    glossary,
    productHierarchy,
    collectionsDimension,
    gendersDimension,
    ageGroupsDimension,
    sellingWindowsDimension,
    assortmentTenuresDimension,
    constructionsDimension,
    weightClassesDimension,
    fitBlocksDimension,
    useCasesDimension,
    sizeScalesDimension,
    taxonomyCategories,
    taxonomyCollections,
    taxonomyGenders,
    taxonomyAgeGroups,
    taxonomySellingWindows,
    taxonomyAssortmentTenures,
    taxonomyWeightClasses,
    taxonomyUseCases,
    taxonomyConstructions,
    seasonOptions,
    seasonColorData,
    currentColorIds,
    pickerOptions,
    proposedForSeasonIds,
    activeSlots,
    filledSlots,
    openSlots,
    fillRate,
    collectionMix,
    unassignedCount,
    complexityUsed,
    assortmentDimensions,
    dimensionOptions,
    slotFilterData,
    slotGridEntries,
    allDimensionLabels,
    categoryTargets,
    constructionTargets,
    weightClassTargets,
    sellingWindowTargets,
    tenureTargets,
    useCaseTargets,
    genderTargets,
    ageGroupTargets,
    mixTargets,
    evergreenCount,
    evergreenPct,
    COLLECTION_LABELS,
    brandContextRows,
  }
}

// ─── Public API ──────────────────────────────────────────────────────

export async function loadSeasonData(code: string): Promise<LoadedSeasonData> {
  return loadSeasonInternal(code)
}
