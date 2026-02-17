import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@repo/db/client"
import { skuConcepts, factorySamples, factoryCosting, skuFactoryAssignments } from "@repo/db/schema"
import { eq } from "drizzle-orm"
import { DocPageShell } from "@/components/nav/DocPageShell"

// ─── Metadata ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  return { title: `SKU Concept ${id.slice(0, 8)} | Satuit Supply Co.` }
}

// ─── Constants ──────────────────────────────────────────────────────

const STAGE_ORDER = [
  'draft',
  'spec',
  'sampling',
  'costing',
  'approved',
  'production',
  'live',
  'retired',
] as const

const STAGE_LABELS: Record<string, string> = {
  draft: 'Draft',
  spec: 'Spec',
  sampling: 'Sampling',
  costing: 'Costing',
  approved: 'Approved',
  production: 'Production',
  live: 'Live',
  retired: 'Retired',
}

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

// ─── Page ────────────────────────────────────────────────────────────

export default async function ConceptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const concept = await db.query.skuConcepts.findFirst({
    where: eq(skuConcepts.id, id),
    with: {
      sourceStudioEntry: true,
      seasonSlot: {
        with: {
          season: true,
          productType: {
            with: { subcategory: { with: { category: true } } },
          },
          collection: true,
        },
      },
      transitions: {
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      },
      creator: true,
      approver: true,
    },
  })

  if (!concept) notFound()

  const snapshot = concept.metadataSnapshot as Record<string, unknown>

  // Fetch linked sourcing records
  const linkedSamples = await db.query.factorySamples.findMany({
    where: eq(factorySamples.skuConceptId, id),
    with: { factory: true },
  })

  const linkedCosting = await db.query.factoryCosting.findMany({
    where: eq(factoryCosting.skuConceptId, id),
    with: { factory: true, subcategory: true },
  })

  const linkedAssignments = await db.query.skuFactoryAssignments.findMany({
    where: eq(skuFactoryAssignments.skuConceptId, id),
    with: { primaryFactory: true },
  })

  const currentStageIdx = STAGE_ORDER.indexOf(concept.status as (typeof STAGE_ORDER)[number])

  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Product", href: "/internal/product" },
        { label: concept.seasonSlot.season.name, href: `/internal/product/seasons/${concept.seasonSlot.season.code}` },
        { label: (snapshot.title as string) ?? "Concept" },
      ]}
    >
      <main className="flex-1 overflow-y-auto" style={{ fontFamily: "var(--depot-font)" }}>
        {/* ─── Header ──────────────────────────────────────────── */}
        <div className="depot-header">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="depot-heading text-xl">
              {(snapshot.title as string) ?? "Untitled Concept"}
            </h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase tracking-wider ${conceptStatusColors[concept.status] ?? ''}`}>
              {concept.status}
            </span>
          </div>

          <div className="flex gap-6 text-xs text-[var(--depot-muted)]">
            <span>
              Season: <Link href={`/internal/product/seasons/${concept.seasonSlot.season.code}`} className="underline-offset-2 hover:underline">{concept.seasonSlot.season.name}</Link>
            </span>
            <span>Slot: {concept.seasonSlot.collection?.name ?? 'Unassigned'} / {concept.seasonSlot.productType.name}</span>
            {concept.creator && <span>Created by: {concept.creator.name ?? concept.creator.email}</span>}
          </div>
        </div>

        {/* ─── Stage Progress Bar ──────────────────────────────── */}
        <section className="px-12 py-6 border-b border-[var(--depot-border)]">
          <p className="depot-label mb-4">Stage Progress</p>
          <div className="flex items-center gap-1">
            {STAGE_ORDER.map((stage, i) => {
              const isCurrent = stage === concept.status
              const isPast = i < currentStageIdx
              const isFuture = i > currentStageIdx

              return (
                <div key={stage} className="flex items-center gap-1 flex-1">
                  <div className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className={`w-full h-1.5 rounded-full transition-colors ${
                        isPast
                          ? 'bg-emerald-500'
                          : isCurrent
                            ? 'bg-blue-500'
                            : 'bg-zinc-200'
                      }`}
                    />
                    <span
                      className={`text-[9px] uppercase tracking-wider ${
                        isCurrent
                          ? 'text-[var(--depot-ink)] font-semibold'
                          : isPast
                            ? 'text-emerald-600'
                            : 'text-[var(--depot-faint)]'
                      }`}
                    >
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── Metadata Snapshot ────────────────────────────────── */}
        <section className="px-12 py-6 border-b border-[var(--depot-border)]">
          <div className="flex items-center justify-between mb-4">
            <p className="depot-label" style={{ marginBottom: 0 }}>Metadata Snapshot</p>
            <Link
              href={`/internal/studio`}
              className="text-[10px] text-[var(--depot-muted)] hover:text-[var(--depot-ink)] transition-colors uppercase tracking-wider"
            >
              View Studio Entry
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SnapshotField label="Intent" value={snapshot.intent as string} />
            <SnapshotField label="Problem Statement" value={snapshot.problemStatement as string} />
            <SnapshotField label="Collection" value={snapshot.collectionId as string} />
            <SnapshotField label="Price Tier" value={snapshot.priceTierTarget as string} />
            <SnapshotField label="Margin Target" value={snapshot.marginTarget ? `${snapshot.marginTarget}%` : null} />
            <SnapshotField label="Complexity" value={snapshot.estimatedComplexity ? `${snapshot.estimatedComplexity}/5` : null} />
            <SnapshotField label="Type" value={snapshot.replacementVsAdditive as string} />
            <SnapshotField label="Category" value={snapshot.category as string} />
          </div>

          {typeof snapshot.description === 'string' && snapshot.description && (
            <div className="mt-4 pt-4 border-t border-[var(--depot-hairline)]">
              <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider mb-1">Description</p>
              <p className="text-xs text-[var(--depot-ink-light)] leading-relaxed">
                {snapshot.description}
              </p>
            </div>
          )}
        </section>

        {/* ─── Stage Timestamps ─────────────────────────────────── */}
        <section className="px-12 py-6 border-b border-[var(--depot-border)]">
          <p className="depot-label mb-4">Stage Timeline</p>
          <div className="space-y-2">
            {STAGE_ORDER.map((stage) => {
              const tsKey = `${stage}At` as keyof typeof concept
              const ts = concept[tsKey] as Date | null
              if (!ts && stage !== 'draft') return null

              return (
                <div key={stage} className="flex items-center gap-4 py-1.5">
                  <span className={`text-[10px] uppercase tracking-wider w-20 ${
                    stage === concept.status ? 'text-[var(--depot-ink)] font-semibold' : 'text-[var(--depot-faint)]'
                  }`}>
                    {STAGE_LABELS[stage]}
                  </span>
                  <span className="text-xs text-[var(--depot-ink-light)] tabular-nums">
                    {ts ? new Date(ts).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : stage === 'draft' ? new Date(concept.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── Linked Sourcing Records ──────────────────────────── */}
        <section className="px-12 py-6 border-b border-[var(--depot-border)]">
          <p className="depot-label mb-4">Linked Sourcing Records</p>

          {linkedSamples.length === 0 && linkedCosting.length === 0 && linkedAssignments.length === 0 ? (
            <div className="pillar-block text-center py-6">
              <p className="text-xs text-[var(--depot-muted)]">
                No sourcing records linked yet. Link samples, costing, or factory assignments as this concept progresses.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {linkedSamples.map((sample) => (
                <div key={sample.id} className="pillar-block flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Sample</p>
                    <p className="text-xs text-[var(--depot-ink)]">
                      {sample.factory.tradingName ?? sample.factory.legalName} — {sample.sampleType}
                    </p>
                  </div>
                  {sample.finalDecision && (
                    <span className="text-[9px] uppercase tracking-wider text-[var(--depot-muted)]">
                      {sample.finalDecision}
                    </span>
                  )}
                </div>
              ))}

              {linkedCosting.map((cost) => (
                <div key={cost.id} className="pillar-block flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Costing</p>
                    <p className="text-xs text-[var(--depot-ink)]">
                      {cost.factory.tradingName ?? cost.factory.legalName} — {cost.subcategory.name}
                    </p>
                  </div>
                  {cost.targetFobRangeLow && cost.targetFobRangeHigh && (
                    <span className="text-xs text-[var(--depot-ink)] tabular-nums">
                      ${cost.targetFobRangeLow}–${cost.targetFobRangeHigh}
                    </span>
                  )}
                </div>
              ))}

              {linkedAssignments.map((assignment) => (
                <div key={assignment.id} className="pillar-block flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">Factory Assignment</p>
                    <p className="text-xs text-[var(--depot-ink)]">
                      {assignment.primaryFactory.tradingName ?? assignment.primaryFactory.legalName}
                    </p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-[var(--depot-muted)]">
                    {assignment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Audit Trail ──────────────────────────────────────── */}
        <section className="px-12 py-6">
          <p className="depot-label mb-4">Decision Log</p>

          {concept.transitions.length === 0 ? (
            <p className="text-xs text-[var(--depot-muted)]">No transitions recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {concept.transitions.map((transition) => (
                <div key={transition.id} className="flex items-start gap-4 py-2 border-b border-[var(--depot-hairline)] last:border-0">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider ${conceptStatusColors[transition.fromStatus] ?? 'bg-zinc-100 text-zinc-600'}`}>
                      {transition.fromStatus}
                    </span>
                    <span className="text-[9px] text-[var(--depot-faint)]">→</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider ${conceptStatusColors[transition.toStatus] ?? 'bg-zinc-100 text-zinc-600'}`}>
                      {transition.toStatus}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {transition.notes && (
                      <p className="text-xs text-[var(--depot-ink-light)] truncate">{transition.notes}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--depot-faint)] tabular-nums shrink-0">
                    {new Date(transition.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </DocPageShell>
  )
}

// ─── Components ─────────────────────────────────────────────────────

function SnapshotField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-xs text-[var(--depot-ink)] capitalize">
        {value ?? <span className="text-[var(--depot-faint)]">—</span>}
      </p>
    </div>
  )
}
