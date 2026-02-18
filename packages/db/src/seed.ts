/**
 * Seed script — populates the portal database with brand documents.
 *
 * Run: DATABASE_URL=postgresql://Matt@localhost:5432/satuit_portal npx tsx src/seed.ts
 * Or:  pnpm db:seed  (with DATABASE_URL in env)
 *
 * Idempotent: re-running replaces existing block content.
 */
import { db } from "./client"
import {
  documents,
  documentBlocks,
  seasons,
  corePrograms,
  productCategories,
  productSubcategories,
  productTypes,
  constructions,
  materialWeightClasses,
  sellingWindows,
  assortmentTenures,
  fitBlocks,
  useCases,
  audienceGenders,
  audienceAgeGroups,
  goodsClasses,
  sizeScales,
  collections,
  permissions,
  roles,
  rolePermissions,
  userRoles,
  users,
} from "./schema"
import { eq, and, inArray } from "drizzle-orm"

// ─── Block builder helpers ───────────────────────────────────────────

type BlockDef = { type: string; contentJson: Record<string, unknown> }

const h = (level: number, text: string): BlockDef => ({
  type: "heading",
  contentJson: { level, text },
})

const t = (content: string): BlockDef => ({
  type: "text",
  contentJson: { content },
})

const r = (label: string, content: string): BlockDef => ({
  type: "rule",
  contentJson: { label, content },
})

const c = (variant: string, content: string): BlockDef => ({
  type: "callout",
  contentJson: { variant, content },
})

const tbl = (
  headers: string[],
  rows: string[][],
  caption?: string,
): BlockDef => ({
  type: "table",
  contentJson: { headers, rows, ...(caption ? { caption } : {}) },
})

// ─── Core Product Spec ───────────────────────────────────────────────

