export const RENDER_INPUT_JSON_MAX_BYTES = 100_000
export const RENDER_MAX_ACTIVE_JOBS = 20
export const RENDER_MAX_RETRIES = 3
export const RENDER_RETRY_META_KEY = "__renderRetry"
export const RENDER_RETRY_BACKOFF_BASE_MS = 15_000
export const RENDER_RETRY_BACKOFF_MAX_MS = 5 * 60 * 1000

const RENDER_BLOCKED_TEXT_PATTERNS: RegExp[] = [
  /\bnazi\b/i,
  /\bswastika\b/i,
  /\bkkk\b/i,
  /\bterrorist\b/i,
  /\bkill\b/i,
  /\bsexual\s*violence\b/i,
  /\bchild\s*porn/i,
]

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

export function validateRenderInputJson(
  input: unknown,
): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  if (!isPlainObject(input)) {
    return { ok: false, error: "inputJson must be a plain object." }
  }
  const str = JSON.stringify(input)
  if (str.length > RENDER_INPUT_JSON_MAX_BYTES) {
    return { ok: false, error: "inputJson too large." }
  }
  return { ok: true, data: input }
}

export function normalizeRenderRetryMeta(inputJson: Record<string, unknown>): Record<string, unknown> {
  const rawMeta = isPlainObject(inputJson[RENDER_RETRY_META_KEY])
    ? (inputJson[RENDER_RETRY_META_KEY] as Record<string, unknown>)
    : {}
  const countRaw = Number(rawMeta.count)
  const count = Number.isFinite(countRaw) ? Math.max(0, Math.floor(countRaw)) : 0
  return {
    ...inputJson,
    [RENDER_RETRY_META_KEY]: {
      ...rawMeta,
      count,
    },
  }
}

export function getRenderRetryCount(inputJson: Record<string, unknown>): number {
  const rawMeta = isPlainObject(inputJson[RENDER_RETRY_META_KEY])
    ? (inputJson[RENDER_RETRY_META_KEY] as Record<string, unknown>)
    : null
  const countRaw = Number(rawMeta?.count ?? 0)
  return Number.isFinite(countRaw) ? Math.max(0, Math.floor(countRaw)) : 0
}

export function getRenderRetryMeta(inputJson: Record<string, unknown>) {
  const rawMeta = isPlainObject(inputJson[RENDER_RETRY_META_KEY])
    ? (inputJson[RENDER_RETRY_META_KEY] as Record<string, unknown>)
    : null
  if (!rawMeta) return null
  return {
    count: getRenderRetryCount(inputJson),
    sourceJobId: typeof rawMeta.sourceJobId === "string" ? rawMeta.sourceJobId : null,
    lastRetryAt: typeof rawMeta.lastRetryAt === "string" ? rawMeta.lastRetryAt : null,
  }
}

export function createRetryInput(
  inputJson: Record<string, unknown>,
  sourceJobId: string,
  nowIso = new Date().toISOString(),
): Record<string, unknown> {
  const normalized = normalizeRenderRetryMeta(inputJson)
  const current = getRenderRetryCount(normalized)
  return {
    ...normalized,
    [RENDER_RETRY_META_KEY]: {
      ...(normalized[RENDER_RETRY_META_KEY] as Record<string, unknown>),
      count: current + 1,
      sourceJobId,
      lastRetryAt: nowIso,
    },
  }
}

export function getRetryCooldownRemainingSeconds(args: {
  retryCount: number
  baseTime: Date
  nowMs?: number
}): number {
  const { retryCount, baseTime, nowMs = Date.now() } = args
  const backoffMs =
    retryCount <= 0
      ? 0
      : Math.min(
          RENDER_RETRY_BACKOFF_MAX_MS,
          RENDER_RETRY_BACKOFF_BASE_MS * 2 ** (retryCount - 1),
        )
  const elapsedMs = nowMs - baseTime.getTime()
  return backoffMs > 0 && elapsedMs < backoffMs ? Math.ceil((backoffMs - elapsedMs) / 1000) : 0
}

