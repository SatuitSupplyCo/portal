export type RenderImageOutput = {
  url: string
  label?: string
}

export type RenderImageProviderConfig = {
  enabled: boolean
  endpointUrl?: string
  apiKey?: string
  timeoutMs: number
  providerLabel: string
}

const DEFAULT_TIMEOUT_MS = 45_000

export function getRenderImageProviderConfig(): RenderImageProviderConfig {
  const endpointUrl = process.env.RENDER_IMAGE_PROVIDER_URL?.trim()
  const enabled =
    process.env.RENDER_IMAGE_PROVIDER_ENABLED === "true" &&
    Boolean(endpointUrl)
  const timeoutRaw = Number(process.env.RENDER_IMAGE_PROVIDER_TIMEOUT_MS)
  return {
    enabled,
    endpointUrl,
    apiKey: process.env.RENDER_IMAGE_PROVIDER_API_KEY?.trim(),
    timeoutMs: Number.isFinite(timeoutRaw) && timeoutRaw > 0 ? timeoutRaw : DEFAULT_TIMEOUT_MS,
    providerLabel: "external-render-image-provider",
  }
}

export function normalizeRenderImageProviderResponse(payload: unknown): {
  images: RenderImageOutput[]
  model?: string
} {
  const row =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {}

  const rawImages = Array.isArray(row.images)
    ? row.images
    : typeof row.url === "string"
      ? [row.url]
      : []

  const images = rawImages
    .map((item): RenderImageOutput | null => {
      if (typeof item === "string") {
        const url = item.trim()
        if (!url) return null
        return { url }
      }
      if (!item || typeof item !== "object" || Array.isArray(item)) return null
      const img = item as Record<string, unknown>
      const url = typeof img.url === "string" ? img.url.trim() : ""
      if (!url) return null
      return {
        url,
        label: typeof img.label === "string" ? img.label : undefined,
      }
    })
    .filter((item): item is RenderImageOutput => Boolean(item))

  return {
    images,
    model: typeof row.model === "string" ? row.model : undefined,
  }
}

export async function requestRenderImages(args: {
  renderPlan: Record<string, unknown>
  inputSummary: Record<string, unknown>
  inputJson: Record<string, unknown>
  config?: RenderImageProviderConfig
}): Promise<{
  images: RenderImageOutput[]
  provider: string
  model?: string
  durationMs: number
  error?: string
}> {
  const config = args.config ?? getRenderImageProviderConfig()
  if (!config.enabled || !config.endpointUrl) {
    return {
      images: [],
      provider: config.providerLabel,
      durationMs: 0,
      error: "Image provider not enabled/configured.",
    }
  }

  const started = Date.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs)

  try {
    const response = await fetch(config.endpointUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        renderPlan: args.renderPlan,
        inputSummary: args.inputSummary,
        inputJson: args.inputJson,
      }),
    })

    if (!response.ok) {
      return {
        images: [],
        provider: config.providerLabel,
        durationMs: Date.now() - started,
        error: `Image provider error (${response.status})`,
      }
    }

    const parsed = normalizeRenderImageProviderResponse(await response.json())
    return {
      images: parsed.images,
      provider: config.providerLabel,
      model: parsed.model,
      durationMs: Date.now() - started,
      error: parsed.images.length === 0 ? "Image provider returned no images." : undefined,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      images: [],
      provider: config.providerLabel,
      durationMs: Date.now() - started,
      error: message,
    }
  } finally {
    clearTimeout(timeoutId)
  }
}
