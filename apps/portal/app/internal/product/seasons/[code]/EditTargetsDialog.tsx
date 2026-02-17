'use client'

import { useState, useTransition, useMemo, useEffect } from 'react'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/dialog'
import { Settings2, AlertTriangle } from 'lucide-react'
import { cn } from '@repo/ui/utils'
import { updateSeason } from '../../actions'

// ─── Types ──────────────────────────────────────────────────────────

export type EditTargetsTab =
  | 'category'
  | 'construction'
  | 'weightClass'
  | 'sellingWindow'
  | 'tenure'
  | 'useCase'
  | 'gender'
  | 'ageGroup'

export interface DimensionOption {
  key: string
  label: string
  group?: string
}

interface EditTargetsDialogProps {
  seasonId: string
  seasonName: string
  currentTargetSlotCount: number
  currentCategoryTargets: Record<string, number>
  currentConstructionTargets: Record<string, number>
  currentWeightClassTargets: Record<string, number>
  currentSellingWindowTargets: Record<string, number>
  currentTenureTargets: Record<string, number>
  currentUseCaseTargets: Record<string, number>
  currentGenderTargets: Record<string, number>
  currentAgeGroupTargets: Record<string, number>
  dimensionOptions: {
    category: DimensionOption[]
    construction: DimensionOption[]
    weightClass: DimensionOption[]
    sellingWindow: DimensionOption[]
    tenure: DimensionOption[]
    useCase: DimensionOption[]
    gender: DimensionOption[]
    ageGroup: DimensionOption[]
  }
  initialTab?: EditTargetsTab
  /** When set, only show Overall + this one dimension (per-dimension CTA mode) */
  focusedDimension?: EditTargetsTab
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// ─── Dimension metadata ─────────────────────────────────────────────

const DIMENSIONS: { id: EditTargetsTab; label: string }[] = [
  { id: 'category', label: 'Category' },
  { id: 'construction', label: 'Construction' },
  { id: 'weightClass', label: 'Weight' },
  { id: 'sellingWindow', label: 'Window' },
  { id: 'tenure', label: 'Tenure' },
  { id: 'useCase', label: 'Use Case' },
  { id: 'gender', label: 'Gender' },
  { id: 'ageGroup', label: 'Age' },
]

// ─── Component ──────────────────────────────────────────────────────

export function EditTargetsDialog({
  seasonId,
  seasonName,
  currentTargetSlotCount,
  currentCategoryTargets,
  currentConstructionTargets,
  currentWeightClassTargets,
  currentSellingWindowTargets,
  currentTenureTargets,
  currentUseCaseTargets,
  currentGenderTargets,
  currentAgeGroupTargets,
  dimensionOptions,
  initialTab,
  focusedDimension,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditTargetsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<EditTargetsTab>(initialTab ?? 'category')
  const [showOverageConfirm, setShowOverageConfirm] = useState(false)

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab])

  // When focused, only show the focused dimension (no Overall tab)
  const visibleTabs = useMemo(() => {
    if (focusedDimension) {
      return DIMENSIONS.filter((d) => d.id === focusedDimension)
    }
    return DIMENSIONS
  }, [focusedDimension])

  // ─── State ──────────────────────────────────────────────────────

  const targetSlotCount = currentTargetSlotCount
  const [categoryTargets, setCategoryTargets] = useState<Record<string, number>>(currentCategoryTargets)
  const [constructionTargets, setConstructionTargets] = useState<Record<string, number>>(currentConstructionTargets)
  const [weightClassTargets, setWeightClassTargets] = useState<Record<string, number>>(currentWeightClassTargets)
  const [sellingWindowTargets, setSellingWindowTargets] = useState<Record<string, number>>(currentSellingWindowTargets)
  const [tenureTargets, setTenureTargets] = useState<Record<string, number>>(currentTenureTargets)
  const [useCaseTargets, setUseCaseTargets] = useState<Record<string, number>>(currentUseCaseTargets)
  const [genderTargets, setGenderTargets] = useState<Record<string, number>>(currentGenderTargets)
  const [ageGroupTargets, setAgeGroupTargets] = useState<Record<string, number>>(currentAgeGroupTargets)

  // ─── Computed totals ────────────────────────────────────────────

  const sum = (rec: Record<string, number>) =>
    Object.values(rec).reduce((s, v) => s + (v || 0), 0)

