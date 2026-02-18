'use server';

import { auth } from '@repo/auth';
import { db } from '@repo/db/client';
import { brandContext } from '@repo/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string };

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');
  return session.user;
}

export async function getBrandContext() {
  const rows = await db.query.brandContext.findMany({ limit: 1 });
  return rows[0] ?? null;
}

export async function upsertBrandContext(data: {
  positioning?: string;
  targetCustomer?: string;
  priceArchitecture?: string;
  aestheticDirection?: string;
  categoryStrategy?: string;
  antiSpec?: string;
}): Promise<ActionResult> {
  const user = await requireAuth();

  try {
    const existing = await db.query.brandContext.findMany({ limit: 1 });

    if (existing.length > 0) {
      await db
        .update(brandContext)
        .set({ ...data, updatedBy: user.id })
        .where(eq(brandContext.id, existing[0]!.id));
    } else {
      await db.insert(brandContext).values({
        ...data,
        updatedBy: user.id,
      });
    }

    revalidatePath('/internal/brand');
    revalidatePath('/internal/brand/strategy');

    const row = await db.query.brandContext.findMany({ limit: 1 });
    if (row[0]?.id) {
      distillBrandBrief(row[0].id).catch((e) =>
        console.error('[distill] brand brief failed:', e),
      );
    }

    return { success: true };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

export async function regenerateBrandBrief(): Promise<ActionResult> {
  await requireAuth();

  const rows = await db.query.brandContext.findMany({ limit: 1 });
  if (!rows[0]) return { success: false, error: 'No brand context found' };

  try {
    await distillBrandBrief(rows[0].id);
    revalidatePath('/internal/brand/strategy');
    return { success: true };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Distillation failed',
    };
  }
}

async function distillBrandBrief(id: string) {
  const { distillBrandContext } = await import('@/lib/ai/distill');
  const row = await db.query.brandContext.findFirst({
    where: eq(brandContext.id, id),
    columns: {
      positioning: true,
      targetCustomer: true,
      priceArchitecture: true,
      aestheticDirection: true,
      categoryStrategy: true,
      antiSpec: true,
    },
  });
  if (!row) return;
  const brief = await distillBrandContext(row);
  if (brief) {
    await db
      .update(brandContext)
      .set({ contextBrief: brief, contextBriefUpdatedAt: new Date() })
      .where(eq(brandContext.id, id));
    revalidatePath('/internal/brand/strategy');
  }
}
