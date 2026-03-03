"use client"

import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react"
import { Layers, LayoutGrid, History, GitBranch, ImagePlus, Loader2, RefreshCw, ExternalLink, Type, Users, Check, X, PackagePlus, Trash2, ChevronDown, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, Underline as UnderlineIcon, Strikethrough as StrikethroughIcon } from "lucide-react"
import {
  cancelRenderJob,
  createRenderJob,
  createDesignAssetUploadRequest,
  decideStudioEntryCollaborationApproval,
  getStudioDesignVersion,
  getStudioEntryCollaborationApproval,
  getRenderProviderHealth,
  listRenderJobs,
  listDesignAssets,
  createDesignAssetRecord,
  processRenderJob,
  requestStudioEntryCollaborationApproval,
  retryRenderJob,
  saveStudioDesignVersion,
  listStudioDesignVersions,
} from "../actions"
import { buildGarmentFlatScopedCss } from "@/lib/studio/garment-flat-style"

// ─── Design document types ────────────────────────────────────────────────

export type DesignSide = "front" | "back"

export type DesignLayer = {
  id: string
  type: "text" | "svg"
  visible: boolean
  groupId?: string
  x: number
  y: number
  scale: number
  rotation: number
  opacity?: number
  color: string
  boxWidth?: number
  boxHeight?: number
  strokeEnabled?: boolean
  strokeColor?: string
  strokeWidth?: number
  effects?: {
    shadow?: {
      enabled: boolean
      x: number
      y: number
      blur: number
      color: string
      opacity: number
    }
  }
  text?: string
  fontFamily?: string
  fontSize?: number
  textAlign?: "left" | "center" | "right"
  verticalAlign?: "top" | "middle" | "bottom"
  lineHeight?: number
  letterSpacing?: number
  allCaps?: boolean
  underline?: boolean
  strikethrough?: boolean
  textPathType?: "none" | "arc_up" | "arc_down" | "circle"
  textPathBend?: number
  textPathOffset?: number
  textBoxWidth?: number
  textBoxHeight?: number
  assetUrl?: string
  assetLabel?: string
}

type BaseLayerVisibility = {
  showFill: boolean
  showStitching: boolean
  showSeams: boolean
  showOutline: boolean
}

export type DesignDoc = {
  schemaVersion: "1.0"
  title: string
  side: string
  layersBySide: Record<string, DesignLayer[]>
  garment: {
    productTypeCode: string
    fillColor: string
    stitchColor: string
    seamColor: string
    outlineColor: string
    autoStitchShade: boolean
    showFill: boolean
    showStitching: boolean
    showSeams: boolean
    showOutline: boolean
    baseLayerVisibilityBySide: Record<string, BaseLayerVisibility>
  }
  guideSettings: {
    showGuides: boolean
    constrainToPrintSafe: boolean
    snapToGuides: boolean
  }
}

type CanvasViewMode = "front" | "back" | "split"

type GarmentPreset = {
  code: string
  label: string
  sides: string[]
}

const GARMENT_PRESETS: GarmentPreset[] = [
  { code: "tee_ss", label: "Short Sleeve Tee", sides: ["front", "back"] },
  { code: "tee_ls", label: "Long Sleeve Tee", sides: ["front", "back"] },
  { code: "crewneck_sweat", label: "Crewneck Sweat", sides: ["front", "back"] },
  { code: "hoodie_pullover", label: "Pullover Hoodie", sides: ["front", "back"] },
]

const DEFAULT_GARMENT_CODE = GARMENT_PRESETS[0]!.code

type SharedDesignComponent = {
  id: string
  name: string
  side: string
  createdAt: string
  layers: DesignLayer[]
}