const coreProductSpecBlocks: BlockDef[] = [
  c(
    "info",
    "<strong>Product Tier:</strong> Tier 1 \u2014 Core Line &nbsp;|&nbsp; <strong>Status:</strong> Brand-defining &nbsp;|&nbsp; <strong>Goal:</strong> North-star product that everything else orbits",
  ),

  // ── 1. Strategic Intent ────────────────────────────────────────────
  h(2, "1. Strategic Intent"),

  c(
    "info",
    'From BOS: <em>"The core product line should ultimately become solids / stripes with subtle branding."</em>',
  ),
  t(
    "<p>This tee is designed to be:</p><ul><li>Bought without context</li><li>Worn repeatedly</li><li>Still relevant in 5\u201310 years</li><li>Representative of Satuit even with no graphics</li></ul>",
  ),
  r("Strategic Test", "If this product fails, the brand fails."),

  // ── 2. Color Application ───────────────────────────────────────────
  h(2, "2. Color Application (Visual System)"),

  h(3, "Approved Body Colors (Launch Set)"),
  tbl(
    ["Color", "Hex", "Role"],
    [
      ["Navy", "#003C68", "Structural \u2014 allowed as full garment"],
      ["White", "#FFFFFF", "Calm canvas"],
      ["Paper", "#FFFCFA", "Calm canvas, warmth"],
    ],
  ),
  r("Body Color Rule", "No accent colors on the body fabric."),

  h(3, "Accent Allowance (Earned Warmth)"),
  t("<p>ONE accent maximum. Interior only. Examples:</p><ul><li>Light blue neck taping</li><li>Red or yellow single stitch detail</li><li>Accent thread on size tag</li></ul>"),
  c(
    "avoid",
    "<ul><li>Accent body color</li><li>Multiple accents</li><li>Contrast panels</li></ul>",
  ),

  // ── 3. Fabric & Handfeel ───────────────────────────────────────────
  h(2, "3. Fabric & Handfeel"),

  c(
    "info",
    'From BOS: <em>"Familiar, not exclusive. Designed to repeat."</em>',
  ),
  t("<p>Applied requirements:</p><ul><li>Mid-weight jersey (not flimsy, not heavy)</li><li>Soft but structured</li><li>Pre-shrunk</li><li>Meant to improve with wear, not degrade</li></ul>"),
  r("Fabric Test", 'If it feels "special occasion," it\u2019s wrong.'),

  // ── 4. Fit & Silhouette ────────────────────────────────────────────
  h(2, "4. Fit & Silhouette"),

  h(3, "Fit"),
  t("<ul><li>Clean, modern, not boxy</li><li>Relaxed without slouch</li><li>No exaggerated drop shoulder</li><li>No extreme tailoring</li></ul>"),

  h(3, "Length"),
  t("<ul><li>Designed to sit naturally</li><li>No fashion-forward cropping or elongation</li></ul>"),
  r("Fit Rule", "This tee should disappear on the body\u2014in a good way."),

  // ── 5. Logo & Mark Placement ───────────────────────────────────────
  h(2, "5. Logo & Mark Placement"),

  c(
    "info",
    'From BOS: <em>"The more permanent the surface, the quieter the logo."</em>',
  ),

  h(3, "Primary Branding (Default)"),
  t("<ul><li>No logo on front</li><li>Symbol only</li><li>Placement: back collar (printed or woven) or hem tag</li></ul>"),

  h(3, "Size & Color"),
  t("<ul><li>Small enough to miss at first glance</li><li>Never larger than necessary for legibility</li><li>Navy on light garments / white or paper on navy garments</li><li>No accent colors for logo mark</li></ul>"),
  c("avoid", "<ul><li>No chest logo</li><li>No oversized branding</li><li>No wordmark on core tee exterior</li></ul>"),

  // ── 6. Neck Label & Interior Details ───────────────────────────────
  h(2, "6. Neck Label & Interior Details"),

  t(
    "<p><strong>Neck label:</strong> Printed or woven. Symbol preferred. Paper or white ink on navy; navy on light garments.</p>" +
    "<p><strong>Interior taping:</strong> Allowed accent color. This is where \u201Cclub detail\u201D lives.</p>" +
    "<p><strong>Care label:</strong> Utility typography only. No marketing copy. Calm, legible, secondary.</p>",
  ),

  // ── 7. Packaging & Tags ────────────────────────────────────────────
  h(2, "7. Packaging & Tags"),

  h(3, "Hang Tag"),
  t(
    "<ul><li>Paper stock</li><li>Symbol on front</li><li>Wordmark on back</li><li>Anchor line allowed: <em>Made for life near the water.</em></li></ul>",
  ),

  h(3, "String & Packaging"),
  t("<ul><li>Accent color allowed on string (one color only)</li><li>Same packaging as every other tier</li></ul>"),
  r("Packaging Rule", "No \u201Ccore\u201D or \u201Cessential\u201D callouts. Consistency over signaling."),

  // ── 8. Ecommerce Application ───────────────────────────────────────
  h(2, "8. Ecommerce Application"),

  h(3, "Product Name"),
  r("Product Name", '"Core Tee" \u2014 no descriptors, no embellishment.'),

  h(3, "Product Description (BOS-Approved Copy)"),
  t(
    "<blockquote>A well-made essential designed for everyday wear near the water. Comfortable, durable, and easy to reach for\u2014season after season.</blockquote>" +
    "<p>Optional second line:</p><blockquote>Built to be worn often, not saved for later.</blockquote>",
  ),

  h(3, "Photography"),
  t("<ul><li>Neutral background</li><li>Natural light</li><li>No lifestyle theatrics</li><li>Texture and fit over narrative</li></ul>"),
  c("avoid", "<ul><li>Over-styled scenes</li><li>Props that suggest costume</li></ul>"),

  // ── 9. What This Product Deliberately Avoids ───────────────────────
  h(2, "9. What This Product Deliberately Avoids"),

  c(
    "avoid",
    "<p>This is just as important as what it includes:</p><ul><li>No town names</li><li>No phrases</li><li>No coordinates</li><li>No seasonal graphics</li><li>No storytelling on the garment</li></ul><p>Those live elsewhere, in collections, not the core.</p>",
  ),

  // ── 10. Final BOS Sound Check ──────────────────────────────────────
  h(2, "10. Final BOS Sound Check"),

  t("<p><strong>Before approving production, ask:</strong></p>"),
  c(
    "info",
    "<ul><li>Would this still feel right if Satuit never made another graphic tee?</li><li>Would someone buy this online without knowing the brand?</li><li>Would this feel normal worn 50+ times?</li></ul>",
  ),
  r("Sound Check", "Must pass all three."),
]

