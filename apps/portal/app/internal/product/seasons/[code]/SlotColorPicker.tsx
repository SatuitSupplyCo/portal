'use client'

import { useState, useMemo, useCallback, useTransition } from 'react'
import { ChevronDown, ChevronUp, Plus, Check, SlidersHorizontal } from 'lucide-react'
import { createStudioEntry } from '../../../studio/actions'

// ─── Types ──────────────────────────────────────────────────────────

export interface ColorOption {
  id: string
  title: string
  hex: string | null
  pantone: string | null
  tags: string[]
  targetSeasonId: string | null
}

interface SlotColorPickerProps {
  colorOptions: ColorOption[]
  seasonColorIds: string[]
  proposedColorIds: string[]
  value: string[]
  onChange: (ids: string[]) => void
}

// ─── Helpers ────────────────────────────────────────────────────────

function darkenHex(hex: string, amount = 0.35): string {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amount))
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amount))
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
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
  const sn = s / 100, ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// ─── Swatch ─────────────────────────────────────────────────────────

function Swatch({
  color,
  selected,
  onToggle,
}: {
  color: ColorOption
  selected: boolean
  onToggle: () => void
}) {
  const hex = color.hex ?? '#d4d4d8'
  const ring = darkenHex(hex)

  return (
    <button
      type="button"
      onClick={onToggle}
      title={color.title}
      className="group relative flex flex-col items-center gap-1"
    >
      <div
        className="w-8 h-8 rounded-full transition-all duration-150 cursor-pointer shrink-0 group-hover:opacity-100"
        style={{
          backgroundColor: hex,
          opacity: selected ? 1 : 0.3,
          outline: selected ? `2px solid ${ring}` : 'none',
          outlineOffset: '2px',
        }}
      />
      <span
        className="text-[8px] text-center leading-tight max-w-[3rem] truncate transition-opacity duration-150 group-hover:opacity-100"
        style={{
          color: 'var(--depot-faint)',
          opacity: selected ? 1 : 0,
        }}
      >
        {color.title}
      </span>
    </button>
  )
}

// ─── Group Label ────────────────────────────────────────────────────

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--depot-faint)] mb-2">
      {children}
    </p>
  )
}

// ─── Inline Add Color Form ──────────────────────────────────────────

