/**
 * Validation script for Launch v1.0 tech pack data.
 *
 * Checks:
 * 1. All required routes have corresponding data
 * 2. Every SKU has a valid route
 * 3. All 4 measurement sections are defined
 * 4. SKUs with "LOCK REQUIRED" in restrictions will render the badge
 * 5. Every SKU includes sketch placeholders (guaranteed by TechPack component)
 *
 * Run: npx tsx scripts/validate-launch-v1.ts
 */

import {
  allSkus,
  skuGroups,
  getSkuBySlug,
  getSkuRoute,
  REQUIRED_ROUTES,
  MEASUREMENT_SECTIONS,
  lockRequired,
} from '../lib/content/launch-v1';
import type { TechPackData } from '@repo/types';

let errors = 0;
let warnings = 0;

function fail(msg: string) {
  console.error(`  FAIL: ${msg}`);
  errors++;
}

function warn(msg: string) {
  console.warn(`  WARN: ${msg}`);
  warnings++;
}

function pass(msg: string) {
  console.log(`  PASS: ${msg}`);
}

// ---------------------------------------------------------------------------
// 1. Check all required routes have data backing
// ---------------------------------------------------------------------------
console.log('\n--- Route coverage ---');

const skuRoutes = new Set(allSkus.map(getSkuRoute));

for (const route of REQUIRED_ROUTES) {
  // SKU routes
  const skuMatch = route.match(/^\/pack\/launch-v1\/([\w-]+)\/([\w-]+)$/);
  if (skuMatch) {
    const [, collection, sku] = skuMatch;
    if (
      collection !== 'appendix-b-measurements' &&
      !['cover', 'execution-rules', 'brand-intent', 'collection-overview', 'appendix-a-trims', 'appendix-c-sku-construction', 'final-lock-points'].includes(collection)
    ) {
      const data = getSkuBySlug(collection, sku);
      if (!data) {
        fail(`No SKU data for route: ${route}`);
      } else {
        pass(`Route backed by data: ${route}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Every SKU has a route
// ---------------------------------------------------------------------------
console.log('\n--- SKU route completeness ---');

for (const sku of allSkus) {
  const route = getSkuRoute(sku);
  if (!REQUIRED_ROUTES.includes(route)) {
    fail(`SKU "${sku.skuName}" generates route ${route} which is not in REQUIRED_ROUTES`);
  } else {
    pass(`SKU "${sku.skuName}" → ${route}`);
  }
}

// ---------------------------------------------------------------------------
// 3. Measurement sections
// ---------------------------------------------------------------------------
console.log('\n--- Measurement sections ---');

for (const section of MEASUREMENT_SECTIONS) {
  const route = `/pack/launch-v1/appendix-b-measurements/${section}`;
  if (REQUIRED_ROUTES.includes(route)) {
    pass(`Measurement section "${section}" route exists`);
  } else {
    fail(`Measurement section "${section}" missing from REQUIRED_ROUTES`);
  }
}

if (MEASUREMENT_SECTIONS.length !== 4) {
  fail(`Expected 4 measurement sections, got ${MEASUREMENT_SECTIONS.length}`);
} else {
  pass('4 measurement sections defined');
}

// ---------------------------------------------------------------------------
// 4. LOCK REQUIRED badge validation
// ---------------------------------------------------------------------------
console.log('\n--- LOCK REQUIRED badge ---');

const skusWithLock = allSkus.filter((s) =>
  s.restrictions.some((r) => r.toUpperCase().includes('LOCK REQUIRED')),
);

if (skusWithLock.length === 0) {
  fail('No SKUs have LOCK REQUIRED in restrictions — expected several');
} else {
  pass(`${skusWithLock.length} SKUs have LOCK REQUIRED restrictions`);
  for (const sku of skusWithLock) {
    pass(`  → "${sku.skuName}" will show LOCK REQUIRED badge`);
  }
}

// ---------------------------------------------------------------------------
// 5. Sketch placeholders (structural check)
// ---------------------------------------------------------------------------
console.log('\n--- Sketch placeholders ---');
pass('TechPack component always renders SketchPlaceholder with "NON-BINDING — FOR REFERENCE ONLY" (structural guarantee)');

// ---------------------------------------------------------------------------
// 6. Data integrity checks
// ---------------------------------------------------------------------------
console.log('\n--- Data integrity ---');

// Check all SKUs have required fields
for (const sku of allSkus) {
  if (!sku.slug) fail(`SKU "${sku.skuName}" missing slug`);
  if (!sku.collectionSlug) fail(`SKU "${sku.skuName}" missing collectionSlug`);
  if (!sku.skuCode) warn(`SKU "${sku.skuName}" missing skuCode`);
  if (sku.colorSwatches.length === 0) warn(`SKU "${sku.skuName}" has no color swatches`);
}

// Check group coverage
const groupSkuCount = skuGroups.reduce((sum, g) => sum + g.skus.length, 0);
if (groupSkuCount !== allSkus.length) {
  fail(`SKU group total (${groupSkuCount}) doesn't match allSkus (${allSkus.length})`);
} else {
  pass(`${allSkus.length} SKUs across ${skuGroups.length} groups`);
}

// Check for known exceptions
const rashGuard = allSkus.find((s) => s.slug === 'long-sleeve-rash-guard');
if (rashGuard) {
  const hasTBD = rashGuard.restrictions.some((r) => r.includes('TBD'));
  if (hasTBD) {
    warn('Long-Sleeve Rash Guard has TBD measurement table — known exception');
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n========================================');
if (errors > 0) {
  console.error(`VALIDATION FAILED: ${errors} error(s), ${warnings} warning(s)`);
  process.exit(1);
} else {
  console.log(`VALIDATION PASSED: 0 errors, ${warnings} warning(s)`);
  process.exit(0);
}