  const totals = useMemo(
    () => ({
      category: sum(categoryTargets),
      construction: sum(constructionTargets),
      weightClass: sum(weightClassTargets),
      sellingWindow: sum(sellingWindowTargets),
      tenure: sum(tenureTargets),
      useCase: sum(useCaseTargets),
      gender: sum(genderTargets),
      ageGroup: sum(ageGroupTargets),
    }),
    [categoryTargets, constructionTargets, weightClassTargets, sellingWindowTargets, tenureTargets, useCaseTargets, genderTargets, ageGroupTargets],
  )

  const visibleDimKeys = useMemo(
    () => new Set<string>(visibleTabs.map((t) => t.id)),
    [visibleTabs],
  )

  const overages = useMemo(() => {
    const result: Record<string, boolean> = {}
    for (const [key, total] of Object.entries(totals)) {
      if (visibleDimKeys.has(key) && total > targetSlotCount && total > 0) result[key] = true
    }
    return result
  }, [totals, targetSlotCount, visibleDimKeys])

  const hasAnyOverage = Object.keys(overages).length > 0

  // ─── Helpers ────────────────────────────────────────────────────

  function updateTarget(
    setter: React.Dispatch<React.SetStateAction<Record<string, number>>>,
    key: string,
    raw: string,
  ) {
    const val = raw === '' ? 0 : parseInt(raw, 10)
    if (isNaN(val) || val < 0) return
    setter((prev) => {
      const next = { ...prev }
      if (val === 0) delete next[key]
      else next[key] = val
      return next
    })
  }

