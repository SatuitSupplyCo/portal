'use client'

import { useState, useTransition } from 'react'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/dialog'
import { Settings2 } from 'lucide-react'
import { updateSeason } from '../../actions'

// ─── Props ──────────────────────────────────────────────────────────

interface EditSeasonPlanDialogProps {
  seasonId: string
  seasonName: string
  currentTargetSlotCount: number
  currentMarginTarget: string | null
  currentTargetEvergreenPct: number | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// ─── Component ──────────────────────────────────────────────────────

export function EditSeasonPlanDialog({
  seasonId,
  seasonName,
  currentTargetSlotCount,
  currentMarginTarget,
  currentTargetEvergreenPct,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditSeasonPlanDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // ─── State ──────────────────────────────────────────────────────
  const [targetSlotCount, setTargetSlotCount] = useState(currentTargetSlotCount)
  const [marginTarget, setMarginTarget] = useState(currentMarginTarget ?? '')
  const [targetEvergreenPct, setTargetEvergreenPct] = useState(currentTargetEvergreenPct ?? 0)

  function resetToCurrentValues() {
    setError(null)
    setTargetSlotCount(currentTargetSlotCount)
    setMarginTarget(currentMarginTarget ?? '')
    setTargetEvergreenPct(currentTargetEvergreenPct ?? 0)
  }

  function handleSave() {
    setError(null)
    if (targetSlotCount < 1) {
      setError('Target slot count must be at least 1.')
      return
    }
    if (targetEvergreenPct < 0 || targetEvergreenPct > 100) {
      setError('Evergreen % must be between 0 and 100.')
      return
    }
    startTransition(async () => {
      const result = await updateSeason(seasonId, {
        targetSkuCount: targetSlotCount,
        marginTarget: marginTarget || undefined,
        targetEvergreenPct: targetEvergreenPct || undefined,
      })
      if (!result.success) {
        setError(result.error)
      } else {
        setOpen(false)
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (v) resetToCurrentValues()
      }}
    >
      {!isControlled && (
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
          <Settings2 className="h-3.5 w-3.5" />
          Edit Plan
        </Button>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Season Plan</DialogTitle>
          <DialogDescription>
            Set high-level planning targets for {seasonName}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Total Slots */}
          <div className="grid gap-1.5">
            <Label htmlFor="sp-slots" className="text-[11px] uppercase tracking-wider text-[var(--depot-faint)]">
              Total Slots
            </Label>
            <Input
              id="sp-slots"
              type="number"
              min={1}
              value={targetSlotCount || ''}
              onChange={(e) => setTargetSlotCount(parseInt(e.target.value) || 0)}
              placeholder="e.g. 120"
            />
            <p className="text-[10px] text-[var(--depot-faint)]">
              Target number of slots for the season.
            </p>
          </div>

          {/* Margin Target */}
          <div className="grid gap-1.5">
            <Label htmlFor="sp-margin" className="text-[11px] uppercase tracking-wider text-[var(--depot-faint)]">
              Margin Target %
            </Label>
            <div className="relative">
              <Input
                id="sp-margin"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={marginTarget}
                onChange={(e) => setMarginTarget(e.target.value)}
                placeholder="e.g. 62.5"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--depot-faint)]">
                %
              </span>
            </div>
          </div>

          {/* Evergreen % */}
          <div className="grid gap-1.5">
            <Label htmlFor="sp-evergreen" className="text-[11px] uppercase tracking-wider text-[var(--depot-faint)]">
              Evergreen %
            </Label>
            <div className="relative">
              <Input
                id="sp-evergreen"
                type="number"
                min={0}
                max={100}
                value={targetEvergreenPct || ''}
                onChange={(e) => setTargetEvergreenPct(parseInt(e.target.value) || 0)}
                placeholder="e.g. 30"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--depot-faint)]">
                %
              </span>
            </div>
            <p className="text-[10px] text-[var(--depot-faint)]">
              Target percentage of slots that are evergreen / multi-season.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
