'use server';

import { auth } from '@repo/auth';
import { db } from '@repo/db/client';
import {
  productCategories,
  productSubcategories,
  productTypes,
  collections,
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
  seasonSlots,
  skuConcepts,
  factoryCapabilities,
  factoryCosting,
  factoryNegotiations,
} from '@repo/db/schema';
import { eq, asc, sql, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type ActionResult = { success: true; data?: unknown } | { success: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');
  return session.user;
}

// ─── Categories ─────────────────────────────────────────────────────

export async function createCategory(data: {
  code: string;
  name: string;
  sortOrder?: number;
}): Promise<ActionResult> {
  await requireAdmin();
  try {
    const [cat] = await db.insert(productCategories).values({
      code: data.code.toLowerCase().replace(/\s+/g, '_'),
      name: data.name,
      sortOrder: data.sortOrder ?? 0,
    }).returning();
    revalidatePath('/internal/product/taxonomy');
    return { success: true, data: { id: cat!.id } };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('unique')) return { success: false, error: 'A category with that code already exists.' };
    return { success: false, error: msg };
  }
}

export async function updateCategory(id: string, data: {
  name?: string;
  status?: 'active' | 'deprecated';
  sortOrder?: number;
}): Promise<ActionResult> {
  await requireAdmin();
  await db.update(productCategories).set(data).where(eq(productCategories.id, id));
  revalidatePath('/internal/product/taxonomy');
  return { success: true };
}

// ─── Subcategories ──────────────────────────────────────────────────

export async function createSubcategory(data: {
  categoryId: string;
  code: string;
  name: string;
  sortOrder?: number;
}): Promise<ActionResult> {
  await requireAdmin();
  try {
    const [sub] = await db.insert(productSubcategories).values({
      categoryId: data.categoryId,
      code: data.code.toLowerCase().replace(/\s+/g, '_'),
      name: data.name,
      sortOrder: data.sortOrder ?? 0,
    }).returning();
    revalidatePath('/internal/product/taxonomy');
    return { success: true, data: { id: sub!.id } };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('unique')) return { success: false, error: 'A subcategory with that code already exists.' };
    return { success: false, error: msg };
  }
}

export async function updateSubcategory(id: string, data: {
  name?: string;
  status?: 'active' | 'deprecated';
  sortOrder?: number;
}): Promise<ActionResult> {
  await requireAdmin();
  await db.update(productSubcategories).set(data).where(eq(productSubcategories.id, id));
  revalidatePath('/internal/product/taxonomy');
  return { success: true };
}

// ─── Product Types ──────────────────────────────────────────────────

export async function createProductType(data: {
  subcategoryId: string;
  code: string;
  name: string;
  sortOrder?: number;
}): Promise<ActionResult> {
  await requireAdmin();
  try {
    const [pt] = await db.insert(productTypes).values({
      subcategoryId: data.subcategoryId,
      code: data.code.toLowerCase().replace(/\s+/g, '_'),
      name: data.name,
      sortOrder: data.sortOrder ?? 0,
    }).returning();
    revalidatePath('/internal/product/taxonomy');
    return { success: true, data: { id: pt!.id } };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('unique')) return { success: false, error: 'A product type with that code already exists.' };
    return { success: false, error: msg };
  }
}

export async function updateProductType(id: string, data: {
  name?: string;
  status?: 'active' | 'deprecated';
  sortOrder?: number;
}): Promise<ActionResult> {
  await requireAdmin();
  await db.update(productTypes).set(data).where(eq(productTypes.id, id));
  revalidatePath('/internal/product/taxonomy');
  return { success: true };
}

// ─── Collections ────────────────────────────────────────────────────

export async function createCollection(data: {
  code: string;
  name: string;
  description?: string;
  sortOrder?: number;
}): Promise<ActionResult> {
  await requireAdmin();
  try {
    const [col] = await db.insert(collections).values({
      code: data.code.toLowerCase().replace(/\s+/g, '_'),
      name: data.name,
      description: data.description ?? null,
      sortOrder: data.sortOrder ?? 0,
    }).returning();
    revalidatePath('/internal/product/taxonomy');
    return { success: true, data: { id: col!.id } };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('unique')) return { success: false, error: 'A collection with that code already exists.' };
    return { success: false, error: msg };
  }
}

export async function updateCollection(id: string, data: {
  name?: string;
  description?: string;
  status?: 'active' | 'deprecated';
  sortOrder?: number;
}): Promise<ActionResult> {
  await requireAdmin();
  await db.update(collections).set(data).where(eq(collections.id, id));
  revalidatePath('/internal/product/taxonomy');
  return { success: true };
}

