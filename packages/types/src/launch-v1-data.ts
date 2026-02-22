import type { TechPackData, SkuGroup } from './tech-pack';

// ---------------------------------------------------------------------------
// Slug helpers
// ---------------------------------------------------------------------------

function toSlug(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u2018\u2019\u0027\u2032]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

const collectionSlugMap: Record<string, string> = {
  'Core Essentials': 'core-essentials',
  'Material Collection': 'material-collection',
  'Origin Collection': 'origin-collection',
  'Coastal Function': 'coastal-function',
  "Coastal Function \u2014 Women\u2019s Coastal": 'coastal-function',
};

function getCollectionSlug(collection: string): string {
  return collectionSlugMap[collection] ?? toSlug(collection);
}

// ---------------------------------------------------------------------------
// Pack metadata
// ---------------------------------------------------------------------------

export const packMeta = {
  title: 'Factory Execution Pack',
  version: 'Launch v1.0',
  date: 'February 7, 2026',
} as const;

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

const navy = '#0F2437';
const offWhite = '#F4F2EC';
const washedBlack = '#2B2B2B';
const heatherGray = '#B9BDC2';
const fadedNavy = '#162635';
const ecru = '#E7E0D0';
const washedCharcoal = '#3C4046';
const slate = '#667085';

const baseHeader = {
  version: 'v1.0',
  date: 'February 7, 2026',
} as const;

export const lockRequired =
  'LOCK REQUIRED \u2014 Micro flag placement: hem vs back collar (global choice).';

// ---------------------------------------------------------------------------
// SKU definitions
// ---------------------------------------------------------------------------

