import { existsSync } from "node:fs"
import path from "node:path"

type TechFlatSet = {
  front: string
  back: string
  isPlaceholder: boolean
}

const PRODUCT_TYPE_PLACEHOLDER = {
  front: "/product/placeholders/generic/flats/generic-flat-front.svg",
  back: "/product/placeholders/generic/flats/generic-flat-back.svg",
}

function placeholderForProductType(code: string) {
  return {
    front: `/product/placeholders/product-types/${code}/flats/${code}-flat-front.svg`,
    back: `/product/placeholders/product-types/${code}/flats/${code}-flat-back.svg`,
  }
}

const DEFAULT_TECH_FLATS_BY_PRODUCT_TYPE_CODE: Record<string, { front: string; back: string }> = {
  tee_ss: {
    front: "/product/essential-tee/flats/essential-tee-flat-front.svg",
    back: "/product/essential-tee/flats/essential-tee-flat-back.svg",
  },
  tee_ls: {
    front: "/product/essential-long-sleeve-tee/flats/essential-long-sleeve-tee-flat-front.svg",
    back: "/product/essential-long-sleeve-tee/flats/essential-long-sleeve-tee-flat-back.svg",
  },
  tee_heavy: {
    front: "/product/essential-heavy-tee/flats/essential-heavy-tee-flat-front.svg",
    back: "/product/essential-heavy-tee/flats/essential-heavy-tee-flat-back.svg",
  },
  henley: placeholderForProductType("henley"),
  tank: placeholderForProductType("tank"),

  crewneck_sweat: {
    front: "/product/core-crewneck/flats/core-crewneck-flat-front.svg",
    back: "/product/core-crewneck/flats/core-crewneck-flat-back.svg",
  },
  hoodie_pullover: {
    front: "/product/core-hoodie/flats/core-hoodie-flat-front.svg",
    back: "/product/core-hoodie/flats/core-hoodie-flat-back.svg",
  },
  hoodie_zip: {
    front: "/product/core-hoodie/flats/core-hoodie-flat-front.svg",
    back: "/product/core-hoodie/flats/core-hoodie-flat-back.svg",
  },
  quarter_zip: placeholderForProductType("quarter_zip"),
  sweater: placeholderForProductType("sweater"),

  oxford_button_down: placeholderForProductType("oxford_button_down"),
  flannel: placeholderForProductType("flannel"),
  camp_collar: placeholderForProductType("camp_collar"),
  button_down_ss: placeholderForProductType("button_down_ss"),
  overshirt: placeholderForProductType("overshirt"),

  chore_jacket: placeholderForProductType("chore_jacket"),
  field_jacket: placeholderForProductType("field_jacket"),
  waxed_jacket: placeholderForProductType("waxed_jacket"),
  vest: placeholderForProductType("vest"),
  technical_shell: {
    front: "/product/swim-hoodie/flats/swim-hoodie-flat-front.svg",
    back: "/product/swim-hoodie/flats/swim-hoodie-flat-back.svg",
  },

  five_pocket: placeholderForProductType("five_pocket"),
  chino: placeholderForProductType("chino"),
  denim: placeholderForProductType("denim"),
  work_pant: placeholderForProductType("work_pant"),
  drawstring_pant: placeholderForProductType("drawstring_pant"),

  tailored_short: {
    front: "/product/tailored-swim-short/flats/tailored-swim-short-flat-front.svg",
    back: "/product/tailored-swim-short/flats/tailored-swim-short-flat-back.svg",
  },
  utility_short: {
    front: "/product/womens-short/flats/womens-short-flat-front.svg",
    back: "/product/womens-short/flats/womens-short-flat-back.svg",
  },
  athletic_short: {
    front: "/product/womens-short/flats/womens-short-flat-front.svg",
    back: "/product/womens-short/flats/womens-short-flat-back.svg",
  },
  swim_short: {
    front: "/product/tailored-swim-short/flats/tailored-swim-short-flat-front.svg",
    back: "/product/tailored-swim-short/flats/tailored-swim-short-flat-back.svg",
  },
  cargo_short: placeholderForProductType("cargo_short"),

  board_short: {
    front: "/product/tailored-swim-short/flats/tailored-swim-short-flat-front.svg",
    back: "/product/tailored-swim-short/flats/tailored-swim-short-flat-back.svg",
  },
  volley_short: {
    front: "/product/tailored-swim-short/flats/tailored-swim-short-flat-front.svg",
    back: "/product/tailored-swim-short/flats/tailored-swim-short-flat-back.svg",
  },
  rash_guard: {
    front: "/product/swim-hoodie/flats/swim-hoodie-flat-front.svg",
    back: "/product/swim-hoodie/flats/swim-hoodie-flat-back.svg",
  },
  performance_tee: {
    front: "/product/material-tee/flats/material-tee-flat-front.svg",
    back: "/product/material-tee/flats/material-tee-flat-back.svg",
  },
  fishing_shirt: placeholderForProductType("fishing_shirt"),

  dad_cap: {
    front: "/product/canvas-cap/flats/canvas-cap-flat-front.svg",
    back: "/product/canvas-cap/flats/canvas-cap-flat-back.svg",
  },
  five_panel: {
    front: "/product/canvas-cap/flats/canvas-cap-flat-front.svg",
    back: "/product/canvas-cap/flats/canvas-cap-flat-back.svg",
  },
  beanie: placeholderForProductType("beanie"),
  crew_sock: placeholderForProductType("crew_sock"),
  tote: placeholderForProductType("tote"),
  belt: placeholderForProductType("belt"),

  blanket: placeholderForProductType("blanket"),
  throw_blanket: placeholderForProductType("throw_blanket"),
  beach_blanket: placeholderForProductType("beach_blanket"),
  towel: placeholderForProductType("towel"),
  bocce_set: placeholderForProductType("bocce_set"),
  paddle_game: placeholderForProductType("paddle_game"),
  soft_cooler: placeholderForProductType("soft_cooler"),
  dry_bag: placeholderForProductType("dry_bag"),
}

