import { describe, expect, it } from "vitest"
import { buildGarmentFlatScopedCss } from "./garment-flat-style"

describe("buildGarmentFlatScopedCss", () => {
  it("scopes selectors to the provided side key", () => {
    const frontCss = buildGarmentFlatScopedCss({
      scopeKey: "canvas-front",
      fillColor: "#d9d9d9",
      stitchColor: "#666666",
      seamColor: "#555555",
      outlineColor: "#444444",
      showFill: false,
      showStitching: true,
      showSeams: true,
      showOutline: true,
    })
    const backCss = buildGarmentFlatScopedCss({
      scopeKey: "canvas-back",
      fillColor: "#ffffff",
      stitchColor: "#777777",
      seamColor: "#666666",
      outlineColor: "#555555",
      showFill: true,
      showStitching: false,
      showSeams: true,
      showOutline: false,
    })

    expect(frontCss).toContain('.garment-flat[data-scope="canvas-front"] [id*="MASK"] path')
    expect(frontCss).not.toContain('data-scope="canvas-back"')
    expect(frontCss).toContain("display: none !important;")

    expect(backCss).toContain('.garment-flat[data-scope="canvas-back"] [id*="MASK"] path')
    expect(backCss).not.toContain('data-scope="canvas-front"')
    expect(backCss).toContain("display: initial !important;")
  })
})