  function doSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateSeason(seasonId, {
        categoryTargets,
        constructionTargets,
        weightClassTargets,
        sellingWindowTargets,
        tenureTargets,
        useCaseTargets,
        genderTargets,
        ageGroupTargets,
      })
      if (!result.success) setError(result.error)
      else { setShowOverageConfirm(false); setOpen(false) }
    })
  }

  function handleSave() {
    if (hasAnyOverage) { setShowOverageConfirm(true); return }
    doSave()
  }

  function resetToCurrentValues() {
    setCategoryTargets(currentCategoryTargets)
    setConstructionTargets(currentConstructionTargets)
    setWeightClassTargets(currentWeightClassTargets)
    setSellingWindowTargets(currentSellingWindowTargets)
    setTenureTargets(currentTenureTargets)
    setUseCaseTargets(currentUseCaseTargets)
    setGenderTargets(currentGenderTargets)
    setAgeGroupTargets(currentAgeGroupTargets)
    setActiveTab(initialTab ?? 'category')
    setShowOverageConfirm(false)
    setError(null)
  }

  // ─── Map tabs to state ──────────────────────────────────────────

  const dimensionState: Record<
    string,
    { targets: Record<string, number>; setter: React.Dispatch<React.SetStateAction<Record<string, number>>>; options: DimensionOption[]; total: number }
  > = {
    category: { targets: categoryTargets, setter: setCategoryTargets, options: dimensionOptions.category, total: totals.category },
    construction: { targets: constructionTargets, setter: setConstructionTargets, options: dimensionOptions.construction, total: totals.construction },
    weightClass: { targets: weightClassTargets, setter: setWeightClassTargets, options: dimensionOptions.weightClass, total: totals.weightClass },
    sellingWindow: { targets: sellingWindowTargets, setter: setSellingWindowTargets, options: dimensionOptions.sellingWindow, total: totals.sellingWindow },
    tenure: { targets: tenureTargets, setter: setTenureTargets, options: dimensionOptions.tenure, total: totals.tenure },
    useCase: { targets: useCaseTargets, setter: setUseCaseTargets, options: dimensionOptions.useCase, total: totals.useCase },
    gender: { targets: genderTargets, setter: setGenderTargets, options: dimensionOptions.gender, total: totals.gender },
    ageGroup: { targets: ageGroupTargets, setter: setAgeGroupTargets, options: dimensionOptions.ageGroup, total: totals.ageGroup },
  }

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (v) resetToCurrentValues()
        if (!v) setShowOverageConfirm(false)
      }}
    >
      {!isControlled && (
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            Edit Targets
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {focusedDimension
              ? `${DIMENSIONS.find((d) => d.id === focusedDimension)?.label ?? ''} Targets`
              : 'Assortment Targets'}
          </DialogTitle>
          <DialogDescription>
            Set slot count targets for {seasonName}.
          </DialogDescription>
        </DialogHeader>

        {/* Tab navigation — hidden when only one tab is visible */}
        {visibleTabs.length > 1 && (
        <div className="flex gap-0.5 border-b border-[var(--depot-hairline)] -mx-6 px-6 overflow-x-auto">
          {visibleTabs.map((dim) => {
            const isOver = overages[dim.id]
            return (
              <button
                key={dim.id}
                type="button"
                onClick={() => setActiveTab(dim.id)}
                className={cn(
                  'px-2 py-2 text-[9px] font-medium uppercase tracking-wider transition-colors relative whitespace-nowrap flex items-center gap-1',
                  activeTab === dim.id
                    ? 'text-[var(--depot-ink)]'
                    : 'text-[var(--depot-faint)] hover:text-[var(--depot-ink-light)]',
                )}
              >
                {dim.label}
                {isOver && <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />}
                {activeTab === dim.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-[var(--depot-ink)]" />
                )}
              </button>
            )
          })}
        </div>
        )}

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
          {dimensionState[activeTab] && (
            <DimensionEditor
              tab={activeTab}
              options={dimensionState[activeTab].options}
              values={dimensionState[activeTab].targets}
              total={dimensionState[activeTab].total}
              targetSlotCount={targetSlotCount}
              isOver={!!overages[activeTab]}
              onChange={(key, val) => updateTarget(dimensionState[activeTab].setter, key, val)}
            />
          )}
        </div>

        {/* Overage confirmation */}
        {showOverageConfirm && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-amber-800">
                  Dimension targets exceed the overall slot target
                </p>
                <p className="text-[10px] text-amber-700 mt-1">
                  One or more dimensions exceed {targetSlotCount} slots. Save anyway?
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => setShowOverageConfirm(false)} className="text-[11px] h-7">
                Go Back
              </Button>
              <Button size="sm" onClick={doSave} disabled={isPending} className="text-[11px] h-7 bg-amber-600 hover:bg-amber-700">
                {isPending ? 'Saving...' : 'Save Anyway'}
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!showOverageConfirm && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Targets'}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Dimension Editor ────────────────────────────────────────────────

function DimensionEditor({
  tab, options, values, total, targetSlotCount, isOver, onChange,
}: {
  tab: EditTargetsTab; options: DimensionOption[]; values: Record<string, number>
  total: number; targetSlotCount: number; isOver: boolean
  onChange: (key: string, val: string) => void
}) {
  const label = DIMENSIONS.find((d) => d.id === tab)?.label ?? tab

  const groups = useMemo(() => {
    const grouped = new Map<string, DimensionOption[]>()
    for (const opt of options) {
      const g = opt.group ?? ''
      if (!grouped.has(g)) grouped.set(g, [])
      grouped.get(g)!.push(opt)
    }
    return grouped
  }, [options])

  const hasGroups = groups.size > 1 || (groups.size === 1 && !groups.has(''))

  return (
    <div className="space-y-4">
      <TotalIndicator total={total} targetSlotCount={targetSlotCount} label={label} isOver={isOver} />
      {hasGroups ? (
        Array.from(groups.entries()).map(([groupName, groupOptions]) => (
          <div key={groupName || '_ungrouped'}>
            {groupName && (
              <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider mb-2">{groupName}</p>
            )}
            <div className="space-y-2">
              {groupOptions.map((opt) => (
                <TargetRow key={opt.key} label={opt.label} value={values[opt.key] ?? 0} onChange={(v) => onChange(opt.key, v)} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="space-y-2">
          {options.map((opt) => (
            <TargetRow key={opt.key} label={opt.label} value={values[opt.key] ?? 0} onChange={(v) => onChange(opt.key, v)} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────

function TotalIndicator({ total, targetSlotCount, label, isOver }: { total: number; targetSlotCount: number; label: string; isOver: boolean }) {
  const isExact = total === targetSlotCount && total > 0
  return (
    <div className="flex items-center justify-between">
      <p className="text-[10px] text-[var(--depot-faint)] uppercase tracking-wider">{label} Distribution</p>
      <div className="flex items-center gap-1.5">
        {isOver && <AlertTriangle className="h-3 w-3 text-amber-500" />}
        <p className={cn('text-[11px] font-medium tabular-nums', isOver ? 'text-amber-600' : isExact ? 'text-emerald-600' : 'text-[var(--depot-ink)]')}>
          {total} / {targetSlotCount} slots
        </p>
      </div>
    </div>
  )
}

function TargetRow({ label, value, onChange }: { label: string; value: number; onChange: (val: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[var(--depot-ink-light)] w-28 truncate" title={label}>{label}</span>
      <div className="flex items-center gap-1 ml-auto">
        <Input type="number" min={0} max={999} value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-16 h-7 text-[11px] text-right tabular-nums" placeholder="0" />
        <span className="text-[10px] text-[var(--depot-faint)] w-8">slots</span>
      </div>
    </div>
  )
}