const coreEssentials: TechPackData[] = [
  {
    slug: 'essential-tee',
    collectionSlug: 'core-essentials',
    skuName: 'Essential Tee',
    collection: 'Core Essentials',
    skuCode: 'LAUNCH-v1-CE-TEE',
    productType: 'tee',
    colorSwatches: [
      { name: 'Navy', hex: navy },
      { name: 'Off-White', hex: offWhite },
      { name: 'Washed Black', hex: washedBlack },
      { name: 'Heather Gray', hex: heatherGray },
    ],
    keyMeasurements: [
      'Fit intent: Modern classic. Straight side seam. No tapering below chest.',
      'Measurement table: Appendix B1 \u2014 Tees (Standard).',
      'Tolerances are enforceable. Approved samples override tables only if documented in writing.',
    ],
    fabric: ['6.5 oz combed ringspun cotton jersey'],
    fit: ['Modern classic; straight side seam'],
    construction: ['Single needle shoulder', 'Double needle sleeve & hem', 'Clean neck rib (no contrast)'],
    branding: [
      'Exterior: NONE',
      'Interior: printed main label (symbol only)',
      'Secondary: woven micro flag at hem OR back collar (choose one globally)',
    ],
    trims: ['Universal custom neck tape (Appendix A)'],
    approvedColors: ['Navy', 'Off-White', 'Washed Black', 'Heather Gray'],
    restrictions: [lockRequired],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B1 \u2014 Tees (Standard)',
      construction: 'Appendix C1 \u2014 Essential Tee',
    },
    intent: ['Understated. Durable. Calm. Intentional.', 'Exterior branding prohibited on this SKU.'],
    msrpReference: '$42',
    ...baseHeader,
  },
  {
    slug: 'essential-heavy-tee',
    collectionSlug: 'core-essentials',
    skuName: 'Essential Heavy Tee',
    collection: 'Core Essentials',
    skuCode: 'LAUNCH-v1-CE-HTEE',
    productType: 'tee',
    colorSwatches: [
      { name: 'Faded Navy', hex: fadedNavy },
      { name: 'Ecru', hex: ecru },
    ],
    keyMeasurements: [
      'Fit intent: Slightly relaxed; structured drape.',
      'Measurement table: Appendix B1 \u2014 Tees (Heavy Adjustments apply).',
      'Heavy adjustments: +0.25" chest ease; sleeve opening +0.25"; body length unchanged.',
    ],
    fabric: ['8.5 oz heavyweight jersey'],
    fit: ['Slightly relaxed; structured drape'],
    construction: ['Same as Essential Tee. No other construction changes allowed.', 'Slightly wider sleeve opening'],
    branding: [
      'Branding & trim: Same as Essential Tee',
      'Exterior: NONE',
      'Interior: printed main label (symbol only)',
      'Secondary: woven micro flag at hem OR back collar (choose one globally)',
    ],
    trims: ['Universal custom neck tape (Appendix A)'],
    approvedColors: ['Faded Navy', 'Ecru'],
    restrictions: [lockRequired],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B1 \u2014 Tees (Heavy)',
      construction: 'Appendix C2 \u2014 Essential Heavy Tee',
    },
    intent: ['Structure and calm. Avoid decoration and loud branding.'],
    msrpReference: '$48',
    ...baseHeader,
  },
  {
    slug: 'core-pullover-hoodie',
    collectionSlug: 'core-essentials',
    skuName: 'Core Pullover Hoodie',
    collection: 'Core Essentials',
    skuCode: 'LAUNCH-v1-CE-HOOD',
    productType: 'fleece',
    colorSwatches: [
      { name: 'Navy', hex: navy },
      { name: 'Washed Charcoal', hex: washedCharcoal },
    ],
    keyMeasurements: [
      'Fit intent: Relaxed body. Clean shoulder. No drop shoulder.',
      'Measurement table: Appendix B2 \u2014 Fleece (Hoodies & Crewnecks).',
    ],
    fabric: ['14 oz brushed fleece'],
    fit: ['Relaxed body, tailored shoulders'],
    construction: ['Set-in sleeve', 'Clean hood shape (no exaggerated volume)', 'No kangaroo pocket shaping details'],
    branding: ['Exterior: woven micro flag only'],
    trims: ['Custom drawstring (approved color only)', 'Standard metal aglet (no logo)', 'Universal neck tape (Appendix A)'],
    approvedColors: ['Navy', 'Washed Charcoal'],
    restrictions: [lockRequired, 'No logo on aglet. No novelty trims.'],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B2 \u2014 Fleece',
      construction: 'Appendix C3 \u2014 Core Pullover Hoodie',
    },
    intent: ['Relaxed, durable, calm. Avoid exaggerated hood volume.'],
    msrpReference: '$88',
    ...baseHeader,
  },
  {
    slug: 'core-crewneck-sweatshirt',
    collectionSlug: 'core-essentials',
    skuName: 'Core Crewneck Sweatshirt',
    collection: 'Core Essentials',
    skuCode: 'LAUNCH-v1-CE-CREW',
    productType: 'fleece',
    colorSwatches: [
      { name: 'Off-White', hex: offWhite },
      { name: 'Navy', hex: navy },
    ],
    keyMeasurements: [
      'Fit intent: Relaxed body. Clean shoulder. No drop shoulder.',
      'Measurement table: Appendix B2 \u2014 Fleece (Hoodies & Crewnecks).',
    ],
    fabric: ['14 oz brushed fleece'],
    fit: ['Classic, structured'],
    construction: ['Standard rib at neck, cuffs, hem', 'No side panels'],
    branding: ['Micro flag only'],
    trims: ['Universal neck tape (Appendix A)'],
    approvedColors: ['Off-White', 'Navy'],
    restrictions: [lockRequired],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B2 \u2014 Fleece',
      construction: 'Appendix C4 \u2014 Core Crewneck Sweatshirt',
    },
    intent: ['Clean, structured, calm.'],
    msrpReference: '$78',
    ...baseHeader,
  },
];

