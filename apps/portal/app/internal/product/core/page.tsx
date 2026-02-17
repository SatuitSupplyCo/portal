import type { Metadata } from "next"
import Link from "next/link"
import { db } from "@repo/db/client"
import { DocPageShell } from "@/components/nav/DocPageShell"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Core Programs | Satuit Supply Co.",
}

// ─── Status styling ─────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800",
  retired: "bg-zinc-100 text-zinc-400",
}

// ─── Page ────────────────────────────────────────────────────────────

export default async function CoreProgramsPage() {
  const programs = await db.query.corePrograms.findMany({
    with: {
      seasonRefs: {
        with: { season: true },
      },
    },
    orderBy: (cp, { asc }) => [asc(cp.name)],
  })

  return (
    <DocPageShell breadcrumbs={[{ label: "Product", href: "/internal/product" }, { label: "Core Programs" }]}>
      <main className="flex-1 overflow-y-auto" style={{ fontFamily: "var(--depot-font)" }}>
        <div className="depot-header">
          <h1 className="depot-heading text-xl">Core Programs</h1>
          <p className="mt-3 text-xs font-light text-[var(--depot-muted)] max-w-lg leading-relaxed tracking-wide">
            Evergreen product programs that sell year-round. Not tied to seasons, but referenced by them.
          </p>
        </div>

        <section className="px-12 py-8">
          {programs.length === 0 ? (
            <div className="pillar-block text-center py-12">
              <p className="text-xs text-[var(--depot-muted)]">
                No core programs created yet. Seed the database to get started.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => {
                const silhouettes = (program.silhouettes as string[]) ?? []
                const colorways = (program.baseColorways as string[]) ?? []
                const activeSeasons = program.seasonRefs
                  .filter(ref => ref.season.status !== 'closed')
                  .map(ref => ref.season)

                return (
                  <Link
                    key={program.id}
                    href={`/internal/product/core/${program.id}`}
                    className="block"
                  >
                    <div className="pillar-block group hover:border-[var(--depot-ink)] transition-colors cursor-pointer h-full">
                      <div className="flex items-start justify-between mb-3">
                        <p className="depot-subheading text-sm">{program.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase tracking-wider ${statusColors[program.status] ?? ''}`}>
                          {program.status}
                        </span>
                      </div>

                      {program.fabricSpec && (
                        <p className="text-[11px] font-light text-[var(--depot-ink-light)] leading-relaxed tracking-wide mb-4">
                          {program.fabricSpec}
                        </p>
                      )}

                      {/* Colorway swatches */}
                      {colorways.length > 0 && (
                        <div className="flex gap-1.5 mb-4">
                          {colorways.map((color) => (
                            <div
                              key={color}
                              className="w-6 h-6 rounded-sm border border-[var(--depot-hairline)]"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}

                      <div className="pt-3 border-t border-[var(--depot-hairline)] flex gap-6">
                        <div>
                          <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Silhouettes</p>
                          <p className="text-xs text-[var(--depot-ink)]">{silhouettes.length}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Colorways</p>
                          <p className="text-xs text-[var(--depot-ink)]">{colorways.length}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Seasons</p>
                          <p className="text-xs text-[var(--depot-ink)]">{activeSeasons.length}</p>
                        </div>
                      </div>
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