// ─── Seed runner ─────────────────────────────────────────────────────

interface DocSeed {
  slug: string
  title: string
  blocks: BlockDef[]
  visibleToPartners?: boolean
}

const docsToSeed: DocSeed[] = [
  {
    slug: "core-product-spec",
    title: "Satuit Core Product Spec \u2014 Core Short-Sleeve Tee",
    blocks: coreProductSpecBlocks,
    visibleToPartners: false,
  },
]

// ─── Seasons & Core Programs ─────────────────────────────────────────

export async function seedSeasons() {
  console.log("Seeding seasons...\n")

  const seasonDefs: Array<{
    code: string
    name: string
    description?: string
    seasonType: "major" | "minor"
    targetSkuCount: number
    marginTarget: string
    complexityBudget: number
    minorMaxSkus?: number
    colorPalette: string[]
    mixTargets: Record<string, number>
  }> = [
    {
      code: "FW26",
      name: "Fall 2026",
      description: "Fall establishes the backbone of Satuit. The season is anchored by weight and layerability — quarter zips, crewnecks, and structured fleece built for sharp coastal air and everyday wear. The focus is disciplined: durable fabrics, restrained color, and foundational silhouettes that define the brand going forward.",
      seasonType: "major",
      targetSkuCount: 18,
      marginTarget: "65.00",
      complexityBudget: 54,
      colorPalette: ["#003C68", "#FFFFFF", "#FFFCFA", "#8B4513", "#2F4F4F"],
      mixTargets: { core: 35, material: 20, function: 15, origin: 15, womens: 10, accessory: 5 },
    },
    {
      code: "WD26",
      name: "Winter Drop 2026",
      seasonType: "minor",
      targetSkuCount: 4,
      marginTarget: "65.00",
      complexityBudget: 12,
      minorMaxSkus: 4,
      colorPalette: ["#003C68", "#FFFFFF", "#8B0000"],
      mixTargets: { core: 50, material: 25, function: 25 },
    },
    {
      code: "SS27",
      name: "Spring 2027",
      seasonType: "major",
      targetSkuCount: 16,
      marginTarget: "65.00",
      complexityBudget: 48,
      colorPalette: ["#003C68", "#FFFFFF", "#FFFCFA", "#87CEEB", "#F5F5DC"],
      mixTargets: { core: 30, material: 15, function: 25, origin: 15, womens: 10, accessory: 5 },
    },
    {
      code: "SD27",
      name: "Summer Drop 2027",
      seasonType: "minor",
      targetSkuCount: 4,
      marginTarget: "65.00",
      complexityBudget: 12,
      minorMaxSkus: 4,
      colorPalette: ["#FFFFFF", "#FFFCFA", "#87CEEB"],
      mixTargets: { core: 50, function: 50 },
    },
  ]

  for (const def of seasonDefs) {
    const existing = await db.query.seasons.findFirst({
      where: (s, { eq: e }) => e(s.code, def.code),
    })
    if (!existing) {
      await db.insert(seasons).values(def)
      console.log(`  Created season: ${def.name} (${def.code})`)
    } else {
      console.log(`  Found existing season: ${def.name}`)
    }
  }
  console.log("")
}

export async function seedCorePrograms() {
  console.log("Seeding core programs...\n")

  const existing = await db.query.corePrograms.findFirst({
    where: (cp, { eq: e }) => e(cp.name, "Fleece Program"),
  })

  if (!existing) {
    await db.insert(corePrograms).values({
      name: "Fleece Program",
      fabricSpec: "11 oz brushed-back fleece, 80/20 cotton-poly, enzyme washed",
      silhouettes: ["crewneck", "hoodie", "quarter-zip"],
      baseColorways: ["#003C68", "#FFFFFF", "#FFFCFA", "#808080", "#2F4F4F"],
      status: "active",
    })
    console.log("  Created core program: Fleece Program")
  } else {
    console.log("  Found existing core program: Fleece Program")
  }
  console.log("")
}

// ─── Product Taxonomy Seed ────────────────────────────────────────────

