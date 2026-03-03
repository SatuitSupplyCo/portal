import { describe, expect, it } from "vitest"
import {
  buildRenderInputSummary,
  createRetryInput,
  getRenderRetryCount,
  getRenderRetryMeta,
  getRetryCooldownRemainingSeconds,
  moderateRenderInput,
  normalizeRenderRetryMeta,
  validateRenderInputJson,
} from "./render-policy"

describe("buildRenderInputSummary", () => {
  it("returns defaults for empty or missing snapshot", () => {
    expect(buildRenderInputSummary({})).toEqual({
      side: "front",
      frontLayerCount: 0,
      backLayerCount: 0,
      sideLayerCounts: { front: 0, back: 0 },
      textLayers: [],
      colors: [],
      hasSvgLayers: false,
      productType: undefined,
      qualityPreset: undefined,
      fitPreset: undefined,
      stylingPreset: undefined,
    })
    expect(buildRenderInputSummary({ snapshot: null })).toEqual({
      side: "front",
      frontLayerCount: 0,
      backLayerCount: 0,
      sideLayerCounts: { front: 0, back: 0 },
      textLayers: [],
      colors: [],
      hasSvgLayers: false,
      productType: undefined,
      qualityPreset: undefined,
      fitPreset: undefined,
      stylingPreset: undefined,
    })
  })

  it("prefers productTypeCode over productType and sets side from snapshot", () => {
    const withCode = buildRenderInputSummary({
      productTypeCode: "hoodie",
      productType: "tee",
      snapshot: { side: "back", frontLayers: [], backLayers: [] },
    })
    expect(withCode.productType).toBe("hoodie")
    expect(withCode.side).toBe("back")

    const withType = buildRenderInputSummary({
      productType: "tee_ls",
      snapshot: { frontLayers: [], backLayers: [] },
    })
    expect(withType.productType).toBe("tee_ls")
    expect(withType.side).toBe("front")
  })

  it("extracts textLayers and colors from layers, caps text at 6 and colors at 8", () => {
    const summary = buildRenderInputSummary({
      snapshot: {
        frontLayers: [
          { text: "  Hello  ", color: "#ff0000" },
          { text: "World", color: "#00ff00" },
          { text: "A", color: "#ff0000" },
          { text: "B", color: "#0000ff" },
          { text: "C", color: "#ffff00" },
          { text: "D", color: "#ff00ff" },
          { text: "E", color: "#00ffff" },
        ],
        backLayers: [],
      },
    })
    expect(summary.textLayers).toEqual(["Hello", "World", "A", "B", "C", "D"])
    expect(summary.colors).toEqual(["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"])
    expect(summary.frontLayerCount).toBe(7)
    expect(summary.backLayerCount).toBe(0)
    expect(summary.sideLayerCounts).toEqual({ front: 7, back: 0 })
  })

  it("sets hasSvgLayers from layer type and ignores non-object layers", () => {
    const noSvg = buildRenderInputSummary({
      snapshot: {
        frontLayers: [{ type: "text", text: "x" }],
        backLayers: [null, "invalid", {}],
      },
    })
    expect(noSvg.hasSvgLayers).toBe(false)
    expect(noSvg.textLayers).toEqual(["x"])

    const withSvg = buildRenderInputSummary({
      snapshot: {
        frontLayers: [{ type: "text" }, { type: "svg", assetUrl: "/a.svg" }],
        backLayers: [],
      },
    })
    expect(withSvg.hasSvgLayers).toBe(true)
  })

  it("supports layersBySide snapshots", () => {
    const summary = buildRenderInputSummary({
      snapshot: {
        side: "top",
        layersBySide: {
          top: [{ type: "text", text: "Top copy" }],
          bottom: [{ type: "svg", assetUrl: "/a.svg" }],
        },
      },
    })
    expect(summary.side).toBe("top")
    expect(summary.sideLayerCounts).toEqual({
      top: 1,
      bottom: 1,
      front: 0,
      back: 0,
    })
    expect(summary.hasSvgLayers).toBe(true)
    expect(summary.textLayers).toEqual(["Top copy"])
  })

  it("uses front/back counts from layersBySide when present", () => {
    const summary = buildRenderInputSummary({
      snapshot: {
        layersBySide: {
          front: [{ type: "text", text: "Front copy" }, { type: "svg", assetUrl: "/f.svg" }],
          back: [{ type: "text", text: "Back copy" }],
        },
      },
    })
    expect(summary.frontLayerCount).toBe(2)
    expect(summary.backLayerCount).toBe(1)
    expect(summary.sideLayerCounts).toEqual({ front: 2, back: 1 })
  })

  it("captures optional render calibration presets", () => {
    const summary = buildRenderInputSummary({
      snapshot: { frontLayers: [], backLayers: [] },
      renderOptions: {
        qualityPreset: "photoreal-high",
        fitPreset: "athletic-relaxed",
        stylingPreset: "premium-lifestyle",
      },
    })
    expect(summary.qualityPreset).toBe("photoreal-high")
    expect(summary.fitPreset).toBe("athletic-relaxed")
    expect(summary.stylingPreset).toBe("premium-lifestyle")
  })
})

describe("render policy helpers", () => {
  it("validates render input JSON shape", () => {
    expect(validateRenderInputJson({ snapshot: {} }).ok).toBe(true)
    expect(validateRenderInputJson(null).ok).toBe(false)
    expect(validateRenderInputJson(["not-object"]).ok).toBe(false)
  })

  it("normalizes retry metadata and increments retry count", () => {
    const base = normalizeRenderRetryMeta({
      __renderRetry: { count: "2.9" },
    })
    expect(getRenderRetryCount(base)).toBe(2)

    const next = createRetryInput(base, "job-1", "2026-03-01T00:00:00.000Z")
    expect(getRenderRetryCount(next)).toBe(3)
    expect(getRenderRetryMeta(next)).toEqual({
      count: 3,
      sourceJobId: "job-1",
      lastRetryAt: "2026-03-01T00:00:00.000Z",
    })
  })

  it("computes cooldown remaining seconds", () => {
    const base = new Date("2026-03-01T00:00:00.000Z")
    const remaining = getRetryCooldownRemainingSeconds({
      retryCount: 2,
      baseTime: base,
      nowMs: base.getTime() + 1_000,
    })
    expect(remaining).toBeGreaterThan(0)
  })

  it("moderates blocked render input terms", () => {
    const blocked = moderateRenderInput({
      snapshot: {
        frontLayers: [{ text: "nazi text", color: "#fff" }],
        backLayers: [],
      },
    })
    expect(blocked.ok).toBe(false)

    const clean = moderateRenderInput({
      snapshot: {
        frontLayers: [{ text: "heritage stripe", color: "#112233" }],
        backLayers: [],
      },
    })
    expect(clean.ok).toBe(true)
  })
})
