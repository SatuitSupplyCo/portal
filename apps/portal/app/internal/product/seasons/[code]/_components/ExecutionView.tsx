import { InfoTooltip } from "@/components/InfoTooltip"
import { MetricBlock } from "./MetricBlock"
import type { GlossaryEntry } from "@/components/InfoTooltip"

interface ExecutionViewProps {
  season: {
    targetSkuCount: number | null
    marginTarget: string | number | null
  }
  filledSlotsCount: number
  openSlotsCount: number
  fillRate: number
  complexityUsed: number
  collectionMix: Record<string, { filled: number; total: number }>
  unassignedCount: number
  mixTargets: Record<string, number>
  COLLECTION_LABELS: Record<string, string>
  glossary: Record<string, GlossaryEntry>
}

export function ExecutionView({
  season,
  filledSlotsCount,
  openSlotsCount,
  fillRate,
  complexityUsed,
  collectionMix,
  unassignedCount,
  mixTargets,
  COLLECTION_LABELS,
  glossary,
}: ExecutionViewProps) {
  return (
    <>
      <section className="px-4 sm:px-6 lg:px-12 py-6 border-b border-[var(--depot-border)]">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          <MetricBlock
            label="Target Slots"
            value={season.targetSkuCount ?? 0}
            glossarySlug="target-slots"
            glossary={glossary}
          />
          <MetricBlock label="Filled" value={filledSlotsCount} />
          <MetricBlock label="Open" value={openSlotsCount} />
          <MetricBlock label="Fill Rate" value={`${fillRate}%`} glossarySlug="fill-rate" glossary={glossary} />
          {season.marginTarget && (
            <MetricBlock
              label="Margin Target"
              value={`${season.marginTarget}%`}
              glossarySlug="margin-target"
              glossary={glossary}
            />
          )}
          <MetricBlock label="Complexity" value={complexityUsed} glossarySlug="complexity" glossary={glossary} />
        </div>
      </section>

      {(Object.keys(collectionMix).length > 0 || unassignedCount > 0) && (
        <section className="px-4 sm:px-6 lg:px-12 py-6 border-b border-[var(--depot-border)]">
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
                  <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider mt-1">{label}</p>
                  {targetCount !== undefined && targetCount > 0 && (
                    <p className="text-[9px] text-[var(--depot-faint)] mt-0.5">Target: {targetCount}</p>
                  )}
                </div>
              )
            })}
            {unassignedCount > 0 && (
              <div className="pillar-block text-center py-3 border-dashed">
                <p className="text-sm font-medium text-amber-600 tabular-nums">{unassignedCount}</p>
                <p className="text-[10px] text-amber-500 uppercase tracking-wider mt-1">Unassigned</p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}
