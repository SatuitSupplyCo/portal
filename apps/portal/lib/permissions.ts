/**
 * Product lifecycle permission helpers.
 *
 * Maps product_role values to specific lifecycle capabilities.
 * These are used by server actions to gate operations and by
 * UI components to conditionally render controls.
 */

export type ProductRole =
  | 'studio_contributor'
  | 'product_lead'
  | 'founder'
  | 'external_designer'
  | 'factory_partner';

// ─── Studio permissions ─────────────────────────────────────────────

export function canSubmitStudio(role: ProductRole | null): boolean {
  if (!role) return false;
  return ['studio_contributor', 'product_lead', 'founder', 'external_designer'].includes(role);
}

export function canSubmitForReview(role: ProductRole | null): boolean {
  if (!role) return false;
  return ['studio_contributor', 'product_lead', 'founder'].includes(role);
}

export function canPromoteToConcept(role: ProductRole | null): boolean {
  if (!role) return false;
  return ['product_lead', 'founder'].includes(role);
}

// ─── Season & slot permissions ──────────────────────────────────────

export function canManageSeasons(role: ProductRole | null): boolean {
  if (!role) return false;
  return ['product_lead', 'founder'].includes(role);
}

export function canFillSeasonSlot(role: ProductRole | null): boolean {
  if (!role) return false;
  return ['product_lead', 'founder'].includes(role);
}

// ─── Concept lifecycle permissions ──────────────────────────────────

export function canApproveTransition(role: ProductRole | null): boolean {
  if (!role) return false;
  return ['product_lead', 'founder'].includes(role);
}

export function canOverride(role: ProductRole | null): boolean {
  if (!role) return false;
  return role === 'founder';
}

export function canKill(role: ProductRole | null): boolean {
  if (!role) return false;
  return role === 'founder';
}

// ─── Core program permissions ───────────────────────────────────────

export function canManageCorePrograms(role: ProductRole | null): boolean {
  if (!role) return false;
  return ['product_lead', 'founder'].includes(role);
}

// ─── Visibility permissions ─────────────────────────────────────────

export function canViewSpecs(role: ProductRole | null): boolean {
  if (!role) return false;
  return true; // all product roles can view specs
}

export function canViewMargins(role: ProductRole | null): boolean {
  if (!role) return false;
  return role !== 'factory_partner';
}

export function canCommentOnAnyStage(role: ProductRole | null): boolean {
  if (!role) return false;
  return role === 'founder';
}
