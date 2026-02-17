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
} from '@repo/db/schema';
import { eq, asc } from 'drizzle-orm';
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
