'use server';

/**
 * Product lifecycle server actions.
 *
 * Handles studio review/promotion, season management,
 * SKU concept lifecycle transitions, core programs,
 * and sourcing record linking.
 */

import { auth } from '@repo/auth';
import { db } from '@repo/db/client';
import {
  studioEntries,
  seasons,
  seasonSlots,
  skuConcepts,
  skuConceptTransitions,
  corePrograms,
  seasonCoreRefs,
  seasonColors,
  factorySamples,
  factoryCosting,
  skuFactoryAssignments,
  productTypes,
} from '@repo/db/schema';
import { eq, and, count, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import {
  canSubmitForReview,
  canPromoteToConcept,
  canManageSeasons,
  canFillSeasonSlot,
  canApproveTransition,
  canKill,
  canManageCorePrograms,
  canOverride,
  type ProductRole,
} from '@/lib/permissions';
import {
  validateReadyForReview,
  validateConceptTransition,
  validateSeasonSlotAdd,
  validateMinorSeasonRules,
  getNextConceptStatus,
} from '@/lib/lifecycle-rules';

// ─── Helpers ────────────────────────────────────────────────────────

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');
  return session.user;
}

type ActionResult = { success: true; data?: unknown } | { success: false; error: string };

// ─── 3A. Studio Lifecycle Actions ───────────────────────────────────

export async function submitForReview(entryId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canSubmitForReview(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions to submit for review.' };
  }

  const entry = await db.query.studioEntries.findFirst({
    where: eq(studioEntries.id, entryId),
  });

  if (!entry) return { success: false, error: 'Studio entry not found.' };

  if (!['raw', 'exploring', 'prototyping', 'revisions_requested'].includes(entry.status)) {
    return { success: false, error: `Cannot submit for review from status "${entry.status}".` };
  }

  const validation = validateReadyForReview({
    title: entry.title,
    description: entry.description,
    category: entry.category,
    intent: entry.intent,
    problemStatement: entry.problemStatement,
    priceTierTarget: entry.priceTierTarget,
    marginTarget: entry.marginTarget,
    estimatedComplexity: entry.estimatedComplexity,
    replacementVsAdditive: entry.replacementVsAdditive,
  });

  if (!validation.valid) {
    return { success: false, error: validation.errors.join(' ') };
  }

  await db
    .update(studioEntries)
    .set({
      status: 'ready_for_review',
      reviewSubmittedAt: new Date(),
    })
    .where(eq(studioEntries.id, entryId));

  revalidatePath('/internal/studio');
  revalidatePath('/internal/product');
  return { success: true };
}

export async function requestRevisions(
  entryId: string,
  notes: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canPromoteToConcept(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Only Product Lead or Founder can request revisions.' };
  }

  const entry = await db.query.studioEntries.findFirst({
    where: eq(studioEntries.id, entryId),
  });

  if (!entry) return { success: false, error: 'Studio entry not found.' };
  if (entry.status !== 'ready_for_review') {
    return { success: false, error: 'Entry must be in review to request revisions.' };
  }

  await db
    .update(studioEntries)
    .set({ status: 'revisions_requested', archiveReason: notes })
    .where(eq(studioEntries.id, entryId));

  revalidatePath('/internal/studio');
  return { success: true };
}

export async function promoteToConcept(
  entryId: string,
  seasonSlotId: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canPromoteToConcept(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Only Product Lead or Founder can promote to concept.' };
  }

  const entry = await db.query.studioEntries.findFirst({
    where: eq(studioEntries.id, entryId),
  });
  if (!entry) return { success: false, error: 'Studio entry not found.' };
  if (entry.status !== 'ready_for_review') {
    return { success: false, error: 'Entry must be in review to promote.' };
  }

  const slot = await db.query.seasonSlots.findFirst({
    where: eq(seasonSlots.id, seasonSlotId),
  });
  if (!slot) return { success: false, error: 'Season slot not found.' };
  if (slot.status !== 'open') {
    return { success: false, error: 'Season slot is not open.' };
  }
  if (!slot.collectionId) {
    return { success: false, error: 'Slot must have a collection assigned before it can be filled.' };
  }

  // Snapshot structured data at promotion time
  const metadataSnapshot = {
    title: entry.title,
    description: entry.description,
    category: entry.category,
    collectionId: entry.collectionId,
    intent: entry.intent,
    problemStatement: entry.problemStatement,
    priceTierTarget: entry.priceTierTarget,
    marginTarget: entry.marginTarget,
    estimatedComplexity: entry.estimatedComplexity,
    strategicRelevanceScore: entry.strategicRelevanceScore,
    replacementVsAdditive: entry.replacementVsAdditive,
    tags: entry.tags,
    categoryMetadata: entry.categoryMetadata,
  };

  // Create concept
  const [concept] = await db
    .insert(skuConcepts)
    .values({
      seasonSlotId,
      sourceStudioEntryId: entryId,
      metadataSnapshot,
      status: 'draft',
      createdBy: user.id,
    })
    .returning();

  // Fill the slot
  await db
    .update(seasonSlots)
    .set({ status: 'filled' })
    .where(eq(seasonSlots.id, seasonSlotId));

  // Mark studio entry as promoted
  await db
    .update(studioEntries)
    .set({
      status: 'promoted',
      promotedAt: new Date(),
      promotedBy: user.id,
    })
    .where(eq(studioEntries.id, entryId));

  // Log the transition
  await db.insert(skuConceptTransitions).values({
    skuConceptId: concept!.id,
    fromStatus: 'promoted',
    toStatus: 'draft',
    actorUserId: user.id,
    notes: `Promoted from studio entry "${entry.title}"`,
  });

  revalidatePath('/internal/studio');
  revalidatePath('/internal/product');
  return { success: true, data: { conceptId: concept!.id } };
}

