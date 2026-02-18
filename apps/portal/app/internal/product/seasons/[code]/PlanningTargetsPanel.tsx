'use client'

import { useState, useMemo } from 'react'
import { cn } from '@repo/ui/utils'
import { Crosshair, Pencil, AlertTriangle, X } from 'lucide-react'
import type { DimensionFilter } from './DimensionFilterProvider'
import { AssortmentInsightPanel } from './AssortmentInsightPanel'
import type { AssortmentMixContext } from '@/lib/ai/types'

// ─── Types ──────────────────────────────────────────────────────────

export interface DimensionBreakdown {
  counts: Record<string, number>
  pcts: Record<string, number>
}

export interface DimensionConfig {
  key: string
  label: string
  /** Slot count targets per value */
  targets: Record<string, number>
  actuals: DimensionBreakdown
  labels: Record<string, string>
  /** Maps to an EditTargetsDialog tab — when set, a CTA is shown */
  editTab?: string
}

interface PlanningTargetsPanelProps {
  dimensions: DimensionConfig[]
  totalSlots: number
  targetSlotCount: number
  /** Called when user clicks Add/Edit Targets CTA for a dimension */
  onEditTargets?: (dimensionKey: string) => void
  /** Currently active dimension filter (from context) */
  selectedFilter?: DimensionFilter | null
  /** Called when a value row is clicked to toggle filter */
  onFilterSelect?: (dimensionKey: string, valueCode: string) => void
  /** Season metadata for AI insight panel */
  seasonContext?: AssortmentMixContext['season']
  /** Slot fill summary for AI insight panel */
  slotSummary?: AssortmentMixContext['summary']
}

// ─── Component ──────────────────────────────────────────────────────

