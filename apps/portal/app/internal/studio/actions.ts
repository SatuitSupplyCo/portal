'use server';

import { db } from '@repo/db/client';
import {
  studioEntries,
  seasons,
  seasonColors,
  seasonSlots,
  collections,
} from '@repo/db/schema';
import { eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { hasPermission } from '@/lib/permissions';
import { getSessionUser } from '@/lib/session';

type ActionResult = {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
};

export async function createStudioEntry(data: {
  title: string;
  description: string;
  category: 'product' | 'materials' | 'color' | 'brand' | 'reference' | 'operational';
  collectionId?: string;
  tags?: string[];
  intent?: string;
  inspirationSource?: 'internal' | 'competitor' | 'archive' | 'vintage' | 'editorial' | 'trade_show' | 'mill_library' | 'street' | 'other';
  sourceUrl?: string;
  targetSeasonId?: string;
  categoryMetadata?: Record<string, unknown>;
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  if (!data.title.trim()) {
    return { success: false, error: 'Title is required.' };
  }
  if (data.category !== 'color' && !data.description.trim()) {
    return { success: false, error: 'Description is required.' };
  }

  // Validate target season if provided
  if (data.targetSeasonId) {
    const season = await db.query.seasons.findFirst({
      where: (s, { eq }) => eq(s.id, data.targetSeasonId!),
    });
    if (!season) {
      return { success: false, error: 'Target season not found.' };
    }
  }

  try {
    const [entry] = await db
      .insert(studioEntries)
      .values({
        title: data.title.trim(),
        description: data.description.trim() || 'Color reference',
        category: data.category,
        status: 'raw',
        collectionId: data.collectionId || null,
        tags: data.tags ?? [],
        intent: data.intent?.trim() || null,
        inspirationSource: data.inspirationSource || null,
        sourceUrl: data.sourceUrl?.trim() || null,
        targetSeasonId: data.targetSeasonId || null,
        categoryMetadata: data.categoryMetadata ?? {},
        owner: user.name ?? user.email ?? 'Unknown',
        createdBy: user.id,
      })
      .returning();

    revalidatePath('/internal/studio');
    return { success: true, data: { entryId: entry!.id } };
  } catch (err) {
    const cause = err instanceof Error && err.cause instanceof Error ? err.cause : err;
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error('[createStudioEntry] DB error:', message);
    return { success: false, error: message };
  }
}

export async function getSeasonOptions() {
  const allSeasons = await db.query.seasons.findMany({
    orderBy: (s, { desc }) => [desc(s.createdAt)],
  });
  return allSeasons.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
  }));
}

// ─── Color Detail & Edit ────────────────────────────────────────────

export async function getColorDetail(id: string) {
  const entry = await db.query.studioEntries.findFirst({
    where: (e, { eq: eqFn }) => eqFn(e.id, id),
    with: { collectionRef: true },
  });
  if (!entry) return null;

  const meta = entry.categoryMetadata as Record<string, unknown> | null;
  return {
    id: entry.id,
    title: entry.title,
    description: entry.description,
    status: entry.status,
    hex: typeof meta?.hex === 'string' ? meta.hex : null,
    pantone: typeof meta?.pantone === 'string' ? meta.pantone : null,
    tags: (entry.tags as string[]) ?? [],
    owner: entry.owner,
    createdAt: entry.createdAt.toISOString(),
    collectionId: entry.collectionId,
    collectionName: entry.collectionRef?.name ?? null,
    targetSeasonId: entry.targetSeasonId,
    inspirationSource: entry.inspirationSource,
    sourceUrl: entry.sourceUrl,
  };
}

export async function getColorEditContext(colorId: string) {
  const [allSeasons, allCollections, colorSeasonRows, allSlots] =
    await Promise.all([
      db.query.seasons.findMany({
        orderBy: (s, { desc }) => [desc(s.createdAt)],
      }),
      db
        .select({ id: collections.id, name: collections.name })
        .from(collections)
        .orderBy(asc(collections.sortOrder)),
      db.query.seasonColors.findMany({
        where: (sc, { eq: eqFn }) => eqFn(sc.studioEntryId, colorId),
      }),
      db.query.seasonSlots.findMany(),
    ]);

  const usedSeasonIds = new Set(colorSeasonRows.map((r) => r.seasonId));
  const usedSeasons = allSeasons
    .filter((s) => usedSeasonIds.has(s.id))
    .map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      status: colorSeasonRows.find((r) => r.seasonId === s.id)?.status ?? 'proposed',
    }));

  const slotCount = allSlots.filter((slot) => {
    if (slot.status === 'removed') return false;
    const ids = (slot.colorwayIds as string[]) ?? [];
    return ids.includes(colorId);
  }).length;

  return {
    seasons: allSeasons.map((s) => ({ id: s.id, code: s.code, name: s.name })),
    collections: allCollections.map((c) => ({ id: c.id, name: c.name })),
    usage: { seasons: usedSeasons, slotCount },
  };
}

export async function updateStudioEntry(
  id: string,
  data: {
    title?: string;
    description?: string;
    tags?: string[];
    collectionId?: string | null;
    targetSeasonId?: string | null;
    inspirationSource?: string | null;
    sourceUrl?: string | null;
    categoryMetadata?: Record<string, unknown>;
  },
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const entry = await db.query.studioEntries.findFirst({
    where: (e, { eq: eqFn }) => eqFn(e.id, id),
  });
  if (!entry) return { success: false, error: 'Entry not found.' };

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.description !== undefined) updateData.description = data.description.trim();
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.collectionId !== undefined) updateData.collectionId = data.collectionId || null;
  if (data.targetSeasonId !== undefined) updateData.targetSeasonId = data.targetSeasonId || null;
  if (data.inspirationSource !== undefined) updateData.inspirationSource = data.inspirationSource || null;
  if (data.sourceUrl !== undefined) updateData.sourceUrl = data.sourceUrl || null;
  if (data.categoryMetadata !== undefined) updateData.categoryMetadata = data.categoryMetadata;

  await db
    .update(studioEntries)
    .set(updateData)
    .where(eq(studioEntries.id, id));

  revalidatePath('/internal/studio');
  revalidatePath('/internal/product');
  return { success: true };
}