export async function seedProductTaxonomy() {
  console.log("Seeding product taxonomy...\n")

  // Check if already seeded
  const existing = await db.query.productCategories.findFirst()
  if (existing) {
    console.log("  Taxonomy already seeded, skipping\n")
    return
  }

  // ── Dimension lookup tables ──────────────────────────────────────

  await db.insert(constructions).values([
    { code: "knit", label: "Knit", sortOrder: 0 },
    { code: "woven", label: "Woven", sortOrder: 1 },
    { code: "cut_and_sew", label: "Cut & Sew", sortOrder: 2 },
    { code: "sweater_knit", label: "Sweater Knit", sortOrder: 3 },
    { code: "technical", label: "Technical", sortOrder: 4 },
    { code: "denim", label: "Denim", sortOrder: 5 },
    { code: "fleece", label: "Fleece", sortOrder: 6 },
    { code: "jersey", label: "Jersey", sortOrder: 7 },
  ])
  console.log("  Seeded constructions (8)")

  await db.insert(materialWeightClasses).values([
    { code: "light", label: "Light", sortOrder: 0 },
    { code: "mid", label: "Mid", sortOrder: 1 },
    { code: "heavy", label: "Heavy", sortOrder: 2 },
    { code: "insulated", label: "Insulated", sortOrder: 3 },
  ])
  console.log("  Seeded material weight classes (4)")

  await db.insert(sellingWindows).values([
    { code: "core_year_round", label: "Core / Year-Round", sortOrder: 0 },
    { code: "ss", label: "Spring/Summer", sortOrder: 1 },
    { code: "fw", label: "Fall/Winter", sortOrder: 2 },
    { code: "transitional", label: "Transitional", sortOrder: 3 },
    { code: "event_based", label: "Event-Based", sortOrder: 4 },
  ])
  console.log("  Seeded selling windows (5)")

  await db.insert(assortmentTenures).values([
    { code: "evergreen", label: "Evergreen", sortOrder: 0 },
    { code: "multi_season", label: "Multi-Season", sortOrder: 1 },
    { code: "limited", label: "Limited", sortOrder: 2 },
    { code: "one_time_capsule", label: "One-Time Capsule", sortOrder: 3 },
  ])
  console.log("  Seeded assortment tenures (4)")

  await db.insert(fitBlocks).values([
    { code: "modern_classic", label: "Modern Classic", sortOrder: 0 },
    { code: "relaxed", label: "Relaxed", sortOrder: 1 },
    { code: "slim", label: "Slim", sortOrder: 2 },
    { code: "oversized", label: "Oversized", sortOrder: 3 },
    { code: "athletic", label: "Athletic", sortOrder: 4 },
    { code: "straight", label: "Straight", sortOrder: 5 },
    { code: "tapered", label: "Tapered", sortOrder: 6 },
  ])
  console.log("  Seeded fit blocks (7)")

  await db.insert(useCases).values([
    { code: "everyday", label: "Everyday", sortOrder: 0 },
    { code: "layering", label: "Layering", sortOrder: 1 },
    { code: "coastal_weather", label: "Coastal Weather", sortOrder: 2 },
    { code: "utility", label: "Utility", sortOrder: 3 },
    { code: "swim", label: "Swim", sortOrder: 4 },
    { code: "training", label: "Training", sortOrder: 5 },
    { code: "travel", label: "Travel", sortOrder: 6 },
    { code: "loungewear", label: "Loungewear", sortOrder: 7 },
    { code: "beach", label: "Beach", sortOrder: 8 },
    { code: "outdoor", label: "Outdoor", sortOrder: 9 },
    { code: "hosting", label: "Hosting", sortOrder: 10 },
  ])
  console.log("  Seeded use cases (11)")

  await db.insert(audienceGenders).values([
    { code: "mens", label: "Men's", sortOrder: 0 },
    { code: "womens", label: "Women's", sortOrder: 1 },
    { code: "unisex", label: "Unisex", sortOrder: 2 },
  ])
  console.log("  Seeded audience genders (3)")

  await db.insert(audienceAgeGroups).values([
    { code: "adult", label: "Adult", sortOrder: 0 },
    { code: "youth", label: "Youth", sortOrder: 1 },
    { code: "kids", label: "Kids", sortOrder: 2 },
    { code: "toddler", label: "Toddler", sortOrder: 3 },
  ])
  console.log("  Seeded audience age groups (4)")

  const [softgoods] = await db
    .insert(goodsClasses)
    .values([
      { code: "softgoods", label: "Softgoods", sortOrder: 0 },
      { code: "hardgoods", label: "Hardgoods", sortOrder: 1 },
    ])
    .returning()
  const goodsClassRows = await db.select().from(goodsClasses)
  const gcMap = Object.fromEntries(goodsClassRows.map((r) => [r.code, r.id]))
  console.log("  Seeded goods classes (2)")

  await db.insert(sizeScales).values([
    {
      code: "alpha",
      label: "Alpha (S–XXL)",
      sizes: ["S", "M", "L", "XL", "XXL"],
      sortOrder: 0,
    },
    {
      code: "alpha_extended",
      label: "Alpha Extended (XS–XXXL)",
      sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
      sortOrder: 1,
    },
    {
      code: "numeric_waist",
      label: "Numeric Waist (28–38)",
      sizes: ["28", "29", "30", "31", "32", "33", "34", "36", "38"],
      sortOrder: 2,
    },
    {
      code: "one_size",
      label: "One Size",
      sizes: ["OS"],
      sortOrder: 3,
    },
  ])
  console.log("  Seeded size scales (4)")

  // ── Collections (replaces collectionTagEnum) ─────────────────────

  await db.insert(collections).values([
    { code: "core", name: "Core", description: "Evergreen foundational products", sortOrder: 0 },
    { code: "material", name: "Material Story", description: "Material-led seasonal stories", sortOrder: 1 },
    { code: "function", name: "Function", description: "Performance and utility-driven pieces", sortOrder: 2 },
    { code: "origin", name: "Origin", description: "Place and heritage-inspired collections", sortOrder: 3 },
    { code: "womens", name: "Women's", description: "Women's collection", sortOrder: 4 },
    { code: "accessory", name: "Accessory", description: "Accessories and add-ons", sortOrder: 5 },
    { code: "lifestyle", name: "Lifestyle", description: "Home, beach, and lifestyle goods", sortOrder: 6 },
  ])
  console.log("  Seeded collections (7)")

  // ── Product hierarchy ────────────────────────────────────────────

  type SubcategoryDef = {
    code: string
    name: string
    goodsClassDefault?: string
    productTypes: Array<{ code: string; name: string }>
  }

  type CategoryDef = {
    code: string
    name: string
    subcategories: SubcategoryDef[]
  }

  const hierarchy: CategoryDef[] = [
    {
      code: "top",
      name: "Tops",
      subcategories: [
        {
          code: "tees",
          name: "Tees",
          productTypes: [
            { code: "tee_ss", name: "Short-Sleeve Tee" },
            { code: "tee_ls", name: "Long-Sleeve Tee" },
            { code: "tee_heavy", name: "Heavyweight Tee" },
            { code: "henley", name: "Henley" },
            { code: "tank", name: "Tank" },
          ],
        },
        {
          code: "knits_layering",
          name: "Knits & Layering",
          productTypes: [
            { code: "crewneck_sweat", name: "Crewneck Sweatshirt" },
            { code: "hoodie_pullover", name: "Pullover Hoodie" },
            { code: "hoodie_zip", name: "Zip Hoodie" },
            { code: "quarter_zip", name: "Quarter Zip" },
            { code: "sweater", name: "Sweater" },
          ],
        },
        {
          code: "wovens",
          name: "Wovens",
          productTypes: [
            { code: "oxford_button_down", name: "Oxford Button-Down" },
            { code: "flannel", name: "Flannel Shirt" },
            { code: "camp_collar", name: "Camp Collar Shirt" },
            { code: "button_down_ss", name: "Short-Sleeve Button-Down" },
            { code: "overshirt", name: "Overshirt / Shirt Jacket" },
          ],
        },
      ],
    },
    {
      code: "outerwear",
      name: "Outerwear",
      subcategories: [
        {
          code: "outerwear",
          name: "Outerwear",
          productTypes: [
            { code: "chore_jacket", name: "Chore Jacket" },
            { code: "field_jacket", name: "Field Jacket" },
            { code: "waxed_jacket", name: "Waxed Jacket" },
            { code: "vest", name: "Vest" },
            { code: "technical_shell", name: "Technical Shell" },
          ],
        },
      ],
    },
    {
      code: "bottom",
      name: "Bottoms",
      subcategories: [
        {
          code: "pants",
          name: "Pants",
          productTypes: [
            { code: "five_pocket", name: "5-Pocket Pant" },
            { code: "chino", name: "Chino" },
            { code: "denim", name: "Denim" },
            { code: "work_pant", name: "Work Pant" },
            { code: "drawstring_pant", name: "Drawstring Pant" },
          ],
        },
        {
          code: "shorts",
          name: "Shorts",
          productTypes: [
            { code: "tailored_short", name: "Tailored Short" },
            { code: "utility_short", name: "Utility Short" },
            { code: "athletic_short", name: "Athletic Short" },
            { code: "swim_short", name: "Swim Short" },
            { code: "cargo_short", name: "Cargo Short" },
          ],
        },
      ],
    },
    {
      code: "swim_performance",
      name: "Swim & Performance",
      subcategories: [
        {
          code: "swim",
          name: "Swim",
          productTypes: [
            { code: "board_short", name: "Board Short" },
            { code: "volley_short", name: "Volley Swim" },
            { code: "rash_guard", name: "Rash Guard" },
          ],
        },
        {
          code: "performance",
          name: "Performance",
          productTypes: [
            { code: "performance_tee", name: "Performance Tee" },
            { code: "fishing_shirt", name: "Fishing Shirt" },
          ],
        },
      ],
    },
    {
      code: "accessory",
      name: "Accessories",
      subcategories: [
        {
          code: "headwear",
          name: "Headwear",
          productTypes: [
            { code: "dad_cap", name: "Dad Cap" },
            { code: "five_panel", name: "5-Panel Cap" },
            { code: "beanie", name: "Beanie" },
          ],
        },
        {
          code: "socks",
          name: "Socks",
          productTypes: [{ code: "crew_sock", name: "Crew Sock" }],
        },
        {
          code: "bags",
          name: "Bags & Carry",
          productTypes: [{ code: "tote", name: "Tote" }],
        },
        {
          code: "belts",
          name: "Belts",
          productTypes: [{ code: "belt", name: "Belt" }],
        },
      ],
    },
    {
      code: "goods",
      name: "Goods",
      subcategories: [
        {
          code: "home",
          name: "Home",
          goodsClassDefault: "softgoods",
          productTypes: [
            { code: "blanket", name: "Blanket" },
            { code: "throw_blanket", name: "Throw Blanket" },
          ],
        },
        {
          code: "beach",
          name: "Beach",
          goodsClassDefault: "softgoods",
          productTypes: [
            { code: "beach_blanket", name: "Beach Blanket" },
            { code: "towel", name: "Towel" },
          ],
        },
        {
          code: "games",
          name: "Games",
          goodsClassDefault: "hardgoods",
          productTypes: [
            { code: "bocce_set", name: "Bocce Set" },
            { code: "paddle_game", name: "Paddle Game" },
          ],
        },
        {
          code: "gear",
          name: "Gear",
          goodsClassDefault: "hardgoods",
          productTypes: [
            { code: "soft_cooler", name: "Soft Cooler" },
            { code: "dry_bag", name: "Dry Bag" },
          ],
        },
      ],
    },
  ]

  let totalProductTypes = 0

  for (let ci = 0; ci < hierarchy.length; ci++) {
    const cat = hierarchy[ci]!
    const [catRow] = await db
      .insert(productCategories)
      .values({ code: cat.code, name: cat.name, sortOrder: ci })
      .returning()

    for (let si = 0; si < cat.subcategories.length; si++) {
      const sub = cat.subcategories[si]!
      const [subRow] = await db
        .insert(productSubcategories)
        .values({
          code: sub.code,
          name: sub.name,
          categoryId: catRow!.id,
          goodsClassDefaultId: sub.goodsClassDefault
            ? gcMap[sub.goodsClassDefault]
            : null,
          sortOrder: si,
        })
        .returning()

      const ptValues = sub.productTypes.map((pt, pi) => ({
        code: pt.code,
        name: pt.name,
        subcategoryId: subRow!.id,
        sortOrder: pi,
      }))

      if (ptValues.length > 0) {
        await db.insert(productTypes).values(ptValues)
        totalProductTypes += ptValues.length
      }
    }
  }

  console.log(
    `  Seeded ${hierarchy.length} categories, ` +
      `${hierarchy.reduce((s, c) => s + c.subcategories.length, 0)} subcategories, ` +
      `${totalProductTypes} product types`,
  )
  console.log("")
}

