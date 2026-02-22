'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@repo/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/select'
import { Pencil, AlertTriangle, SlidersHorizontal, Loader2 } from 'lucide-react'
import {
  updateStudioEntry,
  getColorDetail,
  getColorEditContext,
} from '@/app/internal/studio/actions'
import {
  isValidHex,
  hexToHsl,
  hslToHex,
  textColorForBg,
  type ColorDetailData,
} from '@/lib/color'
export type { ColorDetailData } from '@/lib/color'

type FullDetail = Awaited<ReturnType<typeof getColorDetail>>
type EditContext = Awaited<ReturnType<typeof getColorEditContext>>

// ─── Constants ───────────────────────────────────────────────────────

import { STUDIO_STATUS_COLORS as STATUS_COLORS, STUDIO_STATUS_LABELS as STATUS_LABELS } from "@/lib/status"

const SOURCES = [
  { value: 'internal', label: 'Internal' },
  { value: 'competitor', label: 'Competitor' },
  { value: 'archive', label: 'Archive' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'mill_library', label: 'Mill Library' },
  { value: 'street', label: 'Street' },
  { value: 'other', label: 'Other' },
] as const

// ─── Detail Row ──────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[10px] font-semibold text-[var(--depot-ink)] shrink-0 w-24 uppercase tracking-[0.08em]">
        {label}
      </span>
      <span className="text-[10px] font-light text-[var(--depot-muted)] tracking-wide">
        {children}
      </span>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────

interface ColorDetailDialogProps {
  color: ColorDetailData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Fires after a successful save with the updated color data. */
  onColorSaved?: (updated: ColorDetailData) => void
}

