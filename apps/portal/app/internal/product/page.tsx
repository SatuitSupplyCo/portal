import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { db } from "@repo/db/client"
import { corePrograms } from "@repo/db/schema"
import { eq } from "drizzle-orm"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { SeasonFilter } from "./SeasonFilter"
import { CreateSeasonDialog } from "./CreateSeasonDialog"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Assortment Dashboard | Satuit Supply Co.",
}

// ─── Data fetching ──────────────────────────────────────────────────

async function getAllSeasonsData() {
  return db.query.seasons.findMany({
    with: {
      slots: {
        with: {
          productType: {
            with: { subcategory: { with: { category: true } } },
          },
          collection: true,
          audienceGender: true,
          skuConcept: true,
        },
      },
      coreRefs: {
        with: {
          coreProgram: true,
        },
      },
    },
    orderBy: (s, { asc }) => [asc(s.code)],
  })
}

async function getActiveCorePrograms() {
  return db.query.corePrograms.findMany({
    where: eq(corePrograms.status, 'active'),
  })
}

// ─── Constants ──────────────────────────────────────────────────────

const seasonStatusColors: Record<string, string> = {
  planning: "bg-amber-100 text-amber-800",
  locked: "bg-blue-100 text-blue-800",
  active: "bg-emerald-100 text-emerald-800",
  closed: "bg-zinc-100 text-zinc-500",
}

const COLLECTION_LABELS: Record<string, string> = {
  core: "Core",
  material: "Material",
  function: "Function",
  origin: "Origin",
  womens: "Women's",
  accessory: "Accessory",
  lifestyle: "Lifestyle",
  unassigned: "Unassigned",
}

const DEV_STATUSES = ['draft', 'spec', 'sampling', 'costing']
const PROD_STATUSES = ['approved', 'production', 'live']

const conceptStatusColors: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-600",
  spec: "bg-blue-100 text-blue-700",
  sampling: "bg-purple-100 text-purple-700",
  costing: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  production: "bg-indigo-100 text-indigo-700",
  live: "bg-green-100 text-green-800",
  retired: "bg-zinc-100 text-zinc-400",
}

const conceptStatusLabels: Record<string, string> = {
  draft: "Draft",
  spec: "Spec",
  sampling: "Sampling",
  costing: "Costing",
  approved: "Approved",
  production: "Production",
  live: "Live",
  retired: "Retired",
}

const STAGE_ORDER = ['draft', 'spec', 'sampling', 'costing', 'approved', 'production', 'live', 'retired']

// ─── Page ────────────────────────────────────────────────────────────

export default async function AssortmentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>
}) {
  const { season: seasonCode } = await searchParams
  const allSeasons = await getAllSeasonsData()
  const allCorePrograms = await getActiveCorePrograms()

  const selectedSeason = seasonCode
    ? allSeasons.find((s) => s.code === seasonCode.toUpperCase())
    : null

  const seasonOptions = allSeasons.map((s) => ({
    code: s.code,
    name: s.name,
    seasonType: s.seasonType,
  }))

  return (
    <DocPageShell breadcrumbs={[{ label: "Product" }, { label: "Dashboard" }]}>
      <main className="flex-1 overflow-y-auto" style={{ fontFamily: "var(--depot-font)" }}>
        {/* ─── Header ──────────────────────────────────────────── */}
        <div className="depot-header">
          <div className="flex items-center gap-3 mb-6">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" className="shrink-0">
              <rect x="0" y="0" width="8" height="14" fill="#0f1a2e" />
              <rect x="10" y="0" width="8" height="14" fill="#0f1a2e" />
            </svg>
            <span className="depot-label" style={{ marginBottom: 0 }}>
              Satuit Supply Co.
            </span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="depot-heading text-xl">
              Assortment Dashboard
            </h1>
            <CreateSeasonDialog />
          </div>
          <p className="mt-3 text-xs font-light text-[var(--depot-muted)] max-w-lg leading-relaxed tracking-wide">
            Season-first planning. One concept = one SKU. No silent SKU creep.
          </p>
        </div>

        {/* ─── Season Filter ───────────────────────────────────── */}
        <Suspense fallback={null}>
          <SeasonFilter seasons={seasonOptions} />
        </Suspense>

        {/* ─── Conditional View ─────────────────────────────────── */}
        {selectedSeason ? (
          <SeasonScopedView
            season={selectedSeason}
            allCorePrograms={allCorePrograms}
          />
        ) : (
          <AggregateView
            allSeasons={allSeasons}
            allCorePrograms={allCorePrograms}
          />
        )}
      </main>
    </DocPageShell>
  )
}

// ─── Aggregate View (All Seasons) ───────────────────────────────────