export function getDefaultTechFlatsForProductType(productTypeCode: string): TechFlatSet {
  const base =
    DEFAULT_TECH_FLATS_BY_PRODUCT_TYPE_CODE[productTypeCode] ??
    PRODUCT_TYPE_PLACEHOLDER
  const override = getUploadedOverride(productTypeCode) ?? getLegacyUploadedOverride(productTypeCode)
  const placeholder = getStructuredPlaceholder(productTypeCode) ?? getLegacySinglePlaceholder(productTypeCode)
  const resolved = {
    front: override?.front ?? placeholder?.front ?? base.front,
    back: override?.back ?? placeholder?.back ?? base.back,
  }
  const isPlaceholder =
    !override?.front &&
    !override?.back &&
    resolved.front.includes("/product/placeholders/")

  return {
    ...resolved,
    isPlaceholder,
  }
}

function getUploadedOverride(productTypeCode: string): {
  front?: string
  back?: string
} | null {
  const baseDir = path.join(
    process.cwd(),
    "public",
    "product",
    "placeholders",
    "product-types",
    productTypeCode,
    "flats",
  )
  const frontFilename = `${productTypeCode}-flat-front.svg`
  const backFilename = `${productTypeCode}-flat-back.svg`

  const frontFsPath = path.join(baseDir, frontFilename)
  const backFsPath = path.join(baseDir, backFilename)

  const front = existsSync(frontFsPath)
    ? `/product/placeholders/product-types/${productTypeCode}/flats/${frontFilename}`
    : undefined
  const back = existsSync(backFsPath)
    ? `/product/placeholders/product-types/${productTypeCode}/flats/${backFilename}`
    : undefined

  if (!front && !back) return null

  return {
    front,
    back,
  }
}

function getStructuredPlaceholder(productTypeCode: string): {
  front: string
  back: string
} | null {
  const flatDir = path.join(
    process.cwd(),
    "public",
    "product",
    "placeholders",
    "product-types",
    productTypeCode,
    "flats",
  )
  const frontFilename = `${productTypeCode}-flat-front.svg`
  const backFilename = `${productTypeCode}-flat-back.svg`
  const frontFsPath = path.join(flatDir, frontFilename)
  const backFsPath = path.join(flatDir, backFilename)

  if (!existsSync(frontFsPath) || !existsSync(backFsPath)) return null

  return {
    front: `/product/placeholders/product-types/${productTypeCode}/flats/${frontFilename}`,
    back: `/product/placeholders/product-types/${productTypeCode}/flats/${backFilename}`,
  }
}

function getLegacyUploadedOverride(productTypeCode: string): {
  front?: string
  back?: string
} | null {
  const baseDir = path.join(
    process.cwd(),
    "public",
    "product",
    "placeholders",
    "product-types",
  )
  const frontFilename = `${productTypeCode}-flat-front.svg`
  const backFilename = `${productTypeCode}-flat-back.svg`
  const frontFsPath = path.join(baseDir, frontFilename)
  const backFsPath = path.join(baseDir, backFilename)

  const front = existsSync(frontFsPath)
    ? `/product/placeholders/product-types/${frontFilename}`
    : undefined
  const back = existsSync(backFsPath)
    ? `/product/placeholders/product-types/${backFilename}`
    : undefined

  if (!front && !back) return null

  return {
    front: existsSync(frontFsPath)
      ? `/product/placeholders/product-types/${frontFilename}`
      : undefined,
    back: existsSync(backFsPath)
      ? `/product/placeholders/product-types/${backFilename}`
      : undefined,
  }
}

function getLegacySinglePlaceholder(productTypeCode: string): {
  front: string
  back: string
} | null {
  const singleFsPath = path.join(
    process.cwd(),
    "public",
    "product",
    "placeholders",
    "product-types",
    `${productTypeCode}.svg`,
  )

  if (!existsSync(singleFsPath)) return null

  const url = `/product/placeholders/product-types/${productTypeCode}.svg`
  return { front: url, back: url }
}
