import { describe, expect, it } from "vitest"
import { isPlaceholderRenderUrl } from "./render-assets"

describe("render-assets", () => {
  describe("isPlaceholderRenderUrl", () => {
    it("returns true for placeholder path prefix", () => {
      expect(isPlaceholderRenderUrl("/product/placeholders/generic/flats/generic-flat-front.svg")).toBe(true)
      expect(isPlaceholderRenderUrl("/product/placeholders/generic/flats/generic-flat-back.svg")).toBe(true)
      expect(isPlaceholderRenderUrl("/product/placeholders/")).toBe(true)
      expect(isPlaceholderRenderUrl("/product/placeholders/foo/bar.png")).toBe(true)
    })

    it("returns true for empty or non-string", () => {
      expect(isPlaceholderRenderUrl("")).toBe(true)
      expect(isPlaceholderRenderUrl("   ")).toBe(true)
      expect(isPlaceholderRenderUrl(null)).toBe(true)
      expect(isPlaceholderRenderUrl(undefined)).toBe(true)
      expect(isPlaceholderRenderUrl(123)).toBe(true)
    })

    it("returns false for real image URLs", () => {
      expect(isPlaceholderRenderUrl("https://cdn.example.com/render/abc123.png")).toBe(false)
      expect(isPlaceholderRenderUrl("https://storage.example.com/renders/out.webp")).toBe(false)
      expect(isPlaceholderRenderUrl("/api/signed/asset/xyz.png")).toBe(false)
      expect(isPlaceholderRenderUrl("/other/path/image.jpg")).toBe(false)
    })

    it("trims whitespace before checking", () => {
      expect(isPlaceholderRenderUrl("  /product/placeholders/x.svg  ")).toBe(true)
      expect(isPlaceholderRenderUrl("  https://example.com/img.png  ")).toBe(false)
    })
  })
})
