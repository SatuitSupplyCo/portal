'use server';

import { auth } from '@repo/auth';
import { db } from '@repo/db/client';
import { studioEntries, seasons, users } from '@repo/db/schema';
import { revalidatePath } from 'next/cache';
import { canSubmitStudio, type ProductRole } from '@/lib/permissions';

type ActionResult = {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
};

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  // Verify the session user still exists in the DB (JWT can outlive a DB reset)
  const dbUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, session.user.id),
  });
  if (!dbUser) {
    throw new Error(
      'Your session references a user that no longer exists in the database. Please sign out and sign back in.',
    );
  }

  return session.user;
}

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
  if (!canSubmitStudio(user.productRole as ProductRole)) {
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