export function ColorDetailDialog({
  color,
  open,
  onOpenChange,
  onColorSaved,
}: ColorDetailDialogProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [detail, setDetail] = useState<FullDetail>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editCtx, setEditCtx] = useState<EditContext | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editHex, setEditHex] = useState('#')
  const [editHsl, setEditHsl] = useState<[number, number, number]>([0, 50, 50])
  const [editPantone, setEditPantone] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editCollectionId, setEditCollectionId] = useState('')
  const [editTargetSeasonId, setEditTargetSeasonId] = useState('')
  const [editSource, setEditSource] = useState('')
  const [editSourceUrl, setEditSourceUrl] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true)
    const result = await getColorDetail(id)
    setDetail(result)
    setDetailLoading(false)
  }, [])

  useEffect(() => {
    if (open && color) {
      setMode('view')
      setError(null)
      setEditCtx(null)
      setPickerOpen(false)
      fetchDetail(color.id)
    }
    if (!open) {
      setDetail(null)
    }
  }, [open, color?.id, fetchDetail])

  async function handleEditClick() {
    if (!color) return
    setEditLoading(true)
    const ctx = await getColorEditContext(color.id)
    setEditCtx(ctx)
    setEditLoading(false)

    const d = detail ?? color
    setEditTitle(d.title)
    setEditHex(d.hex || '#')
    if (d.hex && isValidHex(d.hex)) setEditHsl(hexToHsl(d.hex))
    setEditPantone(d.pantone || '')
    setEditDescription((detail?.description) || '')
    setEditTags((detail?.tags ?? d.tags ?? []).join(', '))
    setEditCollectionId(detail?.collectionId || '')
    setEditTargetSeasonId(detail?.targetSeasonId || '')
    setEditSource(detail?.inspirationSource || '')
    setEditSourceUrl(detail?.sourceUrl || '')

    setMode('edit')
  }

  function handleCancelEdit() {
    setMode('view')
    setError(null)
    setPickerOpen(false)
  }

  function handleSave() {
    if (!color) return
    setError(null)

    const validHex = isValidHex(editHex)
    const pantone = editPantone.trim()
    if (!validHex && !pantone) {
      setError('A Pantone code or hex value is required.')
      return
    }

    const categoryMetadata: Record<string, unknown> = {}
    if (validHex) categoryMetadata.hex = editHex
    if (pantone) categoryMetadata.pantone = pantone

    const tags = editTags
      ? editTags.split(',').map((t) => t.trim()).filter(Boolean)
      : []

    startTransition(async () => {
      const result = await updateStudioEntry(color.id, {
        title: editTitle.trim() || undefined,
        description: editDescription.trim() || undefined,
        tags,
        collectionId: editCollectionId || null,
        targetSeasonId: editTargetSeasonId || null,
        inspirationSource: editSource || null,
        sourceUrl: editSourceUrl.trim() || null,
        categoryMetadata,
      })

      if (result.success) {
        const updatedColor: ColorDetailData = {
          id: color.id,
          title: editTitle.trim() || color.title,
          hex: isValidHex(editHex) ? editHex : null,
          pantone: editPantone.trim() || null,
          description: editDescription.trim() || null,
          tags: tags.length > 0 ? tags : null,
        }
        onColorSaved?.(updatedColor)
        setMode('view')
        setPickerOpen(false)
        fetchDetail(color.id)
        router.refresh()
      } else {
        setError(result.error || 'Failed to save changes.')
      }
    })
  }

  function updateHexFromHsl(h: number, s: number, l: number) {
    setEditHsl([h, s, l])
    setEditHex(hslToHex(h, s, l))
  }

  function syncHslFromHex(newHex: string) {
    setEditHex(newHex)
    if (isValidHex(newHex)) setEditHsl(hexToHsl(newHex))
  }

  if (!color) return null

  const d = detail ?? color
  const displayHex = mode === 'edit'
    ? (isValidHex(editHex) ? editHex : null)
    : d.hex
  const displayTitle = mode === 'edit' ? editTitle : d.title

  const hasUsageWarning =
    editCtx &&
    (editCtx.usage.seasons.length > 0 || editCtx.usage.slotCount > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">
          {d.title} — Color Detail
        </DialogTitle>

        {/* ─── Color Swatch Header ──────────────────────────── */}
        <div
          className="h-28 w-full rounded-t-lg transition-colors relative"
          style={{ backgroundColor: displayHex ?? '#e5e7eb' }}
        >
          <div className="absolute inset-x-0 bottom-0 px-6 pb-3 pt-10 bg-gradient-to-t from-black/20 to-transparent">
            {mode === 'edit' ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Color name…"
                className="w-full bg-transparent border-none outline-none text-lg font-semibold tracking-tight placeholder:opacity-50 focus:ring-0"
                style={{
                  color: displayHex ? textColorForBg(displayHex) : '#fff',
                  caretColor: displayHex ? textColorForBg(displayHex) : '#fff',
                }}
              />
            ) : (
              <p
                className="text-lg font-semibold tracking-tight"
                style={{ color: displayHex ? textColorForBg(displayHex) : '#fff' }}
              >
                {displayTitle}
              </p>
            )}
          </div>

          {mode === 'edit' && (
            <button
              type="button"
              onClick={() => setPickerOpen(!pickerOpen)}
              className="absolute top-3 right-4 p-1 rounded-md transition-colors"
              style={{
                color: displayHex ? textColorForBg(displayHex) : '#fff',
                backgroundColor: pickerOpen
                  ? (displayHex ? `${textColorForBg(displayHex)}18` : '#ffffff18')
                  : 'transparent',
              }}
              title={pickerOpen ? 'Hide color picker' : 'Adjust color'}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* ─── HSL Picker (edit mode) ───────────────────────── */}
        {mode === 'edit' && pickerOpen && (
          <div className="px-6 pt-4 pb-4 space-y-2.5 border-b border-border bg-muted/30">
            {[
              { label: 'Hue', idx: 0, max: 360, unit: '°',
                bg: `linear-gradient(to right, hsl(0,${editHsl[1]}%,${editHsl[2]}%), hsl(60,${editHsl[1]}%,${editHsl[2]}%), hsl(120,${editHsl[1]}%,${editHsl[2]}%), hsl(180,${editHsl[1]}%,${editHsl[2]}%), hsl(240,${editHsl[1]}%,${editHsl[2]}%), hsl(300,${editHsl[1]}%,${editHsl[2]}%), hsl(360,${editHsl[1]}%,${editHsl[2]}%))` },
              { label: 'Saturation', idx: 1, max: 100, unit: '%',
                bg: `linear-gradient(to right, hsl(${editHsl[0]},0%,${editHsl[2]}%), hsl(${editHsl[0]},100%,${editHsl[2]}%))` },
              { label: 'Lightness', idx: 2, max: 100, unit: '%',
                bg: `linear-gradient(to right, hsl(${editHsl[0]},${editHsl[1]}%,0%), hsl(${editHsl[0]},${editHsl[1]}%,50%), hsl(${editHsl[0]},${editHsl[1]}%,100%))` },
            ].map(({ label, idx, max, unit, bg }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px]">{label}</Label>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {editHsl[idx]}{unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={max}
                  value={editHsl[idx]}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    const next: [number, number, number] = [...editHsl]
                    next[idx] = v
                    updateHexFromHsl(next[0], next[1], next[2])
                  }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: bg }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ─── View Mode Body ───────────────────────────────── */}
        {mode === 'view' && (
          <div className="px-6 py-5 space-y-4" style={{ fontFamily: 'var(--depot-font)' }}>
            {detailLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Codes */}
                <div className="flex items-center gap-3 flex-wrap">
                  {d.hex && (
                    <span className="text-[11px] font-mono bg-muted px-2 py-1 rounded uppercase">
                      {d.hex}
                    </span>
                  )}
                  {d.pantone && (
                    <span className="text-[11px] font-mono bg-muted px-2 py-1 rounded">
                      {d.pantone}
                    </span>
                  )}
                  {detail?.status && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${STATUS_COLORS[detail.status] ?? ''}`}
                    >
                      {STATUS_LABELS[detail.status] ?? detail.status}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {detail?.collectionName && (
                    <DetailRow label="Collection">{detail.collectionName}</DetailRow>
                  )}
                  {detail?.inspirationSource && (
                    <DetailRow label="Source">
                      {SOURCES.find((s) => s.value === detail.inspirationSource)?.label ??
                        detail.inspirationSource}
                    </DetailRow>
                  )}
                  {detail?.owner && (
                    <DetailRow label="Owner">{detail.owner}</DetailRow>
                  )}
                  {detail?.createdAt && (
                    <DetailRow label="Created">
                      {new Date(detail.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </DetailRow>
                  )}
                </div>

                {/* Description */}
                {detail?.description && (
                  <div className="pt-2 border-t border-[var(--depot-hairline)]">
                    <p className="text-[10px] font-light text-[var(--depot-muted)] leading-relaxed tracking-wide">
                      {detail.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {detail?.tags && detail.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {detail.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Source URL */}
                {detail?.sourceUrl && (
                  <a
                    href={detail.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 hover:underline truncate block"
                  >
                    {detail.sourceUrl}
                  </a>
                )}

                {/* Edit button */}
                <div className="pt-3 border-t border-[var(--depot-hairline)] flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={handleEditClick}
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Pencil className="h-3 w-3" />
                    )}
                    Edit Color
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── Edit Mode Body ───────────────────────────────── */}
        {mode === 'edit' && (
          <div className="px-6 py-4 space-y-4">
            {/* Usage warning */}
            {hasUsageWarning && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-[11px] font-semibold text-amber-800">
                    This color is in use
                  </p>
                </div>
                <ul className="text-[10px] text-amber-700 space-y-0.5 ml-6">
                  {editCtx!.usage.seasons.map((s) => (
                    <li key={s.id}>
                      Assigned to <strong>{s.name}</strong> ({s.status})
                    </li>
                  ))}
                  {editCtx!.usage.slotCount > 0 && (
                    <li>
                      Referenced in <strong>{editCtx!.usage.slotCount}</strong> slot
                      {editCtx!.usage.slotCount !== 1 ? ' colorways' : ' colorway'}
                    </li>
                  )}
                </ul>
                <p className="text-[9px] text-amber-600 ml-6">
                  Changes will be reflected everywhere this color appears.
                </p>
              </div>
            )}

            {/* Hex + Pantone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium">Hex</Label>
                <Input
                  value={editHex}
                  onChange={(e) =>
                    syncHslFromHex(
                      e.target.value.startsWith('#')
                        ? e.target.value
                        : `#${e.target.value}`,
                    )
                  }
                  className="font-mono h-9"
                  placeholder="#4A6FA5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium">Pantone</Label>
                <Input
                  value={editPantone}
                  onChange={(e) => setEditPantone(e.target.value)}
                  className="h-9"
                  placeholder="19-4052 TCX"
                />
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium">Notes</Label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Why this color? Where did you see it?"
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Season + Collection */}
            {editCtx && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium">Target Season</Label>
                  <Select
                    value={editTargetSeasonId}
                    onValueChange={setEditTargetSeasonId}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Any season" />
                    </SelectTrigger>
                    <SelectContent>
                      {editCtx.seasons.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.code} — {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium">Collection</Label>
                  <Select
                    value={editCollectionId}
                    onValueChange={setEditCollectionId}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Any collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {editCtx.collections.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Source + Tags */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium">Source</Label>
                <Select value={editSource} onValueChange={setEditSource}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Where from?" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium">Tags</Label>
                <Input
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="warm, earth tone"
                  className="h-9"
                />
              </div>
            </div>

            {/* Source URL */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium">Source URL</Label>
              <Input
                value={editSourceUrl}
                onChange={(e) => setEditSourceUrl(e.target.value)}
                type="url"
                placeholder="https://..."
                className="h-9"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isPending}
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