// ─── RBAC Seed ──────────────────────────────────────────────────────

const PERMISSION_DEFS: Array<{ code: string; groupKey: string; label: string; description: string }> = [
  // Studio
  { code: "studio.submit", groupKey: "studio", label: "Submit to Studio", description: "Create and submit studio entries" },
  { code: "studio.review", groupKey: "studio", label: "Submit for Review", description: "Submit studio entries for review" },
  { code: "studio.promote", groupKey: "studio", label: "Promote to Concept", description: "Promote studio entries to SKU concepts" },

  // Seasons
  { code: "seasons.manage", groupKey: "seasons", label: "Manage Seasons", description: "Create, update, and lock seasons" },
  { code: "seasons.lock", groupKey: "seasons", label: "Lock Seasons", description: "Lock seasons to prevent further changes" },
  { code: "slots.create", groupKey: "seasons", label: "Create Slots", description: "Add slots to seasons" },
  { code: "slots.fill", groupKey: "seasons", label: "Fill Slots", description: "Fill season slots with concepts" },

  // Colors
  { code: "colors.manage", groupKey: "colors", label: "Manage Colors", description: "Add/remove colors from season palettes" },
  { code: "colors.confirm", groupKey: "colors", label: "Confirm Colors", description: "Confirm proposed season colors" },

  // Concepts
  { code: "concepts.advance", groupKey: "concepts", label: "Advance Concepts", description: "Move concepts through lifecycle stages" },
  { code: "concepts.kill", groupKey: "concepts", label: "Kill Concepts", description: "Retire/kill active concepts" },
  { code: "concepts.override", groupKey: "concepts", label: "Override Concepts", description: "Override concept constraints (fabric, block changes)" },

  // Core Programs
  { code: "core_programs.manage", groupKey: "core_programs", label: "Manage Core Programs", description: "Create and update core programs" },

  // Sourcing
  { code: "sourcing.view", groupKey: "sourcing", label: "View Sourcing", description: "View factory directory and sourcing data" },
  { code: "sourcing.manage", groupKey: "sourcing", label: "Manage Sourcing", description: "Create and manage factory records" },

  // Visibility
  { code: "costing.view", groupKey: "visibility", label: "View Costing", description: "View factory costing and pricing" },
  { code: "margins.view", groupKey: "visibility", label: "View Margins", description: "View margin data and targets" },
]