const HISTORY_LIMIT = 50
const SHARED_COMPONENTS_STORAGE_KEY = "studio-design-shared-components-v1"
const CANVAS_VIEW_MODE_STORAGE_KEY = "studio-design-canvas-view-mode-v1"
const PROPERTIES_TAB_STORAGE_KEY = "studio-design-properties-tab-v1"
const CANVAS_SIZE = 280
const PRINT_SAFE_MARGIN = 28
const PRINT_SAFE_BOX = {
  x: PRINT_SAFE_MARGIN,
  y: PRINT_SAFE_MARGIN,
  width: CANVAS_SIZE - PRINT_SAFE_MARGIN * 2,
  height: CANVAS_SIZE - PRINT_SAFE_MARGIN * 2,
}
const GUIDE_SNAP_THRESHOLD = 6

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace("#", "")
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(raw)) return null
  const normalized = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw
  const intValue = Number.parseInt(normalized, 16)
  return {
    r: (intValue >> 16) & 255,
    g: (intValue >> 8) & 255,
    b: intValue & 255,
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(v).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function toRgba(hex: string, opacityPercent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(0,0,0,${Math.max(0, Math.min(100, opacityPercent)) / 100})`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0, Math.min(100, opacityPercent)) / 100})`
}

function buildOutlineDropShadowFilter(color: string, strokeWidth: number): string {
  const w = Math.max(0, strokeWidth)
  if (w === 0) return "none"
  const r = Math.max(1, w)
  const offsets = [
    [r, 0],
    [-r, 0],
    [0, r],
    [0, -r],
    [r, r],
    [r, -r],
    [-r, r],
    [-r, -r],
    [r * 0.5, r],
    [r * 0.5, -r],
    [-r * 0.5, r],
    [-r * 0.5, -r],
    [r, r * 0.5],
    [r, -r * 0.5],
    [-r, r * 0.5],
    [-r, -r * 0.5],
  ] as const
  return offsets.map(([x, y]) => `drop-shadow(${x}px ${y}px 0 ${color})`).join(" ")
}

function buildOutlineTextShadow(color: string, strokeWidth: number): string {
  const w = Math.max(0, strokeWidth)
  if (w === 0) return "none"
  const r = Math.max(1, w)
  const offsets = [
    [r, 0],
    [-r, 0],
    [0, r],
    [0, -r],
    [r, r],
    [r, -r],
    [-r, r],
    [-r, -r],
    [r * 0.5, r],
    [r * 0.5, -r],
    [-r * 0.5, r],
    [-r * 0.5, -r],
    [r, r * 0.5],
    [r, -r * 0.5],
    [-r, r * 0.5],
    [-r, -r * 0.5],
  ] as const
  return offsets.map(([x, y]) => `${x}px ${y}px 0 ${color}`).join(", ")
}

function getDefaultGarmentLinePalette(fillColor: string): {
  stitchColor: string
  seamColor: string
  outlineColor: string
} {
  const rgb = hexToRgb(fillColor)
  if (!rgb) {
    return {
      stitchColor: "#666666",
      seamColor: "#555555",
      outlineColor: "#444444",
    }
  }
  const darken = (factor: number) =>
    rgbToHex(
      rgb.r * (1 - factor),
      rgb.g * (1 - factor),
      rgb.b * (1 - factor),
    )
  return {
    stitchColor: darken(0.2),
    seamColor: darken(0.28),
    outlineColor: darken(0.35),
  }
}

function getGarmentFlatUrl(productTypeCode: string, side: DesignSide): string {
  return `/product/placeholders/product-types/${productTypeCode}/flats/${productTypeCode}-flat-${side}.svg`
}

function getProductSides(productTypeCode: string, productTypeOptions: GarmentPreset[]): string[] {
  const fromTaxonomy = productTypeOptions.find((preset) => preset.code === productTypeCode)?.sides ?? []
  return fromTaxonomy.length > 0 ? fromTaxonomy : ["front", "back"]
}

function getDefaultBaseLayerVisibility(): BaseLayerVisibility {
  return {
    showFill: true,
    showStitching: true,
    showSeams: true,
    showOutline: true,
  }
}

function getBaseLayerVisibilityForSide(
  doc: Pick<DesignDoc, "garment">,
  sideCode: string,
): BaseLayerVisibility {
  const fallback: BaseLayerVisibility = {
    showFill: doc.garment.showFill,
    showStitching: doc.garment.showStitching,
    showSeams: doc.garment.showSeams,
    showOutline: doc.garment.showOutline,
  }
  const sideVisibility = doc.garment.baseLayerVisibilityBySide?.[sideCode]
  if (!sideVisibility) return fallback
  return {
    showFill: sideVisibility.showFill,
    showStitching: sideVisibility.showStitching,
    showSeams: sideVisibility.showSeams,
    showOutline: sideVisibility.showOutline,
  }
}

function GarmentFlatSvg({
  productTypeCode,
  side,
  scopeKey,
  fillColor,
  stitchColor,
  seamColor,
  outlineColor,
  showFill,
  showStitching,
  showSeams,
  showOutline,
}: {
  productTypeCode: string
  side: DesignSide
  scopeKey: string
  fillColor: string
  stitchColor: string
  seamColor: string
  outlineColor: string
  showFill: boolean
  showStitching: boolean
  showSeams: boolean
  showOutline: boolean
}) {
  const [markup, setMarkup] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const url = useMemo(() => getGarmentFlatUrl(productTypeCode, side), [productTypeCode, side])

  useEffect(() => {
    const controller = new AbortController()
    setLoadError(false)
    setMarkup(null)
    void fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load ${url}`)
        return res.text()
      })
      .then((raw) => {
        const cleaned = raw
          .replace(/<\?xml[^>]*>/gi, "")
          .replace(/<svg\b/i, '<svg class="garment-flat-svg"')
        setMarkup(cleaned)
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true)
      })
    return () => controller.abort()
  }, [url])

  if (loadError || !markup) {
    return (
      <img
        src={url}
        alt={`${productTypeCode} ${side} placeholder`}
        className="absolute inset-0 h-full w-full object-contain pointer-events-none"
      />
    )
  }

  return (
    <>
      <style>{buildGarmentFlatScopedCss({
        scopeKey,
        fillColor,
        stitchColor,
        seamColor,
        outlineColor,
        showFill,
        showStitching,
        showSeams,
        showOutline,
      })}</style>
      <div
        className="absolute inset-0 pointer-events-none garment-flat"
        data-scope={scopeKey}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </>
  )
}

function createLayer(overrides: Partial<DesignLayer> & { type: "text" | "svg" }): DesignLayer {
  return {
    id: crypto.randomUUID(),
    type: overrides.type,
    visible: overrides.visible ?? true,
    x: overrides.x ?? 50,
    y: overrides.y ?? 50,
    scale: overrides.scale ?? 1,
    rotation: overrides.rotation ?? 0,
    opacity: overrides.opacity ?? 100,
    color: overrides.color ?? "#000000",
    boxWidth: overrides.type === "svg" ? (overrides.boxWidth ?? 64) : undefined,
    boxHeight: overrides.type === "svg" ? (overrides.boxHeight ?? 64) : undefined,
    strokeEnabled: overrides.strokeEnabled ?? false,
    strokeColor: overrides.strokeColor ?? "#000000",
    strokeWidth: overrides.strokeWidth ?? 1,
    effects: overrides.effects ?? {
      shadow: {
        enabled: false,
        x: 0,
        y: 2,
        blur: 4,
        color: "#000000",
        opacity: 20,
      },
    },
    text: overrides.type === "text" ? (overrides.text ?? "Text") : undefined,
    fontFamily: overrides.type === "text" ? (overrides.fontFamily ?? "Inter, system-ui, sans-serif") : undefined,
    fontSize: overrides.type === "text" ? (overrides.fontSize ?? 20) : undefined,
    textAlign: overrides.type === "text" ? (overrides.textAlign ?? "left") : undefined,
    verticalAlign: overrides.type === "text" ? (overrides.verticalAlign ?? "top") : undefined,
    lineHeight: overrides.type === "text" ? (overrides.lineHeight ?? 1.2) : undefined,
    letterSpacing: overrides.type === "text" ? (overrides.letterSpacing ?? 0) : undefined,
    allCaps: overrides.type === "text" ? (overrides.allCaps ?? false) : undefined,
    underline: overrides.type === "text" ? (overrides.underline ?? false) : undefined,
    strikethrough: overrides.type === "text" ? (overrides.strikethrough ?? false) : undefined,
    textPathType: overrides.type === "text" ? (overrides.textPathType ?? "none") : undefined,
    textPathBend: overrides.type === "text" ? (overrides.textPathBend ?? 30) : undefined,
    textPathOffset: overrides.type === "text" ? (overrides.textPathOffset ?? 0) : undefined,
    textBoxWidth: overrides.type === "text" ? (overrides.textBoxWidth ?? 220) : undefined,
    textBoxHeight: overrides.type === "text" ? (overrides.textBoxHeight ?? 80) : undefined,
    assetUrl: overrides.type === "svg" ? overrides.assetUrl : undefined,
    assetLabel: overrides.type === "svg" ? overrides.assetLabel : undefined,
  }
}

function getLayersForSide(doc: DesignDoc): DesignLayer[] {
  return getLayersForProductSide(doc, doc.side)
}

function getLayersForProductSide(doc: DesignDoc, side: string): DesignLayer[] {
  const layers = doc.layersBySide?.[side]
  return Array.isArray(layers) ? layers : []
}

function setLayersForProductSide(doc: DesignDoc, side: string, layers: DesignLayer[]): DesignDoc {
  return {
    ...doc,
    layersBySide: {
      ...doc.layersBySide,
      [side]: layers,
    },
  }
}

function setLayersForSide(doc: DesignDoc, layers: DesignLayer[]): DesignDoc {
  return setLayersForProductSide(doc, doc.side, layers)
}

function cloneLayersWithNewIds(layers: DesignLayer[]): DesignLayer[] {
  return layers.map((layer) => ({
    ...layer,
    id: crypto.randomUUID(),
  }))
}

function getSelectedGroupId(layers: DesignLayer[], selectedLayerId: string | null): string | null {
  if (!selectedLayerId) return null
  const layer = layers.find((l) => l.id === selectedLayerId)
  if (!layer?.groupId) return null
  return layer.groupId
}

function estimateLayerBounds(layer: DesignLayer) {
  const size = layer.type === "text"
    ? {
        width: Math.max(60, layer.textBoxWidth ?? ((layer.text?.length ?? 4) * ((layer.fontSize ?? 20) * 0.6))) * layer.scale,
        height: Math.max(18, layer.textBoxHeight ?? (layer.fontSize ?? 20)) * layer.scale,
      }
    : { width: Math.max(24, layer.boxWidth ?? 64) * layer.scale, height: Math.max(24, layer.boxHeight ?? 64) * layer.scale }
  return size
}

function clampToPrintSafe(layer: DesignLayer): DesignLayer {
  const { width, height } = estimateLayerBounds(layer)
  const minX = PRINT_SAFE_BOX.x
  const minY = PRINT_SAFE_BOX.y
  const maxX = PRINT_SAFE_BOX.x + PRINT_SAFE_BOX.width - width
  const maxY = PRINT_SAFE_BOX.y + PRINT_SAFE_BOX.height - height
  return {
    ...layer,
    x: Math.min(Math.max(layer.x, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(layer.y, minY), Math.max(minY, maxY)),
  }
}

function snapLayerToGuides(layer: DesignLayer): DesignLayer {
  const centerX = CANVAS_SIZE / 2
  const centerY = CANVAS_SIZE / 2
  const safeLeft = PRINT_SAFE_BOX.x
  const safeTop = PRINT_SAFE_BOX.y
  const safeRight = PRINT_SAFE_BOX.x + PRINT_SAFE_BOX.width
  const safeBottom = PRINT_SAFE_BOX.y + PRINT_SAFE_BOX.height
  const maybeSnap = (value: number, targets: number[]) => {
    const nearest = targets.find((target) => Math.abs(value - target) <= GUIDE_SNAP_THRESHOLD)
    return nearest ?? value
  }
  return {
    ...layer,
    x: maybeSnap(layer.x, [safeLeft, centerX, safeRight]),
    y: maybeSnap(layer.y, [safeTop, centerY, safeBottom]),
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3600_000)
  const diffDays = Math.floor(diffMs / 86400_000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined })
}

function errorSnippet(error: string | null, maxLen = 80): string {
  if (!error?.trim()) return ""
  const firstLine = error.split(/\r?\n/)[0]?.trim() ?? ""
  return firstLine.length > maxLen ? `${firstLine.slice(0, maxLen)}…` : firstLine
}

// ─── Left: Garment / modules library ───────────────────────────────────

type DesignAssetListItem = {
  assetId: string
  assetVersionId: string
  fileUrl: string
  fileName: string | null
  mime: string
  createdAt: string
  versions?: Array<{
    assetVersionId: string
    fileUrl: string
    fileName: string | null
    mime: string
    createdAt: string
    isLatest: boolean
  }>
}

type EntryColorSuggestion = {
  id: string
  title: string
  hex: string | null
  pantone: string | null
  source: "season" | "collection"
}

function getAssetUrlDomainHint(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url.length > 20 ? `${url.slice(0, 20)}…` : url
  }
}

function GarmentTitleHeader({
  title,
  saveLabel,
  saveHint,
  isSaving,
  onRenameTitle,
  onSaveGarment,
  onDeleteGarment,
  onDuplicateGarment,
  onViewVersionHistory,
}: {
  title: string
  saveLabel: string
  saveHint?: string
  isSaving: boolean
  onRenameTitle: (nextTitle: string) => void
  onSaveGarment: () => Promise<void> | void
  onDeleteGarment: () => void
  onDuplicateGarment: () => void
  onViewVersionHistory: () => void
}) {
  const [titleDraft, setTitleDraft] = useState(title || "untitled")
  const [editingTitle, setEditingTitle] = useState(false)

  useEffect(() => {
    if (!editingTitle) {
      setTitleDraft(title || "untitled")
    }
  }, [title, editingTitle])

  const commitTitle = useCallback(() => {
    const next = titleDraft.trim() || "untitled"
    onRenameTitle(next)
    setEditingTitle(false)
  }, [onRenameTitle, titleDraft])

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        {editingTitle ? (
          <input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                commitTitle()
              }
              if (e.key === "Escape") {
                e.preventDefault()
                setTitleDraft(title || "untitled")
                setEditingTitle(false)
              }
            }}
            autoFocus
            className="w-full rounded border bg-background px-2 py-1 text-sm"
            aria-label="Garment title"
          />
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="truncate text-left text-sm font-medium text-foreground hover:underline"
              title="Rename garment"
            >
              {title || "untitled"}
            </button>
            <details className="relative shrink-0">
              <summary
                className="list-none cursor-pointer inline-flex items-center justify-center rounded hover:bg-muted/50 h-5 w-5"
                aria-label="Garment actions"
                title="Garment actions"
              >
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </summary>
              <div className="absolute left-0 top-full z-20 mt-1 w-40 rounded border bg-background p-1 shadow-sm space-y-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => void onSaveGarment()}
                  className="w-full rounded px-2 py-1 text-left hover:bg-muted/50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={onDuplicateGarment}
                  className="w-full rounded px-2 py-1 text-left hover:bg-muted/50"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={onViewVersionHistory}
                  className="w-full rounded px-2 py-1 text-left hover:bg-muted/50"
                >
                  View version history
                </button>
                <button
                  type="button"
                  onClick={onDeleteGarment}
                  className="w-full rounded px-2 py-1 text-left text-destructive hover:bg-muted/50"
                >
                  Delete
                </button>
              </div>
            </details>
          </>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">{saveLabel}</p>
      {saveHint ? <p className="text-[10px] text-muted-foreground">{saveHint}</p> : null}
    </div>
  )
}

function DesignLayersNavigator({
  doc,
  productTypeOptions,
  canvasSides,
  selectedLayerId,
  selectedLayerIds,
  sharedComponents,
  onSelectLayer,
  onSetSelection,
  onToggleLayerInSelection,
  onDeleteLayer,
  onDeleteSelectedLayers,
  onGroupSelectedLayers,
  onUngroupSelectedLayers,
  onSaveSelectedAsSharedComponent,
  onUpdateLayerById,
  onUpdateGarment,
  onSideChange,
  onSelectCanvasSide,
  onToggleCanvasSide,
}: {
  doc: DesignDoc
  productTypeOptions: GarmentPreset[]
  canvasSides: DesignSide[]
  selectedLayerId: string | null
  selectedLayerIds: string[]
  sharedComponents: SharedDesignComponent[]
  onSelectLayer: (id: string | null) => void
  onSetSelection: (ids: string[], primaryId?: string | null) => void
  onToggleLayerInSelection: (id: string) => void
  onDeleteLayer: (id: string) => void
  onDeleteSelectedLayers: () => void
  onGroupSelectedLayers: () => void
  onUngroupSelectedLayers: () => void
  onSaveSelectedAsSharedComponent: (name: string) => void
  onUpdateLayerById: (sideCode: string, layerId: string, updates: Partial<DesignLayer>) => void
  onUpdateGarment: (updates: Partial<DesignDoc["garment"]>) => void
  onSideChange: (side: DesignSide) => void
  onSelectCanvasSide: (side: DesignSide) => void
  onToggleCanvasSide: (side: DesignSide) => void
}) {
  const layers = getLayersForSide(doc)
  const [expandedSides, setExpandedSides] = useState<Record<string, boolean>>({})
  const [editingNavText, setEditingNavText] = useState<{ sideCode: string; layerId: string } | null>(null)
  const [editingNavTextDraft, setEditingNavTextDraft] = useState("")
  const productSides = useMemo(
    () => getProductSides(doc.garment.productTypeCode, productTypeOptions),
    [doc.garment.productTypeCode, productTypeOptions],
  )
  useEffect(() => {
    setExpandedSides((prev) => {
      let changed = false
      const next: Record<string, boolean> = { ...prev }
      for (const sideCode of productSides) {
        if (!(sideCode in next)) {
          next[sideCode] = true
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [productSides])

  const handleLayerListSelection = useCallback(
    (layerId: string, opts?: { shiftKey?: boolean; toggleKey?: boolean }) => {
      const shiftKey = Boolean(opts?.shiftKey)
      const toggleKey = Boolean(opts?.toggleKey)
      if (shiftKey) {
        const anchorId = selectedLayerId ?? selectedLayerIds[0] ?? layerId
        const anchorIndex = layers.findIndex((layer) => layer.id === anchorId)
        const targetIndex = layers.findIndex((layer) => layer.id === layerId)
        if (anchorIndex === -1 || targetIndex === -1) {
          onSelectLayer(layerId)
          return
        }
        const [start, end] = anchorIndex < targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex]
        const rangeIds = layers.slice(start, end + 1).map((layer) => layer.id)
        if (toggleKey) {
          onSetSelection([...selectedLayerIds, ...rangeIds], layerId)
          return
        }
        onSetSelection(rangeIds, layerId)
        return
      }
      if (toggleKey) {
        onToggleLayerInSelection(layerId)
        return
      }
      onSelectLayer(layerId)
    },
    [layers, onSelectLayer, onSetSelection, onToggleLayerInSelection, selectedLayerId, selectedLayerIds],
  )
  const beginLeftNavTextEdit = useCallback((sideCode: string, layer: DesignLayer) => {
    if (layer.type !== "text") return
    setEditingNavText({ sideCode, layerId: layer.id })
    setEditingNavTextDraft(layer.text ?? "")
  }, [])
  const commitLeftNavTextEdit = useCallback(() => {
    if (!editingNavText) return
    const nextText = editingNavTextDraft
    onUpdateLayerById(editingNavText.sideCode, editingNavText.layerId, { text: nextText })
    setEditingNavText(null)
  }, [editingNavText, editingNavTextDraft, onUpdateLayerById])

  return (
    <div className="max-h-[44vh] overflow-y-auto space-y-1 pr-1">
      <div className="space-y-1 pb-1">
          {productSides.map((sideCode) => {
            const sideLayers = getLayersForProductSide(doc, sideCode)
            const supported = sideCode === "front" || sideCode === "back"
            const isActive = doc.side === sideCode
            const isExpanded = expandedSides[sideCode] ?? true
            const sideBaseVisibility = getBaseLayerVisibilityForSide(doc, sideCode)
            const updateSideBaseVisibility = (updates: Partial<BaseLayerVisibility>) => {
              const nextVisibility: BaseLayerVisibility = {
                ...sideBaseVisibility,
                ...updates,
              }
              const nextBySide = {
                ...doc.garment.baseLayerVisibilityBySide,
                [sideCode]: nextVisibility,
              }
              onUpdateGarment({
                baseLayerVisibilityBySide: nextBySide,
                ...(isActive
                  ? {
                      showFill: nextVisibility.showFill,
                      showStitching: nextVisibility.showStitching,
                      showSeams: nextVisibility.showSeams,
                      showOutline: nextVisibility.showOutline,
                    }
                  : {}),
              })
            }
            return (
              <div key={sideCode} className="space-y-0.5">
                <div
                  className={`rounded px-2 py-1 text-[11px] flex items-center gap-1 ${
                    isActive
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSides((prev) => ({
                        ...prev,
                        [sideCode]: !(prev[sideCode] ?? isActive),
                      }))
                    }
                    className="inline-flex items-center justify-center h-4 w-4 rounded hover:bg-muted/40"
                    aria-label={isExpanded ? `Collapse ${sideCode}` : `Expand ${sideCode}`}
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      if (!supported) return
                      const side = sideCode as DesignSide
                      if (event.shiftKey || event.ctrlKey || event.metaKey) {
                        onToggleCanvasSide(side)
                        return
                      }
                      onSelectCanvasSide(side)
                    }}
                    onDoubleClick={(event) => {
                      event.preventDefault()
                      setExpandedSides((prev) => ({
                        ...prev,
                        [sideCode]: !(prev[sideCode] ?? isActive),
                      }))
                    }}
                    disabled={!supported}
                    className="text-left flex-1 min-w-0 truncate"
                  >
                    {sideCode.replaceAll("_", " ")}
                  </button>
                </div>
                {isExpanded ? (
                  <div className="pl-5 pt-0.5 space-y-1">
                    {supported ? (
                      sideLayers.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground px-2 py-0.5">No layers</p>
                      ) : (
                        sideLayers.map((layer) => {
                          const isVisible = layer.visible !== false
                          const isEditingText =
                            editingNavText?.sideCode === sideCode && editingNavText.layerId === layer.id
                          if (!isActive) {
                            return (
                              <div key={layer.id} className="w-full rounded px-2 py-1 text-[10px] flex items-center gap-1.5 text-muted-foreground">
                                {layer.type === "text" ? <Type className="h-3 w-3 shrink-0" /> : <ImagePlus className="h-3 w-3 shrink-0" />}
                                {isEditingText ? (
                                  <input
                                    autoFocus
                                    value={editingNavTextDraft}
                                    onChange={(event) => setEditingNavTextDraft(event.target.value)}
                                    onFocus={(event) => event.currentTarget.select()}
                                    onBlur={() => commitLeftNavTextEdit()}
                                    onClick={(event) => event.stopPropagation()}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") {
                                        event.preventDefault()
                                        commitLeftNavTextEdit()
                                      } else if (event.key === "Escape") {
                                        event.preventDefault()
                                        setEditingNavText(null)
                                      }
                                    }}
                                    className="min-w-0 flex-1 rounded border bg-background/95 px-1 py-0 text-[10px]"
                                  />
                                ) : (
                                  <span
                                    className={`truncate ${isVisible ? "" : "line-through opacity-70"}`}
                                    onDoubleClick={(event) => {
                                      event.stopPropagation()
                                      beginLeftNavTextEdit(sideCode, layer)
                                    }}
                                  >
                                    {layer.type === "text" ? (layer.text ?? "Text") : (layer.assetLabel ?? "Image layer")}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    onUpdateLayerById(sideCode, layer.id, { visible: !isVisible })
                                  }}
                                  className="ml-auto inline-flex items-center justify-center rounded h-4 w-4 hover:bg-muted/50"
                                  aria-label={isVisible ? "Hide layer" : "Show layer"}
                                  title={isVisible ? "Hide layer" : "Show layer"}
                                >
                                  {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                </button>
                              </div>
                            )
                          }
                          return (
                            <div
                              key={layer.id}
                              role="button"
                              tabIndex={0}
                              onClick={(e) =>
                                handleLayerListSelection(layer.id, {
                                  shiftKey: e.shiftKey,
                                  toggleKey: e.ctrlKey || e.metaKey,
                                })
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault()
                                  handleLayerListSelection(layer.id, {
                                    shiftKey: e.shiftKey,
                                    toggleKey: e.ctrlKey || e.metaKey,
                                  })
                                }
                              }}
                              className={`w-full text-left rounded px-2 py-1 text-[10px] flex items-center gap-1.5 ${
                                selectedLayerId === layer.id ? "bg-primary/15 text-foreground" : "hover:bg-muted/50 text-muted-foreground"
                              }`}
                              onDoubleClick={(event) => {
                                event.stopPropagation()
                                beginLeftNavTextEdit(sideCode, layer)
                              }}
                            >
                              {isEditingText ? (
                                <input
                                  autoFocus
                                  value={editingNavTextDraft}
                                  onChange={(event) => setEditingNavTextDraft(event.target.value)}
                                  onFocus={(event) => event.currentTarget.select()}
                                  onBlur={() => commitLeftNavTextEdit()}
                                  onClick={(event) => event.stopPropagation()}
                                  onPointerDown={(event) => event.stopPropagation()}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault()
                                      commitLeftNavTextEdit()
                                    } else if (event.key === "Escape") {
                                      event.preventDefault()
                                      setEditingNavText(null)
                                    }
                                  }}
                                  className="min-w-0 flex-1 rounded border bg-background/95 px-1 py-0 text-[10px]"
                                />
                              ) : (
                                <span className="truncate">
                                  {layer.type === "text" ? <Type className="mr-1 inline h-3 w-3 align-text-top" /> : <ImagePlus className="mr-1 inline h-3 w-3 align-text-top" />}
                                  {layer.type === "text" ? (layer.text ?? "Text") : (layer.assetLabel ?? "Image layer")}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  onUpdateLayerById(sideCode, layer.id, { visible: !isVisible })
                                }}
                                className="ml-auto inline-flex items-center justify-center rounded h-4 w-4 hover:bg-muted/50"
                                aria-label={isVisible ? "Hide layer" : "Show layer"}
                                title={isVisible ? "Hide layer" : "Show layer"}
                              >
                                {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              </button>
                            </div>
                          )
                        })
                      )
                    ) : (
                      <p className="text-[10px] text-muted-foreground px-2 py-0.5">Side support coming soon</p>
                    )}
                    {supported ? (
                      <>
                        <div className="w-full rounded px-2 py-1 text-[10px] flex items-center gap-1.5 text-muted-foreground">
                          <Layers className="h-3 w-3 shrink-0" />
                          <span className={`truncate ${sideBaseVisibility.showFill ? "" : "line-through opacity-70"}`}>Garment fill</span>
                          <button
                            type="button"
                            onClick={() => updateSideBaseVisibility({ showFill: !sideBaseVisibility.showFill })}
                            className="ml-auto inline-flex items-center justify-center rounded h-4 w-4 hover:bg-muted/50"
                            aria-label={sideBaseVisibility.showFill ? "Hide base layer" : "Show base layer"}
                            title={sideBaseVisibility.showFill ? "Hide base layer" : "Show base layer"}
                          >
                            {sideBaseVisibility.showFill ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </button>
                        </div>
                        <div className="w-full rounded px-2 py-1 text-[10px] flex items-center gap-1.5 text-muted-foreground">
                          <Layers className="h-3 w-3 shrink-0" />
                          <span className={`truncate ${sideBaseVisibility.showStitching ? "" : "line-through opacity-70"}`}>Stitching paths</span>
                          <button
                            type="button"
                            onClick={() => updateSideBaseVisibility({ showStitching: !sideBaseVisibility.showStitching })}
                            className="ml-auto inline-flex items-center justify-center rounded h-4 w-4 hover:bg-muted/50"
                            aria-label={sideBaseVisibility.showStitching ? "Hide base layer" : "Show base layer"}
                            title={sideBaseVisibility.showStitching ? "Hide base layer" : "Show base layer"}
                          >
                            {sideBaseVisibility.showStitching ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </button>
                        </div>
                        <div className="w-full rounded px-2 py-1 text-[10px] flex items-center gap-1.5 text-muted-foreground">
                          <Layers className="h-3 w-3 shrink-0" />
                          <span className={`truncate ${sideBaseVisibility.showSeams ? "" : "line-through opacity-70"}`}>Seams</span>
                          <button
                            type="button"
                            onClick={() => updateSideBaseVisibility({ showSeams: !sideBaseVisibility.showSeams })}
                            className="ml-auto inline-flex items-center justify-center rounded h-4 w-4 hover:bg-muted/50"
                            aria-label={sideBaseVisibility.showSeams ? "Hide base layer" : "Show base layer"}
                            title={sideBaseVisibility.showSeams ? "Hide base layer" : "Show base layer"}
                          >
                            {sideBaseVisibility.showSeams ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </button>
                        </div>
                        <div className="w-full rounded px-2 py-1 text-[10px] flex items-center gap-1.5 text-muted-foreground">
                          <Layers className="h-3 w-3 shrink-0" />
                          <span className={`truncate ${sideBaseVisibility.showOutline ? "" : "line-through opacity-70"}`}>Outline</span>
                          <button
                            type="button"
                            onClick={() => updateSideBaseVisibility({ showOutline: !sideBaseVisibility.showOutline })}
                            className="ml-auto inline-flex items-center justify-center rounded h-4 w-4 hover:bg-muted/50"
                            aria-label={sideBaseVisibility.showOutline ? "Hide base layer" : "Show base layer"}
                            title={sideBaseVisibility.showOutline ? "Hide base layer" : "Show base layer"}
                          >
                            {sideBaseVisibility.showOutline ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
      </div>
    </div>
  )
}

function LeftPanel({
  doc,
  productTypeOptions,
  canvasSides,
  selectedLayerId,
  selectedLayerIds,
  sharedComponents,
  onSelectLayer,
  onSetSelection,
  onToggleLayerInSelection,
  onDeleteLayer,
  onDeleteSelectedLayers,
  onGroupSelectedLayers,
  onUngroupSelectedLayers,
  onSaveSelectedAsSharedComponent,
  onUpdateLayerById,
  onUpdateGarment,
  onSideChange,
  onSelectCanvasSide,
  onToggleCanvasSide,
  renderEnabled,
  studioEntryId,
  getSnapshot,
  saveLabel,
  saveHint,
  isSaving,
  onRenameTitle,
  onSaveGarment,
  onDeleteGarment,
  onDuplicateGarment,
  panelTab,
  onPanelTabChange,
  onViewVersionHistory,
}: {
  doc: DesignDoc
  productTypeOptions: GarmentPreset[]
  canvasSides: DesignSide[]
  selectedLayerId: string | null
  selectedLayerIds: string[]
  sharedComponents: SharedDesignComponent[]
  onSelectLayer: (id: string | null) => void
  onSetSelection: (ids: string[], primaryId?: string | null) => void
  onToggleLayerInSelection: (id: string) => void
  onDeleteLayer: (id: string) => void
  onDeleteSelectedLayers: () => void
  onGroupSelectedLayers: () => void
  onUngroupSelectedLayers: () => void
  onSaveSelectedAsSharedComponent: (name: string) => void
  onUpdateLayerById: (sideCode: string, layerId: string, updates: Partial<DesignLayer>) => void
  onUpdateGarment: (updates: Partial<DesignDoc["garment"]>) => void
  onSideChange: (side: DesignSide) => void
  onSelectCanvasSide: (side: DesignSide) => void
  onToggleCanvasSide: (side: DesignSide) => void
  renderEnabled: boolean
  studioEntryId?: string
  getSnapshot: () => Record<string, unknown>
  saveLabel: string
  saveHint?: string
  isSaving: boolean
  onRenameTitle: (nextTitle: string) => void
  onSaveGarment: () => Promise<void> | void
  onDeleteGarment: () => void
  onDuplicateGarment: () => void
  panelTab: "garment" | "design" | "renderings" | "history"
  onPanelTabChange: (next: "garment" | "design" | "renderings" | "history") => void
  onViewVersionHistory: () => void
}) {
  const [assets, setAssets] = useState<DesignAssetListItem[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [assetError, setAssetError] = useState<string | null>(null)
  const [assetUrlInput, setAssetUrlInput] = useState("")
  const [assetNameInput, setAssetNameInput] = useState("")
  const [assetMimeInput, setAssetMimeInput] = useState("image/svg+xml")
  const [assetSizeInput, setAssetSizeInput] = useState("1024")
  const [assetFile, setAssetFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [creatingAsset, setCreatingAsset] = useState(false)
  const [uploadInfo, setUploadInfo] = useState<string | null>(null)
  const [assetSearchQuery, setAssetSearchQuery] = useState("")
  const [assetSortOrder, setAssetSortOrder] = useState<"newest" | "oldest">("newest")
  const [showPriorVersions, setShowPriorVersions] = useState(false)
  const [renderingsOpen, setRenderingsOpen] = useState(true)
  const [loadingNavRenderings, setLoadingNavRenderings] = useState(false)
  const [navRenderings, setNavRenderings] = useState<Array<{ id: string; url: string; label: string; createdAt?: string }>>([])
  const activeProductLabel = useMemo(
    () =>
      productTypeOptions.find((option) => option.code === doc.garment.productTypeCode)?.label ??
      doc.garment.productTypeCode,
    [doc.garment.productTypeCode, productTypeOptions],
  )

  const fetchNavRenderings = useCallback(async () => {
    setLoadingNavRenderings(true)
    const result = await listRenderJobs({ limit: 25 })
    setLoadingNavRenderings(false)
    if (!result.success || !result.data?.jobs) {
      setNavRenderings([])
      return
    }
    const rows = result.data.jobs as Array<{
      id: string
      status: string
      createdAt?: string | null
      outputJson?: Record<string, unknown> | null
    }>
    const images: Array<{ id: string; url: string; label: string; createdAt?: string }> = []
    for (const job of rows) {
      if (job.status !== "completed") continue
      const output = (job.outputJson ?? null) as { images?: Array<{ url?: string; label?: string }> } | null
      if (!output || !Array.isArray(output.images)) continue
      output.images.forEach((image, idx) => {
        if (!image?.url) return
        images.push({
          id: `${job.id}-${idx}`,
          url: image.url,
          label: image.label?.trim() || `Rendering ${images.length + 1}`,
          createdAt: typeof job.createdAt === "string" ? job.createdAt : undefined,
        })
      })
    }
    setNavRenderings(images.slice(0, 30))
  }, [])

  useEffect(() => {
    void fetchNavRenderings()
  }, [fetchNavRenderings])

  const fetchAssets = useCallback(async () => {
    setLoadingAssets(true)
    setAssetError(null)
    const result = await listDesignAssets({
      limit: 20,
      includePriorVersions: showPriorVersions,
      versionsPerAsset: showPriorVersions ? 5 : 1,
    })
    setLoadingAssets(false)
    if (result.success && result.data?.assets) {
      setAssets(result.data.assets as DesignAssetListItem[])
      return
    }
    setAssetError(result.error ?? "Failed to load design assets")
  }, [showPriorVersions])

  useEffect(() => {
    void fetchAssets()
  }, [fetchAssets])

  async function handleCreateAsset() {
    setAssetError(null)
    setCreatingAsset(true)
    const result = await createDesignAssetRecord({
      fileUrl: assetUrlInput,
      fileName: assetNameInput || undefined,
      mime: assetMimeInput,
      title: assetNameInput || undefined,
    })
    setCreatingAsset(false)
    if (!result.success) {
      setAssetError(result.error ?? "Failed to create asset record")
      return
    }
    setAssetUrlInput("")
    setAssetNameInput("")
    await fetchAssets()
  }

  async function handlePrepareUpload() {
    setAssetError(null)
    setUploadInfo(null)
    const desiredSizeBytes = Number(assetSizeInput)
    const result = await createDesignAssetUploadRequest({
      fileName: (assetNameInput || "asset.svg").trim(),
      mime: assetMimeInput,
      desiredSizeBytes: Number.isFinite(desiredSizeBytes) ? desiredSizeBytes : 0,
    })
    if (!result.success) {
      setAssetError(result.error ?? "Failed to prepare upload")
      return
    }
    if (result.data.status === "ready") {
      setUploadInfo("Upload slot ready. Signed upload flow is configured.")
      return
    }
    setUploadInfo(result.data.message)
  }

  function handleFileSelected(file: File | null) {
    setAssetFile(file)
    if (!file) return
    setAssetNameInput(file.name)
    setAssetMimeInput(file.type || "image/svg+xml")
    setAssetSizeInput(String(file.size || 0))
  }

  async function handleUploadFileAndCreateRecord() {
    if (!assetFile) {
      setAssetError("Choose a file first.")
      return
    }
    setAssetError(null)
    setUploadInfo(null)
    setUploadingFile(true)

    const request = await createDesignAssetUploadRequest({
      fileName: assetFile.name,
      mime: assetFile.type || assetMimeInput,
      desiredSizeBytes: assetFile.size,
    })
    if (!request.success) {
      setUploadingFile(false)
      setAssetError(request.error ?? "Failed to prepare upload")
      return
    }
    if (request.data.status !== "ready") {
      setUploadingFile(false)
      setUploadInfo(request.data.message)
      return
    }

    const uploadResp = await fetch(request.data.uploadUrl, {
      method: request.data.method,
      headers: request.data.headers,
      body: assetFile,
    })
    if (!uploadResp.ok) {
      setUploadingFile(false)
      setAssetError(`Upload failed (${uploadResp.status})`)
      return
    }

    const createResult = await createDesignAssetRecord({
      fileUrl: request.data.fileUrl,
      fileName: assetFile.name,
      mime: assetFile.type || assetMimeInput,
      title: assetFile.name,
    })
    setUploadingFile(false)
    if (!createResult.success) {
      setAssetError(createResult.error ?? "Upload succeeded but asset record creation failed")
      return
    }

    setUploadInfo("Uploaded and added to asset library.")
    setAssetFile(null)
    setFileInputKey((prev) => prev + 1)
    setAssetUrlInput("")
    setAssetNameInput("")
    await fetchAssets()
  }

  const filteredAndSortedAssets = useMemo(() => {
    const q = assetSearchQuery.trim().toLowerCase()
    let list = assets
    if (q) {
      list = assets.filter(
        (a) =>
          (a.fileName ?? a.fileUrl).toLowerCase().includes(q) ||
          a.mime.toLowerCase().includes(q)
      )
    }
    const sorted = [...list].sort((a, b) => {
      const left = new Date(a.createdAt).getTime()
      const right = new Date(b.createdAt).getTime()
      return assetSortOrder === "oldest" ? left - right : right - left
    })
    return sorted
  }, [assets, assetSearchQuery, assetSortOrder])

  return (
    <aside className="relative w-64 shrink-0 border-r bg-muted/30 flex flex-col overflow-hidden">
      <div className="border-b px-4 py-3">
        <GarmentTitleHeader
          title={doc.title}
          saveLabel={saveLabel}
          saveHint={saveHint}
          isSaving={isSaving}
          onRenameTitle={onRenameTitle}
          onSaveGarment={onSaveGarment}
          onDeleteGarment={onDeleteGarment}
          onDuplicateGarment={onDuplicateGarment}
          onViewVersionHistory={onViewVersionHistory}
        />
      </div>
      <div className="flex-1 p-4 text-sm text-muted-foreground space-y-2 overflow-y-auto">
        <button
          type="button"
          onClick={() => onPanelTabChange("garment")}
          aria-pressed={panelTab === "garment"}
          className={`w-full rounded-md px-2 py-1.5 text-xs font-medium flex items-center justify-between transition-colors ${
            panelTab === "garment"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <span className="truncate">{activeProductLabel}</span>
        </button>
        <div className="pb-1 pl-1">
          <DesignLayersNavigator
            doc={doc}
            productTypeOptions={productTypeOptions}
            canvasSides={canvasSides}
            selectedLayerId={selectedLayerId}
            selectedLayerIds={selectedLayerIds}
            sharedComponents={sharedComponents}
            onSelectLayer={onSelectLayer}
            onSetSelection={onSetSelection}
            onToggleLayerInSelection={onToggleLayerInSelection}
            onDeleteLayer={onDeleteLayer}
            onDeleteSelectedLayers={onDeleteSelectedLayers}
            onGroupSelectedLayers={onGroupSelectedLayers}
            onUngroupSelectedLayers={onUngroupSelectedLayers}
            onSaveSelectedAsSharedComponent={onSaveSelectedAsSharedComponent}
            onUpdateLayerById={onUpdateLayerById}
            onUpdateGarment={onUpdateGarment}
            onSideChange={onSideChange}
            onSelectCanvasSide={onSelectCanvasSide}
            onToggleCanvasSide={onToggleCanvasSide}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setRenderingsOpen((prev) => !prev)
            onPanelTabChange("renderings")
          }}
          aria-expanded={renderingsOpen}
          className={`w-full rounded-md px-2 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors ${
            panelTab === "renderings"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${renderingsOpen ? "" : "-rotate-90"}`} />
          <span>Render queue</span>
        </button>
        <button
          type="button"
          onClick={() => onPanelTabChange("history")}
          aria-pressed={panelTab === "history"}
          className={`w-full rounded-md px-2 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors ${
            panelTab === "history"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>History</span>
        </button>
        {renderingsOpen ? (
          <div className="pl-6 pr-1 space-y-1">
            {loadingNavRenderings ? (
              <p className="text-[11px] text-muted-foreground">Loading recent renders...</p>
            ) : navRenderings.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">No rendered outputs yet.</p>
            ) : (
              navRenderings.map((rendering) => (
                <a
                  key={rendering.id}
                  href={rendering.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/50 hover:text-foreground truncate"
                  title={`${rendering.label}${rendering.createdAt ? ` · ${formatTimestamp(rendering.createdAt)}` : ""}`}
                >
                  {rendering.label}
                </a>
              ))
            )}
          </div>
        ) : null}
        <div className="hidden space-y-3 pl-1">
          <RenderQueueBlock
            renderEnabled={renderEnabled}
            studioEntryId={studioEntryId}
            designVersionId={undefined}
            getSnapshot={getSnapshot}
          />
          <div className="rounded border bg-card p-3 space-y-2">
          <p className="text-xs font-medium text-foreground">Add asset</p>
          <input
            key={fileInputKey}
            type="file"
            accept=".svg,.png,.jpg,.jpeg,.webp,.gif,image/svg+xml,image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
            className="w-full rounded border bg-background px-2 py-1 text-xs file:mr-2 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
          />
          <button
            type="button"
            onClick={() => void handleUploadFileAndCreateRecord()}
            disabled={uploadingFile || !assetFile}
            className="w-full rounded border bg-background px-2 py-1 text-xs font-medium hover:bg-muted/50 aria-disabled:opacity-50"
          >
            {uploadingFile ? "Uploading..." : "Upload file + create record"}
          </button>
          <div className="border-t my-1" />
          <p className="text-[11px] text-muted-foreground">Or create a record from an existing URL</p>
          <input
            value={assetUrlInput}
            onChange={(e) => setAssetUrlInput(e.target.value)}
            placeholder="https://example.com/art.svg"
            className="w-full rounded border bg-background px-2 py-1 text-xs"
          />
          <input
            value={assetNameInput}
            onChange={(e) => setAssetNameInput(e.target.value)}
            placeholder="Asset name"
            className="w-full rounded border bg-background px-2 py-1 text-xs"
          />
          <input
            value={assetSizeInput}
            onChange={(e) => setAssetSizeInput(e.target.value)}
            placeholder="Desired size bytes (e.g. 1024)"
            className="w-full rounded border bg-background px-2 py-1 text-xs"
          />
          <select
            value={assetMimeInput}
            onChange={(e) => setAssetMimeInput(e.target.value)}
            className="w-full rounded border bg-background px-2 py-1 text-xs"
          >
            <option value="image/svg+xml">image/svg+xml</option>
            <option value="image/png">image/png</option>
            <option value="image/jpeg">image/jpeg</option>
            <option value="image/webp">image/webp</option>
            <option value="image/gif">image/gif</option>
          </select>
          <button
            type="button"
            onClick={() => void handleCreateAsset()}
            disabled={creatingAsset || !assetUrlInput.trim()}
            className="w-full rounded border bg-background px-2 py-1 text-xs font-medium hover:bg-muted/50 aria-disabled:opacity-50"
          >
            {creatingAsset ? "Creating..." : "Create asset record"}
          </button>
          <button
            type="button"
            onClick={() => void handlePrepareUpload()}
            className="w-full rounded border bg-background px-2 py-1 text-xs font-medium hover:bg-muted/50"
          >
            Prepare upload request
          </button>
          {uploadInfo ? <p className="text-[11px] text-muted-foreground">{uploadInfo}</p> : null}
        </div>

        <div className="rounded border bg-card p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-foreground">Asset library</p>
            <button
              type="button"
              onClick={() => void fetchAssets()}
              className="rounded border px-2 py-0.5 text-[11px] hover:bg-muted/50"
              aria-label="Refresh asset list"
            >
              Refresh
            </button>
          </div>
          <input
            type="search"
            value={assetSearchQuery}
            onChange={(e) => setAssetSearchQuery(e.target.value)}
            placeholder="Search name or type…"
            className="w-full rounded border bg-background px-2 py-1 text-xs"
            aria-label="Search assets by name or MIME type"
          />
          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="Sort order"
          >
            <span className="text-[11px] text-muted-foreground shrink-0">Sort:</span>
            <button
              type="button"
              onClick={() => setAssetSortOrder("newest")}
              aria-pressed={assetSortOrder === "newest"}
              className={`rounded border px-2 py-0.5 text-[11px] hover:bg-muted/50 ${assetSortOrder === "newest" ? "bg-muted" : ""}`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => setAssetSortOrder("oldest")}
              aria-pressed={assetSortOrder === "oldest"}
              className={`rounded border px-2 py-0.5 text-[11px] hover:bg-muted/50 ${assetSortOrder === "oldest" ? "bg-muted" : ""}`}
            >
              Oldest
            </button>
          </div>
          <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={showPriorVersions}
              onChange={(e) => setShowPriorVersions(e.target.checked)}
            />
            Include prior versions
          </label>
          {loadingAssets ? (
            <p className="text-xs text-muted-foreground">Loading assets...</p>
          ) : assets.length === 0 ? (
            <p className="text-xs text-muted-foreground">No assets yet.</p>
          ) : filteredAndSortedAssets.length === 0 ? (
            <p className="text-xs text-muted-foreground">No assets match your search.</p>
          ) : (
            <ul className="space-y-1.5" aria-label="Asset library">
              {filteredAndSortedAssets.map((asset) => (
                <li
                  key={asset.assetVersionId}
                  className="rounded border bg-muted/20 p-2 space-y-0.5"
                >
                  <p className="text-xs font-medium truncate text-foreground" title={asset.fileName ?? asset.fileUrl}>
                    {asset.fileName ?? asset.fileUrl}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {asset.mime} · latest · {formatTimestamp(asset.createdAt)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 truncate" title={asset.fileUrl}>
                    {getAssetUrlDomainHint(asset.fileUrl)}
                  </p>
                  {showPriorVersions && Array.isArray(asset.versions) && asset.versions.length > 1 ? (
                    <details className="mt-1 rounded border bg-background/60 p-1.5">
                      <summary className="cursor-pointer text-[11px] text-muted-foreground">
                        Prior versions ({asset.versions.length - 1})
                      </summary>
                      <ul className="mt-1 space-y-1">
                        {asset.versions.filter((v) => !v.isLatest).map((version) => (
                          <li key={version.assetVersionId} className="rounded border bg-muted/20 p-1.5 space-y-0.5">
                            <p className="text-[11px] truncate" title={version.fileName ?? version.fileUrl}>
                              {version.fileName ?? "Unnamed"} · {formatTimestamp(version.createdAt)}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate" title={version.fileUrl}>
                              {getAssetUrlDomainHint(version.fileUrl)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        {assetError ? <p className="text-xs text-destructive">{assetError}</p> : null}
        </div>
      </div>
    </aside>
  )
}

// ─── Center: Front / back canvas with layer preview ───────────────────────

function CenterPanel({
  doc,
  sharedComponents,
  selectedLayerId,
  selectedLayerIds,
  canvasSides,
  onAddTextLayer,
  onAddSvgLayer,
  onInsertSharedComponent,
  onUpdateLayerById,
  onSelectLayer,
  onSetSelection,
  onTranslateSelection,
  onScaleSelection,
  onBeginTransformGesture,
  onSideChange,
}: {
  doc: DesignDoc
  sharedComponents: SharedDesignComponent[]
  selectedLayerId: string | null
  selectedLayerIds: string[]
  canvasSides: DesignSide[]
  onAddTextLayer: () => void
  onAddSvgLayer: () => void
  onInsertSharedComponent: (componentId: string) => void
  onUpdateLayerById: (sideCode: string, layerId: string, updates: Partial<DesignLayer>) => void
  onSelectLayer: (id: string | null) => void
  onSetSelection: (ids: string[], primaryId?: string | null) => void
  onTranslateSelection: (side: DesignSide, anchorLayerId: string, dx: number, dy: number) => void
  onScaleSelection: (side: DesignSide, anchorLayerId: string, factor: number) => void
  onBeginTransformGesture: () => void
  onSideChange: (side: DesignSide) => void
}) {
  const frontLayers = getLayersForProductSide(doc, "front")
  const backLayers = getLayersForProductSide(doc, "back")
  const normalizedCanvasSides = useMemo<DesignSide[]>(() => {
    const hasFront = canvasSides.includes("front")
    const hasBack = canvasSides.includes("back")
    if (hasFront && hasBack) return ["front", "back"]
    if (hasBack) return ["back"]
    return ["front"]
  }, [canvasSides])
  const viewMode: CanvasViewMode =
    normalizedCanvasSides.length === 2 ? "split" : normalizedCanvasSides[0] === "back" ? "back" : "front"
  const sideComponents = useMemo(
    () => sharedComponents.filter((component) => component.side === doc.side),
    [sharedComponents, doc.side],
  )
  const [selectedComponentId, setSelectedComponentId] = useState("")
  useEffect(() => {
    if (sideComponents.length === 0) {
      setSelectedComponentId("")
      return
    }
    if (sideComponents.some((component) => component.id === selectedComponentId)) return
    setSelectedComponentId(sideComponents[0]!.id)
  }, [selectedComponentId, sideComponents])
  const [splitHorizontal, setSplitHorizontal] = useState(false)
  const [editingTextTarget, setEditingTextTarget] = useState<{ side: DesignSide; layerId: string } | null>(null)
  const [editingTextDraft, setEditingTextDraft] = useState("")
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [marquee, setMarquee] = useState<{
    side: DesignSide
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)
  const dragRef = useRef<{
    mode: "move" | "scale"
    side: DesignSide
    anchorLayerId: string
    lastX: number
    lastY: number
  } | null>(null)
  const gestureStartedRef = useRef(false)

  const getSelectionBounds = useCallback((layers: DesignLayer[]) => {
    const selectedSet = new Set(selectedLayerIds)
    const selected = layers.filter((layer) => selectedSet.has(layer.id))
    if (selected.length === 0) return null
    let left = Number.POSITIVE_INFINITY
    let top = Number.POSITIVE_INFINITY
    let right = Number.NEGATIVE_INFINITY
    let bottom = Number.NEGATIVE_INFINITY
    for (const layer of selected) {
      const bounds = estimateLayerBounds(layer)
      left = Math.min(left, layer.x)
      top = Math.min(top, layer.y)
      right = Math.max(right, layer.x + bounds.width)
      bottom = Math.max(bottom, layer.y + bounds.height)
    }
    return {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
    }
  }, [selectedLayerIds])

  const commitGestureStart = useCallback(() => {
    if (gestureStartedRef.current) return
    onBeginTransformGesture()
    gestureStartedRef.current = true
  }, [onBeginTransformGesture])

  const canvasDisplaySize = useMemo(() => {
    const gap = 16
    const width = Math.max(0, viewportSize.width)
    const height = Math.max(0, viewportSize.height)
    if (width === 0 || height === 0) return CANVAS_SIZE

    let tileWidth = width
    let tileHeight = height
    if (viewMode === "split") {
      if (splitHorizontal) {
        tileWidth = (width - gap) / 2
      } else {
        tileHeight = (height - gap) / 2
      }
    }

    const size = Math.floor(Math.min(tileWidth, tileHeight))
    return Math.max(220, Math.min(900, size))
  }, [splitHorizontal, viewMode, viewportSize.height, viewportSize.width])

  const canvasScale = canvasDisplaySize / CANVAS_SIZE

  useEffect(() => {
    const onWindowPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const dx = event.clientX - drag.lastX
      const dy = event.clientY - drag.lastY
      drag.lastX = event.clientX
      drag.lastY = event.clientY
      if (drag.mode === "move") {
        commitGestureStart()
        onTranslateSelection(drag.side, drag.anchorLayerId, dx / canvasScale, dy / canvasScale)
        return
      }
      const scaleDelta = 1 + (dx + dy) / 220
      const factor = Number.isFinite(scaleDelta) ? Math.max(0.6, Math.min(1.6, scaleDelta)) : 1
      if (factor !== 1) {
        commitGestureStart()
        onScaleSelection(drag.side, drag.anchorLayerId, factor)
      }
    }

    const onWindowPointerUp = () => {
      dragRef.current = null
      gestureStartedRef.current = false
    }

    window.addEventListener("pointermove", onWindowPointerMove)
    window.addEventListener("pointerup", onWindowPointerUp)
    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove)
      window.removeEventListener("pointerup", onWindowPointerUp)
    }
  }, [canvasScale, commitGestureStart, onScaleSelection, onTranslateSelection])

  useEffect(() => {
    const updateSplitLayout = () => {
      const widthOk = window.innerWidth >= 1180
      const heightOk = window.innerHeight >= 760
      setSplitHorizontal(widthOk && heightOk)
    }
    updateSplitLayout()
    window.addEventListener("resize", updateSplitLayout)
    return () => window.removeEventListener("resize", updateSplitLayout)
  }, [])

  const beginTextEdit = useCallback((side: DesignSide, layer: DesignLayer) => {
    if (layer.type !== "text") return
    setEditingTextTarget({ side, layerId: layer.id })
    setEditingTextDraft(layer.text ?? "")
  }, [])

  const commitTextEdit = useCallback(() => {
    if (!editingTextTarget) return
    const sideLayers = getLayersForProductSide(doc, editingTextTarget.side)
    const target = sideLayers.find((layer) => layer.id === editingTextTarget.layerId)
    const nextText = editingTextDraft
    if (target && target.type === "text" && (target.text ?? "") !== nextText) {
      onUpdateLayerById(editingTextTarget.side, editingTextTarget.layerId, { text: nextText })
    }
    setEditingTextTarget(null)
  }, [doc, editingTextDraft, editingTextTarget, onUpdateLayerById])

  useEffect(() => {
    const element = viewportRef.current
    if (!element) return
    const update = () => {
      setViewportSize({
        width: element.clientWidth,
        height: element.clientHeight,
      })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    window.addEventListener("resize", update)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])

  const renderCanvas = (side: DesignSide, layers: DesignLayer[]) => {
    const sideBaseVisibility = getBaseLayerVisibilityForSide(doc, side)
    const visibleLayers = layers.filter((layer) => layer.visible !== false)
    const selectionBounds = getSelectionBounds(visibleLayers)
    const activeMarquee = marquee?.side === side ? marquee : null
    const marqueeRect = activeMarquee
      ? {
          x: Math.min(activeMarquee.startX, activeMarquee.currentX),
          y: Math.min(activeMarquee.startY, activeMarquee.currentY),
          width: Math.abs(activeMarquee.currentX - activeMarquee.startX),
          height: Math.abs(activeMarquee.currentY - activeMarquee.startY),
        }
      : null

    return (
      <div className="rounded-lg border bg-card flex flex-col overflow-hidden">
        <button
          type="button"
          onClick={() => onSideChange(side)}
          className={`border-b px-4 py-2 text-left transition-colors ${
            doc.side === side ? "bg-muted font-medium" : "bg-muted/30 hover:bg-muted/50"
          }`}
        >
          <h3 className="text-sm font-medium capitalize">{side}</h3>
        </button>
        <div
          className="flex-1 flex items-center justify-center min-h-[200px] relative bg-muted/20"
          style={{ minHeight: canvasDisplaySize }}
        >
          <div
            className="relative"
            style={{ width: canvasDisplaySize, height: canvasDisplaySize }}
          >
          <div
            className="relative rounded border border-dashed border-muted-foreground/30 bg-background"
            style={{
              width: CANVAS_SIZE,
              height: CANVAS_SIZE,
              transform: `scale(${canvasScale})`,
              transformOrigin: "top left",
            }}
            onPointerDown={(event) => {
              if (event.button !== 0) return
              const rect = event.currentTarget.getBoundingClientRect()
              const startX = (event.clientX - rect.left) / canvasScale
              const startY = (event.clientY - rect.top) / canvasScale
              setMarquee({
                side,
                startX,
                startY,
                currentX: startX,
                currentY: startY,
              })
              onSelectLayer(null)
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event) => {
              if (!marquee || marquee.side !== side) return
              const rect = event.currentTarget.getBoundingClientRect()
              const currentX = (event.clientX - rect.left) / canvasScale
              const currentY = (event.clientY - rect.top) / canvasScale
              setMarquee((prev) => {
                if (!prev || prev.side !== side) return prev
                return { ...prev, currentX, currentY }
              })
            }}
            onPointerUp={(event) => {
              if (!marquee || marquee.side !== side) return
              const end = marquee
              setMarquee(null)
              const left = Math.min(end.startX, end.currentX)
              const top = Math.min(end.startY, end.currentY)
              const right = Math.max(end.startX, end.currentX)
              const bottom = Math.max(end.startY, end.currentY)
              const selected = visibleLayers
                .filter((layer) => {
                  const bounds = estimateLayerBounds(layer)
                  const layerLeft = layer.x
                  const layerTop = layer.y
                  const layerRight = layer.x + bounds.width
                  const layerBottom = layer.y + bounds.height
                  return layerRight >= left && layerLeft <= right && layerBottom >= top && layerTop <= bottom
                })
                .map((layer) => layer.id)
              if (selected.length > 0) {
                onSetSelection(selected, selected[selected.length - 1] ?? null)
              } else {
                onSelectLayer(null)
              }
              event.currentTarget.releasePointerCapture(event.pointerId)
            }}
          >
            {doc.guideSettings.showGuides && (
              <>
                <div
                  className="absolute border border-dashed border-blue-500/40 pointer-events-none"
                  style={{
                    left: PRINT_SAFE_BOX.x,
                    top: PRINT_SAFE_BOX.y,
                    width: PRINT_SAFE_BOX.width,
                    height: PRINT_SAFE_BOX.height,
                  }}
                />
                <div
                  className="absolute bg-blue-500/30 pointer-events-none"
                  style={{ left: CANVAS_SIZE / 2, top: 0, width: 1, height: CANVAS_SIZE }}
                />
                <div
                  className="absolute bg-blue-500/30 pointer-events-none"
                  style={{ left: 0, top: CANVAS_SIZE / 2, width: CANVAS_SIZE, height: 1 }}
                />
              </>
            )}
            <GarmentFlatSvg
              productTypeCode={doc.garment.productTypeCode}
              side={side}
              scopeKey={`canvas-${side}`}
              fillColor={doc.garment.fillColor}
              stitchColor={doc.garment.stitchColor}
              seamColor={doc.garment.seamColor}
              outlineColor={doc.garment.outlineColor}
              showFill={sideBaseVisibility.showFill}
              showStitching={sideBaseVisibility.showStitching}
              showSeams={sideBaseVisibility.showSeams}
              showOutline={sideBaseVisibility.showOutline}
            />
            {visibleLayers.map((layer) => {
              const shadow = layer.effects?.shadow
              const shadowFilter = shadow?.enabled
                ? `drop-shadow(${shadow.x}px ${shadow.y}px ${shadow.blur}px ${toRgba(shadow.color, shadow.opacity)})`
                : undefined
              return (
              <div
                key={layer.id}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  if (e.metaKey || e.ctrlKey || e.shiftKey) {
                    const existing = selectedLayerIds.includes(layer.id)
                    if (existing) {
                      onSetSelection(
                        selectedLayerIds.filter((id) => id !== layer.id),
                        selectedLayerId === layer.id ? null : selectedLayerId,
                      )
                    } else {
                      onSetSelection([...selectedLayerIds, layer.id], layer.id)
                    }
                  } else {
                    if (layer.type === "text" && selectedLayerId === layer.id) {
                      beginTextEdit(side, layer)
                      return
                    }
                    onSelectLayer(layer.id)
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  if (layer.type !== "text") return
                  onSelectLayer(layer.id)
                  beginTextEdit(side, layer)
                }}
                onPointerDown={(e) => {
                  if (e.button !== 0) return
                  if (editingTextTarget?.layerId === layer.id) return
                  e.stopPropagation()
                  if (!selectedLayerIds.includes(layer.id)) {
                    onSelectLayer(layer.id)
                  }
                  dragRef.current = {
                    mode: "move",
                    side,
                    anchorLayerId: layer.id,
                    lastX: e.clientX,
                    lastY: e.clientY,
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSelectLayer(layer.id)
                  }
                }}
                className={`absolute cursor-pointer outline-none ring-offset-2 ${
                  selectedLayerIds.includes(layer.id)
                    ? "ring-2 ring-primary"
                    : "hover:ring-1 hover:ring-muted-foreground/50"
                }`}
                style={{
                  left: layer.x,
                  top: layer.y,
                  transform: `scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                  transformOrigin: "0 0",
                  color: layer.color,
                  opacity: Math.max(0, Math.min(100, layer.opacity ?? 100)) / 100,
                  filter: shadowFilter,
                }}
              >
                {layer.type === "text" ? (
                  editingTextTarget?.layerId === layer.id ? (
                    <div
                      className="rounded border border-primary/50 bg-background/95 p-1"
                      style={{
                        width: Math.max(60, layer.textBoxWidth ?? 220),
                        height: Math.max(24, layer.textBoxHeight ?? 80),
                      }}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <textarea
                        autoFocus
                        value={editingTextDraft}
                        onChange={(event) => setEditingTextDraft(event.target.value)}
                        onFocus={(event) => event.currentTarget.select()}
                        onBlur={() => commitTextEdit()}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault()
                            commitTextEdit()
                          } else if (event.key === "Escape") {
                            event.preventDefault()
                            setEditingTextTarget(null)
                          }
                        }}
                        className="h-full w-full resize-none border-0 bg-transparent p-0 outline-none"
                        style={{
                          color: layer.color,
                          fontFamily: layer.fontFamily ?? "Inter, system-ui, sans-serif",
                          fontSize: layer.fontSize ?? 20,
                          lineHeight: layer.lineHeight ?? 1.2,
                          letterSpacing: `${layer.letterSpacing ?? 0}px`,
                          textAlign: layer.textAlign ?? "left",
                        }}
                      />
                    </div>
                  ) : (
                    layer.textPathType && layer.textPathType !== "none" ? (
                      <svg
                        width={Math.max(60, layer.textBoxWidth ?? 220)}
                        height={Math.max(24, layer.textBoxHeight ?? 80)}
                        className="overflow-visible"
                      >
                        <defs>
                          <path
                            id={`text-path-${layer.id}`}
                            fill="none"
                            stroke="none"
                            d={
                              layer.textPathType === "circle"
                                ? `M ${(layer.textBoxWidth ?? 220) / 2} ${(layer.textBoxHeight ?? 80) / 2} m -${Math.max(20, Math.min((layer.textBoxWidth ?? 220), (layer.textBoxHeight ?? 80)) / 2 - 8)}, 0 a ${Math.max(20, Math.min((layer.textBoxWidth ?? 220), (layer.textBoxHeight ?? 80)) / 2 - 8)},${Math.max(20, Math.min((layer.textBoxWidth ?? 220), (layer.textBoxHeight ?? 80)) / 2 - 8)} 0 1,1 ${Math.max(40, Math.min((layer.textBoxWidth ?? 220), (layer.textBoxHeight ?? 80)) - 16)},0 a ${Math.max(20, Math.min((layer.textBoxWidth ?? 220), (layer.textBoxHeight ?? 80)) / 2 - 8)},${Math.max(20, Math.min((layer.textBoxWidth ?? 220), (layer.textBoxHeight ?? 80)) / 2 - 8)} 0 1,1 -${Math.max(40, Math.min((layer.textBoxWidth ?? 220), (layer.textBoxHeight ?? 80)) - 16)},0`
                                : `M 6 ${(layer.textBoxHeight ?? 80) / 2} Q ${(layer.textBoxWidth ?? 220) / 2} ${((layer.textBoxHeight ?? 80) / 2) + (layer.textPathType === "arc_up" ? -1 : 1) * (layer.textPathBend ?? 30)} ${(layer.textBoxWidth ?? 220) - 6} ${(layer.textBoxHeight ?? 80) / 2}`
                            }
                          />
                        </defs>
                        <text
                          fill={layer.color}
                          stroke="none"
                          style={{
                            fontFamily: layer.fontFamily ?? "Inter, system-ui, sans-serif",
                            fontSize: layer.fontSize ?? 20,
                            letterSpacing: `${layer.letterSpacing ?? 0}px`,
                            textTransform: layer.allCaps ? "uppercase" : "none",
                            textDecoration: "none",
                            filter: layer.strokeEnabled
                              ? buildOutlineDropShadowFilter(layer.strokeColor ?? "#000000", layer.strokeWidth ?? 1)
                              : undefined,
                          }}
                        >
                          <textPath
                            href={`#text-path-${layer.id}`}
                            startOffset={`${
                              (layer.textAlign ?? "center") === "left"
                                ? 0
                                : (layer.textAlign ?? "center") === "right"
                                  ? 100
                                  : 50
                            + (layer.textPathOffset ?? 0)}%`}
                            textAnchor={
                              (layer.textAlign ?? "center") === "left"
                                ? "start"
                                : (layer.textAlign ?? "center") === "right"
                                  ? "end"
                                  : "middle"
                            }
                          >
                            {layer.text ?? "Text"}
                          </textPath>
                        </text>
                      </svg>
                    ) : (
                      <div
                        style={{
                          width: Math.max(60, layer.textBoxWidth ?? 220),
                          height: Math.max(24, layer.textBoxHeight ?? 80),
                          display: "flex",
                          alignItems:
                            layer.verticalAlign === "middle" ? "center" : layer.verticalAlign === "bottom" ? "flex-end" : "flex-start",
                        }}
                      >
                        <span
                          style={{
                            width: "100%",
                            color: layer.color,
                            fontFamily: layer.fontFamily ?? "Inter, system-ui, sans-serif",
                            fontSize: layer.fontSize ?? 20,
                            lineHeight: layer.lineHeight ?? 1.2,
                            letterSpacing: `${layer.letterSpacing ?? 0}px`,
                            textTransform: layer.allCaps ? "uppercase" : "none",
                            textDecoration: `${layer.underline ? "underline " : ""}${layer.strikethrough ? "line-through" : ""}`.trim() || "none",
                            textAlign: layer.textAlign ?? "left",
                            whiteSpace: "pre-wrap",
                            textShadow: layer.strokeEnabled
                              ? buildOutlineTextShadow(layer.strokeColor ?? "#000000", layer.strokeWidth ?? 1)
                              : undefined,
                          }}
                        >
                          {layer.text ?? "Text"}
                        </span>
                      </div>
                    )
                  )
                ) : (
                  <span
                    className="text-xs text-muted-foreground"
                    style={{
                      width: Math.max(24, layer.boxWidth ?? 64),
                      height: Math.max(24, layer.boxHeight ?? 64),
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    [Image] {layer.assetLabel ?? "Select an asset"}
                  </span>
                )}
              </div>
            )})}
            {selectionBounds ? (
              <div
                className="absolute border border-primary/70 bg-primary/5 pointer-events-none"
                style={{
                  left: selectionBounds.x,
                  top: selectionBounds.y,
                  width: selectionBounds.width,
                  height: selectionBounds.height,
                }}
              />
            ) : null}
            {selectionBounds && selectedLayerId ? (
              <button
                type="button"
                onPointerDown={(event) => {
                  event.stopPropagation()
                  dragRef.current = {
                    mode: "scale",
                    side,
                    anchorLayerId: selectedLayerId,
                    lastX: event.clientX,
                    lastY: event.clientY,
                  }
                }}
                className="absolute h-3 w-3 rounded-full border border-primary bg-background shadow"
                style={{
                  left: selectionBounds.x + selectionBounds.width - 6,
                  top: selectionBounds.y + selectionBounds.height - 6,
                }}
                aria-label="Scale selected layers"
                title="Drag to scale selection"
              />
            ) : null}
            {marqueeRect ? (
              <div
                className="absolute border border-dashed border-primary/70 bg-primary/10 pointer-events-none"
                style={{
                  left: marqueeRect.x,
                  top: marqueeRect.y,
                  width: marqueeRect.width,
                  height: marqueeRect.height,
                }}
              />
            ) : null}
          </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="relative flex-1 flex flex-col min-w-0 overflow-hidden">
      <div
        ref={viewportRef}
        className={`flex-1 gap-4 p-4 pb-20 overflow-auto ${
          viewMode === "split"
            ? splitHorizontal
              ? "grid grid-cols-2"
              : "grid grid-cols-1"
            : "grid grid-cols-1"
        }`}
      >
        {viewMode === "front" ? (
          renderCanvas("front", frontLayers)
        ) : viewMode === "back" ? (
          renderCanvas("back", backLayers)
        ) : (
          <>
            {renderCanvas("front", frontLayers)}
            {renderCanvas("back", backLayers)}
          </>
        )}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-lg border bg-background/95 px-2 py-2 shadow-sm backdrop-blur">
          <button
            type="button"
            onClick={onAddTextLayer}
            className="inline-flex h-8 w-8 items-center justify-center rounded border bg-background hover:bg-muted/50"
            aria-label="Add text layer"
            title="Add text layer"
          >
            <Type className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onAddSvgLayer}
            className="inline-flex h-8 w-8 items-center justify-center rounded border bg-background hover:bg-muted/50"
            aria-label="Add graphic layer"
            title="Add graphic layer"
          >
            <ImagePlus className="h-3.5 w-3.5" />
          </button>
          {sideComponents.length > 0 ? (
            <select
              value={selectedComponentId}
              onChange={(event) => setSelectedComponentId(event.target.value)}
              className="h-8 max-w-40 rounded border bg-background px-2 text-[11px]"
              aria-label="Select component to add"
              title="Select component to add"
            >
              {sideComponents.map((component) => (
                <option key={component.id} value={component.id}>
                  {component.name}
                </option>
              ))}
            </select>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (!selectedComponentId) return
              onInsertSharedComponent(selectedComponentId)
            }}
            disabled={!selectedComponentId}
            className="inline-flex h-8 w-8 items-center justify-center rounded border bg-background hover:bg-muted/50 aria-disabled:opacity-50"
            aria-label={selectedComponentId ? "Add selected component" : "No component available to add"}
            title={selectedComponentId ? "Add selected component" : "No component available to add"}
          >
            <PackagePlus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Render queue (scaffold: enqueue + list status) ───────────────────────

type RenderJobRow = {
  id: string
  status: string
  studioEntryId: string | null
  designVersionId: string | null
  createdAt: string | null
  completedAt: string | null
  error: string | null
  outputJson: Record<string, unknown> | null
  durationMs?: number | null
  provider?: string | null
  model?: string | null
  promptVersion?: string | null
  fallbackUsed?: boolean
  fallbackReason?: string | null
  retryMeta?: {
    count?: number
    sourceJobId?: string | null
    lastRetryAt?: string | null
  } | null
  retryCount?: number
  retryLimit?: number
  retryCooldownRemainingSeconds?: number
  retryAllowed?: boolean
}

type RenderOutputJson = {
  images?: Array<{ url?: string; label?: string }>
  providerMeta?: Record<string, unknown>
}

type JobFilter = "all" | "active" | "completed" | "failed"

type RenderProviderHealth = {
  textProviderEnabled: boolean
  textProviderLabel: string
  textModelId: string
  imageProviderEnabled: boolean
  imageProviderConfigured: boolean
  imageProviderLabel: string
  workerEnabled?: boolean
  renderDailyLimit?: number
  renderActiveLimit?: number
  conceptDailyLimit?: number
  conceptActiveLimit?: number
}

function RenderQueueBlock({
  renderEnabled,
  studioEntryId,
  designVersionId,
  getSnapshot,
}: {
  renderEnabled: boolean
  studioEntryId?: string
  designVersionId?: string
  getSnapshot: () => Record<string, unknown>
}) {
  const [jobs, setJobs] = useState<RenderJobRow[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null)
  const [cancellingJobId, setCancellingJobId] = useState<string | null>(null)
  const [processingNext, setProcessingNext] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<JobFilter>("all")
  const [providerHealth, setProviderHealth] = useState<RenderProviderHealth | null>(null)
  const [qualityPreset, setQualityPreset] = useState("photoreal-high")
  const [fitPreset, setFitPreset] = useState("natural")
  const [stylingPreset, setStylingPreset] = useState("premium-lifestyle")

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [result, healthResult] = await Promise.all([
      listRenderJobs({ limit: 10 }),
      getRenderProviderHealth(),
    ])
    setLoading(false)
    if (result.success && result.data?.jobs) {
      setJobs(result.data.jobs as RenderJobRow[])
    } else {
      setError(result.error ?? "Failed to load jobs")
    }
    if (healthResult.success && healthResult.data) {
      setProviderHealth(healthResult.data as RenderProviderHealth)
    }
  }, [])

  useEffect(() => {
    void fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    const hasActive = jobs.some((j) => j.status === "queued" || j.status === "running")
    if (!hasActive) return
    const id = setInterval(() => {
      void fetchJobs()
    }, 5000)
    return () => clearInterval(id)
  }, [jobs, fetchJobs])

  const filteredJobs = useMemo(() => {
    switch (filter) {
      case "active":
        return jobs.filter((j) => j.status === "queued" || j.status === "running")
      case "completed":
        return jobs.filter((j) => j.status === "completed")
      case "failed":
        return jobs.filter((j) => j.status === "failed")
      default:
        return jobs
    }
  }, [jobs, filter])

  async function handleEnqueue() {
    if (!renderEnabled) return
    setSubmitting(true)
    setError(null)
    const result = await createRenderJob({
      studioEntryId,
      designVersionId,
      inputJson: {
        source: "design-editor",
        snapshot: getSnapshot(),
        renderOptions: {
          qualityPreset,
          fitPreset,
          stylingPreset,
        },
      },
    })
    setSubmitting(false)
    if (result.success) {
      void fetchJobs()
    } else {
      setError(result.error ?? "Failed to create job")
    }
  }

  async function handleRetry(jobId: string) {
    setRetryingJobId(jobId)
    setError(null)
    const result = await retryRenderJob(jobId)
    setRetryingJobId(null)
    if (!result.success) {
      setError(result.error ?? "Failed to retry render job")
      return
    }
    void fetchJobs()
  }

  function isRetryDisabled(job: RenderJobRow): { disabled: boolean; reason?: string } {
    if (job.retryAllowed === false) {
      if (
        typeof job.retryCooldownRemainingSeconds === "number" &&
        job.retryCooldownRemainingSeconds > 0
      ) {
        return {
          disabled: true,
          reason: `Retry cooldown: ${job.retryCooldownRemainingSeconds}s remaining`,
        }
      }
      if (
        typeof job.retryCount === "number" &&
        typeof job.retryLimit === "number" &&
        job.retryCount >= job.retryLimit
      ) {
        return {
          disabled: true,
          reason: `Retry limit reached (${job.retryCount}/${job.retryLimit})`,
        }
      }
      return { disabled: true, reason: "Retry unavailable" }
    }
    return { disabled: false }
  }

  async function handleCancel(jobId: string) {
    setCancellingJobId(jobId)
    setError(null)
    const result = await cancelRenderJob(jobId)
    setCancellingJobId(null)
    if (!result.success) {
      setError(result.error ?? "Failed to cancel render job")
      return
    }
    void fetchJobs()
  }

  async function handleProcessNext() {
    setProcessingNext(true)
    setError(null)
    const result = await processRenderJob()
    setProcessingNext(false)
    if (!result.success) {
      setError(result.error ?? "Failed to process next job")
      return
    }
    void fetchJobs()
  }

  async function handleRunJob(jobId: string) {
    setError(null)
    const result = await processRenderJob({ jobId })
    if (!result.success) {
      setError(result.error ?? "Failed to process render job")
      return
    }
    void fetchJobs()
  }

  const statusBadge = (status: string) => {
    const base = "text-xs font-medium px-2 py-0.5 rounded"
    switch (status) {
      case "completed":
        return `${base} bg-green-500/15 text-green-700 dark:text-green-400`
      case "failed":
        return `${base} bg-destructive/15 text-destructive`
      case "running":
        return `${base} bg-blue-500/15 text-blue-700 dark:text-blue-400`
      case "cancelled":
        return `${base} bg-muted text-muted-foreground`
      default:
        return `${base} bg-amber-500/15 text-amber-700 dark:text-amber-400`
    }
  }

  const fallbackBadge = (job: RenderJobRow) => {
    if (job.fallbackUsed) {
      return "text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400"
    }
    return "text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
  }

  const getOutputImages = (
    outputJson: Record<string, unknown> | null,
  ): Array<{ url: string; label?: string }> => {
    const output = (outputJson ?? null) as RenderOutputJson | null
    if (!output || !Array.isArray(output.images)) return []
    return output.images
      .filter((img): img is { url: string; label?: string } => Boolean(img?.url))
      .map((img) => ({ url: img.url, label: img.label }))
  }

  const getProviderMeta = (outputJson: Record<string, unknown> | null): Record<string, unknown> | null => {
    const output = (outputJson ?? null) as RenderOutputJson | null
    if (!output?.providerMeta || typeof output.providerMeta !== "object") return null
    return output.providerMeta
  }

  const latestImageProviderError = useMemo(() => {
    for (const job of jobs) {
      const providerMeta = getProviderMeta(job.outputJson)
      if (providerMeta && typeof providerMeta.imageProviderError === "string" && providerMeta.imageProviderError.trim()) {
        return providerMeta.imageProviderError
      }
    }
    return null
  }, [jobs])

  const filterTabs: { value: JobFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
  ]

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <ImagePlus className="h-4 w-4" />
          Render on Model
        </span>
        <button
          type="button"
          onClick={() => void fetchJobs()}
          disabled={loading}
          className="p-1 rounded hover:bg-muted aria-disabled:opacity-50"
          aria-label="Refresh jobs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="p-3 space-y-3">
        <button
          type="button"
          onClick={handleEnqueue}
          disabled={submitting || !renderEnabled || (Boolean(studioEntryId) && !designVersionId)}
          className="w-full flex items-center justify-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted/50 aria-disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {submitting ? "Enqueuing…" : renderEnabled ? "Queue render job" : "Rendering disabled"}
        </button>
        {studioEntryId && !designVersionId ? (
          <p className="text-[11px] text-muted-foreground">
            Save a version first to link render jobs to a specific design snapshot.
          </p>
        ) : null}
        <div className="rounded border bg-muted/20 px-2.5 py-2 space-y-1.5">
          <p className="text-[11px] font-medium text-foreground">Render calibration</p>
          <div className="grid grid-cols-1 gap-1.5">
            <select
              value={qualityPreset}
              onChange={(e) => setQualityPreset(e.target.value)}
              className="rounded border bg-background px-2 py-1 text-[11px]"
              aria-label="Render quality preset"
            >
              <option value="photoreal-standard">Quality: photoreal-standard</option>
              <option value="photoreal-high">Quality: photoreal-high</option>
              <option value="campaign-premium">Quality: campaign-premium</option>
            </select>
            <select
              value={fitPreset}
              onChange={(e) => setFitPreset(e.target.value)}
              className="rounded border bg-background px-2 py-1 text-[11px]"
              aria-label="Fit preset"
            >
              <option value="natural">Fit: natural</option>
              <option value="athletic-relaxed">Fit: athletic-relaxed</option>
              <option value="oversized-fashion">Fit: oversized-fashion</option>
            </select>
            <select
              value={stylingPreset}
              onChange={(e) => setStylingPreset(e.target.value)}
              className="rounded border bg-background px-2 py-1 text-[11px]"
              aria-label="Styling preset"
            >
              <option value="editorial-clean">Styling: editorial-clean</option>
              <option value="premium-lifestyle">Styling: premium-lifestyle</option>
              <option value="studio-commercial">Styling: studio-commercial</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleProcessNext()}
          disabled={processingNext || !renderEnabled}
          className="w-full flex items-center justify-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted/50 aria-disabled:opacity-50"
        >
          {processingNext ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing next…
            </>
          ) : (
            "Process next queued"
          )}
        </button>
        {providerHealth ? (
          <div className="rounded border bg-muted/20 px-2.5 py-2 space-y-1">
            <p className="text-[11px] text-muted-foreground">
              Text provider:{" "}
              <span className="font-medium text-foreground">
                {providerHealth.textProviderEnabled ? "enabled" : "disabled"}
              </span>{" "}
              ({providerHealth.textProviderLabel})
            </p>
            <p className="text-[11px] text-muted-foreground truncate" title={providerHealth.textModelId}>
              Model: {providerHealth.textModelId}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Image provider:{" "}
              <span className="font-medium text-foreground">
                {providerHealth.imageProviderEnabled ? "enabled" : "disabled"}
              </span>{" "}
              ({providerHealth.imageProviderLabel})
              {!providerHealth.imageProviderConfigured ? " · not configured" : ""}
            </p>
            {typeof providerHealth.workerEnabled === "boolean" ? (
              <p className="text-[11px] text-muted-foreground">
                Worker processing:{" "}
                <span className="font-medium text-foreground">
                  {providerHealth.workerEnabled ? "enabled" : "disabled"}
                </span>
              </p>
            ) : null}
            {(typeof providerHealth.renderDailyLimit === "number" ||
              typeof providerHealth.renderActiveLimit === "number") ? (
              <p className="text-[11px] text-muted-foreground">
                Render quotas: daily {providerHealth.renderDailyLimit ?? "—"} · active {providerHealth.renderActiveLimit ?? "—"}
              </p>
            ) : null}
            {latestImageProviderError ? (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 truncate" title={latestImageProviderError}>
                Last image provider issue: {latestImageProviderError}
              </p>
            ) : null}
          </div>
        ) : null}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">Recent jobs</p>
            <div className="flex gap-0.5 rounded-md border bg-muted/20 p-0.5">
              {filterTabs.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    filter === value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {loading && jobs.length === 0 ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No render jobs yet.</p>
          ) : filteredJobs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No jobs match &quot;{filter}&quot;.</p>
          ) : (
            <ul className="space-y-1.5">
              {filteredJobs.map((j) => {
                const outputImages = getOutputImages(j.outputJson)
                const providerMeta = getProviderMeta(j.outputJson)
                const snippet = errorSnippet(j.error)
                const retryState = isRetryDisabled(j)
                return (
                  <li
                    key={j.id}
                    className="space-y-2 rounded border bg-muted/20 px-2.5 py-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-muted-foreground" title={j.id}>
                        {j.id.slice(0, 8)}…
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={statusBadge(j.status)}>{j.status}</span>
                        <span className={fallbackBadge(j)}>
                          {j.fallbackUsed ? "fallback" : "provider"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span title={j.createdAt ?? undefined}>
                        Created {formatTimestamp(j.createdAt)}
                      </span>
                      {typeof j.durationMs === "number" && (
                        <span>{j.durationMs}ms</span>
                      )}
                      {j.provider && <span>Provider {j.provider}</span>}
                      {j.model && <span className="truncate max-w-[180px]" title={j.model}>Model {j.model}</span>}
                      {j.promptVersion && <span>Prompt {j.promptVersion}</span>}
                      {providerMeta && typeof providerMeta.qualityPreset === "string" && (
                        <span>Quality {providerMeta.qualityPreset}</span>
                      )}
                      {providerMeta && typeof providerMeta.fitPreset === "string" && (
                        <span>Fit {providerMeta.fitPreset}</span>
                      )}
                      {providerMeta && typeof providerMeta.stylingPreset === "string" && (
                        <span>Style {providerMeta.stylingPreset}</span>
                      )}
                      {(j.status === "completed" || j.status === "failed") && j.completedAt && (
                        <span title={j.completedAt}>
                          Done {formatTimestamp(j.completedAt)}
                        </span>
                      )}
                      {typeof j.retryCount === "number" && typeof j.retryLimit === "number" && (
                        <span>
                          Retries {j.retryCount}/{j.retryLimit}
                        </span>
                      )}
                      {typeof j.retryCooldownRemainingSeconds === "number" &&
                        j.retryCooldownRemainingSeconds > 0 && (
                          <span>
                            Cooldown {j.retryCooldownRemainingSeconds}s
                          </span>
                        )}
                    </div>
                    {j.status === "failed" && snippet && (
                      <p className="text-[11px] text-destructive bg-destructive/10 rounded px-1.5 py-1 truncate" title={j.error ?? undefined}>
                        {snippet}
                      </p>
                    )}
                    {j.fallbackUsed && j.fallbackReason ? (
                      <p
                        className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 rounded px-1.5 py-1 truncate"
                        title={j.fallbackReason}
                      >
                        Fallback reason: {j.fallbackReason}
                      </p>
                    ) : null}
                    {(j.status === "queued" || j.status === "running") && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleRunJob(j.id)}
                          className="rounded border px-2 py-1 text-[11px] hover:bg-background"
                        >
                          Process
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRetry(j.id)}
                          disabled={retryingJobId === j.id || retryState.disabled}
                          className="rounded border px-2 py-1 text-[11px] hover:bg-background aria-disabled:opacity-50"
                          title={retryState.reason}
                        >
                          {retryingJobId === j.id ? "Retrying..." : "Retry"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleCancel(j.id)}
                          disabled={cancellingJobId === j.id}
                          className="rounded border px-2 py-1 text-[11px] hover:bg-background aria-disabled:opacity-50"
                        >
                          {cancellingJobId === j.id ? "Cancelling..." : "Cancel"}
                        </button>
                      </div>
                    )}
                    {j.status === "failed" && (
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => void handleRetry(j.id)}
                          disabled={retryingJobId === j.id || retryState.disabled}
                          className="rounded border px-2 py-1 text-[11px] hover:bg-background aria-disabled:opacity-50"
                          title={retryState.reason}
                        >
                          {retryingJobId === j.id ? "Retrying..." : "Retry"}
                        </button>
                        {retryState.disabled && retryState.reason ? (
                          <p className="text-[10px] text-muted-foreground">{retryState.reason}</p>
                        ) : null}
                      </div>
                    )}
                    {j.status === "completed" && (outputImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        {outputImages.map((img, idx) => (
                          <a
                            key={idx}
                            href={img.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded border bg-background p-1.5 hover:bg-muted/50 text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            {img.url.match(/\.(svg|png|jpg|jpeg|webp|gif)$/i) ? (
                              <img
                                src={img.url}
                                alt={img.label ?? "Output"}
                                className="h-8 w-8 shrink-0 rounded object-cover border"
                              />
                            ) : (
                              <span className="h-8 w-8 shrink-0 rounded border bg-muted flex items-center justify-center">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </span>
                            )}
                            <span className="truncate">{img.label ?? "Output"}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">Completed (no preview)</p>
                    ))}
                    <details className="rounded border bg-background/60 px-2 py-1.5">
                      <summary className="cursor-pointer text-[11px] font-medium text-muted-foreground">
                        Job diagnostics
                      </summary>
                      <pre className="mt-1.5 overflow-auto text-[10px] leading-4 text-muted-foreground">
                        {JSON.stringify(
                          {
                            providerMeta,
                            retryMeta: j.retryMeta ?? null,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Design versions (save + list) ────────────────────────────────────────

type DesignVersionRow = {
  id: string
  version: number
  label?: string
  createdAt: string
}

function DesignVersionsBlock({
  studioEntryId,
  getSnapshot,
  onRestoreSnapshot,
}: {
  studioEntryId: string
  getSnapshot: () => Record<string, unknown>
  onRestoreSnapshot: (snapshot: Record<string, unknown>) => void
}) {
  const [versions, setVersions] = useState<DesignVersionRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchVersions = useCallback(async () => {
    if (!studioEntryId) return
    setLoading(true)
    setError(null)
    const result = await listStudioDesignVersions(studioEntryId, 10)
    setLoading(false)
    if (result.success && result.data?.versions) {
      setVersions(result.data.versions as DesignVersionRow[])
    } else {
      setError(result.error ?? "Failed to load versions")
    }
  }, [studioEntryId])

  useEffect(() => {
    void fetchVersions()
  }, [fetchVersions])

  async function handleSaveVersion() {
    if (!studioEntryId) return
    setSaving(true)
    setError(null)
    const snapshot = getSnapshot()
    const result = await saveStudioDesignVersion(
      studioEntryId,
      { ...snapshot, savedAt: new Date().toISOString() },
      undefined,
    )
    setSaving(false)
    if (result.success) {
      void fetchVersions()
    } else {
      setError(result.error ?? "Failed to save version")
    }
  }

  async function handleRestoreVersion(versionId: string) {
    setRestoringId(versionId)
    setError(null)
    const version = await getStudioDesignVersion(versionId)
    setRestoringId(null)
    if (!version) {
      setError("Unable to load selected version.")
      return
    }
    const snapshot = version.snapshotJson
    if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
      setError("Selected version snapshot is invalid.")
      return
    }
    onRestoreSnapshot(snapshot as Record<string, unknown>)
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
        <GitBranch className="h-3.5 w-3.5" />
        Version
      </div>
      <div className="p-3 space-y-3">
        <button
          type="button"
          onClick={handleSaveVersion}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted/50 aria-disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GitBranch className="h-3.5 w-3.5" />
          )}
          {saving ? "Saving…" : "Save version"}
        </button>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Recent versions</p>
          {loading && versions.length === 0 ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : versions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No versions yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="rounded border bg-muted/20 px-2 py-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">v{v.version}</span>
                    <button
                      type="button"
                      onClick={() => void handleRestoreVersion(v.id)}
                      disabled={restoringId === v.id}
                      className="rounded border bg-background px-2 py-0.5 text-[11px] hover:bg-muted/50 aria-disabled:opacity-50"
                    >
                      {restoringId === v.id ? "Restoring..." : "Restore"}
                    </button>
                  </div>
                  {v.label && (
                    <span className="text-muted-foreground">{v.label}</span>
                  )}
                  <p className="text-muted-foreground mt-0.5">{v.createdAt}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

type CollaborationApprovalView = {
  state: "none" | "requested" | "approved" | "revisions_requested"
  requestedAt?: string
  requestedBy?: string
  decidedAt?: string
  decidedBy?: string
  note?: string
  events: Array<{
    id: string
    type: "requested" | "approved" | "revisions_requested"
    note?: string
    byUserId: string
    byLabel: string
    at: string
  }>
}

function CollaborationApprovalBlock({
  studioEntryId,
  canRequestApproval,
  canDecideApproval,
}: {
  studioEntryId: string
  canRequestApproval: boolean
  canDecideApproval: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [approval, setApproval] = useState<CollaborationApprovalView | null>(null)
  const [entryStatus, setEntryStatus] = useState<string | null>(null)

  const fetchApproval = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getStudioEntryCollaborationApproval(studioEntryId)
    setLoading(false)
    if (!result.success) {
      setError(result.error ?? "Failed to load collaboration approval state.")
      return
    }
    const data = result.data as {
      entry?: { status?: string }
      approval?: CollaborationApprovalView
    }
    setEntryStatus(data.entry?.status ?? null)
    setApproval(
      data.approval ?? {
        state: "none",
        events: [],
      },
    )
  }, [studioEntryId])

  useEffect(() => {
    void fetchApproval()
  }, [fetchApproval])

  async function handleRequestApproval() {
    if (!canRequestApproval) return
    setSubmitting(true)
    setError(null)
    const result = await requestStudioEntryCollaborationApproval({
      entryId: studioEntryId,
      note: note.trim() || undefined,
    })
    setSubmitting(false)
    if (!result.success) {
      setError(result.error ?? "Failed to request approval.")
      return
    }
    setNote("")
    await fetchApproval()
  }

  async function handleDecision(decision: "approved" | "revisions_requested") {
    if (!canDecideApproval) return
    const confirmed = window.confirm(
      decision === "approved"
        ? "Approve this design for collaboration review?"
        : "Request revisions for this design?",
    )
    if (!confirmed) return
    setSubmitting(true)
    setError(null)
    const result = await decideStudioEntryCollaborationApproval({
      entryId: studioEntryId,
      decision,
      note: note.trim() || undefined,
    })
    setSubmitting(false)
    if (!result.success) {
      setError(result.error ?? "Failed to submit approval decision.")
      return
    }
    setNote("")
    await fetchApproval()
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
        <Users className="h-3.5 w-3.5" />
        Collaboration approval
      </div>
      <div className="p-3 space-y-2">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading approval state...</p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Entry status: <span className="font-medium text-foreground">{entryStatus ?? "unknown"}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Approval state: <span className="font-medium text-foreground">{approval?.state ?? "none"}</span>
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional review note"
              rows={2}
              className="w-full rounded border bg-background px-2 py-1 text-xs"
            />
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => void handleRequestApproval()}
                disabled={submitting || !canRequestApproval}
                className="rounded border bg-background px-2 py-1 text-[11px] hover:bg-muted/50 aria-disabled:opacity-50"
              >
                Request review
              </button>
              <button
                type="button"
                onClick={() => void handleDecision("approved")}
                disabled={submitting || !canDecideApproval}
                className="rounded border bg-background px-2 py-1 text-[11px] hover:bg-muted/50 aria-disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Check className="h-3 w-3" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => void handleDecision("revisions_requested")}
                disabled={submitting || !canDecideApproval}
                className="rounded border bg-background px-2 py-1 text-[11px] hover:bg-muted/50 aria-disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <X className="h-3 w-3" />
                Revisions
              </button>
            </div>
            {(!canRequestApproval || !canDecideApproval) && (
              <p className="text-[11px] text-muted-foreground">
                Actions are shown based on your permissions.
              </p>
            )}
            {error ? <p className="text-[11px] text-destructive">{error}</p> : null}
            {approval?.events?.length ? (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground">Recent activity</p>
                <ul className="space-y-1">
                  {approval.events.slice(-5).reverse().map((event) => (
                    <li key={event.id} className="rounded border bg-muted/20 px-2 py-1 text-[11px]">
                      <p className="text-foreground">
                        {event.type} · {event.byLabel}
                      </p>
                      <p className="text-muted-foreground">{new Date(event.at).toLocaleString()}</p>
                      {event.note ? <p className="text-muted-foreground truncate">{event.note}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">No collaboration activity yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Right: Layers, properties, history, version ───────────────────────────

function InspectorSection({
  title,
  children,
  collapsible = false,
  collapsed = false,
  onToggle,
}: {
  title: string
  children: ReactNode
  collapsible?: boolean
  collapsed?: boolean
  onToggle?: () => void
}) {
  return (
    <section className="border-t px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        {collapsible ? (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-6 w-6 items-center justify-center rounded border bg-background hover:bg-muted/50"
            aria-expanded={!collapsed}
            aria-label={`${collapsed ? "Expand" : "Collapse"} ${title} section`}
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
          </button>
        ) : null}
      </div>
      {collapsible && collapsed ? null : children}
    </section>
  )
}

function RightPanel({
  doc,
  productTypeOptions,
  panelTab,
  selectedLayerId,
  selectedLayerIds,
  onUpdateLayer,
  onUpdateGroup,
  onDeleteSelectedLayers,
  onGroupSelectedLayers,
  onUngroupSelectedLayers,
  onSaveSelectedAsSharedComponent,
  undo,
  redo,
  canUndo,
  canRedo,
  studioEntryId,
  lastSavedVersionId,
  renderEnabled,
  getSnapshot,
  onRestoreSnapshot,
  conceptColorDirection,
  suggestedColors,
  canRequestApproval,
  canDecideApproval,
  onUpdateGuideSettings,
  onUpdateGarment,
  onChangeProductType,
}: {
  doc: DesignDoc
  productTypeOptions: GarmentPreset[]
  panelTab: "garment" | "design" | "renderings" | "history"
  selectedLayerId: string | null
  selectedLayerIds: string[]
  onUpdateLayer: (updates: Partial<DesignLayer>) => void
  onUpdateGroup: (groupId: string, updates: Partial<DesignLayer>) => void
  onDeleteSelectedLayers: () => void
  onGroupSelectedLayers: () => void
  onUngroupSelectedLayers: () => void
  onSaveSelectedAsSharedComponent: (name: string) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  studioEntryId?: string
  lastSavedVersionId?: string
  renderEnabled: boolean
  getSnapshot: () => Record<string, unknown>
  onRestoreSnapshot: (snapshot: Record<string, unknown>) => void
  conceptColorDirection: string[]
  suggestedColors: EntryColorSuggestion[]
  canRequestApproval: boolean
  canDecideApproval: boolean
  onUpdateGuideSettings: (updates: Partial<DesignDoc["guideSettings"]>) => void
  onUpdateGarment: (updates: Partial<DesignDoc["garment"]>) => void
  onChangeProductType: (nextProductTypeCode: string, mode: "new-design" | "change-in-place") => void
}) {
  const layers = getLayersForSide(doc)
  const canGroup = selectedLayerIds.length >= 2
  const canUngroup = selectedLayerIds.some((id) => {
    const layer = layers.find((l) => l.id === id)
    return Boolean(layer?.groupId)
  })
  const selectedLayer = selectedLayerId
    ? layers.find((l) => l.id === selectedLayerId) ?? null
    : null
  const selectedGroupId = getSelectedGroupId(layers, selectedLayerId)
  const selectedGroupLayers = selectedGroupId
    ? layers.filter((l) => l.groupId === selectedGroupId)
    : []
  const [imageAssets, setImageAssets] = useState<DesignAssetListItem[]>([])
  const [imageAssetsLoading, setImageAssetsLoading] = useState(false)
  const [imageAssetsError, setImageAssetsError] = useState<string | null>(null)
  const [imageAssetSearch, setImageAssetSearch] = useState("")
  const [imageAssetPage, setImageAssetPage] = useState(0)
  const [imageAssetHasMore, setImageAssetHasMore] = useState(false)
  const [imageAssetSortOrder, setImageAssetSortOrder] = useState<"newest" | "oldest">("newest")
  const [hasAttemptedImageAssetAutoLoad, setHasAttemptedImageAssetAutoLoad] = useState(false)
  const [pendingProductTypeCode, setPendingProductTypeCode] = useState<string | null>(null)
  const [strokeCollapsed, setStrokeCollapsed] = useState(true)
  const [effectsCollapsed, setEffectsCollapsed] = useState(true)
  const activeProductLabel = useMemo(
    () => productTypeOptions.find((option) => option.code === doc.garment.productTypeCode)?.label ?? doc.garment.productTypeCode,
    [doc.garment.productTypeCode, productTypeOptions],
  )
  const pendingProductLabel = useMemo(
    () => (pendingProductTypeCode ? (productTypeOptions.find((option) => option.code === pendingProductTypeCode)?.label ?? pendingProductTypeCode) : null),
    [pendingProductTypeCode, productTypeOptions],
  )
  const imageAssetLoadContext = useMemo(() => {
    if (selectedLayer?.type !== "svg") {
      return null
    }
    return selectedLayer.id
  }, [selectedLayer?.id, selectedLayer?.type])

  const fetchImageAssets = useCallback(async (options?: { page?: number; sortOrder?: "newest" | "oldest" }) => {
    const page = options?.page ?? imageAssetPage
    const sortOrder = options?.sortOrder ?? imageAssetSortOrder
    setImageAssetsLoading(true)
    setImageAssetsError(null)
    const result = await listDesignAssets({
      limit: 20,
      offset: page * 20,
      sortOrder,
      includePriorVersions: false,
      versionsPerAsset: 1,
    })
    setImageAssetsLoading(false)
    if (result.success && result.data?.assets) {
      const nextAssets = result.data.assets as DesignAssetListItem[]
      setImageAssets(nextAssets)
      setImageAssetHasMore(nextAssets.length === 20)
      return
    }
    setImageAssets([])
    setImageAssetHasMore(false)
    setImageAssetsError(result.error ?? "Failed to load image assets")
  }, [imageAssetPage, imageAssetSortOrder])

  useEffect(() => {
    setHasAttemptedImageAssetAutoLoad(false)
    setImageAssetPage(0)
    setImageAssetSearch("")
    setImageAssetHasMore(false)
    setImageAssets([])
  }, [imageAssetLoadContext])

  useEffect(() => {
    if (!imageAssetLoadContext || imageAssets.length > 0 || imageAssetsLoading || hasAttemptedImageAssetAutoLoad) {
      return
    }
    setHasAttemptedImageAssetAutoLoad(true)
    void fetchImageAssets({ page: 0, sortOrder: imageAssetSortOrder })
  }, [
    fetchImageAssets,
    hasAttemptedImageAssetAutoLoad,
    imageAssetLoadContext,
    imageAssetSortOrder,
    imageAssets.length,
    imageAssetsLoading,
  ])

  const filteredImageAssets = useMemo(() => {
    const query = imageAssetSearch.trim().toLowerCase()
    if (!query) return imageAssets
    return imageAssets.filter((asset) =>
      (asset.fileName ?? asset.fileUrl).toLowerCase().includes(query) ||
      asset.mime.toLowerCase().includes(query),
    )
  }, [imageAssets, imageAssetSearch])
  const selectedLayerWidth = useMemo(() => {
    if (!selectedLayer) return null
    const baseWidth =
      selectedLayer.type === "text"
        ? Math.max(60, selectedLayer.textBoxWidth ?? 220)
        : Math.max(24, selectedLayer.boxWidth ?? 64)
    return Math.round(baseWidth * selectedLayer.scale)
  }, [selectedLayer])
  const selectedLayerHeight = useMemo(() => {
    if (!selectedLayer) return null
    const baseHeight =
      selectedLayer.type === "text"
        ? Math.max(24, selectedLayer.textBoxHeight ?? 80)
        : Math.max(24, selectedLayer.boxHeight ?? 64)
    return Math.round(baseHeight * selectedLayer.scale)
  }, [selectedLayer])

  return (
    <aside className="relative w-72 shrink-0 border-l bg-background flex flex-col overflow-hidden">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          Properties
        </h2>
        {panelTab === "design" && selectedLayerIds.length > 0 ? (
          <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">
                {selectedLayerIds.length} layer{selectedLayerIds.length === 1 ? "" : "s"} selected
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onSaveSelectedAsSharedComponent("")}
                  className="inline-flex items-center justify-center rounded border bg-background h-7 w-7 hover:bg-muted/50"
                  aria-label={`Save ${selectedLayerIds.length} selected layer${selectedLayerIds.length === 1 ? "" : "s"} as component`}
                  title={`Save ${selectedLayerIds.length} selected layer${selectedLayerIds.length === 1 ? "" : "s"} as component`}
                >
                  <PackagePlus className="h-3.5 w-3.5" />
                </button>
                {canUngroup ? (
                  <button
                    type="button"
                    onClick={onUngroupSelectedLayers}
                    className="inline-flex items-center justify-center rounded border bg-background h-7 w-7 hover:bg-muted/50"
                    aria-label="Ungroup selected layers"
                    title="Ungroup selected layers"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onGroupSelectedLayers}
                    disabled={!canGroup}
                    className="inline-flex items-center justify-center rounded border bg-background h-7 w-7 hover:bg-muted/50 aria-disabled:opacity-50"
                    aria-label="Group selected layers"
                    title="Group selected layers"
                  >
                    <Layers className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const shouldDelete = window.confirm(
                      `Delete ${selectedLayerIds.length} selected layer${selectedLayerIds.length === 1 ? "" : "s"}?`,
                    )
                    if (!shouldDelete) return
                    onDeleteSelectedLayers()
                  }}
                  className="inline-flex items-center justify-center rounded border bg-background h-7 w-7 hover:bg-muted/50 text-destructive"
                  aria-label={`Delete selected layers (${selectedLayerIds.length})`}
                  title={`Delete selected layers (${selectedLayerIds.length})`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
          </div>
        ) : null}
      </div>
      <div className="flex-1 overflow-y-auto">
        {panelTab === "renderings" && (
          <RenderQueueBlock
            renderEnabled={renderEnabled}
            studioEntryId={studioEntryId}
            designVersionId={lastSavedVersionId}
            getSnapshot={getSnapshot}
          />
        )}
        {panelTab === "garment" && (
          <div className="rounded-lg border bg-card">
            <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
              Garment setup
            </div>
            <div className="p-3 space-y-2">
              <label className="text-[11px] text-muted-foreground block">Product type</label>
              <select
                value={doc.garment.productTypeCode}
                onChange={(event) => {
                  const nextCode = event.target.value
                  if (nextCode === doc.garment.productTypeCode) return
                  setPendingProductTypeCode(nextCode)
                }}
                className="w-full rounded border bg-background px-2 py-1 text-xs"
              >
                {productTypeOptions.map((preset) => (
                  <option key={preset.code} value={preset.code}>
                    {preset.label}
                  </option>
                ))}
                {!productTypeOptions.some((preset) => preset.code === doc.garment.productTypeCode) ? (
                  <option value={doc.garment.productTypeCode}>{doc.garment.productTypeCode}</option>
                ) : null}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] text-muted-foreground">Garment fill</label>
                <input
                  type="color"
                  value={doc.garment.fillColor}
                  onChange={(e) => onUpdateGarment({ fillColor: e.target.value })}
                  className="rounded border bg-background h-8 w-full cursor-pointer"
                />
                <label className="text-[11px] text-muted-foreground">Stitching paths</label>
                <input
                  type="color"
                  value={doc.garment.stitchColor}
                  onChange={(e) => onUpdateGarment({ stitchColor: e.target.value, autoStitchShade: false })}
                  className="rounded border bg-background h-8 w-full cursor-pointer"
                />
                <label className="text-[11px] text-muted-foreground">Seams</label>
                <input
                  type="color"
                  value={doc.garment.seamColor}
                  onChange={(e) => onUpdateGarment({ seamColor: e.target.value, autoStitchShade: false })}
                  className="rounded border bg-background h-8 w-full cursor-pointer"
                />
                <label className="text-[11px] text-muted-foreground">Outline</label>
                <input
                  type="color"
                  value={doc.garment.outlineColor}
                  onChange={(e) => onUpdateGarment({ outlineColor: e.target.value, autoStitchShade: false })}
                  className="rounded border bg-background h-8 w-full cursor-pointer"
                />
              </div>
              {suggestedColors.length > 0 ? (
                <div className="space-y-1.5 rounded border bg-muted/20 px-2.5 py-2">
                  <p className="text-[11px] font-medium text-foreground">Suggested palette</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedColors.map((color) =>
                      color.hex ? (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => onUpdateGarment({ fillColor: color.hex! })}
                          className="group inline-flex items-center gap-1 rounded border bg-background px-1.5 py-1 text-[10px] hover:bg-muted/50"
                          title={`${color.title}${color.pantone ? ` · ${color.pantone}` : ""} · ${color.source}`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-sm border border-black/10"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="max-w-24 truncate">{color.title}</span>
                        </button>
                      ) : null,
                    )}
                  </div>
                </div>
              ) : null}
              {conceptColorDirection.length > 0 ? (
                <div className="space-y-1.5 rounded border bg-muted/20 px-2.5 py-2">
                  <p className="text-[11px] font-medium text-foreground">Concept color direction</p>
                  <ul className="space-y-1 text-[11px] text-muted-foreground">
                    {conceptColorDirection.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <label className="flex items-center justify-between gap-2 text-xs">
                <span>Auto darker line shades</span>
                <input
                  type="checkbox"
                  checked={doc.garment.autoStitchShade}
                  onChange={(e) => onUpdateGarment({ autoStitchShade: e.target.checked })}
                />
              </label>
            </div>
          </div>
        )}
        {panelTab === "design" && (
          <>
            {!selectedLayer ? (
              <InspectorSection title="Properties">
                <p className="text-muted-foreground text-xs">Select a layer to edit.</p>
              </InspectorSection>
            ) : (
              <>
                <InspectorSection title="Position">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-muted-foreground">X</label>
                    <input
                      type="number"
                      value={selectedLayer.x}
                      onChange={(e) => onUpdateLayer({ x: Number(e.target.value) })}
                      className="rounded border bg-background px-2 py-1 text-xs w-full"
                    />
                    <label className="text-xs text-muted-foreground">Y</label>
                    <input
                      type="number"
                      value={selectedLayer.y}
                      onChange={(e) => onUpdateLayer({ y: Number(e.target.value) })}
                      className="rounded border bg-background px-2 py-1 text-xs w-full"
                    />
                    <label className="text-xs text-muted-foreground">Rotation</label>
                    <input
                      type="number"
                      value={selectedLayer.rotation}
                      onChange={(e) => onUpdateLayer({ rotation: Number(e.target.value) })}
                      className="rounded border bg-background px-2 py-1 text-xs w-full"
                    />
                    <label className="text-xs text-muted-foreground">Visibility</label>
                    <button
                      type="button"
                      onClick={() => onUpdateLayer({ visible: !selectedLayer.visible })}
                      className="inline-flex h-8 items-center justify-center rounded border bg-background hover:bg-muted/50"
                    >
                      {selectedLayer.visible ? "Visible" : "Hidden"}
                    </button>
                  </div>
                </InspectorSection>

                <InspectorSection title="Layout">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-muted-foreground">W</label>
                    <input
                      type="number"
                      min={1}
                      value={selectedLayerWidth ?? 0}
                      onChange={(e) => {
                        const next = Math.max(1, Number(e.target.value) || 1)
                        const base = Math.max(1, next / Math.max(0.1, selectedLayer.scale))
                        if (selectedLayer.type === "text") {
                          onUpdateLayer({ textBoxWidth: Math.round(base) })
                          return
                        }
                        onUpdateLayer({ boxWidth: Math.round(base) })
                      }}
                      className="rounded border bg-background px-2 py-1 text-xs w-full"
                    />
                    <label className="text-xs text-muted-foreground">H</label>
                    <input
                      type="number"
                      min={1}
                      value={selectedLayerHeight ?? 0}
                      onChange={(e) => {
                        const next = Math.max(1, Number(e.target.value) || 1)
                        const base = Math.max(1, next / Math.max(0.1, selectedLayer.scale))
                        if (selectedLayer.type === "text") {
                          onUpdateLayer({ textBoxHeight: Math.round(base) })
                          return
                        }
                        onUpdateLayer({ boxHeight: Math.round(base) })
                      }}
                      className="rounded border bg-background px-2 py-1 text-xs w-full"
                    />
                    <label className="text-xs text-muted-foreground">Scale</label>
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      value={selectedLayer.scale}
                      onChange={(e) => onUpdateLayer({ scale: Number(e.target.value) })}
                      className="rounded border bg-background px-2 py-1 text-xs w-full"
                    />
                  </div>
                </InspectorSection>

                {selectedLayer.type === "text" ? (
                  <InspectorSection title="Typography">
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={selectedLayer.text ?? ""}
                        onChange={(e) => onUpdateLayer({ text: e.target.value })}
                        className="rounded border bg-background px-2 py-1 text-xs w-full"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-xs text-muted-foreground">Font family</label>
                        <select
                          value={selectedLayer.fontFamily ?? "Inter, system-ui, sans-serif"}
                          onChange={(e) => onUpdateLayer({ fontFamily: e.target.value })}
                          className="rounded border bg-background px-2 py-1 text-xs w-full"
                        >
                          <option value="Inter, system-ui, sans-serif">Inter</option>
                          <option value="Arial, Helvetica, sans-serif">Arial</option>
                          <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica Neue</option>
                          <option value="'Times New Roman', Times, serif">Times New Roman</option>
                          <option value="'Courier New', Courier, monospace">Courier New</option>
                        </select>
                        <label className="text-xs text-muted-foreground">Font size</label>
                        <input
                          type="number"
                          min={8}
                          max={160}
                          value={selectedLayer.fontSize ?? 20}
                          onChange={(e) => onUpdateLayer({ fontSize: Number(e.target.value) || 20 })}
                          className="rounded border bg-background px-2 py-1 text-xs w-full"
                        />
                        <label className="text-xs text-muted-foreground">Line height</label>
                        <input
                          type="number"
                          min={0.8}
                          max={3}
                          step={0.1}
                          value={selectedLayer.lineHeight ?? 1.2}
                          onChange={(e) => onUpdateLayer({ lineHeight: Number(e.target.value) || 1.2 })}
                          className="rounded border bg-background px-2 py-1 text-xs w-full"
                        />
                        <label className="text-xs text-muted-foreground">Letter spacing</label>
                        <input
                          type="number"
                          min={-5}
                          max={20}
                          step={0.5}
                          value={selectedLayer.letterSpacing ?? 0}
                          onChange={(e) => onUpdateLayer({ letterSpacing: Number(e.target.value) || 0 })}
                          className="rounded border bg-background px-2 py-1 text-xs w-full"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateLayer({ textAlign: "left" })}
                          aria-pressed={(selectedLayer.textAlign ?? "left") === "left"}
                          className={`inline-flex h-8 items-center justify-center rounded border ${
                            (selectedLayer.textAlign ?? "left") === "left" ? "bg-muted text-foreground" : "bg-background hover:bg-muted/50"
                          }`}
                        >
                          <AlignLeft
                            className="h-4 w-4"
                            strokeWidth={2.25}
                            style={{ strokeDasharray: "none", strokeDashoffset: 0 }}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateLayer({ textAlign: "center" })}
                          aria-pressed={(selectedLayer.textAlign ?? "left") === "center"}
                          className={`inline-flex h-8 items-center justify-center rounded border ${
                            (selectedLayer.textAlign ?? "left") === "center" ? "bg-muted text-foreground" : "bg-background hover:bg-muted/50"
                          }`}
                        >
                          <AlignCenter
                            className="h-4 w-4"
                            strokeWidth={2.25}
                            style={{ strokeDasharray: "none", strokeDashoffset: 0 }}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateLayer({ textAlign: "right" })}
                          aria-pressed={(selectedLayer.textAlign ?? "left") === "right"}
                          className={`inline-flex h-8 items-center justify-center rounded border ${
                            (selectedLayer.textAlign ?? "left") === "right" ? "bg-muted text-foreground" : "bg-background hover:bg-muted/50"
                          }`}
                        >
                          <AlignRight
                            className="h-4 w-4"
                            strokeWidth={2.25}
                            style={{ strokeDasharray: "none", strokeDashoffset: 0 }}
                          />
                        </button>
                      </div>
                    </div>
                  </InspectorSection>
                ) : null}

                <InspectorSection title="Fill">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-muted-foreground">Color</label>
                    <input
                      type="color"
                      value={selectedLayer.color}
                      onChange={(e) => onUpdateLayer({ color: e.target.value })}
                      className="rounded border bg-background h-8 w-full cursor-pointer"
                    />
                    <label className="text-xs text-muted-foreground">Opacity</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selectedLayer.opacity ?? 100}
                      onChange={(e) => onUpdateLayer({ opacity: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                      className="rounded border bg-background px-2 py-1 text-xs w-full"
                    />
                  </div>
                </InspectorSection>

                <InspectorSection
                  title="Stroke"
                  collapsible
                  collapsed={strokeCollapsed}
                  onToggle={() => setStrokeCollapsed((prev) => !prev)}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-muted-foreground">Enabled</label>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedLayer.strokeEnabled)}
                      onChange={(e) => onUpdateLayer({ strokeEnabled: e.target.checked })}
                    />
                    <label className="text-xs text-muted-foreground">Color</label>
                    <input
                      type="color"
                      value={selectedLayer.strokeColor ?? "#000000"}
                      onChange={(e) => onUpdateLayer({ strokeColor: e.target.value })}
                      className="rounded border bg-background h-8 w-full cursor-pointer"
                    />
                    <label className="text-xs text-muted-foreground">Width</label>
                    <input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      value={selectedLayer.strokeWidth ?? 1}
                      onChange={(e) => onUpdateLayer({ strokeWidth: Math.max(0, Number(e.target.value) || 0) })}
                      className="rounded border bg-background px-2 py-1 text-xs w-full"
                    />
                  </div>
                </InspectorSection>

                <InspectorSection
                  title="Effects"
                  collapsible
                  collapsed={effectsCollapsed}
                  onToggle={() => setEffectsCollapsed((prev) => !prev)}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-muted-foreground">Drop shadow</label>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedLayer.effects?.shadow?.enabled)}
                      onChange={(e) =>
                        onUpdateLayer({
                          effects: {
                            shadow: {
                              enabled: e.target.checked,
                              x: selectedLayer.effects?.shadow?.x ?? 0,
                              y: selectedLayer.effects?.shadow?.y ?? 2,
                              blur: selectedLayer.effects?.shadow?.blur ?? 4,
                              color: selectedLayer.effects?.shadow?.color ?? "#000000",
                              opacity: selectedLayer.effects?.shadow?.opacity ?? 20,
                            },
                          },
                        })
                      }
                    />
                    <label className="text-xs text-muted-foreground">Color</label>
                    <input
                      type="color"
                      value={selectedLayer.effects?.shadow?.color ?? "#000000"}
                      onChange={(e) =>
                        onUpdateLayer({
                          effects: {
                            shadow: {
                              enabled: selectedLayer.effects?.shadow?.enabled ?? false,
                              x: selectedLayer.effects?.shadow?.x ?? 0,
                              y: selectedLayer.effects?.shadow?.y ?? 2,
                              blur: selectedLayer.effects?.shadow?.blur ?? 4,
                              color: e.target.value,
                              opacity: selectedLayer.effects?.shadow?.opacity ?? 20,
                            },
                          },
                        })
                      }
                      className="rounded border bg-background h-8 w-full cursor-pointer"
                    />
                    <label className="text-xs text-muted-foreground">X / Y</label>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="number"
                        value={selectedLayer.effects?.shadow?.x ?? 0}
                        onChange={(e) =>
                          onUpdateLayer({
                            effects: {
                              shadow: {
                                enabled: selectedLayer.effects?.shadow?.enabled ?? false,
                                x: Number(e.target.value) || 0,
                                y: selectedLayer.effects?.shadow?.y ?? 2,
                                blur: selectedLayer.effects?.shadow?.blur ?? 4,
                                color: selectedLayer.effects?.shadow?.color ?? "#000000",
                                opacity: selectedLayer.effects?.shadow?.opacity ?? 20,
                              },
                            },
                          })
                        }
                        className="rounded border bg-background px-2 py-1 text-xs w-full"
                      />
                      <input
                        type="number"
                        value={selectedLayer.effects?.shadow?.y ?? 2}
                        onChange={(e) =>
                          onUpdateLayer({
                            effects: {
                              shadow: {
                                enabled: selectedLayer.effects?.shadow?.enabled ?? false,
                                x: selectedLayer.effects?.shadow?.x ?? 0,
                                y: Number(e.target.value) || 0,
                                blur: selectedLayer.effects?.shadow?.blur ?? 4,
                                color: selectedLayer.effects?.shadow?.color ?? "#000000",
                                opacity: selectedLayer.effects?.shadow?.opacity ?? 20,
                              },
                            },
                          })
                        }
                        className="rounded border bg-background px-2 py-1 text-xs w-full"
                      />
                    </div>
                    <label className="text-xs text-muted-foreground">Blur</label>
                    <input
                      type="number"
                      min={0}
                      value={selectedLayer.effects?.shadow?.blur ?? 4}
                      onChange={(e) =>
                        onUpdateLayer({
                          effects: {
                            shadow: {
                              enabled: selectedLayer.effects?.shadow?.enabled ?? false,
                              x: selectedLayer.effects?.shadow?.x ?? 0,
                              y: selectedLayer.effects?.shadow?.y ?? 2,
                              blur: Math.max(0, Number(e.target.value) || 0),
                              color: selectedLayer.effects?.shadow?.color ?? "#000000",
                              opacity: selectedLayer.effects?.shadow?.opacity ?? 20,
                            },
                          },
                        })
                      }
                      className="rounded border bg-background px-2 py-1 text-xs w-full"
                    />
                    <label className="text-xs text-muted-foreground">Opacity</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selectedLayer.effects?.shadow?.opacity ?? 20}
                      onChange={(e) =>
                        onUpdateLayer({
                          effects: {
                            shadow: {
                              enabled: selectedLayer.effects?.shadow?.enabled ?? false,
                              x: selectedLayer.effects?.shadow?.x ?? 0,
                              y: selectedLayer.effects?.shadow?.y ?? 2,
                              blur: selectedLayer.effects?.shadow?.blur ?? 4,
                              color: selectedLayer.effects?.shadow?.color ?? "#000000",
                              opacity: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                            },
                          },
                        })
                      }
                      className="rounded border bg-background px-2 py-1 text-xs w-full"
                    />
                  </div>
                </InspectorSection>

                {selectedLayer.type === "svg" ? (
                  <InspectorSection title="Asset">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs text-muted-foreground">Image asset</label>
                        <button
                          type="button"
                          onClick={() => void fetchImageAssets()}
                          className="rounded border px-2 py-0.5 text-[11px] hover:bg-muted/50"
                        >
                          Refresh
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-muted-foreground shrink-0">Sort:</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (imageAssetSortOrder === "newest") return
                            setImageAssetSortOrder("newest")
                            setImageAssetPage(0)
                            setImageAssetSearch("")
                            void fetchImageAssets({ page: 0, sortOrder: "newest" })
                          }}
                          aria-pressed={imageAssetSortOrder === "newest"}
                          className={`rounded border px-2 py-0.5 text-[11px] hover:bg-muted/50 ${imageAssetSortOrder === "newest" ? "bg-muted" : ""}`}
                        >
                          Most recent
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (imageAssetSortOrder === "oldest") return
                            setImageAssetSortOrder("oldest")
                            setImageAssetPage(0)
                            setImageAssetSearch("")
                            void fetchImageAssets({ page: 0, sortOrder: "oldest" })
                          }}
                          aria-pressed={imageAssetSortOrder === "oldest"}
                          className={`rounded border px-2 py-0.5 text-[11px] hover:bg-muted/50 ${imageAssetSortOrder === "oldest" ? "bg-muted" : ""}`}
                        >
                          Oldest
                        </button>
                      </div>
                      <input
                        type="search"
                        value={imageAssetSearch}
                        onChange={(event) => setImageAssetSearch(event.target.value)}
                        placeholder="Search assets…"
                        className="w-full rounded border bg-background px-2 py-1 text-xs"
                        aria-label="Search image assets"
                      />
                      {imageAssetsLoading ? (
                        <p className="text-xs text-muted-foreground">Loading assets...</p>
                      ) : filteredImageAssets.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No assets available.</p>
                      ) : (
                        <ul className="max-h-40 overflow-y-auto space-y-1">
                          {filteredImageAssets.map((asset) => {
                            const selected = selectedLayer.assetUrl === asset.fileUrl
                            return (
                              <li
                                key={asset.assetVersionId}
                                className="rounded border bg-muted/20 p-2 flex items-center gap-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium truncate" title={asset.fileName ?? asset.fileUrl}>
                                    {asset.fileName ?? asset.fileUrl}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {asset.mime} · {formatTimestamp(asset.createdAt)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateLayer({
                                      assetUrl: asset.fileUrl,
                                      assetLabel: asset.fileName ?? "Image asset",
                                    })
                                  }
                                  className="shrink-0 rounded border bg-background px-2 py-0.5 text-[11px] hover:bg-muted/50"
                                >
                                  {selected ? "Selected" : "Use"}
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const previousPage = Math.max(0, imageAssetPage - 1)
                            if (previousPage === imageAssetPage) return
                            setImageAssetPage(previousPage)
                            setImageAssetSearch("")
                            void fetchImageAssets({ page: previousPage })
                          }}
                          disabled={imageAssetsLoading || imageAssetPage === 0}
                          className="rounded border px-2 py-0.5 text-[11px] hover:bg-muted/50 aria-disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="text-[11px] text-muted-foreground">Page {imageAssetPage + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!imageAssetHasMore) return
                            const nextPage = imageAssetPage + 1
                            setImageAssetPage(nextPage)
                            setImageAssetSearch("")
                            void fetchImageAssets({ page: nextPage })
                          }}
                          disabled={imageAssetsLoading || !imageAssetHasMore}
                          className="rounded border px-2 py-0.5 text-[11px] hover:bg-muted/50 aria-disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                      {imageAssetsError ? <p className="text-xs text-destructive">{imageAssetsError}</p> : null}
                    </div>
                  </InspectorSection>
                ) : null}

                {selectedGroupId && selectedGroupLayers.length > 1 ? (
                  <InspectorSection title={`Group (${selectedGroupLayers.length})`}>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs text-muted-foreground">Group X</label>
                      <input
                        type="number"
                        value={selectedLayer.x}
                        onChange={(e) => {
                          const nextX = Number(e.target.value)
                          const delta = nextX - selectedLayer.x
                          onUpdateGroup(selectedGroupId, { x: delta })
                        }}
                        className="rounded border bg-background px-2 py-1 text-xs w-full"
                      />
                      <label className="text-xs text-muted-foreground">Group Y</label>
                      <input
                        type="number"
                        value={selectedLayer.y}
                        onChange={(e) => {
                          const nextY = Number(e.target.value)
                          const delta = nextY - selectedLayer.y
                          onUpdateGroup(selectedGroupId, { y: delta })
                        }}
                        className="rounded border bg-background px-2 py-1 text-xs w-full"
                      />
                      <label className="text-xs text-muted-foreground">Group Scale</label>
                      <input
                        type="number"
                        step={0.1}
                        min={0.1}
                        defaultValue={1}
                        onChange={(e) => onUpdateGroup(selectedGroupId, { scale: Number(e.target.value) })}
                        className="rounded border bg-background px-2 py-1 text-xs w-full"
                      />
                    </div>
                  </InspectorSection>
                ) : null}
              </>
            )}

            <InspectorSection title="Placement guides">
              <div className="space-y-2">
                <label className="flex items-center justify-between gap-2 text-xs">
                  <span>Show print-safe guides</span>
                  <input
                    type="checkbox"
                    checked={doc.guideSettings.showGuides}
                    onChange={(e) => onUpdateGuideSettings({ showGuides: e.target.checked })}
                  />
                </label>
                <label className="flex items-center justify-between gap-2 text-xs">
                  <span>Snap to guides</span>
                  <input
                    type="checkbox"
                    checked={doc.guideSettings.snapToGuides}
                    onChange={(e) => onUpdateGuideSettings({ snapToGuides: e.target.checked })}
                  />
                </label>
                <label className="flex items-center justify-between gap-2 text-xs">
                  <span>Constrain to print-safe box</span>
                  <input
                    type="checkbox"
                    checked={doc.guideSettings.constrainToPrintSafe}
                    onChange={(e) => onUpdateGuideSettings({ constrainToPrintSafe: e.target.checked })}
                  />
                </label>
              </div>
            </InspectorSection>
          </>
        )}
        {panelTab === "history" && (
          <div className="rounded-lg border bg-card">
          <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </div>
          <div className="p-3 flex items-center gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="rounded border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/50 aria-disabled:opacity-50"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="rounded border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/50 aria-disabled:opacity-50"
            >
              Redo
            </button>
            <span className="text-[11px] text-muted-foreground ml-1">⌘Z / ⇧⌘Z</span>
          </div>
        </div>
        )}
        {panelTab === "history" && studioEntryId ? (
          <>
            <CollaborationApprovalBlock
              studioEntryId={studioEntryId}
              canRequestApproval={canRequestApproval}
              canDecideApproval={canDecideApproval}
            />
            <DesignVersionsBlock
              studioEntryId={studioEntryId}
              getSnapshot={getSnapshot}
              onRestoreSnapshot={onRestoreSnapshot}
            />
          </>
        ) : panelTab === "history" ? (
          <div className="rounded-lg border bg-card">
            <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
              <GitBranch className="h-3.5 w-3.5" />
              Version
            </div>
            <div className="p-3 text-sm text-muted-foreground">
              Open this editor from a Studio entry to enable cloud saves, version history, and collaboration approval.
            </div>
          </div>
        ) : null}
      </div>
      {pendingProductTypeCode ? (
        <div className="absolute inset-0 z-20 flex items-start justify-center bg-background/60 p-3 pt-20">
          <div className="w-full rounded-lg border bg-card p-3 shadow-lg">
            <p className="text-xs font-medium text-foreground">Change product type?</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Changing from {activeProductLabel} to {pendingProductLabel ?? pendingProductTypeCode} may drop
              incompatible attributes and side-specific design data.
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">Choose how to proceed:</p>
            <div className="mt-2 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  onChangeProductType(pendingProductTypeCode, "new-design")
                  setPendingProductTypeCode(null)
                }}
                className="w-full rounded border bg-background px-2 py-1.5 text-left text-[11px] hover:bg-muted/50"
              >
                Start a new design for this product
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeProductType(pendingProductTypeCode, "change-in-place")
                  setPendingProductTypeCode(null)
                }}
                className="w-full rounded border bg-background px-2 py-1.5 text-left text-[11px] hover:bg-muted/50"
              >
                Keep design and remove incompatible parts
              </button>
              <button
                type="button"
                onClick={() => setPendingProductTypeCode(null)}
                className="w-full rounded border bg-background px-2 py-1.5 text-left text-[11px] hover:bg-muted/50"
              >
                Cancel and keep current product
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}

// ─── Main 3-panel shell with editor state and undo/redo ───────────────────

const initialDoc: DesignDoc = {
  schemaVersion: "1.0",
  title: "untitled",
  side: "front",
  layersBySide: {
    front: [],
    back: [],
  },
  garment: {
    ...getDefaultGarmentLinePalette("#d9d9d9"),
    productTypeCode: DEFAULT_GARMENT_CODE,
    fillColor: "#d9d9d9",
    showFill: true,
    showStitching: true,
    showSeams: true,
    showOutline: true,
    baseLayerVisibilityBySide: {
      front: getDefaultBaseLayerVisibility(),
      back: getDefaultBaseLayerVisibility(),
    },
    autoStitchShade: true,
  },
  guideSettings: {
    showGuides: true,
    constrainToPrintSafe: false,
    snapToGuides: false,
  },
}

function serializeDoc(doc: DesignDoc): Record<string, unknown> {
  const serializedLayersBySide = Object.fromEntries(
    Object.entries(doc.layersBySide).map(([side, sideLayers]) => [
      side,
      sideLayers.map((l) => ({
        id: l.id,
        type: l.type,
        visible: l.visible,
        groupId: l.groupId,
        x: l.x,
        y: l.y,
        scale: l.scale,
        rotation: l.rotation,
        opacity: l.opacity,
        color: l.color,
        boxWidth: l.boxWidth,
        boxHeight: l.boxHeight,
        strokeEnabled: l.strokeEnabled,
        strokeColor: l.strokeColor,
        strokeWidth: l.strokeWidth,
        effects: l.effects,
        text: l.text,
        fontFamily: l.fontFamily,
        fontSize: l.fontSize,
        textAlign: l.textAlign,
        verticalAlign: l.verticalAlign,
        lineHeight: l.lineHeight,
        letterSpacing: l.letterSpacing,
        allCaps: l.allCaps,
        underline: l.underline,
        strikethrough: l.strikethrough,
        textPathType: l.textPathType,
        textPathBend: l.textPathBend,
        textPathOffset: l.textPathOffset,
        textBoxWidth: l.textBoxWidth,
        textBoxHeight: l.textBoxHeight,
        assetUrl: l.assetUrl,
        assetLabel: l.assetLabel,
      })),
    ]),
  )
  const frontLayers = (serializedLayersBySide.front as Record<string, unknown>[] | undefined) ?? []
  const backLayers = (serializedLayersBySide.back as Record<string, unknown>[] | undefined) ?? []
  return {
    schemaVersion: "1.0",
    title: doc.title,
    side: doc.side,
    layersBySide: serializedLayersBySide,
    frontLayers,
    backLayers,
    garment: doc.garment,
    guideSettings: doc.guideSettings,
  }
}

function parseDesignDocSnapshot(snapshot: Record<string, unknown>): DesignDoc | null {
  const parseLayers = (raw: unknown): DesignLayer[] => {
    if (!Array.isArray(raw)) return []
    return raw
      .filter((layer): layer is Record<string, unknown> => typeof layer === "object" && layer !== null)
      .map((layer) => ({
        id: typeof layer.id === "string" ? layer.id : crypto.randomUUID(),
        type: layer.type === "svg" ? "svg" : "text",
        visible: typeof layer.visible === "boolean" ? layer.visible : true,
        groupId: typeof layer.groupId === "string" ? layer.groupId : undefined,
        x: Number.isFinite(Number(layer.x)) ? Number(layer.x) : 50,
        y: Number.isFinite(Number(layer.y)) ? Number(layer.y) : 50,
        scale: Number.isFinite(Number(layer.scale)) ? Number(layer.scale) : 1,
        rotation: Number.isFinite(Number(layer.rotation)) ? Number(layer.rotation) : 0,
        opacity: Number.isFinite(Number(layer.opacity)) ? Math.max(0, Math.min(100, Number(layer.opacity))) : 100,
        color: typeof layer.color === "string" ? layer.color : "#000000",
        boxWidth: Number.isFinite(Number(layer.boxWidth)) ? Number(layer.boxWidth) : undefined,
        boxHeight: Number.isFinite(Number(layer.boxHeight)) ? Number(layer.boxHeight) : undefined,
        strokeEnabled: typeof layer.strokeEnabled === "boolean" ? layer.strokeEnabled : false,
        strokeColor: typeof layer.strokeColor === "string" ? layer.strokeColor : "#000000",
        strokeWidth: Number.isFinite(Number(layer.strokeWidth)) ? Number(layer.strokeWidth) : 1,
        effects:
          layer.effects && typeof layer.effects === "object" && !Array.isArray(layer.effects)
            ? {
                shadow:
                  (layer.effects as Record<string, unknown>).shadow &&
                  typeof (layer.effects as Record<string, unknown>).shadow === "object" &&
                  !Array.isArray((layer.effects as Record<string, unknown>).shadow)
                    ? {
                        enabled:
                          typeof ((layer.effects as Record<string, unknown>).shadow as Record<string, unknown>).enabled === "boolean"
                            ? (((layer.effects as Record<string, unknown>).shadow as Record<string, unknown>).enabled as boolean)
                            : false,
                        x: Number.isFinite(Number(((layer.effects as Record<string, unknown>).shadow as Record<string, unknown>).x))
                          ? Number(((layer.effects as Record<string, unknown>).shadow as Record<string, unknown>).x)
                          : 0,
                        y: Number.isFinite(Number(((layer.effects as Record<string, unknown>).shadow as Record<string, unknown>).y))
                          ? Number(((layer.effects as Record<string, unknown>).shadow as Record<string, unknown>).y)
                          : 2,
                        blur: Number.isFinite(Number(((layer.effects as Record<string, unknown>).shadow as Record<string, unknown>).blur))
                          ? Number(((layer.effects as Record<string, unknown>).shadow as Record<string, unknown>).blur)
                          : 4,
                        color:
                          typeof ((layer.effects as Record<string, unknown>).shadow as Record<string, unknown>).color === "string"
                            ? (((layer.effects as Record<string, unknown>).shadow as Record<string, unknown>).color as string)
                            : "#000000",
                        opacity: Number.isFinite(Number(((layer.effects as Record<string, unknown>).shadow as Record<string, unknown>).opacity))
                          ? Math.max(
                              0,
                              Math.min(100, Number(((layer.effects as Record<string, unknown>).shadow as Record<string, unknown>).opacity)),
                            )
                          : 20,
                      }
                    : { enabled: false, x: 0, y: 2, blur: 4, color: "#000000", opacity: 20 },
              }
            : { shadow: { enabled: false, x: 0, y: 2, blur: 4, color: "#000000", opacity: 20 } },
        text: typeof layer.text === "string" ? layer.text : undefined,
        fontFamily: typeof layer.fontFamily === "string" ? layer.fontFamily : undefined,
        fontSize: Number.isFinite(Number(layer.fontSize)) ? Number(layer.fontSize) : undefined,
        textAlign:
          layer.textAlign === "center" || layer.textAlign === "right" || layer.textAlign === "left"
            ? layer.textAlign
            : undefined,
        verticalAlign:
          layer.verticalAlign === "middle" || layer.verticalAlign === "bottom" || layer.verticalAlign === "top"
            ? layer.verticalAlign
            : undefined,
        lineHeight: Number.isFinite(Number(layer.lineHeight)) ? Number(layer.lineHeight) : undefined,
        letterSpacing: Number.isFinite(Number(layer.letterSpacing)) ? Number(layer.letterSpacing) : undefined,
        allCaps: typeof layer.allCaps === "boolean" ? layer.allCaps : undefined,
        underline: typeof layer.underline === "boolean" ? layer.underline : undefined,
        strikethrough: typeof layer.strikethrough === "boolean" ? layer.strikethrough : undefined,
        textPathType:
          layer.textPathType === "arc_up" ||
          layer.textPathType === "arc_down" ||
          layer.textPathType === "circle" ||
          layer.textPathType === "none"
            ? layer.textPathType
            : undefined,
        textPathBend: Number.isFinite(Number(layer.textPathBend)) ? Number(layer.textPathBend) : undefined,
        textPathOffset: Number.isFinite(Number(layer.textPathOffset)) ? Number(layer.textPathOffset) : undefined,
        textBoxWidth: Number.isFinite(Number(layer.textBoxWidth)) ? Number(layer.textBoxWidth) : undefined,
        textBoxHeight: Number.isFinite(Number(layer.textBoxHeight)) ? Number(layer.textBoxHeight) : undefined,
        assetUrl: typeof layer.assetUrl === "string" ? layer.assetUrl : undefined,
        assetLabel: typeof layer.assetLabel === "string" ? layer.assetLabel : undefined,
      }))
  }

  const sideRaw = snapshot.side
  const side = typeof sideRaw === "string" && sideRaw.trim() ? sideRaw : "front"
  const schemaVersionRaw = snapshot.schemaVersion
  const schemaVersion: "1.0" = schemaVersionRaw === "1.0" ? "1.0" : "1.0"
  const rawGuideSettings =
    typeof snapshot.guideSettings === "object" && snapshot.guideSettings !== null
      ? (snapshot.guideSettings as Record<string, unknown>)
      : {}
  const rawGarment =
    typeof snapshot.garment === "object" && snapshot.garment !== null
      ? (snapshot.garment as Record<string, unknown>)
      : {}
  const fillColor = typeof rawGarment.fillColor === "string" ? rawGarment.fillColor : "#d9d9d9"
  const autoStitchShade =
    typeof rawGarment.autoStitchShade === "boolean" ? rawGarment.autoStitchShade : true
  const defaultPalette = getDefaultGarmentLinePalette(fillColor)
  const stitchColor =
    typeof rawGarment.stitchColor === "string"
      ? rawGarment.stitchColor
      : defaultPalette.stitchColor
  const seamColor =
    typeof rawGarment.seamColor === "string"
      ? rawGarment.seamColor
      : defaultPalette.seamColor
  const outlineColor =
    typeof rawGarment.outlineColor === "string"
      ? rawGarment.outlineColor
      : defaultPalette.outlineColor
  const defaultBaseVisibility: BaseLayerVisibility = {
    showFill: typeof rawGarment.showFill === "boolean" ? rawGarment.showFill : true,
    showStitching: typeof rawGarment.showStitching === "boolean" ? rawGarment.showStitching : true,
    showSeams: typeof rawGarment.showSeams === "boolean" ? rawGarment.showSeams : true,
    showOutline: typeof rawGarment.showOutline === "boolean" ? rawGarment.showOutline : true,
  }
  const rawLayersBySide =
    typeof snapshot.layersBySide === "object" && snapshot.layersBySide !== null
      ? (snapshot.layersBySide as Record<string, unknown>)
      : null
  const layersBySide: Record<string, DesignLayer[]> = {}
  if (rawLayersBySide) {
    for (const [sideKey, rawLayers] of Object.entries(rawLayersBySide)) {
      layersBySide[sideKey] = parseLayers(rawLayers)
    }
  }
  if (!("front" in layersBySide)) {
    layersBySide.front = parseLayers(snapshot.frontLayers)
  }
  if (!("back" in layersBySide)) {
    layersBySide.back = parseLayers(snapshot.backLayers)
  }
  const rawBaseLayerVisibilityBySide =
    typeof rawGarment.baseLayerVisibilityBySide === "object" && rawGarment.baseLayerVisibilityBySide !== null
      ? (rawGarment.baseLayerVisibilityBySide as Record<string, unknown>)
      : {}
  const baseLayerVisibilityBySide: Record<string, BaseLayerVisibility> = {}
  for (const [sideCode, rawVisibility] of Object.entries(rawBaseLayerVisibilityBySide)) {
    if (!rawVisibility || typeof rawVisibility !== "object" || Array.isArray(rawVisibility)) continue
    const row = rawVisibility as Record<string, unknown>
    baseLayerVisibilityBySide[sideCode] = {
      showFill: typeof row.showFill === "boolean" ? row.showFill : defaultBaseVisibility.showFill,
      showStitching: typeof row.showStitching === "boolean" ? row.showStitching : defaultBaseVisibility.showStitching,
      showSeams: typeof row.showSeams === "boolean" ? row.showSeams : defaultBaseVisibility.showSeams,
      showOutline: typeof row.showOutline === "boolean" ? row.showOutline : defaultBaseVisibility.showOutline,
    }
  }
  const visibilitySides = new Set<string>(["front", "back", side, ...Object.keys(layersBySide)])
  for (const sideCode of visibilitySides) {
    if (!baseLayerVisibilityBySide[sideCode]) {
      baseLayerVisibilityBySide[sideCode] = { ...defaultBaseVisibility }
    }
  }

  return {
    schemaVersion,
    title: typeof snapshot.title === "string" && snapshot.title.trim() ? snapshot.title : "untitled",
    side,
    layersBySide,
    garment: {
      productTypeCode:
        typeof rawGarment.productTypeCode === "string" && rawGarment.productTypeCode.trim()
          ? rawGarment.productTypeCode
          : DEFAULT_GARMENT_CODE,
      fillColor,
      stitchColor,
      seamColor,
      outlineColor,
      showFill: defaultBaseVisibility.showFill,
      showStitching: defaultBaseVisibility.showStitching,
      showSeams: defaultBaseVisibility.showSeams,
      showOutline: defaultBaseVisibility.showOutline,
      baseLayerVisibilityBySide,
      autoStitchShade,
    },
    guideSettings: {
      showGuides:
        typeof rawGuideSettings.showGuides === "boolean"
          ? rawGuideSettings.showGuides
          : true,
      constrainToPrintSafe:
        typeof rawGuideSettings.constrainToPrintSafe === "boolean"
          ? rawGuideSettings.constrainToPrintSafe
          : false,
      snapToGuides:
        typeof rawGuideSettings.snapToGuides === "boolean"
          ? rawGuideSettings.snapToGuides
          : false,
    },
  }
}

type DesignEditorClientProps = {
  studioEntryId?: string
  renderEnabled?: boolean
  canRequestApproval?: boolean
  canDecideApproval?: boolean
  productTypeOptions?: Array<{ code: string; label: string; sides?: string[] }>
  initialSnapshot?: Record<string, unknown>
  initialVersionId?: string
  conceptColorDirection?: string[]
  suggestedColors?: EntryColorSuggestion[]
}

export function DesignEditorClient({
  studioEntryId,
  renderEnabled = true,
  canRequestApproval = false,
  canDecideApproval = false,
  productTypeOptions: productTypeOptionsProp,
  initialSnapshot,
  initialVersionId,
  conceptColorDirection = [],
  suggestedColors = [],
}: DesignEditorClientProps) {
  const productTypeOptions = useMemo<GarmentPreset[]>(() => {
    if (!Array.isArray(productTypeOptionsProp) || productTypeOptionsProp.length === 0) {
      return GARMENT_PRESETS
    }
    const normalized = productTypeOptionsProp
      .filter((option): option is { code: string; label: string; sides?: string[] } =>
        Boolean(option && typeof option.code === "string" && option.code.trim() && typeof option.label === "string"),
      )
      .map((option) => ({
        code: option.code,
        label: option.label,
        sides:
          Array.isArray(option.sides) && option.sides.every((side) => typeof side === "string" && side.trim())
            ? option.sides
            : ["front", "back"],
      }))
    return normalized.length > 0 ? normalized : GARMENT_PRESETS
  }, [productTypeOptionsProp])

  const initialDocFromProps = useMemo(() => {
    const parsed = initialSnapshot ? parseDesignDocSnapshot(initialSnapshot) : null
    return parsed ?? { ...initialDoc }
  }, [initialSnapshot])
  const [doc, setDoc] = useState<DesignDoc>(() => initialDocFromProps)
  const [canvasSides, setCanvasSides] = useState<DesignSide[]>(["front", "back"])
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([])
  const [past, setPast] = useState<DesignDoc[]>([])
  const [future, setFuture] = useState<DesignDoc[]>([])
  const [sharedComponents, setSharedComponents] = useState<SharedDesignComponent[]>([])
  const [panelTab, setPanelTab] = useState<"garment" | "design" | "renderings" | "history">("design")
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null)
  const [lastSavedVersionId, setLastSavedVersionId] = useState<string | null>(initialVersionId ?? null)
  const [savingGarment, setSavingGarment] = useState(false)

  useEffect(() => {
    const parsed = initialSnapshot ? parseDesignDocSnapshot(initialSnapshot) : null
    if (!parsed) return
    setDoc(parsed)
    setSelectedLayerId(null)
    setSelectedLayerIds([])
    setPast([])
    setFuture([])
    setLastSavedSnapshot(JSON.stringify(serializeDoc(parsed)))
    setLastSavedVersionId(initialVersionId ?? null)
  }, [initialSnapshot, initialVersionId])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SHARED_COMPONENTS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return
      const normalized: SharedDesignComponent[] = parsed
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item) => ({
          id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
          name: typeof item.name === "string" ? item.name : "Shared component",
          side: item.side === "back" ? ("back" as const) : ("front" as const),
          createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
          layers: Array.isArray(item.layers)
            ? item.layers
                .filter((layer): layer is Record<string, unknown> => typeof layer === "object" && layer !== null)
                .map((layer): DesignLayer => ({
                  id: typeof layer.id === "string" ? layer.id : crypto.randomUUID(),
                  type: layer.type === "svg" ? "svg" : "text",
                  visible: typeof layer.visible === "boolean" ? layer.visible : true,
                  groupId: typeof layer.groupId === "string" ? layer.groupId : undefined,
                  x: Number.isFinite(Number(layer.x)) ? Number(layer.x) : 50,
                  y: Number.isFinite(Number(layer.y)) ? Number(layer.y) : 50,
                  scale: Number.isFinite(Number(layer.scale)) ? Number(layer.scale) : 1,
                  rotation: Number.isFinite(Number(layer.rotation)) ? Number(layer.rotation) : 0,
                  opacity: Number.isFinite(Number(layer.opacity)) ? Math.max(0, Math.min(100, Number(layer.opacity))) : 100,
                  color: typeof layer.color === "string" ? layer.color : "#000000",
                  boxWidth: Number.isFinite(Number(layer.boxWidth)) ? Number(layer.boxWidth) : undefined,
                  boxHeight: Number.isFinite(Number(layer.boxHeight)) ? Number(layer.boxHeight) : undefined,
                  strokeEnabled: typeof layer.strokeEnabled === "boolean" ? layer.strokeEnabled : false,
                  strokeColor: typeof layer.strokeColor === "string" ? layer.strokeColor : "#000000",
                  strokeWidth: Number.isFinite(Number(layer.strokeWidth)) ? Number(layer.strokeWidth) : 1,
                  effects:
                    layer.effects && typeof layer.effects === "object" && !Array.isArray(layer.effects)
                      ? (layer.effects as DesignLayer["effects"])
                      : { shadow: { enabled: false, x: 0, y: 2, blur: 4, color: "#000000", opacity: 20 } },
                  text: typeof layer.text === "string" ? layer.text : undefined,
                  fontFamily: typeof layer.fontFamily === "string" ? layer.fontFamily : undefined,
                  fontSize: Number.isFinite(Number(layer.fontSize)) ? Number(layer.fontSize) : undefined,
                  textAlign:
                    layer.textAlign === "center" || layer.textAlign === "right" || layer.textAlign === "left"
                      ? layer.textAlign
                      : undefined,
                  verticalAlign:
                    layer.verticalAlign === "middle" || layer.verticalAlign === "bottom" || layer.verticalAlign === "top"
                      ? layer.verticalAlign
                      : undefined,
                  lineHeight: Number.isFinite(Number(layer.lineHeight)) ? Number(layer.lineHeight) : undefined,
                  letterSpacing: Number.isFinite(Number(layer.letterSpacing)) ? Number(layer.letterSpacing) : undefined,
                  allCaps: typeof layer.allCaps === "boolean" ? layer.allCaps : undefined,
                  underline: typeof layer.underline === "boolean" ? layer.underline : undefined,
                  strikethrough: typeof layer.strikethrough === "boolean" ? layer.strikethrough : undefined,
                  textPathType:
                    layer.textPathType === "arc_up" ||
                    layer.textPathType === "arc_down" ||
                    layer.textPathType === "circle" ||
                    layer.textPathType === "none"
                      ? layer.textPathType
                      : undefined,
                  textPathBend: Number.isFinite(Number(layer.textPathBend)) ? Number(layer.textPathBend) : undefined,
                  textPathOffset: Number.isFinite(Number(layer.textPathOffset)) ? Number(layer.textPathOffset) : undefined,
                  textBoxWidth: Number.isFinite(Number(layer.textBoxWidth)) ? Number(layer.textBoxWidth) : undefined,
                  textBoxHeight: Number.isFinite(Number(layer.textBoxHeight)) ? Number(layer.textBoxHeight) : undefined,
                  assetUrl: typeof layer.assetUrl === "string" ? layer.assetUrl : undefined,
                  assetLabel: typeof layer.assetLabel === "string" ? layer.assetLabel : undefined,
              }))
            : [],
        }))
      setSharedComponents(normalized.slice(-40))
    } catch {
      // Ignore invalid local cache and continue.
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(
      SHARED_COMPONENTS_STORAGE_KEY,
      JSON.stringify(sharedComponents.slice(-40)),
    )
  }, [sharedComponents])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CANVAS_VIEW_MODE_STORAGE_KEY)
      if (raw === "front") setCanvasSides(["front"])
      else if (raw === "back") setCanvasSides(["back"])
      else if (raw === "split") setCanvasSides(["front", "back"])
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      const hasFront = canvasSides.includes("front")
      const hasBack = canvasSides.includes("back")
      const mode: CanvasViewMode = hasFront && hasBack ? "split" : hasBack ? "back" : "front"
      window.localStorage.setItem(CANVAS_VIEW_MODE_STORAGE_KEY, mode)
    } catch {
      // ignore
    }
  }, [canvasSides])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROPERTIES_TAB_STORAGE_KEY)
      if (raw === "garment" || raw === "design" || raw === "renderings" || raw === "history") {
        setPanelTab(raw)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(PROPERTIES_TAB_STORAGE_KEY, panelTab)
    } catch {
      // ignore
    }
  }, [panelTab])

  const pushHistory = useCallback((current: DesignDoc) => {
    setPast((prev) => {
      const next = [...prev, JSON.parse(JSON.stringify(current))]
      return next.length > HISTORY_LIMIT ? next.slice(-HISTORY_LIMIT) : next
    })
    setFuture([])
  }, [])

  const undo = useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev
      const next = [...prev]
      const previous = next.pop()!
      setDoc(JSON.parse(JSON.stringify(previous)))
      setFuture((f) => [JSON.parse(JSON.stringify(doc)), ...f])
      return next
    })
  }, [doc])

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev
      const [nextState, ...rest] = prev
      setDoc(JSON.parse(JSON.stringify(nextState)))
      setPast((p) => [...p, JSON.parse(JSON.stringify(doc))])
      return rest
    })
  }, [doc])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault()
        if (e.shiftKey) {
          if (future.length > 0) redo()
        } else {
          if (past.length > 0) undo()
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [past.length, future.length, undo, redo])

  const canUndo = past.length > 0
  const canRedo = future.length > 0

  const onSideChange = useCallback((side: DesignSide) => {
    setDoc((d) => (d.side === side ? d : { ...d, side }))
  }, [])

  const onSelectCanvasSide = useCallback(
    (side: DesignSide) => {
      onSideChange(side)
      setCanvasSides([side])
    },
    [onSideChange],
  )

  const onToggleCanvasSide = useCallback((side: DesignSide) => {
    onSideChange(side)
    setCanvasSides((prev) => {
      const has = prev.includes(side)
      const next = has ? prev.filter((item) => item !== side) : [...prev, side]
      if (next.length === 0) {
        return prev
      }
      setDoc((d) => {
        return next.includes(d.side as DesignSide) ? d : { ...d, side: next[0]! }
      })
      return next
    })
  }, [onSideChange])

  const onAddTextLayer = useCallback(() => {
    let newLayer = createLayer({
      type: "text",
      x: CANVAS_SIZE / 2 - 36,
      y: CANVAS_SIZE / 2 - 12,
      fontSize: 24,
      fontFamily: "Inter, system-ui, sans-serif",
    })
    if (doc.guideSettings.snapToGuides) {
      newLayer = snapLayerToGuides(newLayer)
    }
    if (doc.guideSettings.constrainToPrintSafe) {
      newLayer = clampToPrintSafe(newLayer)
    }
    pushHistory(doc)
    setDoc((d) => {
      const layers = getLayersForSide(d)
      return setLayersForSide(d, [...layers, newLayer])
    })
    setSelectedLayerId(newLayer.id)
  }, [doc, pushHistory])

  const onAddSvgLayer = useCallback(() => {
    let newLayer = createLayer({
      type: "svg",
      color: "#111111",
      assetLabel: "Select an asset",
    })
    if (doc.guideSettings.snapToGuides) {
      newLayer = snapLayerToGuides(newLayer)
    }
    if (doc.guideSettings.constrainToPrintSafe) {
      newLayer = clampToPrintSafe(newLayer)
    }
    pushHistory(doc)
    setDoc((d) => {
      const layers = getLayersForSide(d)
      return setLayersForSide(d, [...layers, newLayer])
    })
    setSelectedLayerId(newLayer.id)
  }, [doc, pushHistory])

  const onSelectLayer = useCallback((id: string | null) => {
    setSelectedLayerId(id)
    setSelectedLayerIds(id ? [id] : [])
    if (id) setPanelTab("design")
  }, [])

  const onSetSelection = useCallback((ids: string[], primaryId?: string | null) => {
    const unique = Array.from(new Set(ids.filter(Boolean)))
    setSelectedLayerIds(unique)
    if (typeof primaryId === "string" && primaryId.length > 0) {
      setSelectedLayerId(primaryId)
      setPanelTab("design")
      return
    }
    setSelectedLayerId(unique[0] ?? null)
    if (unique.length > 0) setPanelTab("design")
  }, [])

  const onBeginTransformGesture = useCallback(() => {
    pushHistory(doc)
  }, [doc, pushHistory])

  const getTransformTargetIds = useCallback(
    (side: DesignSide, anchorLayerId: string): string[] => {
      const sideLayers = getLayersForProductSide(doc, side)
      const selectedSet = new Set(selectedLayerIds)
      if (selectedSet.has(anchorLayerId) && selectedSet.size > 0) {
        return Array.from(selectedSet)
      }
      const anchor = sideLayers.find((layer) => layer.id === anchorLayerId)
      if (anchor?.groupId) {
        return sideLayers.filter((layer) => layer.groupId === anchor.groupId).map((layer) => layer.id)
      }
      return [anchorLayerId]
    },
    [doc, selectedLayerIds],
  )

  const onTranslateSelection = useCallback(
    (side: DesignSide, anchorLayerId: string, dx: number, dy: number) => {
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return
      if (dx === 0 && dy === 0) return
      const targetIds = getTransformTargetIds(side, anchorLayerId)
      if (targetIds.length === 0) return
      const targetSet = new Set(targetIds)
      setDoc((d) => {
        const layers = getLayersForProductSide(d, side)
        const next = layers.map((layer) => {
          if (!targetSet.has(layer.id)) return layer
          let updated: DesignLayer = {
            ...layer,
            x: layer.x + dx,
            y: layer.y + dy,
          }
          if (d.guideSettings.snapToGuides) {
            updated = snapLayerToGuides(updated)
          }
          if (d.guideSettings.constrainToPrintSafe) {
            updated = clampToPrintSafe(updated)
          }
          return updated
        })
        return setLayersForProductSide(d, side, next)
      })
      onSetSelection(targetIds, anchorLayerId)
    },
    [getTransformTargetIds, onSetSelection],
  )

  const onScaleSelection = useCallback(
    (side: DesignSide, anchorLayerId: string, factor: number) => {
      if (!Number.isFinite(factor) || factor <= 0) return
      const targetIds = getTransformTargetIds(side, anchorLayerId)
      if (targetIds.length === 0) return
      const targetSet = new Set(targetIds)
      setDoc((d) => {
        const layers = getLayersForProductSide(d, side)
        const next = layers.map((layer) => {
          if (!targetSet.has(layer.id)) return layer
          let updated: DesignLayer = {
            ...layer,
            scale: Math.max(0.1, Math.min(8, layer.scale * factor)),
          }
          if (d.guideSettings.constrainToPrintSafe) {
            updated = clampToPrintSafe(updated)
          }
          return updated
        })
        return setLayersForProductSide(d, side, next)
      })
      onSetSelection(targetIds, anchorLayerId)
    },
    [getTransformTargetIds, onSetSelection],
  )

  const onToggleLayerInSelection = useCallback((id: string) => {
    setSelectedLayerIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((item) => item !== id)
        setSelectedLayerId(next[0] ?? null)
        return next
      }
      const next = [...prev, id]
      setSelectedLayerId(id)
      setPanelTab("design")
      return next
    })
  }, [])

  const onDeleteLayer = useCallback(
    (id: string) => {
      if (!id) return
      pushHistory(doc)
      setDoc((d) => {
        const layers = getLayersForSide(d)
        const next = layers.filter((layer) => layer.id !== id)
        return setLayersForSide(d, next)
      })
      setSelectedLayerIds((prev) => prev.filter((item) => item !== id))
      setSelectedLayerId((prev) => (prev === id ? null : prev))
    },
    [doc, pushHistory],
  )

  const onDeleteSelectedLayers = useCallback(() => {
    if (selectedLayerIds.length === 0) return
    pushHistory(doc)
    const selectedSet = new Set(selectedLayerIds)
    setDoc((d) => {
      const layers = getLayersForSide(d)
      const next = layers.filter((layer) => !selectedSet.has(layer.id))
      return setLayersForSide(d, next)
    })
    setSelectedLayerIds([])
    setSelectedLayerId(null)
  }, [doc, pushHistory, selectedLayerIds])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return
      if (selectedLayerIds.length === 0) return
      const active = document.activeElement
      const tagName = active?.tagName?.toLowerCase()
      const isTextInput =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        (active instanceof HTMLElement && active.isContentEditable)
      if (isTextInput) return
      event.preventDefault()
      const shouldDelete = window.confirm(
        `Delete ${selectedLayerIds.length} selected layer${selectedLayerIds.length === 1 ? "" : "s"}?`,
      )
      if (!shouldDelete) return
      onDeleteSelectedLayers()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onDeleteSelectedLayers, selectedLayerIds.length])

  const onUpdateLayer = useCallback(
    (updates: Partial<DesignLayer>) => {
      if (!selectedLayerId) return
      pushHistory(doc)
      setDoc((d) => {
        const layers = getLayersForSide(d)
        const idx = layers.findIndex((l) => l.id === selectedLayerId)
        if (idx === -1) return d
        const next = [...layers]
        let nextLayer = { ...next[idx], ...updates }
        if (d.guideSettings.snapToGuides && ("x" in updates || "y" in updates)) {
          nextLayer = snapLayerToGuides(nextLayer)
        }
        if (d.guideSettings.constrainToPrintSafe && ("x" in updates || "y" in updates || "scale" in updates)) {
          nextLayer = clampToPrintSafe(nextLayer)
        }
        next[idx] = nextLayer
        return setLayersForSide(d, next)
      })
    },
    [doc, selectedLayerId, pushHistory],
  )

  const onUpdateLayerById = useCallback(
    (sideCode: string, layerId: string, updates: Partial<DesignLayer>) => {
      pushHistory(doc)
      setDoc((d) => {
        const sideLayers = getLayersForProductSide(d, sideCode)
        const idx = sideLayers.findIndex((layer) => layer.id === layerId)
        if (idx === -1) return d
        const next = [...sideLayers]
        next[idx] = { ...next[idx], ...updates }
        return {
          ...d,
          layersBySide: {
            ...d.layersBySide,
            [sideCode]: next,
          },
        }
      })
    },
    [doc, pushHistory],
  )

  const onUpdateGuideSettings = useCallback(
    (updates: Partial<DesignDoc["guideSettings"]>) => {
      pushHistory(doc)
      setDoc((d) => ({
        ...d,
        guideSettings: {
          ...d.guideSettings,
          ...updates,
        },
      }))
    },
    [doc, pushHistory],
  )

  const onUpdateGarment = useCallback(
    (updates: Partial<DesignDoc["garment"]>) => {
      pushHistory(doc)
      setDoc((d) => {
        const nextProductTypeCode =
          typeof updates.productTypeCode === "string" && updates.productTypeCode.trim()
            ? updates.productTypeCode
            : d.garment.productTypeCode
        const nextSides = getProductSides(nextProductTypeCode, productTypeOptions)
        const nextGarment = {
          ...d.garment,
          ...updates,
        }
        if (typeof updates.fillColor === "string" && (updates.autoStitchShade ?? d.garment.autoStitchShade)) {
          const palette = getDefaultGarmentLinePalette(updates.fillColor)
          nextGarment.stitchColor = palette.stitchColor
          nextGarment.seamColor = palette.seamColor
          nextGarment.outlineColor = palette.outlineColor
        }
        if (updates.autoStitchShade === true) {
          const palette = getDefaultGarmentLinePalette(nextGarment.fillColor)
          nextGarment.stitchColor = palette.stitchColor
          nextGarment.seamColor = palette.seamColor
          nextGarment.outlineColor = palette.outlineColor
        }
        const fallbackBaseVisibility: BaseLayerVisibility = {
          showFill: nextGarment.showFill,
          showStitching: nextGarment.showStitching,
          showSeams: nextGarment.showSeams,
          showOutline: nextGarment.showOutline,
        }
        const normalizedLayersBySide = { ...d.layersBySide }
        for (const sideCode of nextSides) {
          if (!Array.isArray(normalizedLayersBySide[sideCode])) {
            normalizedLayersBySide[sideCode] = []
          }
        }
        const normalizedBaseLayerVisibilityBySide = { ...(nextGarment.baseLayerVisibilityBySide ?? {}) }
        for (const sideCode of nextSides) {
          if (!normalizedBaseLayerVisibilityBySide[sideCode]) {
            normalizedBaseLayerVisibilityBySide[sideCode] = { ...fallbackBaseVisibility }
          }
        }
        nextGarment.baseLayerVisibilityBySide = normalizedBaseLayerVisibilityBySide
        const nextSide = nextSides.includes(d.side) ? d.side : (nextSides[0] ?? "front")
        return {
          ...d,
          side: nextSide,
          layersBySide: normalizedLayersBySide,
          garment: nextGarment,
        }
      })
    },
    [doc, productTypeOptions, pushHistory],
  )

  const onChangeProductType = useCallback(
    (nextProductTypeCode: string, mode: "new-design" | "change-in-place") => {
      const nextCode = nextProductTypeCode.trim()
      if (!nextCode || nextCode === doc.garment.productTypeCode) return
      const nextSides = getProductSides(nextCode, productTypeOptions)
      const resolvedNextSide = nextSides.includes(doc.side) ? doc.side : (nextSides[0] ?? "front")

      const baseLayersBySide = Object.fromEntries(
        Object.entries(doc.layersBySide).map(([sideCode, sideLayers]) => [sideCode, [...sideLayers]]),
      ) as Record<string, DesignLayer[]>
      for (const sideCode of nextSides) {
        if (!Array.isArray(baseLayersBySide[sideCode])) {
          baseLayersBySide[sideCode] = []
        }
      }
      const baseVisibilityBySide = { ...(doc.garment.baseLayerVisibilityBySide ?? {}) }
      const fallbackBaseVisibility = getBaseLayerVisibilityForSide(doc, doc.side)
      for (const sideCode of nextSides) {
        if (!baseVisibilityBySide[sideCode]) {
          baseVisibilityBySide[sideCode] = { ...fallbackBaseVisibility }
        }
      }

      if (mode === "new-design") {
        const duplicate = parseDesignDocSnapshot(serializeDoc(doc))
        if (!duplicate) return
        duplicate.title = `${doc.title || "untitled"} copy`
        duplicate.garment.productTypeCode = nextCode
        duplicate.side = resolvedNextSide as DesignSide
        duplicate.layersBySide = baseLayersBySide
        duplicate.garment.baseLayerVisibilityBySide = baseVisibilityBySide
        const resolvedBaseVisibility = baseVisibilityBySide[resolvedNextSide] ?? fallbackBaseVisibility
        duplicate.garment.showFill = resolvedBaseVisibility.showFill
        duplicate.garment.showStitching = resolvedBaseVisibility.showStitching
        duplicate.garment.showSeams = resolvedBaseVisibility.showSeams
        duplicate.garment.showOutline = resolvedBaseVisibility.showOutline
        setDoc(duplicate)
        setSelectedLayerId(null)
        setSelectedLayerIds([])
        setPast([])
        setFuture([])
        setLastSavedSnapshot(null)
        setLastSavedVersionId(null)
        return
      }

      pushHistory(doc)
      setDoc((current) => {
        const prunedLayersBySide = Object.fromEntries(
          nextSides.map((sideCode) => [sideCode, [...(current.layersBySide[sideCode] ?? [])]]),
        ) as Record<string, DesignLayer[]>
        const prunedVisibilityBySide = Object.fromEntries(
          nextSides.map((sideCode) => [
            sideCode,
            {
              ...(current.garment.baseLayerVisibilityBySide?.[sideCode] ?? fallbackBaseVisibility),
            },
          ]),
        ) as Record<string, BaseLayerVisibility>
        const resolvedBaseVisibility = prunedVisibilityBySide[resolvedNextSide] ?? fallbackBaseVisibility
        return {
          ...current,
          side: resolvedNextSide as DesignSide,
          layersBySide: prunedLayersBySide,
          garment: {
            ...current.garment,
            productTypeCode: nextCode,
            showFill: resolvedBaseVisibility.showFill,
            showStitching: resolvedBaseVisibility.showStitching,
            showSeams: resolvedBaseVisibility.showSeams,
            showOutline: resolvedBaseVisibility.showOutline,
            baseLayerVisibilityBySide: prunedVisibilityBySide,
          },
        }
      })
      setSelectedLayerId(null)
      setSelectedLayerIds([])
    },
    [doc, productTypeOptions, pushHistory],
  )

  const onRenameTitle = useCallback(
    (nextTitle: string) => {
      const normalized = nextTitle.trim() || "untitled"
      if (normalized === doc.title) return
      pushHistory(doc)
      setDoc((d) => ({ ...d, title: normalized }))
    },
    [doc, pushHistory],
  )

  const onDeleteGarment = useCallback(() => {
    const shouldDelete = window.confirm("Delete this garment draft? This clears layers and resets to untitled.")
    if (!shouldDelete) return
    setDoc({ ...initialDoc })
    setSelectedLayerId(null)
    setSelectedLayerIds([])
    setPast([])
    setFuture([])
    setLastSavedSnapshot(null)
    setLastSavedVersionId(null)
  }, [])

  const onDuplicateGarment = useCallback(() => {
    const duplicate = parseDesignDocSnapshot(serializeDoc(doc))
    if (!duplicate) return
    duplicate.title = `${doc.title || "untitled"} copy`
    setDoc(duplicate)
    setSelectedLayerId(null)
    setSelectedLayerIds([])
    setPast([])
    setFuture([])
    setLastSavedSnapshot(null)
    setLastSavedVersionId(null)
  }, [doc])

  const getSnapshot = useCallback(() => serializeDoc(doc), [doc])
  const currentSnapshotString = useMemo(() => JSON.stringify(getSnapshot()), [getSnapshot])
  const isSaved = lastSavedSnapshot !== null && currentSnapshotString === lastSavedSnapshot
  const saveLabel = studioEntryId
    ? isSaved
      ? "Saved to this Studio entry"
      : "Unsaved changes"
    : isSaved
      ? "Saved locally in this browser session"
      : "Unsaved local draft"
  const saveHint = studioEntryId
    ? undefined
    : "Open Design from a Studio entry to save versions and renders to the server."

  const onSaveGarment = useCallback(async () => {
    if (savingGarment) return
    if (!studioEntryId) {
      setLastSavedSnapshot(currentSnapshotString)
      return
    }
    setSavingGarment(true)
    const snapshot = getSnapshot()
    const result = await saveStudioDesignVersion(
      studioEntryId,
      { ...snapshot, savedAt: new Date().toISOString() },
      doc.title?.trim() || "untitled",
    )
    setSavingGarment(false)
    if (!result.success) {
      window.alert(result.error ?? "Failed to save garment.")
      return
    }
    setLastSavedSnapshot(currentSnapshotString)
    const versionId = result.data?.versionId
    if (typeof versionId === "string") {
      setLastSavedVersionId(versionId)
    }
  }, [currentSnapshotString, doc.title, getSnapshot, savingGarment, studioEntryId])

  const onGroupSelectedLayers = useCallback(() => {
    if (selectedLayerIds.length < 2) return
    const groupId = crypto.randomUUID()
    pushHistory(doc)
    setDoc((d) => {
      const layers = getLayersForSide(d)
      const next = layers.map((layer) =>
        selectedLayerIds.includes(layer.id) ? { ...layer, groupId } : layer,
      )
      return setLayersForSide(d, next)
    })
  }, [doc, selectedLayerIds, pushHistory])

  const onUngroupSelectedLayers = useCallback(() => {
    if (selectedLayerIds.length === 0) return
    pushHistory(doc)
    setDoc((d) => {
      const layers = getLayersForSide(d)
      const next = layers.map((layer) =>
        selectedLayerIds.includes(layer.id) ? { ...layer, groupId: undefined } : layer,
      )
      return setLayersForSide(d, next)
    })
  }, [doc, selectedLayerIds, pushHistory])

  const onUpdateGroup = useCallback(
    (groupId: string, updates: Partial<DesignLayer>) => {
      pushHistory(doc)
      setDoc((d) => {
        const layers = getLayersForSide(d)
        const next = layers.map((layer) => {
          if (layer.groupId !== groupId) return layer
          let nextLayer = { ...layer }
          if (typeof updates.x === "number") {
            nextLayer.x += updates.x
          }
          if (typeof updates.y === "number") {
            nextLayer.y += updates.y
          }
          if (typeof updates.scale === "number" && Number.isFinite(updates.scale) && updates.scale > 0) {
            nextLayer.scale = Math.max(0.1, nextLayer.scale * updates.scale)
          }
          if (d.guideSettings.snapToGuides) {
            nextLayer = snapLayerToGuides(nextLayer)
          }
          if (d.guideSettings.constrainToPrintSafe) {
            nextLayer = clampToPrintSafe(nextLayer)
          }
          return nextLayer
        })
        return setLayersForSide(d, next)
      })
    },
    [doc, pushHistory],
  )

  const onSaveSelectedAsSharedComponent = useCallback(
    (name: string) => {
      const sideLayers = getLayersForSide(doc)
      const selectedIds =
        selectedLayerIds.length > 0
          ? selectedLayerIds
          : selectedLayerId
            ? [selectedLayerId]
            : []
      if (selectedIds.length === 0) return
      const selectedLayers = sideLayers.filter((layer) => selectedIds.includes(layer.id))
      if (selectedLayers.length === 0) return
      const component: SharedDesignComponent = {
        id: crypto.randomUUID(),
        name: name.trim() || "Selection component",
        side: doc.side,
        createdAt: new Date().toISOString(),
        layers: cloneLayersWithNewIds(selectedLayers),
      }
      setSharedComponents((prev) => [...prev, component].slice(-40))
    },
    [doc, selectedLayerId, selectedLayerIds],
  )

  const onInsertSharedComponent = useCallback(
    (componentId: string) => {
      const component = sharedComponents.find((c) => c.id === componentId)
      if (!component) return
      const insertedLayers = cloneLayersWithNewIds(component.layers)
      pushHistory(doc)
      setDoc((d) => {
        const layers = getLayersForSide(d)
        return setLayersForSide(d, [...layers, ...insertedLayers])
      })
      setSelectedLayerId(insertedLayers[0]?.id ?? null)
    },
    [doc, pushHistory, sharedComponents],
  )

  const onRestoreSnapshot = useCallback(
    (snapshot: Record<string, unknown>) => {
      const parsed = parseDesignDocSnapshot(snapshot)
      if (!parsed) return
      pushHistory(doc)
      setDoc(parsed)
      setSelectedLayerId(null)
      setSelectedLayerIds([])
    },
    [doc, pushHistory],
  )

  return (
    <div className="flex-1 flex min-h-0">
      <LeftPanel
        doc={doc}
        productTypeOptions={productTypeOptions}
        canvasSides={canvasSides}
        selectedLayerId={selectedLayerId}
        selectedLayerIds={selectedLayerIds}
        sharedComponents={sharedComponents}
        onSelectLayer={onSelectLayer}
        onSetSelection={onSetSelection}
        onToggleLayerInSelection={onToggleLayerInSelection}
        onDeleteLayer={onDeleteLayer}
        onDeleteSelectedLayers={onDeleteSelectedLayers}
        onGroupSelectedLayers={onGroupSelectedLayers}
        onUngroupSelectedLayers={onUngroupSelectedLayers}
        onSaveSelectedAsSharedComponent={onSaveSelectedAsSharedComponent}
        onUpdateLayerById={onUpdateLayerById}
        onUpdateGarment={onUpdateGarment}
        onSideChange={onSideChange}
        onSelectCanvasSide={onSelectCanvasSide}
        onToggleCanvasSide={onToggleCanvasSide}
        renderEnabled={renderEnabled}
        studioEntryId={studioEntryId}
        getSnapshot={getSnapshot}
        saveLabel={saveLabel}
        saveHint={saveHint}
        isSaving={savingGarment}
        onRenameTitle={onRenameTitle}
        onSaveGarment={onSaveGarment}
        onDeleteGarment={onDeleteGarment}
        onDuplicateGarment={onDuplicateGarment}
        panelTab={panelTab}
        onPanelTabChange={setPanelTab}
        onViewVersionHistory={() => setPanelTab("history")}
      />
      <CenterPanel
        doc={doc}
        sharedComponents={sharedComponents}
        selectedLayerId={selectedLayerId}
        selectedLayerIds={selectedLayerIds}
        canvasSides={canvasSides}
        onAddTextLayer={onAddTextLayer}
        onAddSvgLayer={onAddSvgLayer}
        onInsertSharedComponent={onInsertSharedComponent}
        onUpdateLayerById={onUpdateLayerById}
        onSelectLayer={onSelectLayer}
        onSetSelection={onSetSelection}
        onTranslateSelection={onTranslateSelection}
        onScaleSelection={onScaleSelection}
        onBeginTransformGesture={onBeginTransformGesture}
        onSideChange={onSideChange}
      />
      <RightPanel
        doc={doc}
        productTypeOptions={productTypeOptions}
        panelTab={panelTab}
        selectedLayerId={selectedLayerId}
        selectedLayerIds={selectedLayerIds}
        onUpdateLayer={onUpdateLayer}
        onUpdateGroup={onUpdateGroup}
        onDeleteSelectedLayers={onDeleteSelectedLayers}
        onGroupSelectedLayers={onGroupSelectedLayers}
        onUngroupSelectedLayers={onUngroupSelectedLayers}
        onSaveSelectedAsSharedComponent={onSaveSelectedAsSharedComponent}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        studioEntryId={studioEntryId}
        lastSavedVersionId={lastSavedVersionId ?? undefined}
        renderEnabled={renderEnabled}
        getSnapshot={getSnapshot}
        onRestoreSnapshot={onRestoreSnapshot}
        conceptColorDirection={conceptColorDirection}
        suggestedColors={suggestedColors}
        canRequestApproval={canRequestApproval}
        canDecideApproval={canDecideApproval}
        onUpdateGuideSettings={onUpdateGuideSettings}
        onUpdateGarment={onUpdateGarment}
        onChangeProductType={onChangeProductType}
      />
    </div>
  )
}