function InlineAddColor({
  onCreated,
  onCancel,
}: {
  onCreated: (entryId: string) => void
  onCancel: () => void
}) {
  const [hex, setHex] = useState('#')
  const [name, setName] = useState('')
  const [pantone, setPantone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showHsl, setShowHsl] = useState(false)
  const [hsl, setHsl] = useState<[number, number, number]>([0, 50, 50])

  const validHex = isValidHex(hex)
  const previewHex = validHex ? hex : '#d4d4d8'

  function updateHexFromHsl(h: number, s: number, l: number) {
    const newHsl: [number, number, number] = [h, s, l]
    setHsl(newHsl)
    setHex(hslToHex(h, s, l))
  }

  function syncHslFromHex(newHex: string) {
    setHex(newHex)
    if (isValidHex(newHex)) {
      setHsl(hexToHsl(newHex))
    }
  }

  function handleSave() {
    setError(null)
    if (!validHex && !pantone.trim()) {
      setError('Enter a hex or pantone.')
      return
    }
    const title = name.trim() || pantone.trim() || hex
    const categoryMetadata: Record<string, unknown> = {}
    if (validHex) categoryMetadata.hex = hex
    if (pantone.trim()) categoryMetadata.pantone = pantone.trim()

    startTransition(async () => {
      const result = await createStudioEntry({
        title,
        description: [pantone.trim(), validHex ? hex : null].filter(Boolean).join(' · ') || 'Color',
        category: 'color',
        categoryMetadata: Object.keys(categoryMetadata).length > 0 ? categoryMetadata : undefined,
      })
      if (!result.success) {
        setError(result.error ?? 'Failed to create color.')
      } else {
        const newId = (result.data as { entryId: string })?.entryId
        if (newId) onCreated(newId)
      }
    })
  }

  return (
    <div className="rounded-md border border-[var(--depot-hairline)] p-3 space-y-2.5 bg-[var(--depot-surface)]">
      {/* Preview swatch + color name */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full shrink-0 transition-colors"
          style={{ backgroundColor: previewHex }}
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Color name"
          className="flex-1 h-7 rounded border border-input bg-background px-2 text-[11px] text-[var(--depot-ink)] placeholder:text-[var(--depot-faint)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Hex + Pantone */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={hex}
          onChange={(e) => syncHslFromHex(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`)}
          placeholder="#4A6FA5"
          className="h-7 rounded border border-input bg-background px-2 text-[11px] font-mono text-[var(--depot-ink)] placeholder:text-[var(--depot-faint)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          maxLength={7}
        />
        <input
          type="text"
          value={pantone}
          onChange={(e) => setPantone(e.target.value)}
          placeholder="Pantone"
          className="h-7 rounded border border-input bg-background px-2 text-[11px] text-[var(--depot-ink)] placeholder:text-[var(--depot-faint)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* HSL Picker */}
      {showHsl && (
        <div className="space-y-2 rounded border border-[var(--depot-hairline)] p-2.5 bg-background">
          {/* Hue */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-medium text-[var(--depot-faint)] w-4 shrink-0">H</span>
            <input
              type="range"
              min={0}
              max={360}
              value={hsl[0]}
              onChange={(e) => updateHexFromHsl(Number(e.target.value), hsl[1], hsl[2])}
              className="flex-1 h-1.5 accent-[var(--depot-ink)]"
              style={{
                background: `linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))`,
                borderRadius: 4,
              }}
            />
            <span className="text-[9px] font-mono text-[var(--depot-faint)] w-7 text-right">{hsl[0]}°</span>
          </div>

          {/* Saturation */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-medium text-[var(--depot-faint)] w-4 shrink-0">S</span>
            <input
              type="range"
              min={0}
              max={100}
              value={hsl[1]}
              onChange={(e) => updateHexFromHsl(hsl[0], Number(e.target.value), hsl[2])}
              className="flex-1 h-1.5 accent-[var(--depot-ink)]"
              style={{
                background: `linear-gradient(to right, hsl(${hsl[0]},0%,${hsl[2]}%), hsl(${hsl[0]},100%,${hsl[2]}%))`,
                borderRadius: 4,
              }}
            />
            <span className="text-[9px] font-mono text-[var(--depot-faint)] w-7 text-right">{hsl[1]}%</span>
          </div>

          {/* Lightness */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-medium text-[var(--depot-faint)] w-4 shrink-0">L</span>
            <input
              type="range"
              min={0}
              max={100}
              value={hsl[2]}
              onChange={(e) => updateHexFromHsl(hsl[0], hsl[1], Number(e.target.value))}
              className="flex-1 h-1.5 accent-[var(--depot-ink)]"
              style={{
                background: `linear-gradient(to right, hsl(${hsl[0]},${hsl[1]}%,0%), hsl(${hsl[0]},${hsl[1]}%,50%), hsl(${hsl[0]},${hsl[1]}%,100%))`,
                borderRadius: 4,
              }}
            />
            <span className="text-[9px] font-mono text-[var(--depot-faint)] w-7 text-right">{hsl[2]}%</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[10px] text-red-600">{error}</p>
      )}

      {/* Actions — toggle left, cancel/add right */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => {
            if (!showHsl && validHex) setHsl(hexToHsl(hex))
            setShowHsl(!showHsl)
          }}
          title="HSL color picker"
          className="h-6 w-6 flex items-center justify-center rounded text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="h-6 px-2 rounded text-[10px] text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="h-6 px-2.5 rounded bg-[var(--depot-ink)] text-white text-[10px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1"
          >
            {isPending ? 'Saving…' : (
              <>
                <Check className="h-3 w-3" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────

export function SlotColorPicker({
  colorOptions,
  seasonColorIds,
  proposedColorIds,
  value,
  onChange,
}: SlotColorPickerProps) {
  const [showMore, setShowMore] = useState(false)
  const [addingColor, setAddingColor] = useState(false)

  const selectedSet = useMemo(() => new Set(value), [value])
  const seasonSet = useMemo(() => new Set(seasonColorIds), [seasonColorIds])
  const proposedSet = useMemo(() => new Set(proposedColorIds), [proposedColorIds])

  const groups = useMemo(() => {
    const inSeason: ColorOption[] = []
    const proposed: ColorOption[] = []
    const unattached: ColorOption[] = []
    const otherSeason: ColorOption[] = []

    for (const c of colorOptions) {
      if (seasonSet.has(c.id)) {
        inSeason.push(c)
      } else if (proposedSet.has(c.id)) {
        proposed.push(c)
      } else if (!c.targetSeasonId) {
        unattached.push(c)
      } else {
        otherSeason.push(c)
      }
    }

    return { inSeason, proposed, unattached, otherSeason }
  }, [colorOptions, seasonSet, proposedSet])

  const toggle = useCallback(
    (id: string) => {
      if (selectedSet.has(id)) {
        onChange(value.filter((v) => v !== id))
      } else {
        onChange([...value, id])
      }
    },
    [selectedSet, value, onChange],
  )

  const hasMore = groups.unattached.length > 0 || groups.otherSeason.length > 0

  return (
    <div className="space-y-3">
      {/* Season Palette + Add button */}
      <div>
        <GroupLabel>Season Palette</GroupLabel>
        <div className="flex flex-wrap gap-2 items-start">
          {groups.inSeason.map((c) => (
            <Swatch
              key={c.id}
              color={c}
              selected={selectedSet.has(c.id)}
              onToggle={() => toggle(c.id)}
            />
          ))}

          {/* Add new color — dotted circle */}
          {!addingColor && (
            <button
              type="button"
              onClick={() => setAddingColor(true)}
              className="w-8 h-8 rounded-full border-2 border-dashed border-[var(--depot-hairline)] flex items-center justify-center text-[var(--depot-faint)] hover:border-[var(--depot-ink)] hover:text-[var(--depot-ink)] transition-colors"
              title="Add new color"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inline add color form */}
      {addingColor && (
        <InlineAddColor
          onCreated={(entryId) => {
            onChange([...value, entryId])
            setAddingColor(false)
          }}
          onCancel={() => setAddingColor(false)}
        />
      )}

      {/* Proposed */}
      {groups.proposed.length > 0 && (
        <div>
          <GroupLabel>Proposed for Season</GroupLabel>
          <div className="flex flex-wrap gap-2">
            {groups.proposed.map((c) => (
              <Swatch
                key={c.id}
                color={c}
                selected={selectedSet.has(c.id)}
                onToggle={() => toggle(c.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show More / Less toggle */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1 text-[10px] text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
        >
          {showMore ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show fewer colors
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Show more colors
            </>
          )}
        </button>
      )}

      {/* Expanded: unattached + other season */}
      {showMore && (
        <div className="space-y-3">
          {groups.unattached.length > 0 && (
            <div>
              <GroupLabel>Unattached</GroupLabel>
              <div className="flex flex-wrap gap-2">
                {groups.unattached.map((c) => (
                  <Swatch
                    key={c.id}
                    color={c}
                    selected={selectedSet.has(c.id)}
                    onToggle={() => toggle(c.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {groups.otherSeason.length > 0 && (
            <div>
              <GroupLabel>Other Seasons</GroupLabel>
              <div className="flex flex-wrap gap-2">
                {groups.otherSeason.map((c) => (
                  <Swatch
                    key={c.id}
                    color={c}
                    selected={selectedSet.has(c.id)}
                    onToggle={() => toggle(c.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected summary */}
      {value.length > 0 && (() => {
        const outsideCount = value.filter((id) => !seasonSet.has(id)).length
        return (
          <div className="text-[9px] text-[var(--depot-faint)] space-y-0.5">
            <p>{value.length} color{value.length !== 1 ? 's' : ''} selected</p>
            {outsideCount > 0 && (
              <p>{outsideCount} color{outsideCount !== 1 ? 's' : ''} will be added to the Season Palette if this slot is saved.</p>
            )}
          </div>
        )
      })()}
    </div>
  )
}