const SYSTEM_ROLE_DEFS: Array<{
  slug: string
  name: string
  description: string
  permissionCodes: string[]
}> = [
  {
    slug: "founder",
    name: "Founder",
    description: "Full access to all product lifecycle capabilities",
    permissionCodes: PERMISSION_DEFS.map((p) => p.code),
  },
  {
    slug: "product-lead",
    name: "Product Lead",
    description: "Manages seasons, concepts, and product lifecycle (except kill/override)",
    permissionCodes: PERMISSION_DEFS
      .map((p) => p.code)
      .filter((c) => c !== "concepts.kill" && c !== "concepts.override"),
  },
  {
    slug: "studio-contributor",
    name: "Studio Contributor",
    description: "Can create and submit studio entries for review",
    permissionCodes: ["studio.submit", "studio.review"],
  },
  {
    slug: "external-designer",
    name: "External Designer",
    description: "External collaborator who can submit to the studio",
    permissionCodes: ["studio.submit"],
  },
  {
    slug: "factory-partner",
    name: "Factory Partner",
    description: "Factory partner with view access to sourcing and costing",
    permissionCodes: ["sourcing.view", "costing.view"],
  },
]

const PRODUCT_ROLE_TO_SLUG: Record<string, string> = {
  founder: "founder",
  product_lead: "product-lead",
  studio_contributor: "studio-contributor",
  external_designer: "external-designer",
  factory_partner: "factory-partner",
}

