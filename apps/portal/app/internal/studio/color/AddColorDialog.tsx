'use client'

import { useState, useTransition, useCallback, useId } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/select'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { createStudioEntry } from '../actions'

// ─── Constants ───────────────────────────────────────────────────────

type CollectionOption = { id: string; name: string }

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

type SeasonOption = { id: string; code: string; name: string }

// ─── Color helpers ───────────────────────────────────────────────────

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100
  const lN = l / 100
  const a = sN * Math.min(lN, 1 - lN)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function textColorForBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#000000' : '#ffffff'
}

// ─── Component ───────────────────────────────────────────────────────

interface AddColorDialogProps {
  seasons: SeasonOption[]
  collections: CollectionOption[]
  trigger?: React.ReactNode
  initialHex?: string
  /** Pre-select a target season (e.g. when opened from a season palette) */
  defaultSeasonId?: string
  /** Called with the new studio entry ID after successful creation */
  onCreated?: (entryId: string) => void
}

export function AddColorDialog({ seasons, collections, trigger, initialHex, defaultSeasonId, onCreated }: AddColorDialogProps) {
  const router = useRouter()
  const formId = useId()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const startHex = initialHex && isValidHex(initialHex) ? initialHex : '#4A6FA5'
  const [hex, setHex] = useState(startHex)
  const [hsl, setHsl] = useState<[number, number, number]>(() => hexToHsl(startHex))
  const [pickerOpen, setPickerOpen] = useState(false)

  const updateFromHex = useCallback((raw: string) => {
    const normalized = raw.startsWith('#') ? raw : `#${raw}`
    setHex(normalized)
    if (isValidHex(normalized)) {
      setHsl(hexToHsl(normalized))
    }
  }, [])

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    setHsl([h, s, l])
    setHex(hslToHex(h, s, l))
  }, [])

  function handleSubmit(formData: FormData) {
    setError(null)

    const pantone = (formData.get('pantone') as string)?.trim() || undefined
    const hexVal = isValidHex(hex) ? hex : undefined
    const title = (formData.get('title') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()
    const collectionId = (formData.get('collectionId') as string) || undefined
    const targetSeasonId = (formData.get('targetSeasonId') as string) || undefined
    const inspirationSource = (formData.get('inspirationSource') as string) || undefined
    const sourceUrl = (formData.get('sourceUrl') as string)?.trim() || undefined
    const tagsRaw = (formData.get('tags') as string)?.trim()

    if (!pantone && !hexVal) { setError('A Pantone code or hex value is required.'); return }

    const tags = tagsRaw
      ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined

    const categoryMetadata: Record<string, unknown> = {}
    if (pantone) categoryMetadata.pantone = pantone
    if (hexVal) categoryMetadata.hex = hexVal

    const autoTitle = title || pantone || hexVal || 'Untitled Color'
    const autoDescription = description || [pantone, hexVal].filter(Boolean).join(' · ') || 'Color reference'

    startTransition(async () => {
      const result = await createStudioEntry({
        title: autoTitle,
        description: autoDescription,
        category: 'color',
        collectionId,
        tags,
        inspirationSource: inspirationSource as typeof SOURCES[number]['value'] | undefined,
        sourceUrl,
        targetSeasonId,
        categoryMetadata: Object.keys(categoryMetadata).length > 0 ? categoryMetadata : undefined,
      })

      if (!result.success) {
        setError(result.error ?? 'Something went wrong.')
      } else {
        setOpen(false)
        setError(null)
        const newId = (result.data as { entryId: string })?.entryId
        if (newId && onCreated) onCreated(newId)
        router.refresh()
      }
    })
  }

  const validHex = isValidHex(hex)
  const [, s, l] = hsl

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Color
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">Add Color</DialogTitle>
        {/* ─── Swatch + Name overlay ──────────────────────── */}
        <div
          className="h-28 w-full rounded-t-lg transition-colors relative"
          style={{ backgroundColor: validHex ? hex : '#e5e7eb' }}
        >
          <input
            name="title"
            form={formId}
            placeholder="Color name…"
            className="absolute inset-x-0 bottom-0 w-full bg-transparent border-none outline-none px-6 pb-3 pt-8 text-lg font-semibold tracking-tight placeholder:opacity-50 focus:ring-0"
            style={{
              color: validHex ? textColorForBg(hex) : '#666',
              caretColor: validHex ? textColorForBg(hex) : '#666',
              // @ts-expect-error -- vendor prefix for placeholder
              '--placeholder-color': validHex
                ? `${textColorForBg(hex)}80`
                : '#66666680',
            }}
          />
          <style>{`
            input[name="title"]::placeholder {
              color: ${validHex ? `${textColorForBg(hex)}50` : '#66666660'};
            }
          `}</style>

          {/* Settings / picker toggle icon */}
          <button
            type="button"
            onClick={() => setPickerOpen(!pickerOpen)}
            className="absolute bottom-2.5 right-4 p-1 rounded-md transition-colors"
            style={{
              color: validHex ? textColorForBg(hex) : '#666',
              backgroundColor: pickerOpen
                ? (validHex ? `${textColorForBg(hex)}18` : '#66666618')
                : 'transparent',
            }}
            title={pickerOpen ? 'Hide color picker' : 'Adjust color'}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>

        <form id={formId} action={handleSubmit}>
          {/* ─── Inline HSL Picker (expands under swatch) ──── */}
          {pickerOpen && (
            <div className="px-6 pt-4 pb-4 space-y-2.5 border-b border-border bg-muted/30">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px]">Hue</Label>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{hsl[0]}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={hsl[0]}
                  onChange={(e) => updateFromHsl(Number(e.target.value), hsl[1], hsl[2])}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right,
                      hsl(0,${s}%,${l}%), hsl(60,${s}%,${l}%), hsl(120,${s}%,${l}%),
                      hsl(180,${s}%,${l}%), hsl(240,${s}%,${l}%), hsl(300,${s}%,${l}%), hsl(360,${s}%,${l}%))`,
                  }}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px]">Saturation</Label>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{hsl[1]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={hsl[1]}
                  onChange={(e) => updateFromHsl(hsl[0], Number(e.target.value), hsl[2])}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right,
                      hsl(${hsl[0]},0%,${l}%), hsl(${hsl[0]},100%,${l}%))`,
                  }}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px]">Lightness</Label>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{hsl[2]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={hsl[2]}
                  onChange={(e) => updateFromHsl(hsl[0], hsl[1], Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right,
                      hsl(${hsl[0]},${s}%,0%), hsl(${hsl[0]},${s}%,50%), hsl(${hsl[0]},${s}%,100%))`,
                  }}
                />
              </div>
            </div>
          )}

          {/* ─── Pantone + Hex (primary inputs) ────────────── */}
          <div className="px-6 pt-4 pb-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="color-pantone" className="text-[11px] font-medium">
                  Pantone
                </Label>
                <Input
                  id="color-pantone"
                  name="pantone"
                  placeholder="19-4052 TCX"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="color-hex" className="text-[11px] font-medium">
                  Hex
                </Label>
                <Input
                  id="color-hex"
                  value={hex}
                  onChange={(e) => updateFromHex(e.target.value)}
                  className="font-mono h-9"
                  placeholder="#4A6FA5"
                />
              </div>
            </div>
          </div>

          {/* ─── Divider ──────────────────────────────────── */}
          <div className="border-t border-border" />

          {/* ─── Details ──────────────────────────────────── */}
          <div className="px-6 py-4 space-y-4">
            {/* Description / Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="color-description" className="text-[11px] font-medium">
                Notes
              </Label>
              <textarea
                id="color-description"
                name="description"
                placeholder="Why this color? Where did you see it? How does it fit the season?"
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Target Season + Collection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="color-season" className="text-[11px] font-medium">
                  Target Season
                </Label>
                <Select name="targetSeasonId" defaultValue={defaultSeasonId}>
                  <SelectTrigger id="color-season" className="h-9">
                    <SelectValue placeholder="Any season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.code} — {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="color-collection" className="text-[11px] font-medium">
                  Collection
                </Label>
                <Select name="collectionId">
                  <SelectTrigger id="color-collection" className="h-9">
                    <SelectValue placeholder="Any collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Source + Tags */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="color-source" className="text-[11px] font-medium">
                  Source
                </Label>
                <Select name="inspirationSource">
                  <SelectTrigger id="color-source" className="h-9">
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
                <Label htmlFor="color-tags" className="text-[11px] font-medium">
                  Tags
                </Label>
                <Input
                  id="color-tags"
                  name="tags"
                  placeholder="warm, earth tone"
                  className="h-9"
                />
              </div>
            </div>

            {/* Source URL */}
            <div className="space-y-1.5">
              <Label htmlFor="color-sourceUrl" className="text-[11px] font-medium">
                Source URL
              </Label>
              <Input
                id="color-sourceUrl"
                name="sourceUrl"
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
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Adding...' : 'Add Color'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