const materialCollection: TechPackData[] = [
  {
    slug: 'material-tee',
    collectionSlug: 'material-collection',
    skuName: 'Material Tee (Premium Cotton)',
    collection: 'Material Collection',
    skuCode: 'LAUNCH-v1-MC-TEE',
    productType: 'tee',
    colorSwatches: [
      { name: 'Navy', hex: navy },
      { name: 'Ecru', hex: ecru },
    ],
    keyMeasurements: ['Fit intent: Same as Essential Tee.', 'Measurement table: Appendix B1 \u2014 Tees (Standard).'],
    fabric: ['Long-staple cotton or cotton-modal blend', 'Weight: 6.5\u20137 oz'],
    fit: ['Same as Essential Tee'],
    construction: ['Same as Essential Tee'],
    branding: ['Interior printed label only', 'NO exterior branding'],
    trims: ['Universal neck tape (Appendix A)'],
    approvedColors: ['Navy', 'Ecru'],
    restrictions: ['NO exterior branding.'],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B1 \u2014 Tees',
      construction: 'Appendix C5 \u2014 Material Tee',
    },
    intent: ['Materials must justify price without explanation.'],
    ...baseHeader,
  },
  {
    slug: 'material-long-sleeve-tee',
    collectionSlug: 'material-collection',
    skuName: 'Material Long-Sleeve Tee',
    collection: 'Material Collection',
    skuCode: 'LAUNCH-v1-MC-LSTEE',
    productType: 'tee',
    colorSwatches: [
      { name: 'Navy', hex: navy },
      { name: 'Off-White', hex: offWhite },
    ],
    keyMeasurements: ['Fit intent: Straight sleeve; no thumbholes.', 'Measurement table: Appendix B1 \u2014 Tees (Standard).'],
    fabric: ['Same as Material Tee'],
    fit: ['Straight sleeve; no thumbholes'],
    construction: ['Same as Material Tee'],
    branding: ['Interior printed label only', 'NO exterior branding'],
    trims: ['Universal neck tape (Appendix A)'],
    approvedColors: ['Navy', 'Off-White'],
    restrictions: ['No thumbholes. NO exterior branding.'],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B1 \u2014 Tees',
      construction: 'Appendix C5 \u2014 Material Tee (construction parity)',
    },
    intent: ['Materials must justify price without explanation.'],
    ...baseHeader,
  },
  {
    slug: 'material-fleece-crew',
    collectionSlug: 'material-collection',
    skuName: 'Material Fleece Crew',
    collection: 'Material Collection',
    skuCode: 'LAUNCH-v1-MC-FCREW',
    productType: 'fleece',
    colorSwatches: [
      { name: 'Navy', hex: navy },
      { name: 'Washed Charcoal', hex: washedCharcoal },
    ],
    keyMeasurements: ['Fit intent: Structured.', 'Measurement table: Appendix B2 \u2014 Fleece.'],
    fabric: ['16 oz loopback or brushed fleece'],
    fit: ['Structured'],
    construction: ['Reinforced shoulder seam allowed (hidden)', 'No decorative stitching'],
    branding: ['Micro flag (LOCKED)'],
    trims: ['Universal neck tape (Appendix A)'],
    approvedColors: ['Navy', 'Washed Charcoal'],
    restrictions: [lockRequired, 'No decorative stitching.'],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B2 \u2014 Fleece',
      construction: 'Appendix C6 \u2014 Material Fleece Crew',
    },
    intent: ['Materials must justify price without explanation.'],
    ...baseHeader,
  },
  {
    slug: 'material-hoodie',
    collectionSlug: 'material-collection',
    skuName: 'Material Hoodie',
    collection: 'Material Collection',
    skuCode: 'LAUNCH-v1-MC-HOOD',
    productType: 'fleece',
    colorSwatches: [{ name: 'Navy', hex: navy }],
    keyMeasurements: ['Fit intent: Clean, relaxed.', 'Measurement table: Appendix B2 \u2014 Fleece.'],
    fabric: ['Same as Material Fleece Crew'],
    fit: ['Clean, relaxed'],
    construction: ['Same as Material Fleece Crew (no decorative stitching)'],
    branding: ['Interior only'],
    trims: ['Neutral drawstring only', 'Universal neck tape (Appendix A)'],
    approvedColors: ['Navy'],
    restrictions: ['Interior only. No exterior marks.'],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B2 \u2014 Fleece',
      construction: 'Appendix C6 \u2014 Material Fleece Crew (construction baseline)',
    },
    intent: ['Materials must justify price without explanation.'],
    ...baseHeader,
  },
];