export async function seedRbac() {
  console.log("Seeding RBAC permissions and roles...\n")

  // 1. Upsert permissions
  const existingPerms = await db.select().from(permissions)
  const existingCodes = new Set(existingPerms.map((p) => p.code))

  const newPerms = PERMISSION_DEFS.filter((p) => !existingCodes.has(p.code))
  if (newPerms.length > 0) {
    await db.insert(permissions).values(newPerms)
    console.log(`  Created ${newPerms.length} permissions`)
  } else {
    console.log(`  All ${PERMISSION_DEFS.length} permissions already exist`)
  }

  // 2. Upsert system roles
  for (const def of SYSTEM_ROLE_DEFS) {
    let role = await db.query.roles.findFirst({
      where: (r, { eq: e }) => e(r.slug, def.slug),
    })

    if (!role) {
      const [created] = await db
        .insert(roles)
        .values({
          name: def.name,
          slug: def.slug,
          description: def.description,
          isSystem: true,
        })
        .returning()
      role = created!
      console.log(`  Created system role: ${def.name}`)
    } else {
      console.log(`  Found existing role: ${def.name}`)
    }

    // Sync permissions for this role
    const existingRolePerms = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, role.id))
    const existingPermCodes = new Set(existingRolePerms.map((rp) => rp.permissionCode))

    const toAdd = def.permissionCodes.filter((c) => !existingPermCodes.has(c))
    if (toAdd.length > 0) {
      await db.insert(rolePermissions).values(
        toAdd.map((code) => ({ roleId: role!.id, permissionCode: code })),
      )
      console.log(`    Added ${toAdd.length} permissions to ${def.name}`)
    }
  }

  // 3. Migrate existing product_role values to user_roles
  const allUsers = await db.select().from(users)
  const roleMap = new Map<string, string>()

  const allRoles = await db.select().from(roles)
  for (const r of allRoles) {
    roleMap.set(r.slug, r.id)
  }

  let migratedCount = 0
  for (const user of allUsers) {
    if (!user.productRole) continue

    const roleSlug = PRODUCT_ROLE_TO_SLUG[user.productRole]
    if (!roleSlug) continue

    const roleId = roleMap.get(roleSlug)
    if (!roleId) continue

    const existing = await db.query.userRoles.findFirst({
      where: (ur, { eq: e, and: a }) =>
        a(e(ur.userId, user.id), e(ur.roleId, roleId)),
    })

    if (!existing) {
      await db.insert(userRoles).values({ userId: user.id, roleId })
      migratedCount++
    }
  }

  if (migratedCount > 0) {
    console.log(`  Migrated ${migratedCount} users from product_role to user_roles`)
  }

  console.log("")
}

