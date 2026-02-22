import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@repo/db/client"
import { corePrograms } from "@repo/db/schema"
import { eq } from "drizzle-orm"
import { DocPageShell } from "@/components/nav/DocPageShell"

// ─── Metadata ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const program = await db.query.corePrograms.findFirst({
    where: eq(corePrograms.id, id),
  })
  return { title: `${program?.name ?? 'Core Program'} | Satuit Supply Co.` }
}

import { CORE_PROGRAM_STATUS_COLORS as statusColors } from "@/lib/status"

// ─── Page ────────────────────────────────────────────────────────────

export default async function CoreProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const program = await db.query.corePrograms.findFirst({
    where: eq(corePrograms.id, id),
    with: {
      seasonRefs: {
        with: { season: true },
      },
      creator: true,
    },
  })

  if (!program) notFound()

  const silhouettes = (program.silhouettes as string[]) ?? []
  const colorways = (program.baseColorways as string[]) ?? []

  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Product", href: "/internal/product" },
        { label: "Core Programs", href: "/internal/product/core" },
        { label: program.name },
      ]}
    >
      <main className="flex-1 overflow-y-auto" style={{ fontFamily: "var(--depot-font)" }}>
        {/* ─── Header ──────────────────────────────────────────── */}
        <div className="depot-header">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="depot-heading text-xl">{program.name}</h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase tracking-wider ${statusColors[program.status] ?? ''}`}>
              {program.status}
            </span>
          </div>
          {program.creator && (
            <p className="text-xs text-[var(--depot-muted)]">
              Created by {program.creator.name ?? program.creator.email}
            </p>
          )}
        </div>

        {/* ─── Fabric Spec ─────────────────────────────────────── */}
        {program.fabricSpec && (
          <section className="px-12 py-6 border-b border-[var(--depot-border)]">
            <p className="depot-label mb-3">Fabric Specification</p>
            <p className="text-xs text-[var(--depot-ink-light)] leading-relaxed tracking-wide">
              {program.fabricSpec}
            </p>
            {program.blockId && (
              <p className="text-[10px] text-[var(--depot-faint)] mt-2 uppercase tracking-wider">
                Block: {program.blockId}
              </p>
            )}
          </section>
        )}

        {/* ─── Silhouettes ─────────────────────────────────────── */}
        <section className="px-12 py-6 border-b border-[var(--depot-border)]">
          <p className="depot-label mb-4">Silhouettes</p>
          {silhouettes.length === 0 ? (
            <p className="text-xs text-[var(--depot-muted)]">No silhouettes defined.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {silhouettes.map((s) => (
                <span
                  key={s}
                  className="text-[11px] px-3 py-1.5 bg-[var(--depot-surface-alt)] border border-[var(--depot-hairline)] rounded-sm capitalize tracking-wide"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ─── Base Colorways ──────────────────────────────────── */}
        <section className="px-12 py-6 border-b border-[var(--depot-border)]">
          <p className="depot-label mb-4">Base Colorways</p>
          {colorways.length === 0 ? (
            <p className="text-xs text-[var(--depot-muted)]">No colorways defined.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {colorways.map((color) => (
                <div key={color} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-sm border border-[var(--depot-hairline)]"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[11px] text-[var(--depot-ink)] font-mono tracking-wide">
                    {color}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Season References ────────────────────────────────── */}
        <section className="px-12 py-6">
          <p className="depot-label mb-4">Season References</p>
          {program.seasonRefs.length === 0 ? (
            <p className="text-xs text-[var(--depot-muted)]">
              Not referenced by any season yet.
            </p>
          ) : (
            <div className="space-y-3">
              {program.seasonRefs.map((ref) => {
                const selectedColorways = (ref.selectedColorways as string[]) ?? []

                return (
                  <Link
                    key={ref.id}
                    href={`/internal/product/seasons/${ref.season.code}`}
                    className="block"
                  >
                    <div className="pillar-block group hover:border-[var(--depot-ink)] transition-colors cursor-pointer flex items-center justify-between">
                      <div>
                        <p className="depot-subheading text-xs">{ref.season.name}</p>
                        <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider mt-0.5">
                          {ref.season.code} · {ref.season.seasonType}
                        </p>
                      </div>

                      {selectedColorways.length > 0 && (
                        <div className="flex gap-1">
                          {selectedColorways.map((c) => (
                            <div
                              key={c}
                              className="w-5 h-5 rounded-sm border border-[var(--depot-hairline)]"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
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
