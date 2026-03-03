import { describe, expect, it } from "vitest"
import { normalizeDesignDocumentSnapshot } from "./design-document"

describe("normalizeDesignDocumentSnapshot", () => {
  it("applies defaults for legacy snapshots", () => {
    const normalized = normalizeDesignDocumentSnapshot({})

    expect(normalized.schemaVersion).toBe("1.0")
    expect(normalized.title).toBe("untitled")
    expect(normalized.side).toBe("front")
    expect(normalized.layersBySide.front).toEqual([])
    expect(normalized.layersBySide.back).toEqual([])
    expect(normalized.garment).toEqual({
      productTypeCode: "tee_ss",
      fillColor: "#d9d9d9",
      stitchColor: "#adadad",
      seamColor: "#9c9c9c",
      outlineColor: "#7f7f7f",
      autoStitchShade: true,
      showFill: true,
      showStitching: true,
      showSeams: true,
      showOutline: true,
      baseLayerVisibilityBySide: {
        front: { showFill: true, showStitching: true, showSeams: true, showOutline: true },
        back: { showFill: true, showStitching: true, showSeams: true, showOutline: true },
      },
    })
    expect(normalized.guideSettings).toEqual({
      showGuides: true,
      constrainToPrintSafe: false,
      snapToGuides: false,
    })
    expect(typeof normalized.savedAt).toBe("string")
  })

  it("normalizes layer fields and preserves groupId", () => {
    const normalized = normalizeDesignDocumentSnapshot({
      side: "back",
      frontLayers: [
        {
          id: "layer-1",
          type: "svg",
          groupId: "grp-1",
          x: "10",
          y: "20",
          scale: "1.5",
          rotation: 12,
          color: "#ffffff",
          fontFamily: "Inter",
          fontSize: "24",
          assetUrl: "/a.svg",
          assetLabel: "Asset A",
        },
      ],
      garment: {
        productTypeCode: "hoodie_pullover",
        fillColor: "#cccccc",
        stitchColor: "#8a8a8a",
        seamColor: "#777777",
        outlineColor: "#555555",
        autoStitchShade: false,
        showFill: true,
        showStitching: false,
        showSeams: true,
        showOutline: false,
      },
      guideSettings: {
        showGuides: false,
        constrainToPrintSafe: true,
        snapToGuides: true,
      },
      savedAt: "2026-03-01T00:00:00.000Z",
    })

    expect(normalized.side).toBe("back")
    expect(normalized.layersBySide.front).toHaveLength(1)
    expect(normalized.layersBySide.front[0]).toMatchObject({
      id: "layer-1",
      type: "svg",
      groupId: "grp-1",
      x: 10,
      y: 20,
      scale: 1.5,
      rotation: 12,
      color: "#ffffff",
      fontFamily: "Inter",
      fontSize: 24,
      assetUrl: "/a.svg",
      assetLabel: "Asset A",
    })
    expect(normalized.garment).toEqual({
      productTypeCode: "hoodie_pullover",
      fillColor: "#cccccc",
      stitchColor: "#8a8a8a",
      seamColor: "#777777",
      outlineColor: "#555555",
      autoStitchShade: false,
      showFill: true,
      showStitching: false,
      showSeams: true,
      showOutline: false,
      baseLayerVisibilityBySide: {
        front: { showFill: true, showStitching: false, showSeams: true, showOutline: false },
        back: { showFill: true, showStitching: false, showSeams: true, showOutline: false },
      },
    })
    expect(normalized.guideSettings).toEqual({
      showGuides: false,
      constrainToPrintSafe: true,
      snapToGuides: true,
    })
    expect(normalized.savedAt).toBe("2026-03-01T00:00:00.000Z")
  })

  it("filters invalid layers and normalizes legacy front/back layers", () => {
    const normalized = normalizeDesignDocumentSnapshot({
      frontLayers: [
        { id: "f1", type: "text", text: "Front", x: 0, y: 0 },
        null,
        "not-an-object",
        { id: "f2", type: "svg", groupId: "g1", x: 10, y: 20 },
      ],
      backLayers: [
        { id: "b1", type: "text", text: "Back", color: "#333", x: "100", y: "200" },
      ],
    })
    expect(normalized.layersBySide.front).toHaveLength(2)
    expect(normalized.layersBySide.front[0]).toMatchObject({ id: "f1", type: "text", text: "Front", x: 0, y: 0 })
    expect(normalized.layersBySide.front[1]).toMatchObject({ id: "f2", type: "svg", groupId: "g1", x: 10, y: 20 })
    expect(normalized.layersBySide.back).toHaveLength(1)
    expect(normalized.layersBySide.back[0]).toMatchObject({
      id: "b1",
      type: "text",
      text: "Back",
      color: "#333",
      x: 100,
      y: 200,
    })
  })

  it("normalizes layersBySide snapshots", () => {
    const normalized = normalizeDesignDocumentSnapshot({
      title: "Bocce Set",
      side: "top",
      layersBySide: {
        top: [{ id: "t1", type: "text", text: "Top print", x: 4, y: 5 }],
        left_side: [{ id: "l1", type: "svg", assetUrl: "/left.svg" }],
      },
    })
    expect(normalized.title).toBe("Bocce Set")
    expect(normalized.side).toBe("top")
    expect(normalized.layersBySide.top).toHaveLength(1)
    expect(normalized.layersBySide.left_side).toHaveLength(1)
    expect(normalized.layersBySide.front).toEqual([])
    expect(normalized.layersBySide.back).toEqual([])
  })

  it("normalizes opacity, stroke, and effects fields", () => {
    const normalized = normalizeDesignDocumentSnapshot({
      frontLayers: [
        {
          id: "fx-1",
          type: "text",
          opacity: "42",
          strokeEnabled: true,
          strokeColor: "#123456",
          strokeWidth: "2.5",
          effects: {
            shadow: {
              enabled: true,
              x: "3",
              y: "-2",
              blur: "8",
              color: "#222222",
              opacity: "55",
            },
          },
        },
      ],
    })

    expect(normalized.layersBySide.front[0]).toMatchObject({
      id: "fx-1",
      opacity: 42,
      strokeEnabled: true,
      strokeColor: "#123456",
      strokeWidth: 2.5,
      effects: {
        shadow: {
          enabled: true,
          x: 3,
          y: -2,
          blur: 8,
          color: "#222222",
          opacity: 55,
        },
      },
    })
  })
})
