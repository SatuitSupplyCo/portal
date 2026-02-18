import type { Metadata } from "next"
import Link from "next/link"
import { db } from "@repo/db/client"
import { auth } from "@repo/auth"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { CreateSeasonDialog } from "../CreateSeasonDialog"
import { getAccessibleResourceIds } from "@/lib/permissions"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Seasons | Satuit Supply Co.",
}

// ─── Status styling ─────────────────────────────────────────────────

const seasonStatusColors: Record<string, string> = {
  planning: "bg-amber-100 text-amber-800",
  locked: "bg-blue-100 text-blue-800",
  active: "bg-emerald-100 text-emerald-800",
  closed: "bg-zinc-100 text-zinc-500",
}

// ─── Page ────────────────────────────────────────────────────────────

export default async function SeasonsPage() {
  const session = await auth()
  const user = session?.user
    ? {
        id: session.user.id,
        role: session.user.role,
        permissions: session.user.permissions ?? [],
        orgId: session.user.orgId,
      }
    : null

  const allSeasons = await db.query.seasons.findMany({
    with: {
      slots: {
        with: {
          skuConcept: true,
        },
      },
      coreRefs: {
        with: { coreProgram: true },
      },
      colors: true,
    },
    orderBy: (s, { asc }) => [asc(s.code)],
  })

  // Filter by resource grants for non-admin users
  const accessibleIds = user ? await getAccessibleResourceIds(user, 'season') : []
  const filteredSeasons = accessibleIds === null
    ? allSeasons
    : allSeasons.filter((s) => accessibleIds.includes(s.id))

  return (
    <DocPageShell breadcrumbs={[{ label: "Product", href: "/internal/product" }, { label: "Seasons" }]}>
      <main className="flex-1 overflow-y-auto" style={{ fontFamily: "var(--depot-font)" }}>
        <div className="depot-header">
          <div className="flex items-center justify-between">
            <h1 className="depot-heading text-xl">Seasons</h1>
            <CreateSeasonDialog />
          </div>
          <p className="mt-3 text-xs font-light text-[var(--depot-muted)] max-w-lg leading-relaxed tracking-wide">
            2 major seasons + 2 minor drops per year. Plan slots upfront, fill with concepts from Studio.
          </p>
        </div>

        {/* ─── Season Cards ────────────────────────────────────── */}
        <section className="px-12 py-8">
          {filteredSeasons.length === 0 ? (
            <div className="pillar-block text-center py-12">
              <p className="text-xs text-[var(--depot-muted)]">
                No seasons created yet. Seed the database to get started.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredSeasons.map((season) => {
                const activeSlots = season.slots.filter(s => s.status !== 'removed')
                const filledCount = activeSlots.filter(s => s.status === 'filled').length
                const openCount = activeSlots.filter(s => s.status === 'open').length
                const fillRate = activeSlots.length > 0
                  ? Math.round((filledCount / activeSlots.length) * 100)
                  : 0
                const isPlanning = season.status === 'planning'

                // Compute actual complexity
                const complexityActual = activeSlots.reduce((sum, slot) => {
                  const snapshot = slot.skuConcept?.metadataSnapshot as Record<string, unknown> | undefined
                  return sum + ((snapshot?.estimatedComplexity as number) ?? 0)
                }, 0)

                // Count how many target dimensions are configured
                const genderTargets = (season.genderTargets as Record<string, number>) ?? {}
                const categoryTargets = (season.categoryTargets as Record<string, number>) ?? {}
                const mixTargets = (season.mixTargets as Record<string, number>) ?? {}
                const targetsConfigured = [
                  Object.keys(genderTargets).length > 0,
                  Object.keys(categoryTargets).length > 0,
                  Object.keys(mixTargets).length > 0,
                ].filter(Boolean).length

                const colorCount = season.colors?.length ?? 0

                return (
                  <Link
                    key={season.id}
                    href={`/internal/product/seasons/${season.code}`}
                    className="block"
                  >
                    <div className="pillar-block group hover:border-[var(--depot-ink)] transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="depot-subheading text-sm">{season.name}</p>
                          <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider mt-1">
                            {season.code} · {season.seasonType}
                            {season.seasonType === 'minor' && season.minorMaxSkus && (
                              <> · Max {season.minorMaxSkus} SKUs</>
                            )}
                          </p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase tracking-wider ${seasonStatusColors[season.status] ?? ''}`}>
                          {season.status}
                        </span>
                      </div>

                      {isPlanning ? (
                        <>
                          {/* Planning metrics */}
                          <div className="grid grid-cols-4 gap-3 pt-3 border-t border-[var(--depot-hairline)]">
                            <div>
                              <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Target</p>
                              <p className="text-sm font-medium text-[var(--depot-ink)] tabular-nums">{season.targetSkuCount}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Slots</p>
                              <p className="text-sm font-medium text-[var(--depot-ink)] tabular-nums">{activeSlots.length}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Colors</p>
                              <p className="text-sm font-medium text-[var(--depot-ink)] tabular-nums">{colorCount}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Complexity</p>
                              <p className="text-sm font-medium text-[var(--depot-ink)] tabular-nums">{complexityActual}</p>
                            </div>
                          </div>

                          {/* Planning status */}
                          <div className="flex gap-6 mt-3 pt-3 border-t border-[var(--depot-hairline)]">
                            {season.marginTarget && (
                              <div>
                                <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Margin Target</p>
                                <p className="text-xs text-[var(--depot-ink)]">{season.marginTarget}%</p>
                              </div>
                            )}
                            <div>
                              <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Targets Set</p>
                              <p className="text-xs text-[var(--depot-ink)]">
                                {targetsConfigured}/3
                                <span className="text-[var(--depot-faint)] ml-1">
                                  ({targetsConfigured === 3
                                    ? 'all configured'
                                    : [
                                        Object.keys(genderTargets).length === 0 && 'gender',
                                        Object.keys(categoryTargets).length === 0 && 'category',
                                        Object.keys(mixTargets).length === 0 && 'collection',
                                      ]
                                        .filter(Boolean)
                                        .join(', ') + ' needed'})
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* SKU progress bar */}
                          <div className="mt-3 pt-3 border-t border-[var(--depot-hairline)]">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Slot Progress</p>
                              <p className="text-[10px] text-[var(--depot-faint)] tabular-nums">
                                {activeSlots.length} / {season.targetSkuCount}
                              </p>
                            </div>
                            <div className="h-1.5 bg-[var(--depot-hairline)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all"
                                style={{
                                  width: `${Math.min((activeSlots.length / season.targetSkuCount) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Execution metrics */}
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
                              <p className="text-sm font-medium text-[var(--depot-ink)] tabular-nums">{fillRate}%</p>
                            </div>
                          </div>

                          {/* Margin & complexity */}
                          <div className="flex gap-6 mt-3 pt-3 border-t border-[var(--depot-hairline)]">
                            {season.marginTarget && (
                              <div>
                                <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Margin Target</p>
                                <p className="text-xs text-[var(--depot-ink)]">{season.marginTarget}%</p>
                              </div>
                            )}
                            <div>
                              <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Complexity</p>
                              <p className="text-xs text-[var(--depot-ink)]">{complexityActual}</p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Core program refs */}
                      {season.coreRefs.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[var(--depot-hairline)]">
                          <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider mb-1">Evergreen</p>
                          <p className="text-xs text-[var(--depot-ink)]">
                            {season.coreRefs.map(ref => ref.coreProgram.name).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </DocPageShell>
  )
}
