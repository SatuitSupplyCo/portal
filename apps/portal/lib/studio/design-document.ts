export const DESIGN_DOCUMENT_SCHEMA_VERSION = "1.0" as const

export type NormalizedDesignLayer = {
  id: string
  type: "text" | "svg"
  visible: boolean
  groupId?: string
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
  color: string
  boxWidth?: number
  boxHeight?: number
  strokeEnabled: boolean
  strokeColor: string
  strokeWidth: number
  effects: {
    shadow: {
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

export type NormalizedDesignDocument = {
  schemaVersion: typeof DESIGN_DOCUMENT_SCHEMA_VERSION
  title: string
  side: string
  layersBySide: Record<string, NormalizedDesignLayer[]>
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
    baseLayerVisibilityBySide: Record<
      string,
      {
        showFill: boolean
        showStitching: boolean
        showSeams: boolean
        showOutline: boolean
      }
    >
  }
  guideSettings: {
    showGuides: boolean
    constrainToPrintSafe: boolean
    snapToGuides: boolean
  }
  savedAt: string
}

function toNumber(value: unknown, fallback: number): number {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

function normalizeLayer(raw: unknown): NormalizedDesignLayer | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const row = raw as Record<string, unknown>
  return {
    id: typeof row.id === "string" && row.id ? row.id : crypto.randomUUID(),
    type: row.type === "svg" ? "svg" : "text",
    visible: typeof row.visible === "boolean" ? row.visible : true,
    groupId: typeof row.groupId === "string" && row.groupId ? row.groupId : undefined,
    x: toNumber(row.x, 50),
    y: toNumber(row.y, 50),
    scale: toNumber(row.scale, 1),
    rotation: toNumber(row.rotation, 0),
    opacity: Math.max(0, Math.min(100, toNumber(row.opacity, 100))),
    color: typeof row.color === "string" ? row.color : "#000000",
    boxWidth: Number.isFinite(Number(row.boxWidth)) ? Number(row.boxWidth) : undefined,
    boxHeight: Number.isFinite(Number(row.boxHeight)) ? Number(row.boxHeight) : undefined,
    strokeEnabled: typeof row.strokeEnabled === "boolean" ? row.strokeEnabled : false,
    strokeColor: typeof row.strokeColor === "string" ? row.strokeColor : "#000000",
    strokeWidth: Number.isFinite(Number(row.strokeWidth)) ? Number(row.strokeWidth) : 1,
    effects: {
      shadow:
        row.effects && typeof row.effects === "object" && !Array.isArray(row.effects)
          ? (() => {
              const effects = row.effects as Record<string, unknown>
              const rawShadow =
                effects.shadow && typeof effects.shadow === "object" && !Array.isArray(effects.shadow)
                  ? (effects.shadow as Record<string, unknown>)
                  : {}
              return {
                enabled: typeof rawShadow.enabled === "boolean" ? rawShadow.enabled : false,
                x: toNumber(rawShadow.x, 0),
                y: toNumber(rawShadow.y, 2),
                blur: toNumber(rawShadow.blur, 4),
                color: typeof rawShadow.color === "string" ? rawShadow.color : "#000000",
                opacity: Math.max(0, Math.min(100, toNumber(rawShadow.opacity, 20))),
              }
            })()
          : { enabled: false, x: 0, y: 2, blur: 4, color: "#000000", opacity: 20 },
    },
    text: typeof row.text === "string" ? row.text : undefined,
    fontFamily: typeof row.fontFamily === "string" ? row.fontFamily : undefined,
    fontSize: Number.isFinite(Number(row.fontSize)) ? Number(row.fontSize) : undefined,
    textAlign:
      row.textAlign === "left" || row.textAlign === "center" || row.textAlign === "right"
        ? row.textAlign
        : undefined,
    verticalAlign:
      row.verticalAlign === "top" || row.verticalAlign === "middle" || row.verticalAlign === "bottom"
        ? row.verticalAlign
        : undefined,
    lineHeight: Number.isFinite(Number(row.lineHeight)) ? Number(row.lineHeight) : undefined,
    letterSpacing: Number.isFinite(Number(row.letterSpacing)) ? Number(row.letterSpacing) : undefined,
    allCaps: typeof row.allCaps === "boolean" ? row.allCaps : undefined,
    underline: typeof row.underline === "boolean" ? row.underline : undefined,
    strikethrough: typeof row.strikethrough === "boolean" ? row.strikethrough : undefined,
    textPathType:
      row.textPathType === "none" ||
      row.textPathType === "arc_up" ||
      row.textPathType === "arc_down" ||
      row.textPathType === "circle"
        ? row.textPathType
        : undefined,
    textPathBend: Number.isFinite(Number(row.textPathBend)) ? Number(row.textPathBend) : undefined,
    textPathOffset: Number.isFinite(Number(row.textPathOffset)) ? Number(row.textPathOffset) : undefined,
    textBoxWidth: Number.isFinite(Number(row.textBoxWidth)) ? Number(row.textBoxWidth) : undefined,
    textBoxHeight: Number.isFinite(Number(row.textBoxHeight)) ? Number(row.textBoxHeight) : undefined,
    assetUrl: typeof row.assetUrl === "string" ? row.assetUrl : undefined,
    assetLabel: typeof row.assetLabel === "string" ? row.assetLabel : undefined,
  }
}

export function normalizeDesignDocumentSnapshot(
  snapshot: Record<string, unknown>,
): NormalizedDesignDocument {
  const normalizedLayersBySide: Record<string, NormalizedDesignLayer[]> = {}
  if (snapshot.layersBySide && typeof snapshot.layersBySide === "object" && !Array.isArray(snapshot.layersBySide)) {
    for (const [sideKey, rawLayers] of Object.entries(snapshot.layersBySide as Record<string, unknown>)) {
      normalizedLayersBySide[sideKey] = Array.isArray(rawLayers)
        ? rawLayers
            .map((layer) => normalizeLayer(layer))
            .filter((layer): layer is NormalizedDesignLayer => Boolean(layer))
        : []
    }
  }
  const legacyFrontLayers = Array.isArray(snapshot.frontLayers)
    ? snapshot.frontLayers
        .map((layer) => normalizeLayer(layer))
        .filter((layer): layer is NormalizedDesignLayer => Boolean(layer))
    : []
  const legacyBackLayers = Array.isArray(snapshot.backLayers)
    ? snapshot.backLayers
        .map((layer) => normalizeLayer(layer))
        .filter((layer): layer is NormalizedDesignLayer => Boolean(layer))
    : []
  if (!("front" in normalizedLayersBySide)) normalizedLayersBySide.front = legacyFrontLayers
  if (!("back" in normalizedLayersBySide)) normalizedLayersBySide.back = legacyBackLayers

  const side =
    typeof snapshot.side === "string" && snapshot.side.trim()
      ? snapshot.side
      : "front"
  const rawGuideSettings =
    snapshot.guideSettings && typeof snapshot.guideSettings === "object" && !Array.isArray(snapshot.guideSettings)
      ? (snapshot.guideSettings as Record<string, unknown>)
      : {}
  const rawGarment =
    snapshot.garment && typeof snapshot.garment === "object" && !Array.isArray(snapshot.garment)
      ? (snapshot.garment as Record<string, unknown>)
      : {}
  const fillColor = typeof rawGarment.fillColor === "string" ? rawGarment.fillColor : "#d9d9d9"
  const autoStitchShade =
    typeof rawGarment.autoStitchShade === "boolean" ? rawGarment.autoStitchShade : true
  const stitchColor =
    typeof rawGarment.stitchColor === "string" ? rawGarment.stitchColor : "#adadad"
  const seamColor =
    typeof rawGarment.seamColor === "string" ? rawGarment.seamColor : "#9c9c9c"
  const outlineColor =
    typeof rawGarment.outlineColor === "string" ? rawGarment.outlineColor : "#7f7f7f"
  const defaultBaseVisibility = {
    showFill: typeof rawGarment.showFill === "boolean" ? rawGarment.showFill : true,
    showStitching: typeof rawGarment.showStitching === "boolean" ? rawGarment.showStitching : true,
    showSeams: typeof rawGarment.showSeams === "boolean" ? rawGarment.showSeams : true,
    showOutline: typeof rawGarment.showOutline === "boolean" ? rawGarment.showOutline : true,
  }
  const rawBaseLayerVisibilityBySide =
    rawGarment.baseLayerVisibilityBySide &&
    typeof rawGarment.baseLayerVisibilityBySide === "object" &&
    !Array.isArray(rawGarment.baseLayerVisibilityBySide)
      ? (rawGarment.baseLayerVisibilityBySide as Record<string, unknown>)
      : {}
  const baseLayerVisibilityBySide: Record<
    string,
    { showFill: boolean; showStitching: boolean; showSeams: boolean; showOutline: boolean }
  > = {}
  for (const [sideKey, rawVisibility] of Object.entries(rawBaseLayerVisibilityBySide)) {
    if (!rawVisibility || typeof rawVisibility !== "object" || Array.isArray(rawVisibility)) continue
    const row = rawVisibility as Record<string, unknown>
    baseLayerVisibilityBySide[sideKey] = {
      showFill: typeof row.showFill === "boolean" ? row.showFill : defaultBaseVisibility.showFill,
      showStitching: typeof row.showStitching === "boolean" ? row.showStitching : defaultBaseVisibility.showStitching,
      showSeams: typeof row.showSeams === "boolean" ? row.showSeams : defaultBaseVisibility.showSeams,
      showOutline: typeof row.showOutline === "boolean" ? row.showOutline : defaultBaseVisibility.showOutline,
    }
  }
  const visibilitySides = new Set<string>(["front", "back", side, ...Object.keys(normalizedLayersBySide)])
  for (const sideKey of visibilitySides) {
    if (!baseLayerVisibilityBySide[sideKey]) {
      baseLayerVisibilityBySide[sideKey] = { ...defaultBaseVisibility }
    }
  }

  return {
    schemaVersion: DESIGN_DOCUMENT_SCHEMA_VERSION,
    title:
      typeof snapshot.title === "string" && snapshot.title.trim()
        ? snapshot.title
        : "untitled",
    side,
    layersBySide: normalizedLayersBySide,
    garment: {
      productTypeCode:
        typeof rawGarment.productTypeCode === "string" && rawGarment.productTypeCode.trim()
          ? rawGarment.productTypeCode
          : "tee_ss",
      fillColor,
      stitchColor,
      seamColor,
      outlineColor,
      autoStitchShade,
      showFill: defaultBaseVisibility.showFill,
      showStitching: defaultBaseVisibility.showStitching,
      showSeams: defaultBaseVisibility.showSeams,
      showOutline: defaultBaseVisibility.showOutline,
      baseLayerVisibilityBySide,
    },
    guideSettings: {
      showGuides:
        typeof rawGuideSettings.showGuides === "boolean" ? rawGuideSettings.showGuides : true,
      constrainToPrintSafe:
        typeof rawGuideSettings.constrainToPrintSafe === "boolean"
          ? rawGuideSettings.constrainToPrintSafe
          : false,
      snapToGuides:
        typeof rawGuideSettings.snapToGuides === "boolean" ? rawGuideSettings.snapToGuides : false,
    },
    savedAt:
      typeof snapshot.savedAt === "string" && snapshot.savedAt ? snapshot.savedAt : new Date().toISOString(),
  }
}