export async function seed() {
  console.log("Seeding brand documents...\n")

  for (const def of docsToSeed) {
    // Upsert document
    let doc = await db.query.documents.findFirst({
      where: (d, { eq: e }) => e(d.slug, def.slug),
    })

    if (!doc) {
      const [created] = await db
        .insert(documents)
        .values({
          slug: def.slug,
          title: def.title,
          section: "docs",
          status: "published",
          ownerTeam: "brand",
          visibleToInternal: true,
          visibleToPartners: def.visibleToPartners ?? false,
          visibleToVendors: false,
        })
        .returning()
      doc = created!
      console.log(`  Created document: ${def.title}`)
    } else {
      console.log(`  Found existing document: ${def.title}`)
    }

    // Replace blocks (clean reseed)
    await db
      .delete(documentBlocks)
      .where(eq(documentBlocks.documentId, doc.id))

    // Insert all blocks
    await db.insert(documentBlocks).values(
      def.blocks.map((block, i) => ({
        documentId: doc!.id,
        type: block.type as any,
        contentJson: block.contentJson,
        sortOrder: i,
        visibleToInternal: true,
        visibleToPartners: def.visibleToPartners ?? false,
        visibleToVendors: false,
      })),
    )

    console.log(`  Inserted ${def.blocks.length} blocks\n`)
  }

  await seedSeasons()
  await seedCorePrograms()
  await seedProductTaxonomy()
  await seedRbac()

  console.log("Done!")
}