export function PlanningTargetsPanel({
  dimensions,
  totalSlots,
  targetSlotCount,
  onEditTargets,
  selectedFilter,
  onFilterSelect,
  seasonContext,
  slotSummary,
}: PlanningTargetsPanelProps) {
  const [activeKey, setActiveKey] = useState(dimensions[0]?.key ?? '')

  const active = dimensions.find((d) => d.key === activeKey)

  // Pre-compute which dimensions have targets that exceed the overall slot target
  const overageDimensions = useMemo(() => {
    const result = new Set<string>()
    for (const dim of dimensions) {
      const dimTotal = Object.values(dim.targets).reduce((s, v) => s + (v || 0), 0)
      if (dimTotal > targetSlotCount && dimTotal > 0) {
        result.add(dim.key)
      }
    }
    return result
  }, [dimensions, targetSlotCount])

  // Which dimension has an active filter value
  const filterDimKey = selectedFilter?.dimensionKey ?? null

  return (
    <div>
      {/* Dimension tab pills */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {dimensions.map((dim) => {
          const isActive = dim.key === activeKey
          const isOver = overageDimensions.has(dim.key)
          const hasFilter = filterDimKey === dim.key

          return (
            <button
              key={dim.key}
              type="button"
              onClick={() => setActiveKey(dim.key)}
              className={cn(
                'px-3 py-1 text-[10px] uppercase tracking-[0.06em] rounded-sm transition-colors inline-flex items-center gap-1',
                isActive
                  ? 'bg-[var(--depot-ink)] text-white font-medium'
                  : 'bg-[var(--depot-surface-alt)] text-[var(--depot-muted)] hover:text-[var(--depot-ink)] hover:bg-[var(--depot-surface-alt)]',
              )}
            >
              {dim.label}
              {isOver && (
                <AlertTriangle
                  className={cn(
                    'h-3 w-3',
                    isActive ? 'text-amber-300' : 'text-amber-500',
                  )}
                />
              )}
              {hasFilter && (
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isActive ? 'bg-blue-300' : 'bg-blue-500',
                )} />
              )}
            </button>
          )
        })}

        {/* Clear filter indicator */}
        {selectedFilter && (
          <button
            type="button"
            onClick={() => onFilterSelect?.(selectedFilter.dimensionKey, selectedFilter.valueCode)}
            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-blue-600 bg-blue-50 rounded-sm hover:bg-blue-100 transition-colors"
          >
            <span className="uppercase tracking-wider font-medium">
              {dimensions.find(d => d.key === selectedFilter.dimensionKey)?.labels[selectedFilter.valueCode] ?? selectedFilter.valueCode}
            </span>
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </div>

      {/* Active dimension breakdown */}
      {active && (
        <BreakdownView
          dimension={active}
          totalSlots={totalSlots}
          targetSlotCount={targetSlotCount}
          isOver={overageDimensions.has(active.key)}
          onEditTargets={onEditTargets}
          selectedFilter={selectedFilter}
          onFilterSelect={onFilterSelect}
          seasonContext={seasonContext}
          slotSummary={slotSummary}
        />
      )}
    </div>
  )
}

// ─── Breakdown View ─────────────────────────────────────────────────

function BreakdownView({
  dimension,
  totalSlots,
  targetSlotCount,
  isOver,
  onEditTargets,
  selectedFilter,
  onFilterSelect,
  seasonContext,
  slotSummary,
}: {
  dimension: DimensionConfig
  totalSlots: number
  targetSlotCount: number
  isOver: boolean
  onEditTargets?: (dimensionKey: string) => void
  selectedFilter?: DimensionFilter | null
  onFilterSelect?: (dimensionKey: string, valueCode: string) => void
  seasonContext?: AssortmentMixContext['season']
  slotSummary?: AssortmentMixContext['summary']
}) {
  const { targets, actuals, labels, editTab } = dimension

  // Show ALL values from labels (the full taxonomy), plus any extra from targets/actuals
  const allKeys = [
    ...new Set([...Object.keys(labels), ...Object.keys(targets), ...Object.keys(actuals.counts)]),
  ]

  const hasTargets = Object.keys(targets).length > 0
  const dimTargetTotal = Object.values(targets).reduce((s, v) => s + (v || 0), 0)
  const isFilterable = !!onFilterSelect

  return (
    <div>
      {/* Overage warning banner */}
      {isOver && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-sm bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <p className="text-[10px] text-amber-700">
            Total targets ({dimTargetTotal} slots) exceed the overall target ({targetSlotCount} slots)
          </p>
        </div>
      )}

      {/* Two-column layout: values list + AI advice panel */}
      <div className="grid grid-cols-[1fr_1fr] gap-8">
        {/* Left: dimension values */}
        <div>
          {allKeys.map((key) => {
            const target = targets[key] ?? 0
            const actual = actuals.counts[key] ?? 0
            const label = labels[key] ?? key
            const hasTarget = target > 0
            const isItemOver = hasTarget && actual > target
            const isSelected =
              selectedFilter?.dimensionKey === dimension.key &&
              selectedFilter?.valueCode === key

            return (
              <button
                key={key}
                type="button"
                disabled={!isFilterable}
                onClick={() => onFilterSelect?.(dimension.key, key)}
                className={cn(
                  'flex w-full rounded-sm px-2 py-1.5 text-left transition-all items-baseline',
                  isFilterable && 'cursor-pointer hover:bg-[var(--depot-surface-alt)]',
                  isSelected && 'bg-blue-50 ring-1 ring-blue-200',
                  !isFilterable && 'cursor-default',
                )}
              >
                {/* Label */}
                <span
                  className={cn(
                    'text-[11px] shrink-0',
                    isSelected ? 'text-blue-700 font-medium' : 'text-[var(--depot-ink-light)]',
                  )}
                  title={label}
                >
                  {label}
                </span>

                {/* Dot leader */}
                <span
                  className="flex-1 mx-1.5 border-b border-dotted border-[var(--depot-hairline)] translate-y-[-3px]"
                  aria-hidden
                />

                {/* Actual / Target */}
                <span className="shrink-0 whitespace-nowrap">
                  <span
                    className={cn(
                      'text-[11px] tabular-nums font-medium',
                      isSelected
                        ? 'text-blue-700'
                        : isItemOver
                          ? 'text-amber-600'
                          : 'text-[var(--depot-ink)]',
                    )}
                  >
                    {actual}
                  </span>
                  <span className="text-[11px] text-[var(--depot-faint)] mx-0.5">/</span>
                  {hasTarget ? (
                    <span
                      className={cn(
                        'text-[11px] tabular-nums',
                        isItemOver ? 'text-amber-600' : 'text-[var(--depot-faint)]',
                      )}
                    >
                      {target}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--depot-faint)] italic">
                      –
                    </span>
                  )}
                </span>
              </button>
            )
          })}

          {/* Per-dimension CTA */}
          {editTab && onEditTargets && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => onEditTargets(dimension.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[var(--depot-muted)] hover:text-[var(--depot-ink)] transition-colors"
              >
                {hasTargets ? (
                  <>
                    <Pencil className="h-3 w-3" />
                    Edit Targets
                  </>
                ) : (
                  <>
                    <Crosshair className="h-3 w-3" />
                    Add Targets
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right: AI insights panel */}
        {seasonContext && slotSummary ? (
          <AssortmentInsightPanel
            seasonContext={seasonContext}
            dimension={{
              key: dimension.key,
              label: dimension.label,
              targets: dimension.targets,
              actuals: dimension.actuals.counts,
              labels: dimension.labels,
            }}
            summary={slotSummary}
          />
        ) : (
          <div className="border border-dashed border-[var(--depot-hairline)] rounded-md px-5 py-4 flex flex-col items-center justify-center text-center min-h-[120px]">
            <p className="text-[10px] text-[var(--depot-faint)] leading-relaxed max-w-[200px]">
              AI insights unavailable
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