type SeasonWithSlots = Awaited<ReturnType<typeof getAllSeasonsData>>[number]
type CoreProgram = Awaited<ReturnType<typeof getActiveCorePrograms>>[number]

function AggregateView({
  allSeasons,
  allCorePrograms,
}: {
  allSeasons: SeasonWithSlots[]
  allCorePrograms: CoreProgram[]
}) {
  let totalActiveSkus = 0
  let totalSkuCap = 0
  let totalFilledSlots = 0
  let totalOpenSlots = 0
  let totalSlots = 0
  const collectionMix: Record<string, number> = {}

  for (const season of allSeasons) {
    if (season.status === 'closed') continue
    totalSkuCap += season.targetSkuCount

    for (const slot of season.slots) {
      if (slot.status === 'removed') continue
      totalSlots++

      if (slot.status === 'filled') {
        totalFilledSlots++
        totalActiveSkus++
        const col = slot.collection?.code ?? 'unassigned'
        collectionMix[col] = (collectionMix[col] || 0) + 1
      } else {
        totalOpenSlots++
      }
    }
  }

  const fillRate = totalSlots > 0 ? Math.round((totalFilledSlots / totalSlots) * 100) : 0

  return (
    <>
      {/* ─── KPI Strip ───────────────────────────────────────── */}
      <section className="px-12 py-8 border-b border-[var(--depot-border)]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <KpiCard label="Active SKUs" value={totalActiveSkus} />
          <KpiCard label="SKU Cap" value={totalSkuCap} />
          <KpiCard label="Fill Rate" value={`${fillRate}%`} />
          <KpiCard label="Open Slots" value={totalOpenSlots} />
          <KpiCard label="Evergreen Programs" value={allCorePrograms.length} />
          <KpiCard label="Seasons" value={allSeasons.filter(s => s.status !== 'closed').length} />
        </div>
      </section>

      {/* ─── Collection Mix ──────────────────────────────────── */}
      <section className="px-12 py-8 border-b border-[var(--depot-border)]">
        <p className="depot-label mb-6">Collection Mix</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(COLLECTION_LABELS).map(([key, label]) => {
            const filled = collectionMix[key] || 0
            const pct = totalFilledSlots > 0
              ? Math.round((filled / totalFilledSlots) * 100)
              : 0

            return (
              <div key={key} className="pillar-block text-center">
                <p className="text-lg font-semibold text-[var(--depot-ink)] tabular-nums">
                  {pct}%
                </p>
                <p className="depot-label mt-1" style={{ marginBottom: 0 }}>
                  {label}
                </p>
                <p className="text-[10px] text-[var(--depot-faint)] mt-0.5">
                  {filled} SKU{filled !== 1 ? 's' : ''}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── Season Cards ────────────────────────────────────── */}
      <section className="px-12 py-8 border-b border-[var(--depot-border)]">
        <p className="depot-label mb-6">Seasons</p>

        <div className="grid md:grid-cols-2 gap-4">
          {allSeasons.map((season) => {
            const filledCount = season.slots.filter(s => s.status === 'filled').length
            const openCount = season.slots.filter(s => s.status === 'open').length
            const totalCount = season.slots.filter(s => s.status !== 'removed').length
            const localFillRate = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0

            return (
              <Link
                key={season.id}
                href={`/internal/product/seasons/${season.code}`}
                className="block"
              >
                <div className="pillar-block group hover:border-[var(--depot-ink)] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="depot-subheading text-xs">{season.name}</p>
                      <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider mt-0.5">
                        {season.code} · {season.seasonType}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase tracking-wider ${seasonStatusColors[season.status] ?? ''}`}>
                      {season.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-3 pt-3 border-t border-[var(--depot-hairline)]">
                    <div>
                      <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Target</p>
                      <p className="text-sm font-medium text-[var(--depot-ink)] tabular-nums">{season.targetSkuCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Filled</p>
                      <p className="text-sm font-medium text-[var(--depot-ink)] tabular-nums">{filledCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Open</p>
                      <p className="text-sm font-medium text-[var(--depot-ink)] tabular-nums">{openCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Fill %</p>
                      <p className="text-sm font-medium text-[var(--depot-ink)] tabular-nums">{localFillRate}%</p>
                    </div>
                  </div>

                  {season.marginTarget && (
                    <div className="mt-3 pt-3 border-t border-[var(--depot-hairline)]">
                      <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">
                        Margin Target: <span className="text-[var(--depot-ink)]">{season.marginTarget}%</span>
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ─── Core Programs ───────────────────────────────────── */}
      <CoreProgramsSection programs={allCorePrograms} />
    </>
  )
}

// ─── Season-Scoped View ─────────────────────────────────────────────

function SeasonScopedView({
  season,
  allCorePrograms,
}: {
  season: SeasonWithSlots
  allCorePrograms: CoreProgram[]
}) {
  const activeSlots = season.slots.filter(s => s.status !== 'removed')
  const filledSlots = activeSlots.filter(s => s.status === 'filled')
  const openSlots = activeSlots.filter(s => s.status === 'open')
  const fillRate = activeSlots.length > 0
    ? Math.round((filledSlots.length / activeSlots.length) * 100)
    : 0

  // Collection mix scoped to this season
  const collectionMix: Record<string, number> = {}
  for (const slot of activeSlots) {
    const col = slot.collection?.code ?? 'unassigned'
    collectionMix[col] = (collectionMix[col] || 0) + 1
  }

  // Concept stage breakdown
  const concepts = filledSlots
    .map((slot) => {
      const concept = slot.skuConcept
      if (!concept) return null
      const snapshot = concept.metadataSnapshot as Record<string, unknown>
      return {
        id: concept.id,
        title: (snapshot.title as string) ?? 'Untitled',
        collection: slot.collection?.code ?? 'unassigned',
        productTypeName: slot.productType.name,
        categoryName: slot.productType.subcategory.category.name,
        status: concept.status,
        complexity: (snapshot.estimatedComplexity as number) ?? 0,
        replacementFlag: slot.replacementFlag,
      }
    })
    .filter(Boolean) as Array<{
      id: string
      title: string
      collection: string
      productTypeName: string
      categoryName: string
      status: string
      complexity: number
      replacementFlag: boolean
    }>

  // Sort concepts by stage order (furthest along first)
  concepts.sort((a, b) => {
    const aIdx = STAGE_ORDER.indexOf(a.status)
    const bIdx = STAGE_ORDER.indexOf(b.status)
    return bIdx - aIdx
  })

  const inDevCount = concepts.filter(c => DEV_STATUSES.includes(c.status)).length
  const inProdCount = concepts.filter(c => PROD_STATUSES.includes(c.status)).length
  const complexityUsed = concepts.reduce((sum, c) => sum + c.complexity, 0)

  // Core programs referenced by this season
  const referencedProgramIds = new Set(season.coreRefs.map(r => r.coreProgramId))
  const seasonCorePrograms = allCorePrograms.filter(p => referencedProgramIds.has(p.id))

  return (
    <>
      {/* ─── Season Header Badge ─────────────────────────────── */}
      <div className="px-12 py-4 border-b border-[var(--depot-border)] bg-[var(--depot-surface-alt)]">
        <div className="flex items-center gap-3">
          <p className="depot-subheading text-sm" style={{ marginBottom: 0 }}>{season.name}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase tracking-wider ${seasonStatusColors[season.status] ?? ''}`}>
            {season.status}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase tracking-wider bg-zinc-100 text-zinc-600">
            {season.seasonType}
          </span>
          <Link
            href={`/internal/product/seasons/${season.code}`}
            className="ml-auto text-[10px] tracking-wider uppercase text-[var(--depot-muted)] hover:text-[var(--depot-ink)] transition-colors"
          >
            Season Detail
          </Link>
        </div>
      </div>

      {/* ─── Season-Scoped KPIs ──────────────────────────────── */}
      <section className="px-12 py-8 border-b border-[var(--depot-border)]">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          <KpiCard label="Target SKUs" value={season.targetSkuCount} />
          <KpiCard label="Filled" value={filledSlots.length} />
          <KpiCard label="Open" value={openSlots.length} />
          <KpiCard label="Fill Rate" value={`${fillRate}%`} />
          {season.marginTarget && (
            <KpiCard label="Margin Target" value={`${season.marginTarget}%`} />
          )}
          <KpiCard label="Complexity" value={complexityUsed} />
          <KpiCard label="In Development" value={inDevCount} />
          <KpiCard label="In Production+" value={inProdCount} />
        </div>
      </section>

      {/* ─── Collection Mix (Season-Scoped) ──────────────────── */}
      <section className="px-12 py-8 border-b border-[var(--depot-border)]">
        <p className="depot-label mb-6">Collection Mix</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(COLLECTION_LABELS).map(([key, label]) => {
            const slotCount = collectionMix[key] || 0
            const targetCount = (season.mixTargets as Record<string, number>)?.[key]

            return (
              <div key={key} className="pillar-block text-center">
                <p className="text-lg font-semibold text-[var(--depot-ink)] tabular-nums">
                  {slotCount}
                </p>
                <p className="depot-label mt-1" style={{ marginBottom: 0 }}>
                  {label}
                </p>
                {targetCount !== undefined && targetCount > 0 && (
                  <p className="text-[10px] text-[var(--depot-faint)] mt-0.5">
                    Target: {targetCount}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── Pipeline Table ──────────────────────────────────── */}
      <section className="px-12 py-8 border-b border-[var(--depot-border)]">
        <div className="flex items-center justify-between mb-6">
          <p className="depot-label" style={{ marginBottom: 0 }}>Pipeline</p>
          <span className="text-[9px] uppercase tracking-wider text-[var(--depot-faint)] bg-[var(--depot-surface-alt)] px-2 py-0.5 rounded-sm">
            Unit tracking coming soon
          </span>
        </div>

        {concepts.length === 0 ? (
          <div className="pillar-block text-center py-8">
            <p className="text-xs text-[var(--depot-muted)]">
              No concepts in this season yet. Fill slots from Studio to see the pipeline.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div
              className="manifest-header"
              style={{ gridTemplateColumns: "1fr auto auto auto auto auto auto" }}
            >
              <span>Concept</span>
              <span>Collection</span>
              <span>Status</span>
              <span className="text-right text-[var(--depot-faint)]">Forecast</span>
              <span className="text-right text-[var(--depot-faint)]">Produced</span>
              <span className="text-right text-[var(--depot-faint)]">Sold</span>
              <span className="text-right text-[var(--depot-faint)]">Remaining</span>
            </div>

            {/* Rows */}
            {concepts.map((concept) => (
              <Link
                key={concept.id}
                href={`/internal/product/concepts/${concept.id}`}
                className="block"
              >
                <div
                  className="manifest-row group"
                  style={{ gridTemplateColumns: "1fr auto auto auto auto auto auto" }}
                >
                  {/* Concept name + product type */}
                  <div className="min-w-0">
                    <p className="manifest-name group-hover:text-[var(--depot-ink-light)] transition-colors truncate">
                      {concept.title}
                    </p>
                    <p className="text-[10px] text-[var(--depot-faint)]">
                      {concept.productTypeName}
                      {concept.replacementFlag && (
                        <span className="ml-1 text-amber-600">replacement</span>
                      )}
                    </p>
                  </div>

                  {/* Collection */}
                  <span className="text-[11px] text-[var(--depot-ink-light)] capitalize">
                    {COLLECTION_LABELS[concept.collection] ?? concept.collection}
                  </span>

                  {/* Status badge */}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider ${conceptStatusColors[concept.status] ?? ''}`}>
                    {conceptStatusLabels[concept.status] ?? concept.status}
                  </span>

                  {/* Placeholder inventory columns */}
                  <span className="text-[11px] text-right text-[var(--depot-faint)]/40 tabular-nums">—</span>
                  <span className="text-[11px] text-right text-[var(--depot-faint)]/40 tabular-nums">—</span>
                  <span className="text-[11px] text-right text-[var(--depot-faint)]/40 tabular-nums">—</span>
                  <span className="text-[11px] text-right text-[var(--depot-faint)]/40 tabular-nums">—</span>
                </div>
              </Link>
            ))}
          </>
        )}
      </section>

      {/* ─── Core Programs (Season-Scoped) ────────────────────── */}
      {seasonCorePrograms.length > 0 && (
        <CoreProgramsSection programs={seasonCorePrograms} />
      )}
    </>
  )
}

// ─── Shared Components ──────────────────────────────────────────────

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="pillar-block text-center">
      <p className="text-lg font-semibold text-[var(--depot-ink)] tabular-nums">
        {value}
      </p>
      <p className="depot-label mt-1" style={{ marginBottom: 0 }}>
        {label}
      </p>
    </div>
  )
}

function CoreProgramsSection({ programs }: { programs: CoreProgram[] }) {
  return (
    <section className="px-12 py-8">
      <div className="flex items-center justify-between mb-6">
        <p className="depot-label" style={{ marginBottom: 0 }}>Evergreen Programs</p>
        <Link
          href="/internal/product/core"
          className="text-[10px] tracking-wider uppercase text-[var(--depot-muted)] hover:text-[var(--depot-ink)] transition-colors"
        >
          View All
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="pillar-block text-center py-8">
          <p className="text-xs text-[var(--depot-muted)]">No active core programs.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/internal/product/core/${program.id}`}
              className="block"
            >
              <div className="pillar-block group hover:border-[var(--depot-ink)] transition-colors cursor-pointer">
                <p className="depot-subheading text-xs mb-2">{program.name}</p>
                {program.fabricSpec && (
                  <p className="text-[11px] font-light text-[var(--depot-ink-light)] leading-relaxed tracking-wide">
                    {program.fabricSpec}
                  </p>
                )}
                <div className="mt-3 pt-3 border-t border-[var(--depot-hairline)] flex gap-4">
                  <div>
                    <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Silhouettes</p>
                    <p className="text-xs text-[var(--depot-ink)]">
                      {(program.silhouettes as string[])?.length ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Colorways</p>
                    <p className="text-xs text-[var(--depot-ink)]">
                      {(program.baseColorways as string[])?.length ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
