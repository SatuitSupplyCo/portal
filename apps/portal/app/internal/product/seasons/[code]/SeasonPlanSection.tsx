'use client'

import { useState, useCallback } from 'react'
import { Pencil } from 'lucide-react'
import { EditSeasonPlanDialog } from './EditSeasonPlanDialog'
import { InfoTooltip, type GlossaryEntry } from '@/components/InfoTooltip'

// ─── Types ──────────────────────────────────────────────────────────

interface SeasonPlanSectionProps {
  seasonId: string
  seasonName: string
  // Actuals
  totalSlots: number
  filledSlots: number
  openSlotCount: number
  evergreenPct: number
  evergreenCount: number
  // Targets
  targetSlotCount: number
  marginTarget: string | null
  targetEvergreenPct: number | null
  glossary?: Record<string, GlossaryEntry>
}

// ─── Component ──────────────────────────────────────────────────────

export function SeasonPlanSection({
  seasonId,
  seasonName,
  totalSlots,
  filledSlots,
  openSlotCount,
  evergreenPct,
  evergreenCount,
  targetSlotCount,
  marginTarget,
  targetEvergreenPct,
  glossary,
}: SeasonPlanSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const openDialog = useCallback(() => setDialogOpen(true), [])

  return (
    <>
      {/* 2×2 KPI grid with edit affordance */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          {/* Slots */}
          <div>
            <p className="text-[9px] text-[var(--depot-faint)] uppercase tracking-widest mb-1 flex items-center gap-1">
              Slots
              <InfoTooltip slug="target-slots" glossary={glossary} />
            </p>
            <span className="text-lg font-semibold text-[var(--depot-ink)] tabular-nums leading-none">
              {totalSlots}
            </span>
            <span className="text-[11px] text-[var(--depot-faint)] tabular-nums ml-1.5">
              / {targetSlotCount}
            </span>
          </div>

          {/* Styles */}
          <div>
            <p className="text-[9px] text-[var(--depot-faint)] uppercase tracking-widest mb-1">Styles</p>
            <span className="text-lg font-semibold text-[var(--depot-ink)] tabular-nums leading-none">
              {filledSlots}
            </span>
            <span className="text-[10px] text-[var(--depot-faint)] ml-1.5">
              ({openSlotCount} open)
            </span>
          </div>

          {/* Margin */}
          <div>
            <p className="text-[9px] text-[var(--depot-faint)] uppercase tracking-widest mb-1 flex items-center gap-1">
              Margin
              <InfoTooltip slug="margin-target" glossary={glossary} />
            </p>
            {marginTarget ? (
              <>
                <span className="text-lg font-semibold text-[var(--depot-ink)] tabular-nums leading-none">
                  {marginTarget}%
                </span>
                <span className="text-[11px] text-[var(--depot-faint)] ml-1.5">target</span>
              </>
            ) : (
              <span className="text-sm text-[var(--depot-faint)] leading-none">—</span>
            )}
          </div>

          {/* Evergreen */}
          <div>
            <p className="text-[9px] text-[var(--depot-faint)] uppercase tracking-widest mb-1 flex items-center gap-1">
              Evergreen
              <InfoTooltip slug="evergreen-pct" glossary={glossary} />
            </p>
            <span className="text-lg font-semibold text-[var(--depot-ink)] tabular-nums leading-none">
              {evergreenPct}%
            </span>
            {targetEvergreenPct != null && targetEvergreenPct > 0 ? (
              <span className="text-[11px] text-[var(--depot-faint)] tabular-nums ml-1.5">
                / {targetEvergreenPct}%
              </span>
            ) : (
              <span className="text-[10px] text-[var(--depot-faint)] ml-1.5">
                ({evergreenCount} of {totalSlots})
              </span>
            )}
          </div>
        </div>

        {/* Edit pencil — top-right of the KPI block */}
        <button
          type="button"
          onClick={openDialog}
          className="absolute top-0 right-0 text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
          title="Edit Season Plan"
        >
          <Pencil className="h-3 w-3" />
        </button>
      </div>

      <EditSeasonPlanDialog
        seasonId={seasonId}
        seasonName={seasonName}
        currentTargetSlotCount={targetSlotCount}
        currentMarginTarget={marginTarget}
        currentTargetEvergreenPct={targetEvergreenPct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
