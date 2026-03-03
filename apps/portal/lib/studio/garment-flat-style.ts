type GarmentFlatStyleOptions = {
  scopeKey: string
  fillColor: string
  stitchColor: string
  seamColor: string
  outlineColor: string
  showFill: boolean
  showStitching: boolean
  showSeams: boolean
  showOutline: boolean
}

function escapeCssAttributeValue(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')
}

export function buildGarmentFlatScopedCss({
  scopeKey,
  fillColor,
  stitchColor,
  seamColor,
  outlineColor,
  showFill,
  showStitching,
  showSeams,
  showOutline,
}: GarmentFlatStyleOptions): string {
  const escapedScope = escapeCssAttributeValue(scopeKey)
  const baseSelector = `.garment-flat[data-scope="${escapedScope}"]`
  return `
    ${baseSelector} svg,
    ${baseSelector} .garment-flat-svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    ${baseSelector} [id*="GRID"],
    ${baseSelector} [id*="ANNOTATION"],
    ${baseSelector} [id*="DIMENSION"] {
      display: none !important;
    }
    ${baseSelector} [id*="MASK"] path,
    ${baseSelector} [id*="MASK"] polygon,
    ${baseSelector} [id*="MASK"] rect,
    ${baseSelector} [id*="MASK"] circle,
    ${baseSelector} [id*="MASK"] ellipse {
      display: ${showFill ? "initial" : "none"} !important;
      fill: ${fillColor} !important;
      stroke: none !important;
    }
    ${baseSelector} [id*="STITCHING"] path,
    ${baseSelector} [id*="STITCHING"] polygon,
    ${baseSelector} [id*="STITCHING"] polyline,
    ${baseSelector} [id*="STITCHING"] line,
    ${baseSelector} .stitching {
      display: ${showStitching ? "initial" : "none"} !important;
      stroke: ${stitchColor} !important;
    }
    ${baseSelector} [id*="SEAMS"] path,
    ${baseSelector} [id*="SEAMS"] polygon,
    ${baseSelector} [id*="SEAMS"] polyline,
    ${baseSelector} [id*="SEAMS"] line,
    ${baseSelector} .seam {
      display: ${showSeams ? "initial" : "none"} !important;
      stroke: ${seamColor} !important;
      stroke-dasharray: none !important;
      stroke-dashoffset: 0 !important;
    }
    ${baseSelector} [id*="OUTLINE"] path,
    ${baseSelector} [id*="OUTLINE"] polygon,
    ${baseSelector} [id*="OUTLINE"] polyline,
    ${baseSelector} [id*="OUTLINE"] line,
    ${baseSelector} .outline {
      display: ${showOutline ? "initial" : "none"} !important;
      stroke: ${outlineColor} !important;
      stroke-dasharray: none !important;
      stroke-dashoffset: 0 !important;
    }
  `
}
