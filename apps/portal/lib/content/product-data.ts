// ─── Product Intelligence — Source of Truth Data ─────────────────────
//
// SATUIT V1 LAUNCH — Canonical content layer.
// All collections, garments, materials, and metadata live here.
// When migrated to database, this file becomes the seed.
// ─────────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────

export type GarmentRole = "base" | "mid" | "shell"
export type GarmentStatus = "sampling" | "production" | "live"
export type Seasonality = "core" | "seasonal"

export interface MaterialSpec {
  id: string
  title: string
  metric: string
  value: string
  description: string
  standard: string
}

export interface AssetLink {
  label: string
  href: string
  type: "drive" | "figma" | "dam" | "pdf" | "csv" | "external"
  category: "campaign" | "studio" | "production" | "design"
}

export interface LockedDecision {
  decision: string
  rationale: string
}

export interface LineageEntry {
  version: string
  date: string
  changes: string[]
}

export interface AnnotationPoint {
  id: string
  x: number
  y: number
  label: string
  note: string
}

export interface TactileSignature {
  fabricName: string
  composition: string
  weight: string
  finish: string
  behavior: string
  saltTest: string
}

export interface BosTest {
  question: string
  answer: string
}

// --- Production tab ---
export interface SourcingCard {
  mill?: string
  fabricOrigin?: string
  certifications?: string[]
}

// --- Assets tab ---
export interface CopyBlock {
  short: string
  long: string
}

export interface ColorSwatch {
  name: string
  hex: string
  pantone?: string
  note?: string
}

export interface Garment {
  slug: string
  name: string
  sku: string
  role: GarmentRole
  status: GarmentStatus
  seasonality: Seasonality
  description: string
  /** Retail price */
  price?: string
  /** The "BOS" Test — how we judge this garment */
  bosTest?: BosTest
  techFlats?: { front: string; back: string }
  colorways?: ColorSwatch[]
  annotations: AnnotationPoint[]
  tactile: TactileSignature
  lockedDecisions: LockedDecision[]
  lineage: LineageEntry[]
  executionLinks: AssetLink[]
  // --- Production tab ---
  sourcing?: SourcingCard
  // --- Assets tab ---
  imageBank?: AssetLink[]
  copyBlocks?: CopyBlock
  contextGuide?: string
  // --- Log tab ---
  inventoryStatus?: string
  performanceNotes?: string[]
}

export interface DesignCriterion {
  label: string
  test: string
}

export interface Scenario {
  title: string
  description: string
}

export interface VisualDirective {
  label: string
  description: string
}

export interface PaletteEntry {
  name: string
  role: string
  description: string
}

export interface EnvironmentalContext {
  mandate?: string
  scenarios?: string
  scenarioList?: Scenario[]
  visualLanguage?: VisualDirective[]
  palette?: string
  paletteEntries?: PaletteEntry[]
}

export interface TrimStandard {
  label: string
  spec: string
}

export interface Collection {
  slug: string
  /** Taxonomy code — links this content to the taxonomy `collections` table */
  taxonomyCode: string
  name: string
  id: string
  leadDesigner: string
  revisionDate: string
  status: GarmentStatus
  intent: string
  judgeOfSuccess: string
  designCriteria?: DesignCriterion[]
  systemRole?: string
  keyVerb?: string
  designMandate?: string
  brandingMandate?: string
  trimStandards?: TrimStandard[]
  lineup?: string
  environmentalContext?: EnvironmentalContext
  antiSpec: string[]
  assets: AssetLink[]
  operationalLinks: AssetLink[]
  garments: Garment[]
}

// ─── System Pillars (The "BOS" Filter) ───────────────────────────────

export interface SystemPillar {
  id: string
  title: string
  test: string
  focus: string
}

export const systemPillars: SystemPillar[] = [
  {
    id: "silent-sell",
    title: "The Silent Sell",
    test: "Would this piece sell if the customer never learned our story?",
    focus: "Quality",
  },
  {
    id: "boring-best-way",
    title: "Boring in the Best Way",
    test: "Does it feel timeless or just trendy?",
    focus: "Longevity",
  },
  {
    id: "fabric-first",
    title: "Fabric First",
    test: "Does the material justify the price before we even speak?",
    focus: "Craft",
  },
]

// ─── Material Compass (kept for reference) ───────────────────────────

export const materialCompass: MaterialSpec[] = []

// ─── System Roles ────────────────────────────────────────────────────

export interface SystemRole {
  id: string
  label: string
  title: string
  description: string
  examples: string
}

export const systemRoles: SystemRole[] = []

// ─── Role display map ────────────────────────────────────────────────

export const roleDisplayMap: Record<GarmentRole, string> = {
  base: "Foundation",
  mid: "Insulation",
  shell: "Protection",
}

// ─── Manifesto ───────────────────────────────────────────────────────

export const manifesto = {
  title: "Built for the Harbor, Made for the Neighbor.",
  body: "This is a catalog of solutions, not trends. We design for the specific realities of life where the pavement meets the water. Our pieces are intended to be the first thing you grab and the last thing you replace. If it isn't easy to wear, built to last, and better after a season of salt air, it isn't Satuit.",
  principles: [] as string[],
}

// ─── Collections — V1 Launch ─────────────────────────────────────────
// 16 SKUs across 4 pillars.
//
// Numbering (user-facing):
//   01 Essential Tee · 02 Essential Heavy Tee · 03 Core Pullover Hoodie
//   04 Core Crewneck · 05 Material Tee · 06 Material LS Tee
//   07 Material Fleece Crew · 08 Material Hoodie · 09 Origin Graphic Tee
//   10 Origin Hoodie · 11 Origin Crewneck · 12 Performance Swim Hoodie
//   13 Women's Short · 14 Tailored Swim Short
//   15 Women's Essential Tee · 16 Women's Essential LS Tee
// ─────────────────────────────────────────────────────────────────────

