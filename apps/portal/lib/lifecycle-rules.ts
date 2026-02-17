/**
 * Product lifecycle validation rules.
 *
 * These enforce governance constraints: required fields before review,
 * season capacity limits, sequential stage progression, and minor
 * season discipline rules.
 */

// ─── Types ──────────────────────────────────────────────────────────

interface StudioEntryForValidation {
  title: string;
  description: string;
  category: string;
  intent: string | null;
  problemStatement: string | null;
  priceTierTarget: string | null;
  marginTarget: string | null;
  estimatedComplexity: number | null;
  replacementVsAdditive: string | null;
}

interface SeasonForValidation {
  seasonType: 'major' | 'minor';
  targetSkuCount: number;
  minorMaxSkus: number | null;
  status: string;
}

interface ConceptForValidation {
  status: string;
}

// ─── Studio validation ──────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const REQUIRED_FOR_REVIEW: Array<{
  field: keyof StudioEntryForValidation;
  label: string;
}> = [
  { field: 'intent', label: 'Intent' },
  { field: 'problemStatement', label: 'Problem Statement' },
  { field: 'priceTierTarget', label: 'Price Tier Target' },
  { field: 'estimatedComplexity', label: 'Complexity Estimate' },
  { field: 'replacementVsAdditive', label: 'Replacement vs Additive' },
];

export function validateReadyForReview(
  entry: StudioEntryForValidation,
): ValidationResult {
  const errors: string[] = [];

  if (!entry.title.trim()) errors.push('Title is required.');
  if (!entry.description.trim()) errors.push('Description is required.');

  for (const { field, label } of REQUIRED_FOR_REVIEW) {
    const value = entry[field];
    if (value === null || value === undefined || value === '') {
      errors.push(`${label} is required before submitting for review.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Season slot validation ─────────────────────────────────────────

export function validateSeasonSlotFill(
  season: SeasonForValidation,
  currentFilledSlots: number,
): ValidationResult {
  const errors: string[] = [];
  const cap =
    season.seasonType === 'minor' && season.minorMaxSkus
      ? season.minorMaxSkus
      : season.targetSkuCount;

  if (currentFilledSlots >= cap) {
    errors.push(
      `Season is at capacity (${currentFilledSlots}/${cap} slots filled). Override required to add more.`,
    );
  }

  if (season.status === 'closed') {
    errors.push('Cannot fill slots in a closed season.');
  }

  return { valid: errors.length === 0, errors };
}

export function validateSeasonSlotAdd(
  season: SeasonForValidation,
  currentSlotCount: number,
): ValidationResult {
  const errors: string[] = [];
  const cap =
    season.seasonType === 'minor' && season.minorMaxSkus
      ? season.minorMaxSkus
      : season.targetSkuCount;

  if (currentSlotCount >= cap) {
    errors.push(
      `Cannot exceed target SKU count (${cap}). Override required.`,
    );
  }

  if (season.status === 'locked' || season.status === 'closed') {
    errors.push(`Cannot add slots to a ${season.status} season.`);
  }

  return { valid: errors.length === 0, errors };
}

// ─── Concept stage validation ───────────────────────────────────────

const CONCEPT_STAGE_ORDER = [
  'draft',
  'spec',
  'sampling',
  'costing',
  'approved',
  'production',
  'live',
  'retired',
] as const;

export type ConceptStatus = (typeof CONCEPT_STAGE_ORDER)[number];

export function validateConceptTransition(
  concept: ConceptForValidation,
  targetStatus: string,
): ValidationResult {
  const errors: string[] = [];
  const currentIdx = CONCEPT_STAGE_ORDER.indexOf(
    concept.status as ConceptStatus,
  );
  const targetIdx = CONCEPT_STAGE_ORDER.indexOf(
    targetStatus as ConceptStatus,
  );

  if (currentIdx === -1) {
    errors.push(`Current status "${concept.status}" is not recognized.`);
    return { valid: false, errors };
  }

  if (targetIdx === -1) {
    errors.push(`Target status "${targetStatus}" is not recognized.`);
    return { valid: false, errors };
  }

  // Must advance exactly one step (no skipping)
  if (targetIdx !== currentIdx + 1) {
    const nextStatus = CONCEPT_STAGE_ORDER[currentIdx + 1];
    errors.push(
      `Cannot skip from "${concept.status}" to "${targetStatus}". Next stage is "${nextStatus}".`,
    );
  }

  return { valid: errors.length === 0, errors };
}

export function getNextConceptStatus(
  currentStatus: string,
): ConceptStatus | null {
  const idx = CONCEPT_STAGE_ORDER.indexOf(currentStatus as ConceptStatus);
  if (idx === -1 || idx >= CONCEPT_STAGE_ORDER.length - 1) return null;
  return CONCEPT_STAGE_ORDER[idx + 1];
}

// ─── Minor season rules ─────────────────────────────────────────────

export function validateMinorSeasonRules(
  season: SeasonForValidation,
  newCategory: string,
  existingCategories: string[],
): ValidationResult {
  const errors: string[] = [];

  if (season.seasonType !== 'minor') {
    return { valid: true, errors: [] };
  }

  // Minor seasons cannot introduce new categories without override
  if (!existingCategories.includes(newCategory)) {
    errors.push(
      `Minor seasons cannot introduce new category "${newCategory}" without override. Existing categories: ${existingCategories.join(', ') || 'none'}.`,
    );
  }

  return { valid: errors.length === 0, errors };
}