const originCollection: TechPackData[] = [
  {
    slug: 'origin-graphic-tee',
    collectionSlug: 'origin-collection',
    skuName: 'Origin Graphic Tee',
    collection: 'Origin Collection',
    skuCode: 'LAUNCH-v1-OC-GTEE',
    productType: 'tee',
    colorSwatches: [
      { name: 'Off-White', hex: offWhite },
      { name: 'Washed Navy', hex: fadedNavy },
    ],
    keyMeasurements: ['Fit intent: Same as Essential Tee.', 'Measurement table: Appendix B1 \u2014 Tees.'],
    fabric: ['6.5 oz cotton jersey'],
    fit: ['Same as Essential Tee'],
    construction: ['Same as Essential Tee'],
    branding: ['Graphic: abstract or symbolic only (no large town names)', 'Micro flag allowed'],
    trims: ['Universal neck tape (Appendix A)'],
    approvedColors: ['Off-White', 'Washed Navy'],
    restrictions: [
      lockRequired,
      'Graphic: one placement only. No text-heavy designs. No town name as headline.',
      'Print: soft hand, matte finish. No puff, foil, or specialty inks.',
    ],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B1 \u2014 Tees',
      construction: 'Appendix C7 \u2014 Origin Graphic Tee',
    },
    intent: ['Abstract, symbolic, limited. Never core-coded.'],
    ...baseHeader,
  },
  {
    slug: 'origin-hoodie',
    collectionSlug: 'origin-collection',
    skuName: 'Origin Hoodie',
    collection: 'Origin Collection',
    skuCode: 'LAUNCH-v1-OC-HOOD',
    productType: 'fleece',
    colorSwatches: [{ name: 'Navy', hex: navy }],
    keyMeasurements: ['Measurement table: Appendix B2 \u2014 Fleece.'],
    fabric: ['14 oz brushed fleece'],
    fit: ['Clean, relaxed'],
    construction: ['Same as Core Hoodie'],
    branding: ['Graphic: minimal, symbolic'],
    trims: ['Custom drawstring (approved color)', 'Universal neck tape (Appendix A)'],
    approvedColors: ['Navy'],
    restrictions: [lockRequired, 'Graphic must remain minimal and symbolic.'],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B2 \u2014 Fleece',
      construction: 'Appendix C8 \u2014 Origin Hoodie',
    },
    intent: ['Abstract, symbolic, limited. Never core-coded.'],
    ...baseHeader,
  },
  {
    slug: 'origin-crewneck',
    collectionSlug: 'origin-collection',
    skuName: 'Origin Crewneck',
    collection: 'Origin Collection',
    skuCode: 'LAUNCH-v1-OC-CREW',
    productType: 'fleece',
    colorSwatches: [{ name: 'Off-White', hex: offWhite }],
    keyMeasurements: ['Measurement table: Appendix B2 \u2014 Fleece.'],
    fabric: ['14 oz brushed fleece'],
    fit: ['Classic, structured'],
    construction: ['Same as Core Crewneck'],
    branding: ['Branding: graphic only; no additional marks'],
    trims: ['Universal neck tape (Appendix A)'],
    approvedColors: ['Off-White'],
    restrictions: ['No additional marks beyond approved graphic.'],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B2 \u2014 Fleece',
      construction: 'Appendix C4 \u2014 Core Crewneck (construction baseline)',
    },
    intent: ['Abstract, symbolic, limited.'],
    ...baseHeader,
  },
];