export const collections: Collection[] = [
  // ═══════════════════════════════════════════════════════════════════
  // 01. CORE ESSENTIALS — 8 SKUs
  // ═══════════════════════════════════════════════════════════════════
  {
    slug: "core-essentials",
    taxonomyCode: "core",
    name: "Core Essentials",
    id: "CE-V1",
    leadDesigner: "M. Sullivan",
    revisionDate: "2026-01-15",
    status: "production",
    designMandate: "Repeatable / Calm / Timeless",
    brandingMandate: "Subtle / Structural",
    systemRole: "The Brand Spine",
    lineup:
      "Essential Tee, Essential Heavy Tee, Core Pullover Hoodie, Core Crewneck Sweatshirt, Essential Long Sleeve Tee, Canvas Cap, Women's Essential Tee, Women's Essential Long Sleeve Tee.",
    intent:
      "The pieces that define Satuit when everything else is stripped away. Core Essentials are designed to be the default choice — the first thing grabbed from the drawer.",
    judgeOfSuccess:
      "A customer buys one, wears it for three months, and orders the same thing in two more colors without looking at a single product page.",
    trimStandards: [
      { label: "Neck Tape", spec: "12mm Natural/Off-White (Universal)." },
      { label: "Labeling", spec: "Printed main label (Symbol only)." },
      { label: "Stitching", spec: "No contrast; no accent thread on exterior." },
    ],
    antiSpec: [
      "Graphic prints or screen-printed branding of any kind.",
      "Synthetic performance fabrics — this is cotton territory.",
      "Slim-fit or fashion-forward silhouettes. Relaxed is the only language.",
      "Seasonal colorways that won't exist next year.",
      "Visible external labels that suggest 'premium' positioning.",
    ],
    assets: [
      { label: "Core Essentials — Campaign Brief SS26", href: "#", type: "drive", category: "campaign" },
      { label: "Figma — CE Product Page Layouts", href: "#", type: "figma", category: "design" },
    ],
    operationalLinks: [
      { label: "Tech Pack — Core Essentials V1", href: "/pack/launch-v1/cover", type: "external", category: "production" },
      { label: "Measurement Spec — Tees", href: "/pack/launch-v1/appendix-b-measurements/tees", type: "external", category: "production" },
    ],
    garments: [
      // ─── 01 — Essential Tee ──────────────────────────────────────
      {
        slug: "essential-tee",
        name: "Essential Tee",
        sku: "CE-TEE-001",
        role: "base",
        status: "production",
        seasonality: "core",
        price: "$42",
        techFlats: {
          front: "/product/essential-tee/flats/essential-tee-flat-front.svg",
          back: "/product/essential-tee/flats/essential-tee-flat-back.svg",
        },
        colorways: [
          { name: "Satuit Navy", hex: "#0A1E36", pantone: "289 C", note: "The 'Midnight' anchor. Deep, industrial, and premium." },
          { name: "Canvas", hex: "#F0EFEA", pantone: "Warm Gray 1 C", note: "The 'Stone' neutral. Avoids looking like a cheap white undershirt." },
        ],
        description:
          "The 6.5 oz modern classic. This is the entry point to the Satuit system — a garment built to be invisible. It doesn't announce itself. It just fits, washes well, and gets better with every wear. The silhouette is relaxed without being oversized, and the weight is substantial enough to drape cleanly without feeling heavy.",
        bosTest: {
          question: "Would this piece sell if the customer never learned our story?",
          answer: "Yes. The hand-feel and weight speak for themselves. At 6.5 oz, it sits in the sweet spot between a cheap promotional tee and an overwrought 'luxury' blank.",
        },
        annotations: [
          { id: "collar", x: 50, y: 8, label: "Ribbed Collar", note: "1×1 rib, 2cm width. High-recovery knit — won't bacon-neck after a season of wear." },
          { id: "shoulder", x: 25, y: 18, label: "Relaxed Shoulder", note: "Natural shoulder placement. No drop, no structure — the fabric does the work." },
          { id: "pocket", x: 30, y: 40, label: "Chest Pocket", note: "Single-welt, 12cm × 10cm. Positioned for visual weight. Bar-tacked at stress points." },
          { id: "hem", x: 50, y: 92, label: "Hem Finish", note: "Double-needle coverstitch, 2cm width. Slight curve at side seams for untucked wear." },
        ],
        tactile: {
          fabricName: "Satuit Standard Cotton",
          composition: "100% Combed Ring-Spun Cotton",
          weight: "6.5 oz (190 GSM)",
          finish: "Garment-dyed, enzyme-washed",
          behavior: "Soft, broken-in hand from day one. Light enough for summer layering, substantial enough to hold its shape. Develops character with wear — subtle fading at seams, softening at joints.",
          saltTest: "Standard 3.5% saline protocol. No color migration, no hand-feel degradation after 4-hour immersion.",
        },
        lockedDecisions: [
          { decision: "No external branding.", rationale: "Woven label inside the collar only. Hem tag is 1cm × 2cm, tone-on-tone." },
          { decision: "Relaxed fit only.", rationale: "One silhouette. It's the right one. Fit variants dilute the point of view." },
          { decision: "Garment-dyed, never piece-dyed.", rationale: "Each piece develops individual character. Two tees in the same color will be siblings, not clones." },
        ],
        lineage: [
          { version: "v1.0", date: "2025-08-01", changes: ["Initial spec. 6.5 oz body, relaxed silhouette.", "First sampling with production partner."] },
          { version: "v1.2", date: "2026-01-15", changes: ["Collar rib tightened for recovery.", "Enzyme wash adjusted for softer day-one hand.", "Approved for production."] },
        ],
        executionLinks: [
          { label: "Tech Pack — CE-TEE-001", href: "#", type: "pdf", category: "production" },
          { label: "Measurement Chart", href: "#", type: "csv", category: "production" },
        ],
      },

      // ─── 02 — Essential Heavy Tee ────────────────────────────────
      {
        slug: "essential-heavy-tee",
        name: "Essential Heavy Tee",
        sku: "CE-TEE-002",
        role: "base",
        status: "production",
        seasonality: "core",
        price: "$48",
        techFlats: {
          front: "/product/essential-heavy-tee/flats/essential-heavy-tee-flat-front.svg",
          back: "/product/essential-heavy-tee/flats/essential-heavy-tee-flat-back.svg",
        },
        colorways: [
          { name: "Ecru", hex: "#E2DFD2", pantone: "7527 C", note: "Slightly more 'raw' and 'unbleached' than Canvas to signal the 8.5 oz weight." },
          { name: "Faded Navy", hex: "#323E4F", pantone: "432 C", note: "Looks like a hull that's seen a full season of salt and sun." },
        ],
        description:
          "For the person who wants a shirt with \"heft.\" This isn't just a layer; it's a piece of equipment. The 8.5 oz fabric holds a crisp silhouette that doesn't cling, making it the ideal choice for high-humidity days or as a standalone top-layer in the shoulder seasons.",
        bosTest: {
          question: "Does the fabric do all the talking without explanation?",
          answer: "Yes. The density of the drape is immediately visible. It looks and feels substantial enough to justify the $6 up-charge from the standard weight without a single word of marketing.",
        },
        annotations: [
          { id: "collar", x: 50, y: 8, label: "High-Recovery Rib", note: "Won't bacon-neck after a season of wear. 1×1 rib, reinforced — shape comes from knit density, not stretch." },
          { id: "shoulder", x: 25, y: 18, label: "Broader Shoulder", note: "Slightly wider than the Essential Tee. Designed for structured drape — stands off the body, doesn't cling." },
          { id: "side-seam", x: 80, y: 55, label: "Reinforced Side Seam", note: "Double-tacked at stress points. Built for the wash, not the dry cleaner." },
          { id: "hem", x: 50, y: 92, label: "The Satuit Zig-Zag", note: "A nod to sail-repair — strength where it counts. The hem stitch is a functional signature." },
        ],
        tactile: {
          fabricName: "Satuit Heavy Cotton",
          composition: "100% Organic Combed Cotton",
          weight: "8.5 oz (280 GSM)",
          finish: "Pigment-dyed, enzyme-washed",
          behavior: "Dense, dry, premium. Holds its silhouette and improves with every wash. Enough structure to stand off the body in high humidity.",
          saltTest: "Expect 3% shrink on first wash. Fabric settles and softens at the joints, becoming unique to the wearer. Pigment-dyed to fade at seams over years, not months.",
        },
        lockedDecisions: [
          { decision: "Slightly relaxed fit with broader shoulder.", rationale: "Designed for Structured Drape — stands off the body, not against it." },
          { decision: "Reinforced hidden shoulder seams.", rationale: "Longevity over aesthetics. The reinforcement is invisible but extends garment life significantly." },
          { decision: "Back-collar micro flag.", rationale: "No exterior markings to differentiate weight from the Essential Tee. The fabric speaks." },
          { decision: "No stretch fibers.", rationale: "No Lycra. No Spandex. Knit density provides shape retention without losing soul over time." },
        ],
        lineage: [
          { version: "v1.0", date: "2025-06-15", changes: ["Initial spec. 8 oz body, standard shoulder.", "First sampling."] },
          { version: "v1.1", date: "2025-09-01", changes: ["Increased to 8.5 oz after wear-testing.", "Shoulder seam reinforcement added.", "Switched to pigment-dye for long-term patina."] },
          { version: "v1.2", date: "2026-01-15", changes: ["Refined neck ribbing for improved recovery.", "Hem stitch finalized (Satuit Zig-Zag).", "Approved for production."] },
        ],
        executionLinks: [
          { label: "Measurement_Table_V1.2.pdf", href: "#", type: "pdf", category: "production" },
          { label: "Internal_Label_Placement_Guide.png", href: "#", type: "dam", category: "design" },
          { label: "Cotton_Origin_Cert_2026.pdf", href: "#", type: "pdf", category: "production" },
          { label: "Studio_Flats_Package.zip", href: "#", type: "dam", category: "studio" },
        ],
      },

      // ─── 03 — Core Pullover Hoodie ───────────────────────────────
      {
        slug: "core-hoodie",
        name: "Core Pullover Hoodie",
        sku: "CE-HOD-001",
        role: "mid",
        status: "production",
        seasonality: "core",
        price: "$88",
        techFlats: {
          front: "/product/core-hoodie/flats/core-hoodie-flat-front.svg",
          back: "/product/core-hoodie/flats/core-hoodie-flat-back.svg",
        },
        colorways: [
          { name: "Satuit Navy", hex: "#0A1E36", pantone: "289 C", note: "The 'Midnight' anchor." },
          { name: "Washed Charcoal", hex: "#3C3C3C", pantone: "446 C", note: "The color of iron and harbor pilings. Softens the 'Supply' look." },
        ],
        description:
          "A sweatshirt built like a garment, not a gym uniform. We focused on a tailored shoulder and a clean body to ensure it layers perfectly under a shell. The 14 oz fleece provides the warmth needed for a New England \"Sea Smoke\" morning without the bulk of novelty shaping.",
        bosTest: {
          question: "Would this still feel right in 5 years?",
          answer: "Yes. By eliminating \"drop shoulders\" and oversized silhouettes, we've created a permanent shape that ignores the trend cycle.",
        },
        annotations: [
          { id: "hood", x: 50, y: 5, label: "Functional Hood", note: "Three-panel construction with custom drawcord. Sits flat when down, covers fully when up." },
          { id: "shoulder", x: 25, y: 18, label: "Tailored Shoulder", note: "No drop shoulder. Natural placement that layers under a shell without bunching." },
          { id: "kangaroo", x: 50, y: 55, label: "Kangaroo Pocket", note: "Reinforced entry points. Bar-tacked corners. Sized for hands, not storage." },
          { id: "cuff", x: 15, y: 80, label: "Ribbed Cuffs", note: "2×1 rib, 7cm width. Tight enough to hold, loose enough to push up." },
        ],
        tactile: {
          fabricName: "Satuit Brushed Fleece",
          composition: "80% Cotton / 20% Recycled Polyester",
          weight: "14 oz (400 GSM)",
          finish: "Piece-dyed, garment-washed, brushed interior",
          behavior: "Heavyweight fleece with a brushed interior that softens with each wash. Smooth, dense exterior face. Feels like the hoodie equivalent of a well-worn work jacket.",
          saltTest: "Pilling resistance Grade 4+ after 10,000 Martindale cycles. No color shift under salt exposure. 100+ wash cycles.",
        },
        lockedDecisions: [
          { decision: "Tailored shoulders — no drop.", rationale: "Drop shoulder reads 'streetwear.' This is utility. Natural shoulder layers under a shell without bunching." },
          { decision: "No front logo.", rationale: "The quality of construction is the only external signature." },
          { decision: "Custom drawstrings with unbranded metal aglets.", rationale: "Clean hardware. No branding on functional elements." },
          { decision: "Side-seam micro flag.", rationale: "Single point of external branding. Tone-on-tone, 1cm × 2cm." },
        ],
        lineage: [
          { version: "v1.0", date: "2025-10-01", changes: ["Initial spec. 12 oz body, set-in sleeves.", "Increased to 14 oz for substantial hand.", "Approved for production."] },
        ],
        executionLinks: [
          { label: "Tech Pack — CE-HOD-001", href: "#", type: "pdf", category: "production" },
        ],
      },

      // ─── 04 — Core Crewneck Sweatshirt ───────────────────────────
      {
        slug: "core-crewneck",
        name: "Core Crewneck Sweatshirt",
        sku: "CE-CRW-001",
        role: "mid",
        status: "production",
        seasonality: "core",
        price: "$78",
        techFlats: {
          front: "/product/core-crewneck/flats/core-crewneck-flat-front.svg",
          back: "/product/core-crewneck/flats/core-crewneck-flat-back.svg",
        },
        colorways: [
          { name: "Canvas", hex: "#F0EFEA", pantone: "Warm Gray 1 C", note: "The 'Stone' neutral." },
          { name: "Washed Charcoal", hex: "#3C3C3C", pantone: "446 C", note: "The color of iron and harbor pilings." },
        ],
        description:
          "The definition of \"Boring in the best way.\" This is the reliable, no-nonsense sweatshirt that thrives on repetition. We stripped away the hood and drawstrings to leave only the essential structure and warmth of our signature fleece.",
        bosTest: {
          question: "Does it feel useful, not performative?",
          answer: "Yes. It is a tool for warmth. Its value is found in the reinforced cuffs and the weight of the fabric, not in a graphic or a \"fit\" gimmick.",
        },
        annotations: [
          { id: "neckline", x: 50, y: 8, label: "Crew Neckline", note: "2×1 rib, 3cm width. Set slightly below natural neckline for layering over collared shirts." },
          { id: "body", x: 50, y: 45, label: "Brushed Interior", note: "Same fleece as the hoodie. Brushed loop interior, smooth dense face. Three-season weight." },
        ],
        tactile: {
          fabricName: "Satuit Brushed Fleece",
          composition: "80% Cotton / 20% Recycled Polyester",
          weight: "14 oz (400 GSM)",
          finish: "Piece-dyed, garment-washed, brushed interior",
          behavior: "Identical hand to the Core Hoodie. Structured but not rigid. The 'boring in the best way' piece — it does nothing wrong and everything right.",
          saltTest: "Same protocol as CE-HOD-001. Pilling Grade 4+, 100+ wash cycles.",
        },
        lockedDecisions: [
          { decision: "Classic structured fit — no raglan.", rationale: "Set-in sleeves create a cleaner shoulder line and pair better under jackets." },
          { decision: "No drawstrings.", rationale: "This is a crewneck. Every element that doesn't serve a purpose is removed." },
          { decision: "Side-seam micro flag.", rationale: "Single point of external branding. Consistent with Core Essentials trim standard." },
          { decision: "Universal 12mm Natural neck tape.", rationale: "Locked global trim. Consistent across every Core Essential." },
        ],
        lineage: [
          { version: "v1.0", date: "2025-10-01", changes: ["Initial spec. Same 14 oz fleece body as hoodie.", "Approved for production alongside CE-HOD-001."] },
        ],
        executionLinks: [
          { label: "Tech Pack — CE-CRW-001", href: "#", type: "pdf", category: "production" },
        ],
      },

      // ─── 05 — Essential Long Sleeve Tee ────────────────────────────
      {
        slug: "essential-long-sleeve-tee",
        name: "Essential Long Sleeve Tee",
        sku: "CE-LST-001",
        role: "base",
        status: "production",
        seasonality: "core",
        price: "$54–$58",
        techFlats: {
          front: "/product/essential-long-sleeve-tee/flats/essential-long-sleeve-tee-flat-front.svg",
          back: "/product/essential-long-sleeve-tee/flats/essential-long-sleeve-tee-flat-back.svg",
        },
        colorways: [
          { name: "Satuit Navy", hex: "#0A1E36", pantone: "289 C" },
          { name: "Canvas", hex: "#F0EFEA", pantone: "Warm Gray 1 C" },
          { name: "Faded Slate", hex: "#5B6770", pantone: "7545 C", note: "A blue-toned gray. Bridges the gap between Navy and Granite." },
        ],
        description:
          "A long sleeve cotton tee is not special — it's necessary. Cool mornings, wind off the water, shoulder seasons, dock nights. This is the transitional uniform layer: same body as the Essential Tee, in a slightly heavier 7–8 oz cotton jersey that earns its place through sheer utility.",
        bosTest: {
          question: "Would this piece sell if the customer never learned our story?",
          answer: "Yes. It's a long sleeve cotton tee that fits right and weighs right. The need is the pitch.",
        },
        annotations: [
          { id: "collar", x: 50, y: 8, label: "Ribbed Collar", note: "Same 1×1 rib as the Essential Tee. Consistent collar system across the Core line." },
          { id: "cuff", x: 15, y: 80, label: "Ribbed Cuff", note: "1×1 rib, snug without constriction. Pushes up cleanly, holds its shape." },
          { id: "body", x: 50, y: 45, label: "Essential Body", note: "Same relaxed silhouette as CE-TEE-001. Slightly heavier jersey for three-season wear." },
        ],
        tactile: {
          fabricName: "Satuit Standard Cotton (Heavy)",
          composition: "100% Combed Ring-Spun Cotton",
          weight: "7–8 oz (200–230 GSM)",
          finish: "Garment-dyed, enzyme-washed",
          behavior: "Same broken-in hand as the Essential Tee, with more substance. Heavy enough to cut wind off the water, light enough to layer under a hoodie without bulk.",
          saltTest: "Standard 3.5% saline protocol. Same performance as CE-TEE-001.",
        },
        lockedDecisions: [
          { decision: "Same body as Essential Tee.", rationale: "This is a sleeve extension, not a new silhouette. One fit, two lengths." },
          { decision: "No exterior branding.", rationale: "Consistent with Core Essentials trim standard. Woven label inside collar only." },
          { decision: "Garment-dyed, never piece-dyed.", rationale: "Same character development as the Essential Tee. Siblings, not clones." },
          { decision: "Tight colorway: Navy, Off-White, Faded Slate.", rationale: "Three colors that work year-round. No seasonal rotation." },
        ],
        lineage: [
          { version: "v1.0", date: "2026-02-10", changes: ["Repositioned from Material Collection to Core Essentials.", "Fabric shifted from long-staple blend to standard cotton jersey at 7–8 oz.", "Renamed from Material LS Tee to Essential Long Sleeve Tee.", "Approved for production."] },
        ],
        executionLinks: [
          { label: "Tech Pack — CE-LST-001", href: "#", type: "pdf", category: "production" },
        ],
      },

      // ─── 06 — Canvas Cap ──────────────────────────────────────────
      {
        slug: "canvas-cap",
        name: "Canvas Cap",
        sku: "CE-CAP-001",
        role: "base",
        status: "sampling",
        seasonality: "core",
        price: "$38",
        techFlats: {
          front: "/product/canvas-cap/flats/canvas-cap-flat-front.svg",
          back: "/product/canvas-cap/flats/canvas-cap-flat-back.svg",
        },
        colorways: [
          { name: "Satuit Navy", hex: "#0A1E36", pantone: "289 C" },
          { name: "Canvas", hex: "#F0EFEA", pantone: "Warm Gray 1 C" },
          { name: "Faded Slate", hex: "#5B6770", pantone: "7545 C" },
        ],
        description:
          "The canvas cap is not a logo hat. It is the most wearable entry point into the brand — built to finish the uniform, soften the system visually, and add material depth without graphics. Heavy canvas, matte, dry hand. The hat you grab without thinking, not the hat that announces where you vacation.",
        bosTest: {
          question: "Would this piece sell if the customer never learned our story?",
          answer: "Yes. It's a well-made unstructured cap in heavy canvas. The texture and weight do the work. No logo required.",
        },
        annotations: [
          { id: "panel", x: 50, y: 30, label: "Unstructured 6-Panel", note: "No buckram. The cap molds to the head over time. Broken-in from day one." },
          { id: "brim", x: 50, y: 75, label: "Slight Curve Brim", note: "Pre-curved, not flat. Reads 'worn' rather than 'collected.'" },
          { id: "mark", x: 70, y: 25, label: "Minimal Mark", note: "Small-scale tonal embroidery. Discovered, not displayed. No loud thread, no contrast." },
        ],
        tactile: {
          fabricName: "Satuit Heavy Canvas",
          composition: "100% Cotton Canvas",
          weight: "12 oz (340 GSM)",
          finish: "Garment-washed, enzyme-softened",
          behavior: "Matte, dry hand. Stiff enough to hold shape, soft enough to feel broken in immediately. Develops deep character with wear — unique crease patterns, salt fade at the brim.",
          saltTest: "Standard saline protocol. Canvas resists degradation. Color fades predictably at stress points (brim, crown).",
        },
        lockedDecisions: [
          { decision: "Minimal mark only — no loud embroidery.", rationale: "This is a texture piece, not a statement piece. If it starts carrying loud branding, you're drifting." },
          { decision: "Unstructured construction.", rationale: "No buckram, no rigid panels. The cap should look like it's been worn for a year on day one." },
          { decision: "Tight colorway: Navy, Off-White, Faded Slate.", rationale: "Same core palette as the Essential line. No seasonal color pops." },
          { decision: "Always merchandised with Core Essentials.", rationale: "Never styled solo as a hero product. Shown worn, slightly broken in." },
        ],
        lineage: [
          { version: "v1.0", date: "2026-02-10", changes: ["Initial spec. Heavy canvas sourcing confirmed.", "Unstructured 6-panel, minimal tonal mark.", "In sampling."] },
        ],
        executionLinks: [
          { label: "Tech Pack — CE-CAP-001", href: "#", type: "pdf", category: "production" },
        ],
      },

      // ─── 07 — Women's Essential Tee ─────────────────────────────────
      {
        slug: "womens-essential-tee",
        name: "Women's Essential Tee",
        sku: "CE-WTEE-001",
        role: "base",
        status: "sampling",
        seasonality: "core",
        price: "$42",
        techFlats: {
          front: "/product/womens-essential-tee/flats/womens-essential-tee-flat-front.svg",
          back: "/product/womens-essential-tee/flats/womens-essential-tee-flat-back.svg",
        },
        colorways: [
          { name: "Satuit Navy", hex: "#0A1E36", pantone: "289 C", note: "The 'Midnight' anchor. Deep, industrial, and premium." },
          { name: "Canvas", hex: "#F0EFEA", pantone: "Warm Gray 1 C", note: "The 'Stone' neutral. Avoids looking like a cheap white undershirt." },
        ],
        description:
          "The women's entry point to the Satuit system. Same 6.5 oz cotton, same garment-dyed character, same philosophy — built to be invisible. The silhouette is re-drafted for a women's fit: slightly narrower shoulder, tapered body, and a shorter overall length that works untucked without excess fabric.",
        bosTest: {
          question: "Would this piece sell if the customer never learned our story?",
          answer: "Yes. The hand-feel and weight speak for themselves. The fit is the only variable — and it's the right one.",
        },
        annotations: [
          { id: "collar", x: 50, y: 8, label: "Ribbed Collar", note: "1×1 rib, 2cm width. Same high-recovery knit as the men's Essential Tee." },
          { id: "shoulder", x: 25, y: 18, label: "Narrower Shoulder", note: "Re-drafted for women's fit. Natural placement — no drop, slightly narrower than CE-TEE-001." },
          { id: "body", x: 50, y: 45, label: "Tapered Body", note: "Relaxed but not oversized. Subtle taper through the torso for a clean drape without cling." },
          { id: "hem", x: 50, y: 92, label: "Shortened Hem", note: "Double-needle coverstitch, 2cm width. Shorter overall length — hits at the hip for untucked wear." },
        ],
        tactile: {
          fabricName: "Satuit Standard Cotton",
          composition: "100% Combed Ring-Spun Cotton",
          weight: "6.5 oz (190 GSM)",
          finish: "Garment-dyed, enzyme-washed",
          behavior: "Identical fabric to CE-TEE-001. Soft, broken-in hand from day one. Same character development — subtle fading at seams, softening at joints.",
          saltTest: "Standard 3.5% saline protocol. Same performance as CE-TEE-001.",
        },
        lockedDecisions: [
          { decision: "No external branding.", rationale: "Consistent with Core Essentials trim standard. Woven label inside collar only." },
          { decision: "Re-drafted fit, not 'shrunk-down men's.'", rationale: "The pattern is built from scratch for a women's body. Not a size-down of the men's block." },
          { decision: "Garment-dyed, never piece-dyed.", rationale: "Same character development as the men's Essential Tee. Siblings, not clones." },
          { decision: "Same colorway as CE-TEE-001.", rationale: "Core palette consistency. No gender-specific color additions." },
        ],
        lineage: [
          { version: "v1.0", date: "2026-02-11", changes: ["Initial spec. Women's fit re-drafted from CE-TEE-001 base.", "Same 6.5 oz body, same trim standards.", "In sampling."] },
        ],
        executionLinks: [
          { label: "Tech Pack — CE-WTEE-001", href: "#", type: "pdf", category: "production" },
        ],
      },

      // ─── 08 — Women's Essential Long Sleeve Tee ────────────────────
      {
        slug: "womens-essential-long-sleeve-tee",
        name: "Women's Essential Long Sleeve Tee",
        sku: "CE-WLST-001",
        role: "base",
        status: "sampling",
        seasonality: "core",
        price: "$54–$58",
        techFlats: {
          front: "/product/womens-essential-long-sleeve-tee/flats/womens-long-sleeve-tee-flat-front.svg",
          back: "/product/womens-essential-long-sleeve-tee/flats/womens-long-sleeve-tee-flat-back.svg",
        },
        colorways: [
          { name: "Satuit Navy", hex: "#0A1E36", pantone: "289 C" },
          { name: "Canvas", hex: "#F0EFEA", pantone: "Warm Gray 1 C" },
          { name: "Faded Slate", hex: "#5B6770", pantone: "7545 C", note: "A blue-toned gray. Bridges the gap between Navy and Granite." },
        ],
        description:
          "The women's long sleeve transitional layer. Same 7–8 oz cotton jersey as CE-LST-001, same utility mandate — cool mornings, wind off the water, shoulder seasons. Re-drafted with the women's Essential Tee silhouette: narrower shoulder, tapered body, proportional sleeve length.",
        bosTest: {
          question: "Would this piece sell if the customer never learned our story?",
          answer: "Yes. It's a long sleeve cotton tee that fits right and weighs right. The need is the pitch.",
        },
        annotations: [
          { id: "collar", x: 50, y: 8, label: "Ribbed Collar", note: "Same 1×1 rib as the women's Essential Tee. Consistent collar system across the Core line." },
          { id: "cuff", x: 15, y: 80, label: "Ribbed Cuff", note: "1×1 rib, snug without constriction. Proportioned for women's wrist. Pushes up cleanly, holds its shape." },
          { id: "body", x: 50, y: 45, label: "Women's Essential Body", note: "Same tapered silhouette as CE-WTEE-001. Slightly heavier jersey for three-season wear." },
        ],
        tactile: {
          fabricName: "Satuit Standard Cotton (Heavy)",
          composition: "100% Combed Ring-Spun Cotton",
          weight: "7–8 oz (200–230 GSM)",
          finish: "Garment-dyed, enzyme-washed",
          behavior: "Same broken-in hand as the women's Essential Tee, with more substance. Heavy enough to cut wind off the water, light enough to layer under a hoodie without bulk.",
          saltTest: "Standard 3.5% saline protocol. Same performance as CE-LST-001.",
        },
        lockedDecisions: [
          { decision: "Same body as Women's Essential Tee.", rationale: "This is a sleeve extension, not a new silhouette. One fit, two lengths." },
          { decision: "No exterior branding.", rationale: "Consistent with Core Essentials trim standard. Woven label inside collar only." },
          { decision: "Garment-dyed, never piece-dyed.", rationale: "Same character development as CE-LST-001. Siblings, not clones." },
          { decision: "Tight colorway: Navy, Off-White, Faded Slate.", rationale: "Three colors that work year-round. Matches the men's Essential Long Sleeve palette." },
        ],
        lineage: [
          { version: "v1.0", date: "2026-02-11", changes: ["Initial spec. Women's fit re-drafted from CE-LST-001 base.", "Same 7–8 oz body, same trim standards.", "In sampling."] },
        ],
        executionLinks: [
          { label: "Tech Pack — CE-WLST-001", href: "#", type: "pdf", category: "production" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 02. MATERIAL COLLECTION — 3 SKUs
  // ═══════════════════════════════════════════════════════════════════
  {
    slug: "material-collection",
    taxonomyCode: "material",
    name: "Material Collection",
    id: "MC-V1",
    leadDesigner: "M. Sullivan",
    revisionDate: "2026-01-20",
    status: "production",
    designMandate: "Materials First / Storytelling Last",
    brandingMandate: "Quiet / Let the Cloth Speak",
    systemRole: "Pricing Power Through Fabric & Craft",
    lineup: "Material Tee, Material Fleece Crew, Material Hoodie.",
    intent:
      "The Material Collection exists to prove that Satuit isn't just about basics. These pieces use elevated fabrics and construction techniques to justify a higher price point — but the storytelling comes after the material, not before it. You feel the difference before you read the tag.",
    judgeOfSuccess:
      "A customer picks up the garment, feels the weight and texture, and decides to buy it before reading a single word of copy.",
    antiSpec: [
      "Marketing-driven 'premium' language that the fabric can't back up.",
      "Exotic fibers for the sake of novelty. Every material must earn its place.",
      "Visible construction details that exist for 'craftsmanship signaling' rather than function.",
      "Price points that require a 'story' to justify — the hand-feel must do it alone.",
    ],
    assets: [
      { label: "Material Collection — Fabric Swatches", href: "#", type: "drive", category: "production" },
      { label: "Figma — MC Product Pages", href: "#", type: "figma", category: "design" },
    ],
    operationalLinks: [
      { label: "Tech Pack — Material Collection V1", href: "#", type: "pdf", category: "production" },
    ],
    garments: [
      // ─── 05 — Material Tee (Premium) ─────────────────────────────
      {
        slug: "material-tee",
        name: "Material Tee",
        sku: "MC-TEE-001",
        role: "base",
        status: "production",
        seasonality: "core",
        price: "$54–$58",
        techFlats: {
          front: "/product/material-tee/flats/material-tee-flat-front.svg",
          back: "/product/material-tee/flats/material-tee-flat-back.svg",
        },
        colorways: [
          { name: "Salt Air", hex: "#69A3B0", pantone: "549 C", note: "A 'dusty' blue-green. The color of the horizon on a hazy morning." },
          { name: "Driftwood", hex: "#8D8477", pantone: "7531 C", note: "Adds a necessary 'earth' element to ground the blues." },
        ],
        description:
          "An exercise in tactile restraint. We took our standard \"Default\" fit and executed it in a premium long-staple blend. It's for the neighbor who wants the Satuit silhouette but requires a softer, more refined handfeel for \"Town\" use.",
        bosTest: {
          question: "Would a fabric swatch alone justify the price?",
          answer: "Yes. The luster and silkiness of the long-staple fiber are self-evident.",
        },
        annotations: [
          { id: "fabric", x: 50, y: 40, label: "Long-Staple Cotton/Modal", note: "Premium blend creates a smoother, stronger yarn with a natural luster. You feel the difference immediately." },
          { id: "collar", x: 50, y: 8, label: "Flat-Knit Collar", note: "Flat-knit rather than ribbed. Creates a cleaner, more refined neckline that reads 'intentional,' not 'athletic.'" },
        ],
        tactile: {
          fabricName: "Long-Staple Cotton/Modal Blend",
          composition: "Long-Staple Cotton / Modal",
          weight: "7 oz (200 GSM)",
          finish: "Garment-dyed, silicone-washed",
          behavior: "Buttery smooth with a subtle sheen. Resists pilling and maintains surface integrity over hundreds of washes. Gets softer without losing structure.",
          saltTest: "Standard saline protocol. Superior color retention due to longer fiber absorption. No surface degradation.",
        },
        lockedDecisions: [
          { decision: "No exterior branding.", rationale: "The cloth is the signature. If you need to see a logo, you're not the customer." },
          { decision: "Interior printed label only.", rationale: "Clean internal finish. No woven label that can irritate." },
          { decision: "DTM (Dye-to-Match) stitching.", rationale: "Thread matches body color exactly. Zero contrast on exterior." },
        ],
        lineage: [
          { version: "v1.0", date: "2025-11-01", changes: ["Initial spec. Long-staple sourcing confirmed.", "Flat-knit collar finalized.", "Approved for production."] },
        ],
        executionLinks: [
          { label: "Tech Pack — MC-TEE-001", href: "#", type: "pdf", category: "production" },
        ],
      },

      // ─── 07 — Material Fleece Crew ───────────────────────────────
      {
        slug: "material-fleece-crew",
        name: "Material Fleece Crew",
        sku: "MC-FLC-001",
        role: "mid",
        status: "production",
        seasonality: "core",
        price: "$98",
        techFlats: {
          front: "/product/material-fleece-crew/flats/material-fleece-crew-flat-front.svg",
          back: "/product/material-fleece-crew/flats/material-fleece-crew-flat-back.svg",
        },
        colorways: [
          { name: "Washed Charcoal", hex: "#3C3C3C", pantone: "446 C", note: "The color of iron and harbor pilings." },
          { name: "Driftwood", hex: "#8D8477", pantone: "7531 C" },
        ],
        description:
          "Our heaviest knit. At 16 oz, this crewneck behaves more like a soft-shell jacket than a sweater. It provides a level of structural protection that traditional fleece cannot match, built specifically for high-exposure harbor days.",
        bosTest: {
          question: "Does the weight communicate the value?",
          answer: "Yes. The sheer mass of the garment makes the $98 price point feel like an investment in durability.",
        },
        annotations: [
          { id: "interior", x: 65, y: 45, label: "Heavy Loopback/Brushed", note: "16 oz construction. Visible loops create airflow channels and develop character with wear." },
          { id: "collar", x: 50, y: 8, label: "Tubular Neckline", note: "Tubular knit — no rib, no seam. The cleanest possible finish. A detail you can only do at this weight." },
        ],
        tactile: {
          fabricName: "Satuit Heavy Loopback/Brushed Fleece",
          composition: "100% Cotton (Heavy Loopback/Brushed)",
          weight: "16 oz (450 GSM)",
          finish: "Piece-dyed, garment-washed",
          behavior: "Heavy and substantial. Smooth, dense exterior face. Softens over years without losing structure. The kind of fleece that gets passed down.",
          saltTest: "No pilling at 15,000 Martindale cycles. Structure maintained through 200+ washes.",
        },
        lockedDecisions: [
          { decision: "No exterior branding.", rationale: "The weight IS the brand. You know it's special the moment you pick it up." },
          { decision: "Heavyweight structured fit.", rationale: "At 16 oz, the fabric provides its own structure. The fit works with the weight, not against it." },
          { decision: "Side-seam micro flag (Locked: YES).", rationale: "Internal decision confirmed. Single point of exterior identification." },
        ],
        lineage: [
          { version: "v1.0", date: "2025-09-01", changes: ["Initial spec. 14 oz loopback.", "Weight increased to 16 oz for 'pick up and know' heft.", "Tubular neckline finalized.", "Approved for production."] },
        ],
        executionLinks: [
          { label: "Tech Pack — MC-FLC-001", href: "#", type: "pdf", category: "production" },
          { label: "Fabric Mill Cert — Heavy Fleece", href: "#", type: "pdf", category: "production" },
        ],
      },

      // ─── 08 — Material Hoodie ────────────────────────────────────
      {
        slug: "material-hoodie",
        name: "Material Hoodie",
        sku: "MC-HOD-001",
        role: "mid",
        status: "production",
        seasonality: "core",
        price: "$118",
        techFlats: {
          front: "/product/material-hoodie/flats/material-hoodie-flat-front.svg",
          back: "/product/material-hoodie/flats/material-hoodie-flat-back.svg",
        },
        colorways: [
          { name: "Washed Charcoal", hex: "#3C3C3C", pantone: "446 C", note: "The color of iron and harbor pilings." },
          { name: "Satuit Navy", hex: "#0A1E36", pantone: "289 C" },
        ],
        description:
          "The Material Collection's answer to the Core Hoodie. Same tailored shoulder, same clean body, but in the 16 oz heavy fleece that defines this collection. The weight difference is noticeable from across the room — it drapes like outerwear.",
        bosTest: {
          question: "Does the material justify the price before we even speak?",
          answer: "Yes. The $30 premium over the Core Hoodie is self-evident in the hand. This is a hoodie you wear as a jacket.",
        },
        annotations: [
          { id: "hood", x: 50, y: 5, label: "Heavyweight Hood", note: "Three-panel construction. At 16 oz, the hood holds its shape when down and provides real protection when up." },
          { id: "body", x: 50, y: 45, label: "16 oz Body", note: "Same heavy fleece as the Material Fleece Crew. Visible loopback interior." },
        ],
        tactile: {
          fabricName: "Satuit Heavy Loopback/Brushed Fleece",
          composition: "100% Cotton (Heavy Loopback/Brushed)",
          weight: "16 oz (450 GSM)",
          finish: "Piece-dyed, garment-washed",
          behavior: "Same hand-feel as MC-FLC-001. The hood adds a functional layer without sacrificing the heavyweight drape.",
          saltTest: "Same protocol as MC-FLC-001.",
        },
        lockedDecisions: [
          { decision: "No exterior branding.", rationale: "Consistent with Material Collection — the cloth speaks." },
          { decision: "Tailored shoulder (matches Core Hoodie).", rationale: "Same silhouette as CE-HOD-001. The difference is in the fabric, not the fit." },
          { decision: "Self-fabric drawcord.", rationale: "No contrast cord, no waxed tips. The drawcord disappears into the garment." },
        ],
        lineage: [
          { version: "v1.0", date: "2025-12-01", changes: ["Spec'd as Material extension of Core Hoodie.", "16 oz fabric confirmed.", "Approved for production."] },
        ],
        executionLinks: [
          { label: "Tech Pack — MC-HOD-001", href: "#", type: "pdf", category: "production" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 03. ORIGIN COLLECTION — 3 SKUs
  // ═══════════════════════════════════════════════════════════════════
  {
    slug: "origin-collection",
    taxonomyCode: "origin",
    name: "Origin Collection",
    id: "OC-V1",
    leadDesigner: "M. Sullivan",
    revisionDate: "2026-02-01",
    status: "sampling",
    designMandate: "Abstract / Symbolic / Limited",
    brandingMandate: "Localized / Earned",
    systemRole: "Local Story Without Defining the Brand",
    lineup: "Origin Graphic Tee, Origin Hoodie, Origin Crewneck.",
    intent:
      "Origin exists to tell the Scituate story without making Satuit a 'local brand.' These pieces use abstract, symbolic references to the harbor, the coast, and the community — never literal anchors, never 'Est. 2024' badges. The collection is intentionally limited: Origin SKUs must always be fewer than Core Essentials.",
    judgeOfSuccess:
      "Someone from outside New England wears the piece and appreciates the design without knowing it references a specific place. Someone from Scituate recognizes it immediately.",
    antiSpec: [
      "Literal geographic references ('Scituate, MA' text, coordinates, maps).",
      "Nautical clichés (anchors, ropes, compass roses, lighthouses).",
      "'Established' or 'Founded' date stamps.",
      "More SKUs than Core Essentials — the rule is Origin < Core.",
      "Premium pricing above the Material Collection — Origin is story, not fabric.",
    ],
    assets: [
      { label: "Origin — Symbol Development", href: "#", type: "figma", category: "design" },
    ],
    operationalLinks: [
      { label: "Tech Pack — Origin V1", href: "#", type: "pdf", category: "production" },
    ],
    garments: [
      // ─── 09 — Origin Graphic Tee ─────────────────────────────────
      {
        slug: "origin-graphic-tee",
        name: "Origin Graphic Tee",
        sku: "OC-TEE-001",
        role: "base",
        status: "sampling",
        seasonality: "seasonal",
        price: "$48",
        techFlats: {
          front: "/product/origin-graphic-tee/flats/origin-graphic-tee-flat-front.svg",
          back: "/product/origin-graphic-tee/flats/origin-graphic-tee-flat-back.svg",
        },
        colorways: [
          { name: "Salt Air", hex: "#69A3B0", pantone: "549 C", note: "A 'dusty' blue-green. The horizon on a hazy morning." },
          { name: "Canvas", hex: "#F0EFEA", pantone: "Warm Gray 1 C" },
        ],
        description:
          "The local entry point. We use abstract, symbolic graphics to signal our harbor roots without relying on \"souvenir\" wordmarks. It's a way to wear the story without the performance of a loud headline.",
        bosTest: {
          question: "Is the graphic symbolic or performative?",
          answer: "Symbolic. If you know the harbor, you recognize the mark. If you don't, it just looks like a well-placed design.",
        },
        annotations: [
          { id: "graphic", x: 50, y: 35, label: "Origin Mark", note: "Small-scale placement. Tonal ink — visible only in certain light. Derived from the harbor silhouette, abstracted to pure geometry." },
        ],
        tactile: {
          fabricName: "Satuit Standard Cotton",
          composition: "100% Combed Ring-Spun Cotton",
          weight: "6.5 oz (190 GSM)",
          finish: "Garment-dyed, enzyme-washed",
          behavior: "Identical to CE-TEE-001. The Origin Tee is a Core Essential with a story, not a different product.",
          saltTest: "Same protocol as CE-TEE-001.",
        },
        lockedDecisions: [
          { decision: "Small front/back placement only.", rationale: "No large wordmarks. The graphic is discovered, not displayed." },
          { decision: "Tonal ink — never contrast.", rationale: "The graphic rewards attention. It doesn't demand it." },
          { decision: "Back-collar micro flag.", rationale: "Consistent with Core Essentials base body." },
        ],
        lineage: [
          { version: "v1.0", date: "2026-01-20", changes: ["Initial spec. Origin Mark v3 approved.", "Tonal print method confirmed (discharge).", "In sampling."] },
        ],
        executionLinks: [
          { label: "Tech Pack — OC-TEE-001", href: "#", type: "pdf", category: "production" },
          { label: "Origin Mark — Vector Files", href: "#", type: "figma", category: "design" },
        ],
      },

      // ─── 10 — Origin Hoodie ──────────────────────────────────────
      {
        slug: "origin-hoodie",
        name: "Origin Hoodie",
        sku: "OC-HOD-001",
        role: "mid",
        status: "sampling",
        seasonality: "seasonal",
        price: "$98",
        techFlats: {
          front: "/product/origin-hoodie/flats/origin-hoodie-flat-front.svg",
          back: "/product/origin-hoodie/flats/origin-hoodie-flat-back.svg",
        },
        colorways: [
          { name: "Washed Gray", hex: "#A8ADAD", pantone: "422 C", note: "The color of weathered shingles and dry granite." },
          { name: "Satuit Navy", hex: "#0A1E36", pantone: "289 C" },
        ],
        description:
          "Local truth meets our core 14 oz fleece. This is the \"limited\" version of our spine — retaining all the structural integrity of the Core Hoodie but adding a layer of symbolic meaning.",
        bosTest: {
          question: "Is it \"merch\" or a \"garment\"?",
          answer: "Garment. Because the base is our Core 14oz fleece, it remains a piece of high-quality equipment first, and a \"graphic hoodie\" second.",
        },
        annotations: [
          { id: "graphic", x: 50, y: 35, label: "Origin Mark (Chest)", note: "Minimal symbolic graphic. Tonal discharge. Small-scale placement — discovered, not displayed." },
        ],
        tactile: {
          fabricName: "Satuit Brushed Fleece",
          composition: "80% Cotton / 20% Recycled Polyester",
          weight: "14 oz (400 GSM)",
          finish: "Piece-dyed, garment-washed, brushed interior",
          behavior: "Identical to CE-HOD-001. The Origin treatment is additive, not structural.",
          saltTest: "Same protocol as CE-HOD-001.",
        },
        lockedDecisions: [
          { decision: "Minimal symbolic graphic — no chest wordmark.", rationale: "The mark is the story. Words are marketing." },
          { decision: "Custom drawstring in approved harbor color.", rationale: "Single color accent that ties to the Origin palette." },
          { decision: "Same body as CE-HOD-001.", rationale: "Origin is a story layer, not a fit variant." },
        ],
        lineage: [
          { version: "v1.0", date: "2026-01-25", changes: ["Spec'd as Origin extension of Core Hoodie.", "Harbor color drawstring sourced.", "In sampling."] },
        ],
        executionLinks: [
          { label: "Tech Pack — OC-HOD-001", href: "#", type: "pdf", category: "production" },
        ],
      },

      // ─── 11 — Origin Crewneck ────────────────────────────────────
      {
        slug: "origin-crewneck",
        name: "Origin Crewneck",
        sku: "OC-CRW-001",
        role: "mid",
        status: "sampling",
        seasonality: "seasonal",
        price: "$88",
        techFlats: {
          front: "/product/origin-crewneck/flats/origin-crewneck-flat-front.svg",
          back: "/product/origin-crewneck/flats/origin-crewneck-flat-back.svg",
        },
        colorways: [
          { name: "Washed Gray", hex: "#A8ADAD", pantone: "422 C", note: "The color of weathered shingles and dry granite." },
          { name: "Canvas", hex: "#F0EFEA", pantone: "Warm Gray 1 C" },
        ],
        description:
          "The Core Crewneck with the Origin Mark. Same 14 oz brushed fleece, same fit, same construction. The mark is placed on the upper back, below the collar — visible when the wearer turns around. Understated and earned.",
        bosTest: {
          question: "Is it \"merch\" or a \"garment\"?",
          answer: "Garment. Same logic as the Origin Hoodie. Equipment first, story second. The back placement makes it even more quiet.",
        },
        annotations: [
          { id: "graphic", x: 50, y: 18, label: "Origin Mark (Back)", note: "Upper back placement, 8cm width. Tonal discharge print. Visible when the wearer walks away." },
        ],
        tactile: {
          fabricName: "Satuit Brushed Fleece",
          composition: "80% Cotton / 20% Recycled Polyester",
          weight: "14 oz (400 GSM)",
          finish: "Piece-dyed, garment-washed, brushed interior",
          behavior: "Identical to CE-CRW-001. The Origin treatment is additive, not structural.",
          saltTest: "Same protocol as CE-CRW-001.",
        },
        lockedDecisions: [
          { decision: "Back placement only.", rationale: "The crewneck is the public-facing layer. The mark is a reward for the person behind the wearer." },
          { decision: "Same body as CE-CRW-001.", rationale: "Origin is a story layer, not a fit variant." },
        ],
        lineage: [
          { version: "v1.0", date: "2026-01-25", changes: ["Spec'd alongside OC-HOD-001.", "Back placement confirmed.", "In sampling."] },
        ],
        executionLinks: [
          { label: "Tech Pack — OC-CRW-001", href: "#", type: "pdf", category: "production" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 04. COASTAL FUNCTION — 4 SKUs
  // ═══════════════════════════════════════════════════════════════════
  {
    slug: "coastal-function",
    taxonomyCode: "function",
    name: "Coastal Function",
    id: "CF-V1",
    leadDesigner: "J. Briggs",
    revisionDate: "2026-02-05",
    status: "sampling",
    designMandate: "Functional / Calm / Non-Technical",
    brandingMandate: "Invisible / Performance Without Posturing",
    systemRole: "Real-Use Gear (Year-Round)",
    lineup: "Performance Swim Hoodie, Women's Short, Tailored Swim Short.",
    intent:
      "Coastal Function is the collection that earns its place through utility, not aesthetics. These are the pieces built for actual water proximity — swim, sun, transit. The mandate is clear: functional performance without the 'tech-bro' aesthetic. Every piece must work in the water and look right at dinner.",
    judgeOfSuccess:
      "A customer wears the Swim Hoodie from the beach to a harborside restaurant and nobody knows it's performance fabric. The utility is invisible.",
    environmentalContext: {
      mandate: "Function that doesn't perform. Utility that doesn't announce itself.",
      scenarioList: [
        { title: "Post-Swim Transit", description: "Wet to dry. The gear needs to handle the transition from water to car to restaurant without looking like athletic wear." },
        { title: "All-Day Sun Exposure", description: "UV protection built into the fabric, not applied as a coating. The garment must protect without the wearer needing to think about it." },
        { title: "Salt-Spray Commute", description: "Daily exposure to marine air. Fabrics must resist salt degradation without DWR coatings that crack or peel." },
      ],
    },
    antiSpec: [
      "Technical fabric branding visible on the exterior ('Quick-Dry,' 'UV50+' callouts).",
      "Mesh panels, reflective details, or any feature borrowed from sportswear.",
      "Neon or high-visibility colorways.",
      "Elastic-only waistbands on any bottom.",
      "Any fabric that 'swishes' or sounds synthetic when moving.",
      "Shiny finishes of any kind — if it looks like gym wear, it's a failure.",
    ],
    assets: [
      { label: "Coastal Function — Fabric Testing Log", href: "#", type: "drive", category: "production" },
      { label: "Figma — CF Product Pages", href: "#", type: "figma", category: "design" },
    ],
    operationalLinks: [
      { label: "Tech Pack — Coastal Function V1", href: "#", type: "pdf", category: "production" },
      { label: "Measurement Spec — Swim", href: "/pack/launch-v1/appendix-b-measurements/swim-men", type: "external", category: "production" },
    ],
    garments: [
      // ─── 12 — Performance Swim Hoodie ────────────────────────────
      {
        slug: "swim-hoodie",
        name: "Performance Swim Hoodie",
        sku: "CF-HOD-001",
        role: "shell",
        status: "sampling",
        seasonality: "seasonal",
        price: "$88",
        techFlats: {
          front: "/product/swim-hoodie/flats/swim-hoodie-flat-front.svg",
          back: "/product/swim-hoodie/flats/swim-hoodie-flat-back.svg",
        },
        colorways: [
          { name: "Satuit Navy", hex: "#0A1E36", pantone: "289 C" },
          { name: "Faded Slate", hex: "#5B6770", pantone: "7545 C", note: "A blue-toned gray. Bridges the gap between Navy and Granite." },
        ],
        description:
          "Sun protection without the \"tech\" noise. We stripped away the kangaroo pocket and the ribbing to create a sleek, matte silhouette that provides a 50+ UPF barrier against the salt and sun while remaining breathable.",
        bosTest: {
          question: "Does this feel useful, not sporty?",
          answer: "Yes. By avoiding the shiny finish of traditional performance gear, it feels like a neighbor's staple, not a triathlete's uniform.",
        },
        annotations: [
          { id: "fabric", x: 50, y: 40, label: "Poly-Stretch Knit", note: "200 GSM. Engineered for cotton hand-feel with quick-dry performance. You shouldn't be able to tell it's a tech fabric." },
          { id: "hood", x: 50, y: 5, label: "Sun Hood", note: "Extended brim coverage. UPF 50+ rated. Functional — protects from sun, not just rain." },
        ],
        tactile: {
          fabricName: "Satuit Poly-Stretch Knit",
          composition: "Poly-Stretch Knit",
          weight: "200 GSM",
          finish: "Matte, UPF 50+ inherent",
          behavior: "Matte, sleek silhouette. No pocket, no ribbing. Provides a UPF 50+ barrier while remaining breathable. Dries in 20 minutes.",
          saltTest: "Extended ocean exposure test. UPF rating maintained after 50 washes. No hand-feel degradation in salt water.",
        },
        lockedDecisions: [
          { decision: "No pocket.", rationale: "Clean silhouette. Pockets add bulk and 'sporty' visual noise." },
          { decision: "No ribbing.", rationale: "Ribbed cuffs and hems read 'sweatshirt.' This is a transit layer." },
          { decision: "Matte finish only.", rationale: "Shiny performance fabric is the opposite of Satuit. If it gleams, it fails." },
          { decision: "Side-seam micro flag only.", rationale: "Single point of external branding. Nothing on the chest, nothing on the hood." },
        ],
        lineage: [
          { version: "v1.0", date: "2026-01-10", changes: ["Initial spec. Fabric sourcing confirmed.", "UPF testing in progress.", "In sampling."] },
        ],
        executionLinks: [
          { label: "Tech Pack — CF-HOD-001", href: "#", type: "pdf", category: "production" },
        ],
      },

      // ─── 13 — Women's Short ──────────────────────────────────────
      {
        slug: "womens-short",
        name: "Women's Short",
        sku: "CF-SHT-002",
        role: "base",
        status: "sampling",
        seasonality: "seasonal",
        price: "$64",
        techFlats: {
          front: "/product/womens-short/flats/womens-short-flat-front.svg",
          back: "/product/womens-short/flats/womens-short-flat-back.svg",
        },
        colorways: [
          { name: "Faded Slate", hex: "#5B6770", pantone: "7545 C", note: "A blue-toned gray. Bridges the gap between Navy and Granite." },
          { name: "Canvas", hex: "#F0EFEA", pantone: "Warm Gray 1 C" },
        ],
        description:
          "A functional short built for water proximity and town transit. Clean front, hidden elastic at back panel, and a silhouette that reads 'tailored' rather than 'activewear.' The cotton-nylon blend handles splash and spray without looking like a swim trunk.",
        bosTest: {
          question: "Does this feel useful, not sporty?",
          answer: "Yes. The snap-button fly and welted pockets keep it in tailored territory. It works at the beach and at dinner — the whole point of Coastal Function.",
        },
        annotations: [
          { id: "waistband", x: 50, y: 8, label: "Clean Front", note: "Snap-button fly with hidden elastic at back panel. Tailored silhouette with functional stretch." },
          { id: "pocket", x: 75, y: 40, label: "Welted Back Pocket", note: "Hidden zip pocket at right rear. Welted, not patch — maintains the tailored line." },
        ],
        tactile: {
          fabricName: "Satuit Shore Blend",
          composition: "60% Cotton / 40% Nylon",
          weight: "5.5 oz (155 GSM)",
          finish: "DWR treated, sand-washed",
          behavior: "Dry hand with slight stretch from the nylon. Dries faster than cotton but doesn't feel synthetic. Resists water spotting in light spray.",
          saltTest: "Standard saline protocol plus sand abrasion testing. DWR maintained at 80%+ after 30 washes.",
        },
        lockedDecisions: [
          { decision: "Snap-button fly, not zip.", rationale: "Consistent with Coastal Function hardware. Functional with wet hands." },
          { decision: "No elastic-only waistband.", rationale: "Elastic-only reads as athletic. The front panel is clean and structured." },
        ],
        lineage: [
          { version: "v1.0", date: "2026-01-20", changes: ["Initial spec. Cotton-nylon blend confirmed.", "Snap-button hardware sourced.", "In sampling."] },
        ],
        executionLinks: [
          { label: "Tech Pack — CF-SHT-002", href: "#", type: "pdf", category: "production" },
        ],
      },

      // ─── 14 — Tailored Swim Short ─────────────────────────────────
      {
        slug: "tailored-swim-short",
        name: "Tailored Swim Short",
        sku: "CF-SHT-001",
        role: "base",
        status: "sampling",
        seasonality: "seasonal",
        price: "$78",
        techFlats: {
          front: "/product/tailored-swim-short/flats/tailored-swim-short-flat-front.svg",
          back: "/product/tailored-swim-short/flats/tailored-swim-short-flat-back.svg",
        },
        colorways: [
          { name: "Satuit Navy", hex: "#0A1E36", pantone: "289 C" },
          { name: "Faded Slate", hex: "#5B6770", pantone: "7545 C", note: "A blue-toned gray. Bridges the gap between Navy and Granite." },
        ],
        description:
          "Not a fashion trunk. Not a patterned beach short. Not a resort piece. This is a swim short designed to function like a short. The word \"tailored\" matters — it separates you from boardwalk energy. Built for long days on and off the water, styled like apparel, not beachwear.",
        bosTest: {
          question: "Does this feel useful, not sporty?",
          answer: "Yes. The tailored construction reads as a real short. If someone in Brooklyn, Portland, or Austin could buy it and wear it without context, you're positioned correctly. If it only makes sense at the beach, it's wrong.",
        },
        annotations: [
          { id: "waist", x: 50, y: 8, label: "Elastic Waist + Drawcord", note: "Internal drawcord, clean exterior. No visible elastic waistband — reads tailored, not athletic." },
          { id: "inseam", x: 75, y: 50, label: "~5\" Inseam", note: "Clean leg opening. No cargo details, no utility loops. The silhouette is the function." },
          { id: "fabric", x: 50, y: 40, label: "Matte Quick-Dry", note: "Matte finish that reads as cotton. Dries fast without the synthetic sheen. No 'swish.'" },
          { id: "mark", x: 85, y: 30, label: "Woven Flag", note: "One woven flag only. Single point of identification. No contrast stitching, no prints." },
        ],
        tactile: {
          fabricName: "Satuit Shore Matte",
          composition: "Nylon / Spandex Quick-Dry Blend",
          weight: "5 oz (140 GSM)",
          finish: "Matte, sand-washed",
          behavior: "Matte, dry hand. Functions as a swim trunk but reads as a tailored short. No sheen, no swish, no synthetic tell. Dries in 15 minutes.",
          saltTest: "Extended ocean exposure. Fabric maintains matte finish and hand-feel after repeated salt immersion. 50+ wash cycles.",
        },
        lockedDecisions: [
          { decision: "No prints. Ever.", rationale: "If you ever add prints, you shift category. This is functional tailored swim, not vacation trunk." },
          { decision: "No contrast stitching.", rationale: "Clean, tonal construction. The short should disappear into an outfit." },
          { decision: "Navy first. Slate only if Navy performs.", rationale: "Color discipline. Prove the silhouette before expanding the palette." },
          { decision: "One woven flag only.", rationale: "Single point of external identification. Consistent with Coastal Function trim standard." },
          { decision: "Never present as 'beach essential' or 'vacation ready.'", rationale: "Present as: a tailored swim short built for long days on and off the water. Style with LS tee, swim hoodie, canvas cap." },
        ],
        lineage: [
          { version: "v1.0", date: "2026-02-10", changes: ["Initial spec. Matte quick-dry fabric sourced.", "5\" inseam, elastic waist + internal drawcord.", "In sampling."] },
        ],
        executionLinks: [
          { label: "Tech Pack — CF-SHT-001", href: "#", type: "pdf", category: "production" },
        ],
      },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────

export function getCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug)
}

export function getCollectionByTaxonomyCode(code: string): Collection | undefined {
  return collections.find((c) => c.taxonomyCode === code)
}

export function getGarment(
  collectionSlug: string,
  garmentSlug: string,
): { collection: Collection; garment: Garment } | undefined {
  const collection = collections.find((c) => c.slug === collectionSlug)
  if (!collection) return undefined
  const garment = collection.garments.find((g) => g.slug === garmentSlug)
  if (!garment) return undefined
  return { collection, garment }
}

export function getAllGarments(): Array<{
  collection: Collection
  garment: Garment
}> {
  return collections.flatMap((c) =>
    c.garments.map((g) => ({ collection: c, garment: g })),
  )
}