export function buildRenderInputSummary(inputJson: Record<string, unknown>) {
  const snapshot =
    isPlainObject(inputJson.snapshot) && inputJson.snapshot
      ? (inputJson.snapshot as Record<string, unknown>)
      : {}
  const side = typeof snapshot.side === "string" && snapshot.side ? snapshot.side : "front"

  const rawLayersBySide =
    isPlainObject(snapshot.layersBySide) ? (snapshot.layersBySide as Record<string, unknown>) : {}
  const layersBySide: Record<string, unknown[]> = {}
  for (const [sideKey, rawLayers] of Object.entries(rawLayersBySide)) {
    layersBySide[sideKey] = Array.isArray(rawLayers) ? rawLayers : []
  }
  const frontLayers = Array.isArray(snapshot.frontLayers) ? snapshot.frontLayers : []
  const backLayers = Array.isArray(snapshot.backLayers) ? snapshot.backLayers : []
  if (!("front" in layersBySide)) layersBySide.front = frontLayers
  if (!("back" in layersBySide)) layersBySide.back = backLayers
  const allLayers = Object.values(layersBySide).flat().filter(isPlainObject)

  const textLayers = allLayers
    .map((layer) => (typeof layer.text === "string" ? layer.text.trim() : ""))
    .filter((value): value is string => Boolean(value))
    .slice(0, 6)
  const colors = [
    ...new Set(
      allLayers
        .map((layer) => (typeof layer.color === "string" ? layer.color.trim() : ""))
        .filter((value): value is string => Boolean(value)),
    ),
  ].slice(0, 8)
  const hasSvgLayers = allLayers.some((layer) => layer.type === "svg")

  const maybeProductType =
    typeof inputJson.productTypeCode === "string"
      ? inputJson.productTypeCode
      : typeof inputJson.productType === "string"
        ? inputJson.productType
        : isPlainObject(snapshot.garment) &&
            typeof (snapshot.garment as Record<string, unknown>).productTypeCode === "string"
          ? ((snapshot.garment as Record<string, unknown>).productTypeCode as string)
        : undefined

  const renderOptions =
    isPlainObject(inputJson.renderOptions) && inputJson.renderOptions
      ? (inputJson.renderOptions as Record<string, unknown>)
      : {}

  const qualityPreset =
    typeof renderOptions.qualityPreset === "string" && renderOptions.qualityPreset.trim()
      ? renderOptions.qualityPreset.trim()
      : undefined
  const fitPreset =
    typeof renderOptions.fitPreset === "string" && renderOptions.fitPreset.trim()
      ? renderOptions.fitPreset.trim()
      : undefined
  const stylingPreset =
    typeof renderOptions.stylingPreset === "string" && renderOptions.stylingPreset.trim()
      ? renderOptions.stylingPreset.trim()
      : undefined

  return {
    side,
    frontLayerCount: layersBySide.front.length,
    backLayerCount: layersBySide.back.length,
    sideLayerCounts: Object.fromEntries(
      Object.entries(layersBySide).map(([sideKey, sideLayers]) => [sideKey, sideLayers.length]),
    ),
    textLayers,
    colors,
    hasSvgLayers,
    productType: maybeProductType,
    qualityPreset,
    fitPreset,
    stylingPreset,
  }
}

export function moderateRenderInput(
  inputJson: Record<string, unknown>,
): { ok: true } | { ok: false; error: string } {
  const summary = buildRenderInputSummary(inputJson)
  const corpus = [summary.productType ?? "", ...summary.textLayers, ...summary.colors].join(" ")
  const hit = RENDER_BLOCKED_TEXT_PATTERNS.find((pattern) => pattern.test(corpus))
  if (hit) {
    return {
      ok: false,
      error: "Render input contains blocked terms and cannot be processed.",
    }
  }
  return { ok: true }
}