// ─── 3B. Season Management Actions ──────────────────────────────────

export async function createSeason(data: {
  code: string;
  name: string;
  description?: string;
  launchDate?: Date;
  seasonType: 'major' | 'minor';
  targetSkuCount: number;
  targetStyleCount?: number;
  marginTarget?: string;
  targetEvergreenPct?: number;
  complexityBudget?: number;
  minorMaxSkus?: number;
  colorPalette?: string[];
  mixTargets?: Record<string, number>;
  genderTargets?: Record<string, number>;
  categoryTargets?: Record<string, number>;
    productTypeTargets?: Record<string, number>;
    sellingWindowTargets?: Record<string, number>;
    tenureTargets?: Record<string, number>;
    ageGroupTargets?: Record<string, number>;
    weightClassTargets?: Record<string, number>;
    useCaseTargets?: Record<string, number>;
    constructionTargets?: Record<string, number>;
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canManageSeasons(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const [season] = await db.insert(seasons).values({
    ...data,
    colorPalette: data.colorPalette ?? [],
    mixTargets: data.mixTargets ?? {},
    genderTargets: data.genderTargets ?? {},
    categoryTargets: data.categoryTargets ?? {},
    productTypeTargets: data.productTypeTargets ?? {},
    sellingWindowTargets: data.sellingWindowTargets ?? {},
    tenureTargets: data.tenureTargets ?? {},
    ageGroupTargets: data.ageGroupTargets ?? {},
    weightClassTargets: data.weightClassTargets ?? {},
    useCaseTargets: data.useCaseTargets ?? {},
    constructionTargets: data.constructionTargets ?? {},
    createdBy: user.id,
  }).returning();

  revalidatePath('/internal/product');
  return { success: true, data: { seasonId: season!.id } };
}

export async function updateSeason(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    launchDate: Date;
    targetSkuCount: number;
    targetStyleCount: number;
    marginTarget: string;
    targetEvergreenPct: number;
    complexityBudget: number;
    minorMaxSkus: number;
    colorPalette: string[];
    mixTargets: Record<string, number>;
    genderTargets: Record<string, number>;
    categoryTargets: Record<string, number>;
    productTypeTargets: Record<string, number>;
    sellingWindowTargets: Record<string, number>;
    tenureTargets: Record<string, number>;
    ageGroupTargets: Record<string, number>;
    weightClassTargets: Record<string, number>;
    useCaseTargets: Record<string, number>;
    constructionTargets: Record<string, number>;
  }>,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canManageSeasons(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  await db.update(seasons).set(data).where(eq(seasons.id, id));

  revalidatePath('/internal/product');
  return { success: true };
}

export async function lockSeason(id: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canManageSeasons(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  await db.update(seasons).set({ status: 'locked' }).where(eq(seasons.id, id));

  revalidatePath('/internal/product');
  return { success: true };
}

export async function createSeasonSlot(
  seasonId: string,
  data: {
    productTypeId: string;
    collectionId?: string;
    audienceGenderId: string;
    audienceAgeGroupId: string;
    sellingWindowId?: string;
    assortmentTenureId?: string;
    colorwayIds?: string[];
    replacementFlag?: boolean;
    notes?: string;
  },
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canFillSeasonSlot(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const season = await db.query.seasons.findFirst({
    where: eq(seasons.id, seasonId),
  });
  if (!season) return { success: false, error: 'Season not found.' };

  // Count existing active slots
  const [slotCount] = await db
    .select({ count: count() })
    .from(seasonSlots)
    .where(and(eq(seasonSlots.seasonId, seasonId), eq(seasonSlots.status, 'open')));

  const currentCount = slotCount?.count ?? 0;

  const validation = validateSeasonSlotAdd(
    {
      seasonType: season.seasonType,
      targetSkuCount: season.targetSkuCount,
      minorMaxSkus: season.minorMaxSkus,
      status: season.status,
    },
    currentCount,
  );

  if (!validation.valid) {
    return { success: false, error: validation.errors.join(' ') };
  }

  // Resolve product type → category for minor season rules
  const productType = await db.query.productTypes.findFirst({
    where: eq(productTypes.id, data.productTypeId),
    with: { subcategory: { with: { category: true } } },
  });
  if (!productType) return { success: false, error: 'Product type not found.' };

  // Check minor season category rules
  if (season.seasonType === 'minor') {
    const existingSlots = await db.query.seasonSlots.findMany({
      where: eq(seasonSlots.seasonId, seasonId),
      with: { productType: { with: { subcategory: { with: { category: true } } } } },
    });
    const existingCategories = [
      ...new Set(existingSlots.map((s) => s.productType.subcategory.category.code)),
    ];
    const minorValidation = validateMinorSeasonRules(
      {
        seasonType: season.seasonType,
        targetSkuCount: season.targetSkuCount,
        minorMaxSkus: season.minorMaxSkus,
        status: season.status,
      },
      productType.subcategory.category.code,
      existingCategories,
    );
    if (!minorValidation.valid) {
      return { success: false, error: minorValidation.errors.join(' ') };
    }
  }

  const [slot] = await db.insert(seasonSlots).values({
    seasonId,
    productTypeId: data.productTypeId,
    collectionId: data.collectionId ?? null,
    audienceGenderId: data.audienceGenderId,
    audienceAgeGroupId: data.audienceAgeGroupId,
    sellingWindowId: data.sellingWindowId ?? null,
    assortmentTenureId: data.assortmentTenureId ?? null,
    colorwayIds: data.colorwayIds ?? [],
    replacementFlag: data.replacementFlag ?? false,
    notes: data.notes,
    createdBy: user.id,
  }).returning();

  revalidatePath('/internal/product');
  return { success: true, data: { slotId: slot!.id } };
}

export async function removeSeasonSlot(slotId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canManageSeasons(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const slot = await db.query.seasonSlots.findFirst({
    where: eq(seasonSlots.id, slotId),
  });
  if (!slot) return { success: false, error: 'Slot not found.' };
  if (slot.status === 'filled') {
    return { success: false, error: 'Cannot remove a filled slot. Kill the concept first.' };
  }

  await db
    .update(seasonSlots)
    .set({ status: 'removed' })
    .where(eq(seasonSlots.id, slotId));

  revalidatePath('/internal/product');
  return { success: true };
}

export async function addCoreRef(
  seasonId: string,
  coreProgramId: string,
  selectedColorways: string[],
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canManageSeasons(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  await db.insert(seasonCoreRefs).values({
    seasonId,
    coreProgramId,
    selectedColorways,
  });

  revalidatePath('/internal/product');
  return { success: true };
}

// ─── 3C. SKU Concept Lifecycle Actions ──────────────────────────────

export async function advanceConcept(
  conceptId: string,
  notes?: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canApproveTransition(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions to advance concept.' };
  }

  const concept = await db.query.skuConcepts.findFirst({
    where: eq(skuConcepts.id, conceptId),
  });
  if (!concept) return { success: false, error: 'Concept not found.' };

  const nextStatus = getNextConceptStatus(concept.status);
  if (!nextStatus) {
    return { success: false, error: 'Concept is already at its final stage.' };
  }

  const validation = validateConceptTransition(
    { status: concept.status },
    nextStatus,
  );
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(' ') };
  }

  // Build timestamp update for the target stage
  const timestampField = `${nextStatus}At` as keyof typeof concept;
  const updateData: Record<string, unknown> = {
    status: nextStatus,
    [timestampField]: new Date(),
  };

  if (nextStatus === 'approved') {
    updateData.approvedBy = user.id;
  }

  await db
    .update(skuConcepts)
    .set(updateData)
    .where(eq(skuConcepts.id, conceptId));

  await db.insert(skuConceptTransitions).values({
    skuConceptId: conceptId,
    fromStatus: concept.status,
    toStatus: nextStatus,
    actorUserId: user.id,
    notes: notes ?? null,
  });

  revalidatePath('/internal/product');
  return { success: true, data: { newStatus: nextStatus } };
}

export async function killConcept(
  conceptId: string,
  reason: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canKill(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Only Founder can kill a concept.' };
  }

  const concept = await db.query.skuConcepts.findFirst({
    where: eq(skuConcepts.id, conceptId),
  });
  if (!concept) return { success: false, error: 'Concept not found.' };
  if (concept.status === 'retired') {
    return { success: false, error: 'Concept is already retired.' };
  }

  // Retire the concept
  await db
    .update(skuConcepts)
    .set({ status: 'retired', retiredAt: new Date() })
    .where(eq(skuConcepts.id, conceptId));

  // Free the slot
  await db
    .update(seasonSlots)
    .set({ status: 'open' })
    .where(eq(seasonSlots.id, concept.seasonSlotId));

  // Log it
  await db.insert(skuConceptTransitions).values({
    skuConceptId: conceptId,
    fromStatus: concept.status,
    toStatus: 'retired',
    actorUserId: user.id,
    notes: `Killed: ${reason}`,
  });

  revalidatePath('/internal/product');
  return { success: true };
}

export async function linkSourcingRecord(
  conceptId: string,
  recordType: 'factory_sample' | 'factory_costing' | 'sku_factory_assignment',
  recordId: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canApproveTransition(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  switch (recordType) {
    case 'factory_sample':
      await db
        .update(factorySamples)
        .set({ skuConceptId: conceptId })
        .where(eq(factorySamples.id, recordId));
      break;
    case 'factory_costing':
      await db
        .update(factoryCosting)
        .set({ skuConceptId: conceptId })
        .where(eq(factoryCosting.id, recordId));
      break;
    case 'sku_factory_assignment':
      await db
        .update(skuFactoryAssignments)
        .set({ skuConceptId: conceptId })
        .where(eq(skuFactoryAssignments.id, recordId));
      break;
    default:
      return { success: false, error: `Unknown record type: ${recordType}` };
  }

  revalidatePath('/internal/product');
  return { success: true };
}

// ─── 3D. Core Program Actions ───────────────────────────────────────

export async function createCoreProgram(data: {
  name: string;
  fabricSpec?: string;
  blockId?: string;
  silhouettes?: string[];
  baseColorways?: string[];
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canManageCorePrograms(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const [program] = await db.insert(corePrograms).values({
    name: data.name,
    fabricSpec: data.fabricSpec,
    blockId: data.blockId,
    silhouettes: data.silhouettes ?? [],
    baseColorways: data.baseColorways ?? [],
    createdBy: user.id,
  }).returning();

  revalidatePath('/internal/product');
  return { success: true, data: { programId: program!.id } };
}

export async function updateCoreProgram(
  id: string,
  data: Partial<{
    name: string;
    fabricSpec: string;
    blockId: string;
    silhouettes: string[];
    baseColorways: string[];
    status: 'active' | 'paused' | 'retired';
  }>,
  isOverride?: boolean,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canManageCorePrograms(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  // Fabric/block changes require founder override
  if ((data.fabricSpec !== undefined || data.blockId !== undefined) && !isOverride) {
    if (!canOverride(user.productRole as ProductRole, user.role)) {
      return {
        success: false,
        error: 'Fabric spec and block changes require Founder override.',
      };
    }
  }

  await db.update(corePrograms).set(data).where(eq(corePrograms.id, id));

  revalidatePath('/internal/product');
  return { success: true };
}

// ─── Season Colors ──────────────────────────────────────────────────

export async function updateSeasonColors(
  seasonId: string,
  colorEntryIds: string[],
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canManageSeasons(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const season = await db.query.seasons.findFirst({
    where: eq(seasons.id, seasonId),
  });
  if (!season) return { success: false, error: 'Season not found.' };

  // Get existing season colors
  const existing = await db.query.seasonColors.findMany({
    where: eq(seasonColors.seasonId, seasonId),
  });
  const existingIds = new Set(existing.map((c) => c.studioEntryId));
  const newIds = new Set(colorEntryIds);

  // Remove colors no longer selected
  const toRemove = existing.filter((c) => !newIds.has(c.studioEntryId));
  if (toRemove.length > 0) {
    await db.delete(seasonColors).where(
      and(
        eq(seasonColors.seasonId, seasonId),
        inArray(seasonColors.studioEntryId, toRemove.map((c) => c.studioEntryId)),
      ),
    );
  }

  // Add newly selected colors
  const toAdd = colorEntryIds.filter((id) => !existingIds.has(id));
  if (toAdd.length > 0) {
    await db.insert(seasonColors).values(
      toAdd.map((entryId, i) => ({
        seasonId,
        studioEntryId: entryId,
        status: 'proposed' as const,
        sortOrder: existing.length + i,
        createdBy: user.id,
      })),
    );
  }

  revalidatePath('/internal/product');
  return { success: true };
}

export async function confirmSeasonColor(
  seasonId: string,
  studioEntryId: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!canManageSeasons(user.productRole as ProductRole, user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  await db
    .update(seasonColors)
    .set({ status: 'confirmed' })
    .where(
      and(
        eq(seasonColors.seasonId, seasonId),
        eq(seasonColors.studioEntryId, studioEntryId),
      ),
    );

  revalidatePath('/internal/product');
  return { success: true };
}
