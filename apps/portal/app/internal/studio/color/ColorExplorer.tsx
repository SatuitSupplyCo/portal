'use client'

import { useState, useCallback } from 'react'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import { Copy, Check, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────

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
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#000000' : '#ffffff'
}

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}

// ─── Types ───────────────────────────────────────────────────────────

interface SavedColor {
  hex: string
  name: string
}

interface ColorExplorerProps {
  onSaveToStudio?: (hex: string) => void
}

// ─── Component ───────────────────────────────────────────────────────

export function ColorExplorer({ onSaveToStudio }: ColorExplorerProps) {
  const [expanded, setExpanded] = useState(false)
  const [hex, setHex] = useState('#4A6FA5')
  const [hsl, setHsl] = useState<[number, number, number]>(() => hexToHsl('#4A6FA5'))
  const [palette, setPalette] = useState<SavedColor[]>([])
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [copiedMain, setCopiedMain] = useState(false)

  const updateFromHex = useCallback((newHex: string) => {
    if (isValidHex(newHex)) {
      setHex(newHex)
      setHsl(hexToHsl(newHex))
    } else {
      setHex(newHex)
    }
  }, [])

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    setHsl([h, s, l])
    setHex(hslToHex(h, s, l))
  }, [])

  function addToPalette() {
    if (!isValidHex(hex)) return
    if (palette.some((c) => c.hex.toLowerCase() === hex.toLowerCase())) return
    setPalette((prev) => [...prev, { hex, name: '' }])
  }

  function removeFromPalette(idx: number) {
    setPalette((prev) => prev.filter((_, i) => i !== idx))
  }

  function renamePaletteColor(idx: number, name: string) {
    setPalette((prev) => prev.map((c, i) => (i === idx ? { ...c, name } : c)))
  }

  async function copyHex(value: string, idx?: number) {
    await navigator.clipboard.writeText(value)
    if (idx !== undefined) {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    } else {
      setCopiedMain(true)
      setTimeout(() => setCopiedMain(false), 1500)
    }
  }

  // Generate tints/shades
  const [, s, l] = hsl
  const tints = Array.from({ length: 5 }, (_, i) => {
    const newL = Math.min(95, l + (i + 1) * ((95 - l) / 5))
    return hslToHex(hsl[0], s, Math.round(newL))
  })
  const shades = Array.from({ length: 5 }, (_, i) => {
    const newL = Math.max(5, l - (i + 1) * ((l - 5) / 5))
    return hslToHex(hsl[0], s, Math.round(newL))
  })

  // Complementary & analogous
  const complementary = hslToHex((hsl[0] + 180) % 360, s, l)
  const analogous1 = hslToHex((hsl[0] + 30) % 360, s, l)
  const analogous2 = hslToHex((hsl[0] + 330) % 360, s, l)
  const triadic1 = hslToHex((hsl[0] + 120) % 360, s, l)
  const triadic2 = hslToHex((hsl[0] + 240) % 360, s, l)

  if (!expanded) {
    return (
      <div className="px-8 md:px-12 py-3 border-b border-border/50">
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex gap-0.5">
            {['#4A6FA5', '#E8927C', '#7BA05B', '#D4A843', '#9B6B9E'].map((c) => (
              <div key={c} className="h-3 w-3 rounded-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>Color Explorer</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div className="px-8 md:px-12 py-6 border-b border-border bg-muted/10">
      {/* Collapse toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Color Explorer
        </p>
        <button
          onClick={() => setExpanded(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          Collapse
          <ChevronUp className="h-3 w-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ─── Picker panel ─────────────────────── */}
        <div className="space-y-4">
          {/* Main swatch */}
          <div
            className="h-32 rounded-lg border border-border flex items-end p-3 transition-colors"
            style={{ backgroundColor: isValidHex(hex) ? hex : '#e5e7eb' }}
          >
            <span
              className="text-xs font-mono font-medium"
              style={{ color: isValidHex(hex) ? textColorForBg(hex) : '#666' }}
            >
              {isValidHex(hex) ? hex.toUpperCase() : '—'}
            </span>
          </div>

          {/* Hex input */}
          <div className="space-y-1.5">
            <Label className="text-[10px]">Hex</Label>
            <div className="flex gap-2">
              <Input
                value={hex}
                onChange={(e) => updateFromHex(e.target.value)}
                className="font-mono text-sm h-8"
                placeholder="#000000"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 shrink-0"
                onClick={() => copyHex(hex)}
                disabled={!isValidHex(hex)}
              >
                {copiedMain ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          {/* HSL sliders */}
          <div className="space-y-3">
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

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={addToPalette}
              disabled={!isValidHex(hex)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add to Palette
            </Button>
            {onSaveToStudio && (
              <Button
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => onSaveToStudio(hex)}
                disabled={!isValidHex(hex)}
              >
                Save to Studio
              </Button>
            )}
          </div>
        </div>

        {/* ─── Right panel ──────────────────────── */}
        <div className="space-y-5">
          {/* Tints & Shades */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Tints & Shades
            </p>
            <div className="flex rounded-lg overflow-hidden border border-border h-10">
              {[...shades.reverse(), hex, ...tints].map((c, i) => (
                <button
                  key={`${c}-${i}`}
                  className="flex-1 transition-transform hover:scale-y-125 hover:z-10 relative group/swatch"
                  style={{ backgroundColor: c }}
                  onClick={() => updateFromHex(c)}
                  title={c.toUpperCase()}
                >
                  <span
                    className="absolute inset-x-0 bottom-0 text-[7px] font-mono opacity-0 group-hover/swatch:opacity-100 transition-opacity text-center pb-0.5"
                    style={{ color: textColorForBg(c) }}
                  >
                    {c.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Harmonies */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Color Harmonies
            </p>
            <div className="grid grid-cols-3 gap-3">
              <HarmonyGroup
                label="Complementary"
                colors={[hex, complementary]}
                onSelect={updateFromHex}
              />
              <HarmonyGroup
                label="Analogous"
                colors={[analogous2, hex, analogous1]}
                onSelect={updateFromHex}
              />
              <HarmonyGroup
                label="Triadic"
                colors={[hex, triadic1, triadic2]}
                onSelect={updateFromHex}
              />
            </div>
          </div>

          {/* Saved palette */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Working Palette
              {palette.length > 0 && (
                <span className="font-normal ml-1">({palette.length})</span>
              )}
            </p>
            {palette.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/60 py-3">
                Click &ldquo;Add to Palette&rdquo; to start building a color story.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {palette.map((color, i) => (
                  <div
                    key={`${color.hex}-${i}`}
                    className="group/chip flex items-center gap-1.5 rounded-md border border-border bg-card pl-0.5 pr-2 py-0.5"
                  >
                    <button
                      className="h-6 w-6 rounded-sm shrink-0 border border-border/50"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => updateFromHex(color.hex)}
                      title="Select this color"
                    />
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => renamePaletteColor(i, e.target.value)}
                      placeholder={color.hex.toUpperCase()}
                      className="text-[11px] bg-transparent border-none outline-none w-20 placeholder:text-muted-foreground/40"
                    />
                    <button
                      className="opacity-0 group-hover/chip:opacity-100 transition-opacity"
                      onClick={() => copyHex(color.hex, i)}
                      title="Copy hex"
                    >
                      {copiedIdx === i ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      className="opacity-0 group-hover/chip:opacity-100 transition-opacity"
                      onClick={() => removeFromPalette(i)}
                      title="Remove"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────

function HarmonyGroup({
  label,
  colors,
  onSelect,
}: {
  label: string
  colors: string[]
  onSelect: (hex: string) => void
}) {
  return (
    <div>
      <p className="text-[9px] text-muted-foreground mb-1">{label}</p>
      <div className="flex rounded-md overflow-hidden border border-border h-8">
        {colors.map((c, i) => (
          <button
            key={`${c}-${i}`}
            className="flex-1 transition-opacity hover:opacity-80"
            style={{ backgroundColor: c }}
            onClick={() => onSelect(c)}
            title={c.toUpperCase()}
          />
        ))}
      </div>
    </div>
  )
}