const coastalFunction: TechPackData[] = [
  {
    slug: 'lightweight-performance-swim-hoodie',
    collectionSlug: 'coastal-function',
    skuName: 'Lightweight Performance Swim Hoodie',
    collection: 'Coastal Function',
    skuCode: 'LAUNCH-v1-CF-SHOOD',
    productType: 'swim',
    colorSwatches: [{ name: 'Washed Navy', hex: fadedNavy }],
    keyMeasurements: ['Measurement table: Appendix B3 \u2014 Swim (Hoodie).'],
    fabric: ['Poly-dominant stretch knit (~200 GSM)'],
    fit: ['Functional, calm, non-technical appearance'],
    construction: ['NO French terry', 'NO kangaroo pocket', 'NO ribbing', 'Clean hem finish', 'Hood must lay flat'],
    branding: ['Micro flag only'],
    trims: ['Interior label only as required', 'No ribbing or pockets'],
    approvedColors: ['Washed Navy'],
    restrictions: [lockRequired],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B3 \u2014 Swim (Hoodie)',
      construction: 'Appendix C9 \u2014 Lightweight Performance Swim Hoodie',
    },
    intent: ['Functional, calm, non-technical appearance.'],
    ...baseHeader,
  },
  {
    slug: 'mens-tailored-swim-short',
    collectionSlug: 'coastal-function',
    skuName: "Men\u2019s Tailored Swim Short",
    collection: 'Coastal Function',
    skuCode: 'LAUNCH-v1-CF-MSHORT',
    productType: 'shorts',
    colorSwatches: [
      { name: 'Navy', hex: navy },
      { name: 'Slate (optional)', hex: slate },
    ],
    keyMeasurements: ['Inseam: 5" (all sizes)', "Measurement table: Appendix B3 \u2014 Swim (Men\u2019s Tailored Swim Short)."],
    fabric: ['Matte quick-dry nylon'],
    fit: ['Tailored, clean, not athletic'],
    construction: ['Internal drawcord', 'Clean waistband (no contrast)'],
    branding: ['Interior label only'],
    trims: ['Internal drawcord only'],
    approvedColors: ['Navy (primary)', 'Slate (optional)'],
    restrictions: ['No exterior branding.'],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B3 \u2014 Swim (Short)',
      construction: "Appendix C10 \u2014 Men\u2019s Tailored Swim Short",
    },
    intent: ['Functional, calm, non-technical appearance.'],
    ...baseHeader,
  },
  {
    slug: 'long-sleeve-rash-guard',
    collectionSlug: 'coastal-function',
    skuName: 'Long-Sleeve Rash Guard',
    collection: 'Coastal Function',
    skuCode: 'LAUNCH-v1-CF-RASH',
    productType: 'swim',
    colorSwatches: [{ name: 'Navy', hex: navy }],
    keyMeasurements: [
      'Fit intent: Close but not compressive.',
      'MEASUREMENT TABLE TBD \u2014 REQUIRES APPROVAL.',
    ],
    fabric: ['Matte performance knit'],
    fit: ['Close but not compressive'],
    construction: ['Clean, calm construction (no technical styling cues)'],
    branding: ['Micro flag at hem OR back (LOCK REQUIRED)'],
    trims: ['\u2014'],
    approvedColors: ['Navy'],
    restrictions: [lockRequired, 'MEASUREMENT TABLE TBD \u2014 REQUIRES APPROVAL.'],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B3 \u2014 Swim (TBD)',
      construction: 'Appendix C \u2014 (No SKU-specific delta provided)',
    },
    intent: ['Functional, calm, non-technical appearance.'],
    ...baseHeader,
  },
  {
    slug: 'womens-coastal-short',
    collectionSlug: 'coastal-function',
    skuName: "Women\u2019s Coastal Short",
    collection: "Coastal Function \u2014 Women\u2019s Coastal",
    skuCode: 'LAUNCH-v1-CF-WSHORT',
    productType: 'shorts',
    colorSwatches: [
      { name: 'Washed Navy', hex: fadedNavy },
      { name: 'Ecru (optional)', hex: ecru },
    ],
    keyMeasurements: ['Inseam: 3.5\u20134.5"', "Measurement table: Appendix B3 \u2014 Women\u2019s Coastal Short."],
    fabric: ['Quick-dry woven'],
    fit: ['Mid-rise, relaxed'],
    construction: ['Clean waistband', 'No cargo elements', 'Functional pockets allowed if flat'],
    branding: ['Interior only'],
    trims: ['\u2014'],
    approvedColors: ['Washed Navy', 'Ecru (optional)'],
    restrictions: ['No cargo elements.'],
    appendixRefs: {
      trims: 'Appendix A \u2014 Trim Requirements',
      measurements: 'Appendix B3 \u2014 Coastal (Women)',
      construction: "Appendix C11 \u2014 Women\u2019s Coastal Short",
    },
    intent: ['Functional, calm, non-technical appearance.'],
    ...baseHeader,
  },
];

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const skuGroups: SkuGroup[] = [
  { id: 'core', slug: 'core-essentials', title: '04 \u2014 CORE ESSENTIALS', skus: coreEssentials },
  { id: 'material', slug: 'material-collection', title: '05 \u2014 MATERIAL COLLECTION', skus: materialCollection },
  { id: 'origin', slug: 'origin-collection', title: '06 \u2014 ORIGIN COLLECTION', skus: originCollection },
  { id: 'coastal', slug: 'coastal-function', title: '07 \u2014 COASTAL FUNCTION', skus: coastalFunction },
];

export const allSkus: TechPackData[] = [
  ...coreEssentials,
  ...materialCollection,
  ...originCollection,
  ...coastalFunction,
];

export function getSkuBySlug(
  collectionSlug: string,
  skuSlug: string,
): TechPackData | undefined {
  return allSkus.find(
    (s) => s.collectionSlug === collectionSlug && s.slug === skuSlug,
  );
}

export function getCollectionDisplayName(slug: string): string {
  const group = skuGroups.find((g) => g.slug === slug);
  return group ? group.title.replace(/^\d+\s\u2014\s/, '') : slug;
}

export const MEASUREMENT_SECTIONS = ['tees', 'fleece', 'swim-men', 'coastal-women'] as const;
export type MeasurementSection = (typeof MEASUREMENT_SECTIONS)[number];

export function buildRequiredRoutes(basePath: string): string[] {
  return [
    `${basePath}/cover`,
    `${basePath}/execution-rules`,
    `${basePath}/brand-intent`,
    `${basePath}/collection-overview`,
    ...allSkus.map((s) => `${basePath}/${s.collectionSlug}/${s.slug}`),
    `${basePath}/appendix-a-trims`,
    `${basePath}/appendix-b-measurements/tees`,
    `${basePath}/appendix-b-measurements/fleece`,
    `${basePath}/appendix-b-measurements/swim-men`,
    `${basePath}/appendix-b-measurements/coastal-women`,
    `${basePath}/appendix-c-sku-construction`,
    `${basePath}/final-lock-points`,
  ];
}