// ─── Reorder (batch sortOrder update) ────────────────────────────────

export async function reorderCategories(
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(productCategories)
          .set({ sortOrder: i })
          .where(eq(productCategories.id, orderedIds[i]!));
      }
    });
    revalidatePath('/internal/product/taxonomy');
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function reorderSubcategories(
  categoryId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(productSubcategories)
          .set({ sortOrder: i })
          .where(eq(productSubcategories.id, orderedIds[i]!));
      }
    });
    revalidatePath('/internal/product/taxonomy');
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function reorderProductTypes(
  subcategoryId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(productTypes)
          .set({ sortOrder: i })
          .where(eq(productTypes.id, orderedIds[i]!));
      }
    });
    revalidatePath('/internal/product/taxonomy');
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// ─── Reclassify (move to different parent) ──────────────────────────

export async function moveSubcategory(
  id: string,
  toCategoryId: string,
  newIndex: number,
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.transaction(async (tx) => {
      // Re-parent the subcategory
      await tx
        .update(productSubcategories)
        .set({ categoryId: toCategoryId })
        .where(eq(productSubcategories.id, id));

      // Fetch the new parent's subcategories in current order
      const siblings = await tx.query.productSubcategories.findMany({
        where: eq(productSubcategories.categoryId, toCategoryId),
        orderBy: asc(productSubcategories.sortOrder),
      });

      // Build the new order: remove the moved item then splice at newIndex
      const ids = siblings.map((s) => s.id).filter((sid) => sid !== id);
      ids.splice(newIndex, 0, id);

      for (let i = 0; i < ids.length; i++) {
        await tx
          .update(productSubcategories)
          .set({ sortOrder: i })
          .where(eq(productSubcategories.id, ids[i]!));
      }
    });
    revalidatePath('/internal/product/taxonomy');
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function moveProductType(
  id: string,
  toSubcategoryId: string,
  newIndex: number,
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.transaction(async (tx) => {
      // Re-parent the product type
      await tx
        .update(productTypes)
        .set({ subcategoryId: toSubcategoryId })
        .where(eq(productTypes.id, id));

      // Fetch the new parent's product types in current order
      const siblings = await tx.query.productTypes.findMany({
        where: eq(productTypes.subcategoryId, toSubcategoryId),
        orderBy: asc(productTypes.sortOrder),
      });

      // Build the new order: remove the moved item then splice at newIndex
      const ids = siblings.map((p) => p.id).filter((pid) => pid !== id);
      ids.splice(newIndex, 0, id);

      for (let i = 0; i < ids.length; i++) {
        await tx
          .update(productTypes)
          .set({ sortOrder: i })
          .where(eq(productTypes.id, ids[i]!));
      }
    });
    revalidatePath('/internal/product/taxonomy');
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// ─── Generic Dimension CRUD ─────────────────────────────────────────

const DIMENSION_TABLES = {
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
} as const;

type DimensionKey = keyof typeof DIMENSION_TABLES;

export async function createDimensionValue(
  dimension: DimensionKey,
  data: { code: string; label: string; description?: string; sortOrder?: number },
): Promise<ActionResult> {
  await requireAdmin();
  const table = DIMENSION_TABLES[dimension];
  try {
    const [row] = await db.insert(table).values({
      code: data.code.toLowerCase().replace(/\s+/g, '_'),
      label: data.label,
      description: data.description ?? null,
      sortOrder: data.sortOrder ?? 0,
    } as never).returning();
    revalidatePath('/internal/product/taxonomy');
    return { success: true, data: { id: (row as { id: string }).id } };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('unique')) return { success: false, error: `A ${dimension} value with that code already exists.` };
    return { success: false, error: msg };
  }
}

export async function updateDimensionValue(
  dimension: DimensionKey,
  id: string,
  data: { label?: string; description?: string; status?: 'active' | 'deprecated'; sortOrder?: number },
): Promise<ActionResult> {
  await requireAdmin();
  const table = DIMENSION_TABLES[dimension];
  await db.update(table).set(data as never).where(eq((table as typeof constructions).id, id));
  revalidatePath('/internal/product/taxonomy');
  return { success: true };
}

// ─── Usage Checks ──────────────────────────────────────────────────

type UsageResult = { inUse: boolean; usageCount: number; usageDescription: string };

export async function checkCategoryUsage(id: string): Promise<UsageResult> {
  await requireAdmin();

  // Get all product type IDs under this category (via subcategories)
  const subs = await db.query.productSubcategories.findMany({
    where: eq(productSubcategories.categoryId, id),
    columns: { id: true },
  });
  const subIds = subs.map((s) => s.id);

  if (subIds.length === 0) return { inUse: false, usageCount: 0, usageDescription: '' };

  const pts = await db.query.productTypes.findMany({
    where: inArray(productTypes.subcategoryId, subIds),
    columns: { id: true },
  });
  const ptIds = pts.map((p) => p.id);

  let total = 0;
  const parts: string[] = [];

  // Check season_slots referencing child product types
  if (ptIds.length > 0) {
    const [slotCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(seasonSlots)
      .where(inArray(seasonSlots.productTypeId, ptIds));
    if (slotCount!.count > 0) {
      total += slotCount!.count;
      parts.push(`${slotCount!.count} season slot(s)`);
    }
  }

  // Check factory tables referencing child subcategories
  const [capCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(factoryCapabilities)
    .where(inArray(factoryCapabilities.subcategoryId, subIds));
  if (capCount!.count > 0) {
    total += capCount!.count;
    parts.push(`${capCount!.count} factory capability record(s)`);
  }

  const [costCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(factoryCosting)
    .where(inArray(factoryCosting.subcategoryId, subIds));
  if (costCount!.count > 0) {
    total += costCount!.count;
    parts.push(`${costCount!.count} factory costing record(s)`);
  }

  const [negCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(factoryNegotiations)
    .where(inArray(factoryNegotiations.subcategoryId, subIds));
  if (negCount!.count > 0) {
    total += negCount!.count;
    parts.push(`${negCount!.count} factory negotiation(s)`);
  }

  return {
    inUse: total > 0,
    usageCount: total,
    usageDescription: parts.join(', '),
  };
}

export async function checkSubcategoryUsage(id: string): Promise<UsageResult> {
  await requireAdmin();

  let total = 0;
  const parts: string[] = [];

  // Check child product types used in season_slots
  const pts = await db.query.productTypes.findMany({
    where: eq(productTypes.subcategoryId, id),
    columns: { id: true },
  });
  const ptIds = pts.map((p) => p.id);

  if (ptIds.length > 0) {
    const [slotCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(seasonSlots)
      .where(inArray(seasonSlots.productTypeId, ptIds));
    if (slotCount!.count > 0) {
      total += slotCount!.count;
      parts.push(`${slotCount!.count} season slot(s)`);
    }
  }

  // Check factory tables
  const [capCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(factoryCapabilities)
    .where(eq(factoryCapabilities.subcategoryId, id));
  if (capCount!.count > 0) {
    total += capCount!.count;
    parts.push(`${capCount!.count} factory capability record(s)`);
  }

  const [costCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(factoryCosting)
    .where(eq(factoryCosting.subcategoryId, id));
  if (costCount!.count > 0) {
    total += costCount!.count;
    parts.push(`${costCount!.count} factory costing record(s)`);
  }

  const [negCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(factoryNegotiations)
    .where(eq(factoryNegotiations.subcategoryId, id));
  if (negCount!.count > 0) {
    total += negCount!.count;
    parts.push(`${negCount!.count} factory negotiation(s)`);
  }

  return {
    inUse: total > 0,
    usageCount: total,
    usageDescription: parts.join(', '),
  };
}

export async function checkProductTypeUsage(id: string): Promise<UsageResult> {
  await requireAdmin();

  const [slotCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(seasonSlots)
    .where(eq(seasonSlots.productTypeId, id));

  const count = slotCount!.count;
  return {
    inUse: count > 0,
    usageCount: count,
    usageDescription: count > 0 ? `${count} season slot(s)` : '',
  };
}

export async function checkCollectionUsage(id: string): Promise<UsageResult> {
  await requireAdmin();

  const [slotCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(seasonSlots)
    .where(eq(seasonSlots.collectionId, id));

  const count = slotCount!.count;
  return {
    inUse: count > 0,
    usageCount: count,
    usageDescription: count > 0 ? `${count} season slot(s)` : '',
  };
}

const DIMENSION_USAGE_MAP: Record<DimensionKey, () => { table: typeof seasonSlots | typeof skuConcepts; column: unknown }[]> = {
  audienceGenders: () => [{ table: seasonSlots, column: seasonSlots.audienceGenderId }],
  audienceAgeGroups: () => [{ table: seasonSlots, column: seasonSlots.audienceAgeGroupId }],
  sellingWindows: () => [{ table: seasonSlots, column: seasonSlots.sellingWindowId }],
  assortmentTenures: () => [{ table: seasonSlots, column: seasonSlots.assortmentTenureId }],
  constructions: () => [{ table: skuConcepts, column: skuConcepts.constructionId }],
  materialWeightClasses: () => [{ table: skuConcepts, column: skuConcepts.materialWeightClassId }],
  fitBlocks: () => [{ table: skuConcepts, column: skuConcepts.fitBlockId }],
  useCases: () => [{ table: skuConcepts, column: skuConcepts.useCaseId }],
  goodsClasses: () => [{ table: skuConcepts, column: skuConcepts.goodsClassId }],
  sizeScales: () => [{ table: skuConcepts, column: skuConcepts.sizeScaleId }],
};

export async function checkDimensionUsage(
  dimension: DimensionKey,
  id: string,
): Promise<UsageResult> {
  await requireAdmin();

  const refs = DIMENSION_USAGE_MAP[dimension]();
  let total = 0;
  const parts: string[] = [];

  for (const ref of refs) {
    const col = ref.column as typeof seasonSlots.audienceGenderId;
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ref.table)
      .where(eq(col, id));
    if (result!.count > 0) {
      total += result!.count;
      const tableName = ref.table === seasonSlots ? 'season slot(s)' : 'SKU concept(s)';
      parts.push(`${result!.count} ${tableName}`);
    }
  }

  // goodsClasses also referenced by productSubcategories.goodsClassDefaultId
  if (dimension === 'goodsClasses') {
    const [subCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(productSubcategories)
      .where(eq(productSubcategories.goodsClassDefaultId, id));
    if (subCount!.count > 0) {
      total += subCount!.count;
      parts.push(`${subCount!.count} subcategory default(s)`);
    }
  }

  return {
    inUse: total > 0,
    usageCount: total,
    usageDescription: parts.join(', '),
  };
}

// ─── Delete / Archive ───────────────────────────────────────────────

type DeleteResult = { success: true; action: 'deleted' | 'archived' } | { success: false; error: string };

export async function deleteCategory(id: string): Promise<DeleteResult> {
  await requireAdmin();
  try {
    const usage = await checkCategoryUsage(id);
    if (usage.inUse) {
      await db.update(productCategories).set({ status: 'deprecated' }).where(eq(productCategories.id, id));
      revalidatePath('/internal/product/taxonomy');
      return { success: true, action: 'archived' };
    }
    await db.delete(productCategories).where(eq(productCategories.id, id));
    revalidatePath('/internal/product/taxonomy');
    return { success: true, action: 'deleted' };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteSubcategory(id: string): Promise<DeleteResult> {
  await requireAdmin();
  try {
    const usage = await checkSubcategoryUsage(id);
    if (usage.inUse) {
      await db.update(productSubcategories).set({ status: 'deprecated' }).where(eq(productSubcategories.id, id));
      revalidatePath('/internal/product/taxonomy');
      return { success: true, action: 'archived' };
    }
    await db.delete(productSubcategories).where(eq(productSubcategories.id, id));
    revalidatePath('/internal/product/taxonomy');
    return { success: true, action: 'deleted' };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteProductType(id: string): Promise<DeleteResult> {
  await requireAdmin();
  try {
    const usage = await checkProductTypeUsage(id);
    if (usage.inUse) {
      await db.update(productTypes).set({ status: 'deprecated' }).where(eq(productTypes.id, id));
      revalidatePath('/internal/product/taxonomy');
      return { success: true, action: 'archived' };
    }
    await db.delete(productTypes).where(eq(productTypes.id, id));
    revalidatePath('/internal/product/taxonomy');
    return { success: true, action: 'deleted' };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteCollection(id: string): Promise<DeleteResult> {
  await requireAdmin();
  try {
    const usage = await checkCollectionUsage(id);
    if (usage.inUse) {
      await db.update(collections).set({ status: 'deprecated' }).where(eq(collections.id, id));
      revalidatePath('/internal/product/taxonomy');
      return { success: true, action: 'archived' };
    }
    await db.delete(collections).where(eq(collections.id, id));
    revalidatePath('/internal/product/taxonomy');
    return { success: true, action: 'deleted' };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteDimensionValue(
  dimension: DimensionKey,
  id: string,
): Promise<DeleteResult> {
  await requireAdmin();
  const table = DIMENSION_TABLES[dimension];
  try {
    const usage = await checkDimensionUsage(dimension, id);
    if (usage.inUse) {
      await db.update(table).set({ status: 'deprecated' } as never).where(eq((table as typeof constructions).id, id));
      revalidatePath('/internal/product/taxonomy');
      return { success: true, action: 'archived' };
    }
    await db.delete(table).where(eq((table as typeof constructions).id, id));
    revalidatePath('/internal/product/taxonomy');
    return { success: true, action: 'deleted' };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
