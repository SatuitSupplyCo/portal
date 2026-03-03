import { describe, expect, it } from "vitest"
import {
  normalizeRenderImageProviderResponse,
} from "./render-image-provider"

describe("normalizeRenderImageProviderResponse", () => {
  it("normalizes object image payload entries", () => {
    const parsed = normalizeRenderImageProviderResponse({
      model: "img-model-v1",
      images: [
        { url: "https://cdn.example.com/a.png", label: "Front" },
        { url: "https://cdn.example.com/b.png" },
      ],
    })
    expect(parsed.model).toBe("img-model-v1")
    expect(parsed.images).toEqual([
      { url: "https://cdn.example.com/a.png", label: "Front" },
      { url: "https://cdn.example.com/b.png", label: undefined },
    ])
  })

  it("supports simple url payload fallback", () => {
    const parsed = normalizeRenderImageProviderResponse({
      url: "https://cdn.example.com/single.png",
    })
    expect(parsed.images).toEqual([{ url: "https://cdn.example.com/single.png" }])
  })

  it("filters invalid image entries", () => {
    const parsed = normalizeRenderImageProviderResponse({
      images: [{ foo: "bar" }, "", 123, null],
    })
    expect(parsed.images).toEqual([])
  })
})
