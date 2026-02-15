/**
 * Seed script — populates the portal database with brand documents.
 *
 * Run: DATABASE_URL=postgresql://Matt@localhost:5432/satuit_portal npx tsx src/seed.ts
 * Or:  pnpm db:seed  (with DATABASE_URL in env)
 *
 * Idempotent: re-running replaces existing block content.
 */
import { db } from "./client"
import { documents, documentBlocks } from "./schema"
import { eq } from "drizzle-orm"

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

async function seed() {
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

  console.log("Done!")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
