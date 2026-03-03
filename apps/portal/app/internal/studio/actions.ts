'use server';

import { randomUUID } from 'node:crypto';
import { db } from '@repo/db/client';
import {
  studioEntries,
  seasons,
  seasonColors,
  seasonSlots,
  collections,
  conceptJobs,
  conceptJobAcceptances,
  studioDesignVersions,
  renderJobs,
  assets,
  assetVersions,
} from '@repo/db/schema';
import { eq, asc, desc, inArray, and, gte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { generateObject } from 'ai';
import { hasPermission } from '@/lib/permissions';
import { getSessionUser } from '@/lib/session';
import {
  getConceptingProviderConfig,
  CONCEPTING_PROMPT_VERSION,
} from '@/lib/ai/concepting-config';
import { buildConceptingPrompt, conceptingResponseSchema } from '@/lib/ai/concepting';
import {
  getRenderingProviderConfig,
  RENDER_PROMPT_VERSION,
} from '@/lib/ai/rendering-config';
import { buildRenderingPrompt, renderingResponseSchema } from '@/lib/ai/rendering';
import {
  getRenderImageProviderConfig,
  requestRenderImages,
} from '@/lib/ai/render-image-provider';
import { getModel } from '@/lib/ai/client';
import {
  createDesignAssetUploadSlot,
  isDesignAssetStorageConfigured,
} from '@/lib/storage/design-assets';
import {
  DESIGN_DOCUMENT_SCHEMA_VERSION,
  normalizeDesignDocumentSnapshot,
} from '@/lib/studio/design-document';
import {
  buildConceptContentHash,
  evaluateConceptReuse,
} from '@/lib/studio/concept-policy';
import {
  type CollaborationApprovalPayload,
  readCollaborationApprovalMeta,
  writeCollaborationApprovalMeta,
} from '@/lib/studio/collaboration-approval';
import {
  canDecideCollaborationApproval,
  canRequestCollaborationApproval,
  getNextDesignVersionNumber,
  resolveStatusAfterCollaborationDecision,
} from '@/lib/studio/action-policies';
import {
  RENDER_MAX_ACTIVE_JOBS,
  RENDER_MAX_RETRIES,
  buildRenderInputSummary,
  createRetryInput,
  getRenderRetryCount,
  getRetryCooldownRemainingSeconds,
  moderateRenderInput,
  normalizeRenderRetryMeta,
  validateRenderInputJson,
  getRenderRetryMeta,
} from '@/lib/studio/render-policy';
import { persistRenderOutputImages } from '@/lib/studio/render-assets';

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

export async function getStudioEntryCollaborationApproval(entryId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }
  const id = typeof entryId === 'string' ? entryId.trim() : '';
  if (!id || !isValidUuid(id)) {
    return { success: false, error: 'Invalid studio entry ID.' };
  }

  const entry = await db.query.studioEntries.findFirst({
    where: eq(studioEntries.id, id),
    columns: {
      id: true,
      status: true,
      reviewSubmittedAt: true,
      categoryMetadata: true,
      owner: true,
      updatedAt: true,
    },
  });
  if (!entry) return { success: false, error: 'Studio entry not found.' };

  const meta = (entry.categoryMetadata as Record<string, unknown> | null) ?? {};
  const approval = readCollaborationApprovalMeta(meta);
  return {
    success: true,
    data: {
      entry: {
        id: entry.id,
        status: entry.status,
        owner: entry.owner,
        reviewSubmittedAt: entry.reviewSubmittedAt?.toISOString() ?? null,
        updatedAt: entry.updatedAt?.toISOString() ?? null,
      },
      approval: {
        ...approval,
        events: approval.events,
      },
    },
  };
}

export async function requestStudioEntryCollaborationApproval(
  data: { entryId: string; note?: string },
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.review')) {
    return { success: false, error: 'Insufficient permissions to request review.' };
  }
  const id = typeof data.entryId === 'string' ? data.entryId.trim() : '';
  if (!id || !isValidUuid(id)) {
    return { success: false, error: 'Invalid studio entry ID.' };
  }

  const entry = await db.query.studioEntries.findFirst({
    where: eq(studioEntries.id, id),
    columns: { id: true, status: true, categoryMetadata: true },
  });
  if (!entry) return { success: false, error: 'Studio entry not found.' };
  if (!canRequestCollaborationApproval(entry.status)) {
    return { success: false, error: `Cannot request approval from status "${entry.status}".` };
  }

  const meta = (entry.categoryMetadata as Record<string, unknown> | null) ?? {};
  const approval = readCollaborationApprovalMeta(meta);
  const nowIso = new Date().toISOString();
  const nextApproval: CollaborationApprovalPayload = {
    ...approval,
    state: 'requested',
    requestedAt: nowIso,
    requestedBy: user.id,
    note: typeof data.note === 'string' ? data.note.trim().slice(0, 1000) : undefined,
    events: [
      ...approval.events,
      {
        id: randomUUID(),
        type: 'requested',
        note: typeof data.note === 'string' ? data.note.trim().slice(0, 1000) : undefined,
        byUserId: user.id,
        byLabel: user.name ?? user.email ?? 'Unknown',
        at: nowIso,
      },
    ],
  };

  await db
    .update(studioEntries)
    .set({
      status: 'ready_for_review',
      reviewSubmittedAt: new Date(),
      categoryMetadata: writeCollaborationApprovalMeta(meta, nextApproval),
    })
    .where(eq(studioEntries.id, id));

  revalidatePath('/internal/studio');
  revalidatePath('/internal/studio/design');
  revalidatePath('/internal/studio/product');
  return { success: true };
}

export async function decideStudioEntryCollaborationApproval(
  data: { entryId: string; decision: 'approved' | 'revisions_requested'; note?: string },
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.promote')) {
    return { success: false, error: 'Insufficient permissions to review approval.' };
  }
  const id = typeof data.entryId === 'string' ? data.entryId.trim() : '';
  if (!id || !isValidUuid(id)) {
    return { success: false, error: 'Invalid studio entry ID.' };
  }
  if (data.decision !== 'approved' && data.decision !== 'revisions_requested') {
    return { success: false, error: 'Invalid decision.' };
  }

  const entry = await db.query.studioEntries.findFirst({
    where: eq(studioEntries.id, id),
    columns: { id: true, status: true, categoryMetadata: true },
  });
  if (!entry) return { success: false, error: 'Studio entry not found.' };
  if (!canDecideCollaborationApproval(entry.status)) {
    return { success: false, error: 'Entry must be in review before approval decision.' };
  }

  const meta = (entry.categoryMetadata as Record<string, unknown> | null) ?? {};
  const approval = readCollaborationApprovalMeta(meta);
  const nowIso = new Date().toISOString();
  const note = typeof data.note === 'string' ? data.note.trim().slice(0, 1000) : undefined;
  const nextApproval: CollaborationApprovalPayload = {
    ...approval,
    state: data.decision,
    decidedAt: nowIso,
    decidedBy: user.id,
    note,
    events: [
      ...approval.events,
      {
        id: randomUUID(),
        type: data.decision,
        note,
        byUserId: user.id,
        byLabel: user.name ?? user.email ?? 'Unknown',
        at: nowIso,
      },
    ],
  };

  await db
    .update(studioEntries)
    .set({
      status: resolveStatusAfterCollaborationDecision(data.decision),
      categoryMetadata: writeCollaborationApprovalMeta(meta, nextApproval),
    })
    .where(eq(studioEntries.id, id));

  revalidatePath('/internal/studio');
  revalidatePath('/internal/studio/design');
  revalidatePath('/internal/studio/product');
  return { success: true };
}

// ─── AI Concepting ───────────────────────────────────────────────────

type ConceptJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

type ConceptGenerationConstraints = {
  productTypeCode?: string;
  seasonCode?: string;
  priceTierTarget?: 'entry' | 'mid' | 'premium';
  riskLevel?: 'safe' | 'balanced' | 'exploratory';
  brandVoice?: string;
  customerProfile?: string;
  requiredMotifs?: string[];
  forbiddenMotifs?: string[];
};

type ConceptJobInputV1 = {
  schemaVersion: '1.0';
  inspirationEntryIds: string[];
  constraints?: ConceptGenerationConstraints;
  generation: {
    numConcepts: number;
    temperatureProfile?: 'conservative' | 'balanced' | 'creative';
    seed?: number;
  };
  requestContext?: {
    workspace?: string;
    featureFlag?: string;
    forceNewJob?: boolean;
  };
};

type AiConceptCard = {
  id: string;
  title: string;
  rationale: string;
  constructionIdeas: string[];
  graphicDirection: string[];
  colorDirection: string[];
  confidence?: 'low' | 'medium' | 'high';
  safetyFlags?: string[];
};

type ConceptJobOutputV1 = {
  schemaVersion: '1.0';
  concepts: AiConceptCard[];
  providerMeta: {
    provider: string;
    model: string;
    promptVersion: string;
    tokensIn?: number;
    tokensOut?: number;
    durationMs?: number;
  };
};

function normalizeConceptInput(raw: ConceptJobInputV1): ConceptJobInputV1 {
  const trimmedIds = (raw.inspirationEntryIds ?? []).map((id) => id.trim()).filter(Boolean);
  const uniqueIds = [...new Set(trimmedIds)];
  const requested = raw.generation?.numConcepts ?? 3;
  const numConcepts = Math.max(3, Math.min(5, requested));

  return {
    schemaVersion: '1.0',
    inspirationEntryIds: uniqueIds.slice(0, 5),
    constraints: raw.constraints,
    generation: {
      numConcepts,
      temperatureProfile: raw.generation?.temperatureProfile ?? 'balanced',
      seed: raw.generation?.seed,
    },
    requestContext: raw.requestContext,
  };
}

function buildConceptCards(
  titles: string[],
  input: ConceptJobInputV1,
): AiConceptCard[] {
  const productLabel = input.constraints?.productTypeCode?.replaceAll('_', ' ') ?? 'core silhouette';
  const risk = input.constraints?.riskLevel ?? 'balanced';
  const total = input.generation.numConcepts;

  return Array.from({ length: total }, (_, index) => {
    const title = titles[index % titles.length] ?? 'Studio Direction';
    return {
    id: `concept-${index + 1}`,
    title: `${title} ${index + 1}`,
    rationale: `A ${risk} direction inspired by selected Studio references, translated into a ${productLabel} expression with clear commercial intent.`,
    constructionIdeas: [
      'contrast neck tape',
      'reinforced side seam label placement',
      'material/trim pairing focused on production readiness',
    ],
    graphicDirection: [
      'small chest mark with restrained placement',
      'secondary back graphic that supports the story',
    ],
    colorDirection: [
      'anchor neutral',
      'supporting deep tone',
      'single accent for storytelling',
    ],
    confidence: 'medium',
    safetyFlags: [],
    };
  });
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Concept IDs from stub are e.g. "concept-1"; allow alphanumeric, dash, underscore. */
const CONCEPT_ID_REGEX = /^[a-zA-Z0-9_-]{1,256}$/;

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && UUID_REGEX.test(id.trim());
}

function isValidConceptId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.length <= 256 && CONCEPT_ID_REGEX.test(id.trim());
}

export async function generateConceptDirections(
  rawInput: ConceptJobInputV1,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const rawIds = rawInput?.inspirationEntryIds;
  if (!Array.isArray(rawIds) || rawIds.length === 0) {
    return { success: false, error: 'Select at least one inspiration item.' };
  }
  const validIds = rawIds
    .map((id) => (typeof id === 'string' ? id.trim() : ''))
    .filter((id) => id.length > 0 && isValidUuid(id));
  if (validIds.length === 0) {
    const hasEmpty = rawIds.some((id) => typeof id !== 'string' || id.trim() === '');
    return {
      success: false,
      error: hasEmpty
        ? 'Inspiration IDs cannot be empty.'
        : 'Provide at least one valid inspiration entry ID (UUID format).',
    };
  }

  const input = normalizeConceptInput({ ...rawInput, inspirationEntryIds: validIds });
  if (input.inspirationEntryIds.length < 1) {
    return { success: false, error: 'Select at least one inspiration item.' };
  }

  if (await hasReachedConceptDailyLimit(user.id)) {
    return {
      success: false,
      error: `Daily concept limit reached (${CONCEPT_DAILY_JOB_LIMIT}). Try again tomorrow.`,
    };
  }
  if (await hasReachedConceptActiveLimit(user.id)) {
    return {
      success: false,
      error: `Too many active concept jobs. Wait for some jobs to finish (limit: ${CONCEPT_MAX_ACTIVE_JOBS}).`,
    };
  }

  const contentHash = buildConceptContentHash(input as unknown as Record<string, unknown>);

  if (!input.requestContext?.forceNewJob) {
    const existingCompleted = await db.query.conceptJobs.findFirst({
      where: and(
        eq(conceptJobs.createdBy, user.id),
        eq(conceptJobs.contentHash, contentHash),
        eq(conceptJobs.status, 'completed'),
      ),
      orderBy: [desc(conceptJobs.createdAt)],
      columns: {
        id: true,
        outputJson: true,
      },
    });

    const existingInProgress = await db.query.conceptJobs.findFirst({
      where: and(
        eq(conceptJobs.createdBy, user.id),
        eq(conceptJobs.contentHash, contentHash),
        inArray(conceptJobs.status, ['queued', 'running']),
      ),
      orderBy: [desc(conceptJobs.createdAt)],
      columns: {
        id: true,
        status: true,
      },
    });
    const reuseDecision = evaluateConceptReuse({
      forceNewJob: input.requestContext?.forceNewJob,
      existingCompleted: existingCompleted
        ? { id: existingCompleted.id, outputJson: existingCompleted.outputJson }
        : null,
      existingInProgress: existingInProgress
        ? {
            id: existingInProgress.id,
            status: existingInProgress.status as 'queued' | 'running',
          }
        : null,
    });
    if (reuseDecision.action === 'reuse_completed') {
      return {
        success: true,
        data: {
          jobId: reuseDecision.jobId,
          status: 'completed' as ConceptJobStatus,
          concepts: reuseDecision.concepts,
          reused: true,
        },
      };
    }
    if (reuseDecision.action === 'reject_in_progress') {
      return {
        success: false,
        error: reuseDecision.message,
      };
    }
  }

  const providerConfig = getConceptingProviderConfig();
  const useProvider = providerConfig.enabled;

  const [job] = await db
    .insert(conceptJobs)
    .values({
      status: 'running',
      inputJson: input as unknown as Record<string, unknown>,
      promptVersion: CONCEPTING_PROMPT_VERSION,
      provider: useProvider ? providerConfig.providerLabel : 'stub',
      model: useProvider ? providerConfig.modelId : 'local-template',
      contentHash,
      createdBy: user.id,
    })
    .returning();

  try {
    const inspirations = await db.query.studioEntries.findMany({
      where: inArray(studioEntries.id, input.inspirationEntryIds),
      columns: { id: true, title: true, description: true },
      limit: 5,
    });

    const sourceTitles =
      inspirations.length > 0 ? inspirations.map((row) => row.title) : ['Studio Direction'];
    const sourceDescriptions =
      inspirations.length > 0
        ? inspirations.map((row) => row.description ?? '')
        : [];

    let output: ConceptJobOutputV1;
    let durationMs: number;
    let tokensIn: number;
    let tokensOut: number;

    if (useProvider) {
      const promptContext = {
        inspirationTitles: sourceTitles,
        inspirationDescriptions: sourceDescriptions,
        numConcepts: input.generation.numConcepts,
        productTypeLabel: input.constraints?.productTypeCode?.replaceAll('_', ' '),
        riskLevel: input.constraints?.riskLevel,
        brandVoice: input.constraints?.brandVoice,
        customerProfile: input.constraints?.customerProfile,
      };
      const { system, prompt } = buildConceptingPrompt(promptContext);
      const model = getModel(providerConfig.modelId);
      const startMs = Date.now();

      const result = await generateObject({
        model,
        schema: conceptingResponseSchema,
        system,
        prompt,
        temperature: input.generation.temperatureProfile === 'creative' ? 0.7 : input.generation.temperatureProfile === 'conservative' ? 0.2 : 0.4,
      });

      durationMs = Date.now() - startMs;
      tokensIn = result.usage?.inputTokens ?? 0;
      tokensOut = result.usage?.outputTokens ?? 0;

      if (!result.object?.concepts?.length) {
        throw new Error('Provider returned no concepts');
      }
      const rawConcepts = result.object.concepts;
      const concepts: AiConceptCard[] = rawConcepts.slice(0, input.generation.numConcepts).map((c, i) => ({
        id: c.id ?? `concept-${i + 1}`,
        title: c.title,
        rationale: c.rationale,
        constructionIdeas: Array.isArray(c.constructionIdeas) ? c.constructionIdeas : [],
        graphicDirection: Array.isArray(c.graphicDirection) ? c.graphicDirection : [],
        colorDirection: Array.isArray(c.colorDirection) ? c.colorDirection : [],
        confidence: c.confidence,
        safetyFlags: c.safetyFlags ?? [],
      }));

      output = {
        schemaVersion: '1.0',
        concepts,
        providerMeta: {
          provider: providerConfig.providerLabel,
          model: providerConfig.modelId,
          promptVersion: CONCEPTING_PROMPT_VERSION,
          tokensIn,
          tokensOut,
          durationMs,
        },
      };
    } else {
      durationMs = 0;
      tokensIn = 0;
      tokensOut = 0;
      const concepts = buildConceptCards(sourceTitles, input);
      output = {
        schemaVersion: '1.0',
        concepts,
        providerMeta: {
          provider: 'stub',
          model: 'local-template',
          promptVersion: CONCEPTING_PROMPT_VERSION,
        },
      };
    }

    await db
      .update(conceptJobs)
      .set({
        status: 'completed',
        outputJson: output as unknown as Record<string, unknown>,
        durationMs,
        tokensIn,
        tokensOut,
        completedAt: new Date(),
      })
      .where(eq(conceptJobs.id, job!.id));

    revalidatePath('/internal/studio');
    revalidatePath('/internal/studio/concepting');

    return {
      success: true,
      data: {
        jobId: job!.id,
        status: 'completed' as ConceptJobStatus,
        concepts: output.concepts,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db
      .update(conceptJobs)
      .set({
        status: 'failed',
        error: message,
        completedAt: new Date(),
      })
      .where(eq(conceptJobs.id, job!.id));
    return { success: false, error: message };
  }
}

export async function listConceptJobs(limit = 10): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const clamped = Math.max(1, Math.min(25, limit));
  const jobs = await db.query.conceptJobs.findMany({
    orderBy: [desc(conceptJobs.createdAt)],
    limit: clamped,
    where: (row, { eq: eqFn }) => eqFn(row.createdBy, user.id),
  });

  return { success: true, data: { jobs } };
}

export async function acceptConceptDirection(
  data: {
    conceptJobId: string;
    conceptId: string;
    allowDuplicate?: boolean;
  },
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const conceptJobId = typeof data.conceptJobId === 'string' ? data.conceptJobId.trim() : '';
  const conceptId = typeof data.conceptId === 'string' ? data.conceptId.trim() : '';
  if (!conceptJobId || !isValidUuid(conceptJobId)) {
    return { success: false, error: 'Invalid concept job ID.' };
  }
  if (!isValidConceptId(conceptId)) {
    return { success: false, error: 'Invalid concept ID.' };
  }

  const job = await db.query.conceptJobs.findFirst({
    where: (row, { eq: eqFn }) => eqFn(row.id, conceptJobId),
    with: { acceptances: true },
  });
  if (!job || job.status !== 'completed' || !job.outputJson) {
    return { success: false, error: 'Concept job is not available for acceptance.' };
  }

  if (job.createdBy !== user.id) {
    return { success: false, error: 'You can only accept concepts from your own jobs.' };
  }

  // Default: disallow duplicate acceptances for same (job, concept) → one entry per concept.
  const existingAcceptance = job.acceptances?.find((a) => a.conceptId === conceptId);
  if (existingAcceptance && data.allowDuplicate !== true) {
    return { success: false, error: 'This concept has already been accepted for this job.' };
  }

  const output = job.outputJson as unknown as ConceptJobOutputV1;
  const input = job.inputJson as unknown as ConceptJobInputV1;
  const concept = output.concepts.find((item) => item.id === conceptId);
  if (!concept) {
    return { success: false, error: 'Concept not found in selected job.' };
  }

  const [entry] = await db
    .insert(studioEntries)
    .values({
      title: concept.title,
      description: concept.rationale,
      category: 'product',
      status: 'raw',
      owner: user.name ?? user.email ?? 'Unknown',
      createdBy: user.id,
      tags: ['ai', 'concepting'],
      categoryMetadata: {
        aiConcept: concept,
        provenance: {
          conceptJobId: job.id,
          conceptId: concept.id,
          inspirationEntryIds: input.inspirationEntryIds,
          promptVersion: output.providerMeta.promptVersion,
          provider: output.providerMeta.provider,
          model: output.providerMeta.model,
          acceptedBy: user.id,
          acceptedAt: new Date().toISOString(),
        },
      },
    })
    .returning();

  await db.insert(conceptJobAcceptances).values({
    conceptJobId,
    conceptId,
    studioEntryId: entry!.id,
    acceptedBy: user.id,
  });

  revalidatePath('/internal/studio');
  revalidatePath('/internal/studio/product');
  revalidatePath('/internal/studio/concepting');
  return { success: true, data: { entryId: entry!.id } };
}

// ─── Render Jobs (Design → model render queue) ───────────────────────────

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getRenderPlaceholderUrl(side?: 'front' | 'back'): string {
  return side === 'back'
    ? '/product/placeholders/generic/flats/generic-flat-back.svg'
    : '/product/placeholders/generic/flats/generic-flat-front.svg';
}

function parsePositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  return fallback;
}

function parseBooleanEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase());
}

const CONCEPT_MAX_ACTIVE_JOBS = parsePositiveIntEnv('STUDIO_CONCEPT_MAX_ACTIVE_JOBS', 2);
const CONCEPT_DAILY_JOB_LIMIT = parsePositiveIntEnv('STUDIO_CONCEPT_DAILY_JOB_LIMIT', 30);
const RENDER_DAILY_JOB_LIMIT = parsePositiveIntEnv('STUDIO_RENDER_DAILY_JOB_LIMIT', 60);
const RENDER_WORKER_ENABLED = parseBooleanEnv('STUDIO_RENDER_WORKER_ENABLED', true);
const RENDER_AUTO_PROCESS_ON_ENQUEUE = parseBooleanEnv('STUDIO_RENDER_AUTO_PROCESS_ON_ENQUEUE', false);
const RENDER_DEDUPE_LOOKBACK_LIMIT = 25;

function getStartOfUtcDay(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function hasReachedConceptActiveLimit(userId: string): Promise<boolean> {
  const active = await db.query.conceptJobs.findMany({
    where: and(
      eq(conceptJobs.createdBy, userId),
      inArray(conceptJobs.status, ['queued', 'running']),
    ),
    columns: { id: true },
    limit: CONCEPT_MAX_ACTIVE_JOBS + 1,
  });
  return active.length >= CONCEPT_MAX_ACTIVE_JOBS;
}

async function hasReachedConceptDailyLimit(userId: string): Promise<boolean> {
  const startOfDay = getStartOfUtcDay();
  const todayJobs = await db.query.conceptJobs.findMany({
    where: and(eq(conceptJobs.createdBy, userId), gte(conceptJobs.createdAt, startOfDay)),
    columns: { id: true },
    limit: CONCEPT_DAILY_JOB_LIMIT + 1,
  });
  return todayJobs.length >= CONCEPT_DAILY_JOB_LIMIT;
}

async function hasReachedRenderDailyLimit(userId: string): Promise<boolean> {
  const startOfDay = getStartOfUtcDay();
  const todayJobs = await db.query.renderJobs.findMany({
    where: and(eq(renderJobs.createdBy, userId), gte(renderJobs.createdAt, startOfDay)),
    columns: { id: true },
    limit: RENDER_DAILY_JOB_LIMIT + 1,
  });
  return todayJobs.length >= RENDER_DAILY_JOB_LIMIT;
}


async function hasReachedActiveRenderLimit(userId: string): Promise<boolean> {
  const active = await db.query.renderJobs.findMany({
    where: and(
      eq(renderJobs.createdBy, userId),
      inArray(renderJobs.status, ['queued', 'running']),
    ),
    columns: { id: true },
    limit: RENDER_MAX_ACTIVE_JOBS + 1,
  });
  return active.length >= RENDER_MAX_ACTIVE_JOBS;
}

export async function getRenderProviderHealth(): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const textProvider = getRenderingProviderConfig();
  const imageProvider = getRenderImageProviderConfig();
  return {
    success: true,
    data: {
      textProviderEnabled: textProvider.enabled,
      textProviderLabel: textProvider.providerLabel,
      textModelId: textProvider.modelId,
      imageProviderEnabled: imageProvider.enabled,
      imageProviderConfigured: Boolean(imageProvider.endpointUrl),
      imageProviderLabel: imageProvider.providerLabel,
      workerEnabled: RENDER_WORKER_ENABLED,
      renderDailyLimit: RENDER_DAILY_JOB_LIMIT,
      renderActiveLimit: RENDER_MAX_ACTIVE_JOBS,
      conceptDailyLimit: CONCEPT_DAILY_JOB_LIMIT,
      conceptActiveLimit: CONCEPT_MAX_ACTIVE_JOBS,
    },
  };
}

async function buildProviderRenderOutput(inputJson: Record<string, unknown>): Promise<{
  outputJson: Record<string, unknown>;
  durationMs: number;
  tokensIn: number;
  tokensOut: number;
  provider: string;
  model: string;
}> {
  const providerConfig = getRenderingProviderConfig();
  const summary = buildRenderInputSummary(inputJson);
  const renderSide: 'front' | 'back' | undefined =
    summary.side === 'front' || summary.side === 'back' ? summary.side : undefined;

  if (!providerConfig.enabled) {
    return {
      outputJson: buildStubRenderOutput(inputJson),
      durationMs: 0,
      tokensIn: 0,
      tokensOut: 0,
      provider: 'stub',
      model: 'local-render-template',
    };
  }

  try {
    const { system, prompt } = buildRenderingPrompt({
      productType: summary.productType,
      side: renderSide,
      frontLayerCount: summary.frontLayerCount,
      backLayerCount: summary.backLayerCount,
      textLayers: summary.textLayers,
      colors: summary.colors,
      hasSvgLayers: summary.hasSvgLayers,
      qualityPreset: summary.qualityPreset,
      fitPreset: summary.fitPreset,
      stylingPreset: summary.stylingPreset,
    });

    const model = getModel(providerConfig.modelId);
    const startMs = Date.now();
    const result = await generateObject({
      model,
      schema: renderingResponseSchema,
      system,
      prompt,
      temperature: 0.3,
    });
    const durationMs = Date.now() - startMs;
    const tokensIn = result.usage?.inputTokens ?? 0;
    const tokensOut = result.usage?.outputTokens ?? 0;

    const imageResult = await requestRenderImages({
      renderPlan: result.object as Record<string, unknown>,
      inputSummary: summary as unknown as Record<string, unknown>,
      inputJson,
    });
    const hasProviderImages = imageResult.images.length > 0;

    const outputJson: Record<string, unknown> = {
      images: hasProviderImages
        ? imageResult.images
        : [
            {
              url: getRenderPlaceholderUrl(renderSide),
              label: 'Provider-assisted render preview',
            },
          ],
      renderPlan: result.object,
      providerMeta: {
        provider: providerConfig.providerLabel,
        model: providerConfig.modelId,
        promptVersion: RENDER_PROMPT_VERSION,
        tokensIn,
        tokensOut,
        durationMs,
        imageOutput: hasProviderImages ? 'provider' : 'placeholder',
        imageProvider: imageResult.provider,
        imageProviderModel: imageResult.model,
        imageProviderDurationMs: imageResult.durationMs,
        imageProviderError: imageResult.error,
        qualityPreset: summary.qualityPreset ?? null,
        fitPreset: summary.fitPreset ?? null,
        stylingPreset: summary.stylingPreset ?? null,
      },
      inputSummary: summary,
    };

    return {
      outputJson,
      durationMs,
      tokensIn,
      tokensOut,
      provider: providerConfig.providerLabel,
      model: providerConfig.modelId,
    };
  } catch (error) {
    const fallbackMessage = error instanceof Error ? error.message : String(error);
    const outputJson = buildStubRenderOutput(inputJson);
    outputJson.providerMeta = {
      provider: 'stub-fallback',
      model: 'local-render-template',
      promptVersion: RENDER_PROMPT_VERSION,
      fallbackReason: fallbackMessage,
      generatedAt: new Date().toISOString(),
    };
    return {
      outputJson,
      durationMs: 0,
      tokensIn: 0,
      tokensOut: 0,
      provider: 'stub-fallback',
      model: 'local-render-template',
    };
  }
}

export async function createRenderJob(data: {
  studioEntryId?: string;
  designVersionId?: string;
  inputJson: Record<string, unknown>;
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const validated = validateRenderInputJson(data.inputJson);
  if (!validated.ok) return { success: false, error: validated.error };
  const moderated = moderateRenderInput(validated.data);
  if (!moderated.ok) return { success: false, error: moderated.error };

  if (await hasReachedRenderDailyLimit(user.id)) {
    return {
      success: false,
      error: `Daily render limit reached (${RENDER_DAILY_JOB_LIMIT}). Try again tomorrow.`,
    };
  }

  if (await hasReachedActiveRenderLimit(user.id)) {
    return {
      success: false,
      error: `Too many active render jobs. Wait for some jobs to finish (limit: ${RENDER_MAX_ACTIVE_JOBS}).`,
    };
  }

  const studioEntryId =
    data.studioEntryId != null && data.studioEntryId !== ''
      ? data.studioEntryId.trim()
      : null;
  const designVersionId =
    data.designVersionId != null && data.designVersionId !== ''
      ? data.designVersionId.trim()
      : null;
  const normalizedInput = normalizeRenderRetryMeta(validated.data);

  if (studioEntryId != null && !isValidUuid(studioEntryId)) {
    return { success: false, error: 'Invalid studioEntryId.' };
  }
  if (designVersionId != null && !isValidUuid(designVersionId)) {
    return { success: false, error: 'Invalid designVersionId.' };
  }

  try {
    // Prevent accidental duplicate jobs for the same input from rapid re-clicks/retries.
    const activeJobs = await db.query.renderJobs.findMany({
      where: and(
        eq(renderJobs.createdBy, user.id),
        inArray(renderJobs.status, ['queued', 'running']),
      ),
      columns: {
        id: true,
        status: true,
        inputJson: true,
        studioEntryId: true,
        designVersionId: true,
      },
      orderBy: [desc(renderJobs.createdAt)],
      limit: RENDER_DEDUPE_LOOKBACK_LIMIT,
    });
    const normalizedInputString = JSON.stringify(normalizedInput);
    const duplicate = activeJobs.find((job) => {
      if ((job.studioEntryId ?? null) !== (studioEntryId ?? null)) return false;
      if ((job.designVersionId ?? null) !== (designVersionId ?? null)) return false;
      if (!isPlainObject(job.inputJson)) return false;
      return JSON.stringify(job.inputJson) === normalizedInputString;
    });
    if (duplicate) {
      return {
        success: true,
        data: { jobId: duplicate.id, status: duplicate.status, deduped: true },
      };
    }

    const [job] = await db
      .insert(renderJobs)
      .values({
        status: 'queued',
        inputJson: normalizedInput,
        promptVersion: RENDER_PROMPT_VERSION,
        studioEntryId: studioEntryId ?? null,
        designVersionId: designVersionId ?? null,
        createdBy: user.id,
      })
      .returning();

    revalidatePath('/internal/studio');
    revalidatePath('/internal/studio/design');
    if (RENDER_WORKER_ENABLED && RENDER_AUTO_PROCESS_ON_ENQUEUE) {
      void processRenderJob({ jobId: job!.id });
    }
    return { success: true, data: { jobId: job!.id, status: 'queued' } };
  } catch (err) {
    const cause = err instanceof Error && err.cause instanceof Error ? err.cause : err;
    const message = cause instanceof Error ? cause.message : String(err);
    console.error('[createRenderJob] DB error:', message);
    return { success: false, error: message };
  }
}

export async function retryRenderJob(sourceJobId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const id = typeof sourceJobId === 'string' ? sourceJobId.trim() : '';
  if (!id || !isValidUuid(id)) {
    return { success: false, error: 'Invalid source job ID.' };
  }

  const source = await db.query.renderJobs.findFirst({
    where: eq(renderJobs.id, id),
    columns: {
      id: true,
      createdBy: true,
      inputJson: true,
      studioEntryId: true,
      designVersionId: true,
      createdAt: true,
      completedAt: true,
    },
  });
  if (!source) return { success: false, error: 'Source render job not found.' };
  if (source.createdBy !== user.id) {
    return { success: false, error: 'You can only retry your own render jobs.' };
  }

  const validated = validateRenderInputJson(source.inputJson);
  if (!validated.ok) {
    return { success: false, error: 'Cannot retry job with invalid input payload.' };
  }
  const currentRetryCount = getRenderRetryCount(validated.data);
  if (currentRetryCount >= RENDER_MAX_RETRIES) {
    return {
      success: false,
      error: `Retry limit reached for this render input (max ${RENDER_MAX_RETRIES}).`,
    };
  }

  const baseTime = source.completedAt ?? source.createdAt ?? new Date();
  const waitSeconds = getRetryCooldownRemainingSeconds({
    retryCount: currentRetryCount,
    baseTime,
  });
  if (waitSeconds > 0) {
    return {
      success: false,
      error: `Retry cooldown active. Wait ${waitSeconds}s before retrying this job.`,
    };
  }

  const retryInput = createRetryInput(validated.data, source.id);
  const moderated = moderateRenderInput(retryInput);
  if (!moderated.ok) return { success: false, error: moderated.error };

  if (await hasReachedRenderDailyLimit(user.id)) {
    return {
      success: false,
      error: `Daily render limit reached (${RENDER_DAILY_JOB_LIMIT}). Try again tomorrow.`,
    };
  }

  if (await hasReachedActiveRenderLimit(user.id)) {
    return {
      success: false,
      error: `Too many active render jobs. Wait for some jobs to finish (limit: ${RENDER_MAX_ACTIVE_JOBS}).`,
    };
  }

  const [job] = await db
    .insert(renderJobs)
    .values({
      status: 'queued',
      inputJson: retryInput,
      promptVersion: RENDER_PROMPT_VERSION,
      studioEntryId: source.studioEntryId,
      designVersionId: source.designVersionId,
      createdBy: user.id,
    })
    .returning();

  revalidatePath('/internal/studio');
  revalidatePath('/internal/studio/design');
  return { success: true, data: { jobId: job!.id, status: 'queued' } };
}

export async function cancelRenderJob(jobId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const id = typeof jobId === 'string' ? jobId.trim() : '';
  if (!id || !isValidUuid(id)) {
    return { success: false, error: 'Invalid job ID.' };
  }

  const job = await db.query.renderJobs.findFirst({
    where: eq(renderJobs.id, id),
    columns: { id: true, createdBy: true, status: true },
  });
  if (!job) return { success: false, error: 'Render job not found.' };
  if (job.createdBy !== user.id) {
    return { success: false, error: 'You can only cancel your own render jobs.' };
  }
  if (job.status !== 'queued' && job.status !== 'running') {
    return {
      success: false,
      error: 'Only queued or running jobs can be cancelled.',
    };
  }

  const updated = await db
    .update(renderJobs)
    .set({
      status: 'cancelled',
      error: null,
      completedAt: new Date(),
    })
    .where(
      and(
        eq(renderJobs.id, id),
        inArray(renderJobs.status, ['queued', 'running']),
      ),
    )
    .returning({ id: renderJobs.id });

  if (updated.length === 0) {
    return { success: false, error: 'Job status changed before cancellation.' };
  }

  revalidatePath('/internal/studio');
  revalidatePath('/internal/studio/design');
  return { success: true, data: { jobId: id, status: 'cancelled' } };
}

export async function listRenderJobs(params: {
  studioEntryId?: string;
  designVersionId?: string;
  limit?: number;
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const limit = Math.max(1, Math.min(50, params.limit ?? 10));
  const conditions = [eq(renderJobs.createdBy, user.id)];

  if (params.studioEntryId?.trim() && isValidUuid(params.studioEntryId.trim())) {
    conditions.push(eq(renderJobs.studioEntryId, params.studioEntryId.trim()));
  }
  if (params.designVersionId?.trim() && isValidUuid(params.designVersionId.trim())) {
    conditions.push(eq(renderJobs.designVersionId, params.designVersionId.trim()));
  }

  const jobs = await db.query.renderJobs.findMany({
    where: and(...conditions),
    orderBy: [desc(renderJobs.createdAt)],
    limit,
    columns: {
      id: true,
      status: true,
      studioEntryId: true,
      designVersionId: true,
      createdAt: true,
      completedAt: true,
      error: true,
      outputJson: true,
      durationMs: true,
      inputJson: true,
      provider: true,
      model: true,
      promptVersion: true,
    },
  });

  return {
    success: true,
    data: {
      jobs: jobs.map((j) => {
        const inputJson = isPlainObject(j.inputJson)
          ? (j.inputJson as Record<string, unknown>)
          : {};
        const retryMeta = getRenderRetryMeta(inputJson);
        const retryCount = getRenderRetryCount(inputJson);
        const baseTime = j.completedAt ?? j.createdAt ?? new Date();
        const retryCooldownRemainingSeconds = getRetryCooldownRemainingSeconds({
          retryCount,
          baseTime,
        });
        const outputJson = (j.outputJson as Record<string, unknown> | null) ?? null;
        const providerMeta =
          outputJson && isPlainObject(outputJson.providerMeta)
            ? (outputJson.providerMeta as Record<string, unknown>)
            : null;
        const fallbackReason =
          providerMeta && typeof providerMeta.fallbackReason === 'string'
            ? providerMeta.fallbackReason
            : null;
        const fallbackUsed =
          (typeof j.provider === 'string' && j.provider.includes('fallback')) ||
          (providerMeta != null && typeof providerMeta.provider === 'string' && providerMeta.provider.includes('fallback'));
        return {
          id: j.id,
          status: j.status,
          studioEntryId: j.studioEntryId,
          designVersionId: j.designVersionId,
          createdAt: j.createdAt?.toISOString() ?? null,
          completedAt: j.completedAt?.toISOString() ?? null,
          error: j.error ?? null,
          outputJson,
          durationMs: j.durationMs ?? null,
          provider: j.provider ?? null,
          model: j.model ?? null,
          promptVersion: j.promptVersion ?? null,
          fallbackUsed,
          fallbackReason,
          retryMeta,
          retryCount,
          retryLimit: RENDER_MAX_RETRIES,
          retryCooldownRemainingSeconds,
          retryAllowed:
            retryCount < RENDER_MAX_RETRIES && retryCooldownRemainingSeconds === 0,
        };
      }),
    },
  };
}

/** Worker-style: claim the next queued render job for the current user and transition it to running. Uses status guard to avoid races. */
export async function claimNextRenderJob(): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const next = await db.query.renderJobs.findFirst({
    where: and(
      eq(renderJobs.createdBy, user.id),
      eq(renderJobs.status, 'queued'),
    ),
    orderBy: [asc(renderJobs.createdAt)],
    columns: { id: true, status: true },
  });

  if (!next) {
    return { success: true, data: { claimed: false, jobId: null, status: null } };
  }

  const updated = await db
    .update(renderJobs)
    .set({ status: 'running', error: null })
    .where(
      and(
        eq(renderJobs.id, next.id),
        eq(renderJobs.status, 'queued'),
      ),
    )
    .returning({ id: renderJobs.id, status: renderJobs.status });

  if (updated.length === 0) {
    return { success: true, data: { claimed: false, jobId: null, status: null } };
  }

  revalidatePath('/internal/studio');
  revalidatePath('/internal/studio/design');
  return {
    success: true,
    data: {
      claimed: true,
      jobId: updated[0]!.id,
      status: updated[0]!.status,
    },
  };
}

export async function markRenderJobRunning(jobId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const id = jobId?.trim();
  if (!id || !isValidUuid(id)) {
    return { success: false, error: 'Invalid job ID.' };
  }

  const job = await db.query.renderJobs.findFirst({
    where: eq(renderJobs.id, id),
    columns: { id: true, createdBy: true, status: true },
  });
  if (!job) return { success: false, error: 'Render job not found.' };
  if (job.createdBy !== user.id) {
    return { success: false, error: 'You can only update your own render jobs.' };
  }
  if (job.status !== 'queued') {
    return { success: false, error: 'Only queued jobs can move to running.' };
  }

  const updated = await db
    .update(renderJobs)
    .set({
      status: 'running',
      error: null,
    })
    .where(
      and(eq(renderJobs.id, id), eq(renderJobs.status, 'queued')),
    )
    .returning({ id: renderJobs.id });

  if (updated.length === 0) {
    return { success: false, error: 'Job was already claimed or status changed.' };
  }

  revalidatePath('/internal/studio');
  revalidatePath('/internal/studio/design');
  return { success: true, data: { jobId: id, status: 'running' as const } };
}

/** Internal/scaffold: mark a render job as completed. Call from worker or stub. */
export async function markRenderJobCompleted(
  jobId: string,
  output: { outputJson: Record<string, unknown>; durationMs?: number },
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const id = jobId?.trim();
  if (!id || !isValidUuid(id)) {
    return { success: false, error: 'Invalid job ID.' };
  }

  const job = await db.query.renderJobs.findFirst({
    where: eq(renderJobs.id, id),
    columns: { id: true, createdBy: true, status: true },
  });
  if (!job) return { success: false, error: 'Render job not found.' };
  if (job.createdBy !== user.id) {
    return { success: false, error: 'You can only update your own render jobs.' };
  }
  if (job.status !== 'queued' && job.status !== 'running') {
    return { success: false, error: 'Job is not in a runnable state.' };
  }

  const updated = await db
    .update(renderJobs)
    .set({
      status: 'completed',
      outputJson: output.outputJson,
      durationMs: output.durationMs ?? null,
      completedAt: new Date(),
    })
    .where(
      and(
        eq(renderJobs.id, id),
        inArray(renderJobs.status, ['queued', 'running']),
      ),
    )
    .returning({ id: renderJobs.id });

  if (updated.length === 0) {
    return { success: false, error: 'Job was already completed or failed.' };
  }

  revalidatePath('/internal/studio');
  revalidatePath('/internal/studio/design');
  return { success: true, data: { jobId: id, status: 'completed' as const } };
}

/**
 * Worker-style: process one render job using provider-backed planning when enabled,
 * with automatic fallback to stub output if provider execution fails.
 */
export async function processRenderJob(options?: {
  jobId?: string;
}): Promise<ActionResult> {
  if (!RENDER_WORKER_ENABLED) {
    return { success: false, error: 'Render worker processing is disabled by configuration.' };
  }
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  let jobId: string;
  let inputJson: Record<string, unknown>;

  if (options?.jobId?.trim()) {
    const id = options.jobId.trim();
    if (!isValidUuid(id)) {
      return { success: false, error: 'Invalid job ID.' };
    }
    const job = await db.query.renderJobs.findFirst({
      where: eq(renderJobs.id, id),
      columns: { id: true, createdBy: true, status: true, inputJson: true },
    });
    if (!job) return { success: false, error: 'Render job not found.' };
    if (job.createdBy !== user.id) {
      return { success: false, error: 'You can only process your own render jobs.' };
    }
    if (job.status !== 'queued' && job.status !== 'running') {
      return {
        success: false,
        error: `Job is not runnable (status: ${job.status}).`,
      };
    }
    jobId = job.id;
    inputJson = job.inputJson ?? {};
  } else {
    const claimResult = await claimNextRenderJob();
    if (!claimResult.success) {
      return claimResult;
    }
    const data = claimResult.data as
      | { claimed?: boolean; jobId?: string | null; status?: string }
      | undefined;
    if (!data?.claimed || !data?.jobId) {
      return {
        success: true,
        data: { jobId: null, status: null, processed: false },
      };
    }
    jobId = data.jobId;
    const job = await db.query.renderJobs.findFirst({
      where: eq(renderJobs.id, jobId),
      columns: { inputJson: true },
    });
    inputJson = job?.inputJson ?? {};
  }

  await db
    .update(renderJobs)
    .set({ status: 'running', error: null })
    .where(
      and(
        eq(renderJobs.id, jobId),
        eq(renderJobs.status, 'queued'),
      ),
    );

  const moderation = moderateRenderInput(inputJson);
  if (!moderation.ok) {
    await db
      .update(renderJobs)
      .set({
        status: 'failed',
        error: moderation.error,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(renderJobs.id, jobId),
          inArray(renderJobs.status, ['queued', 'running']),
        ),
      );
    return { success: false, error: moderation.error };
  }

  const execution = await buildProviderRenderOutput(inputJson);

  // Persist non-placeholder image URLs to assets + asset_versions and attach linkage
  const rawImages = execution.outputJson.images;
  if (Array.isArray(rawImages) && rawImages.length > 0) {
    const enrichedImages = await persistRenderOutputImages({
      imageEntries: rawImages as Array<{ url?: string; label?: string }>,
      userId: user.id,
    });
    execution.outputJson = {
      ...execution.outputJson,
      images: enrichedImages,
    };
  }

  const updated = await db
    .update(renderJobs)
    .set({
      status: 'completed',
      outputJson: execution.outputJson,
      durationMs: execution.durationMs,
      tokensIn: execution.tokensIn,
      tokensOut: execution.tokensOut,
      provider: execution.provider,
      model: execution.model,
      promptVersion: RENDER_PROMPT_VERSION,
      completedAt: new Date(),
    })
    .where(
      and(
        eq(renderJobs.id, jobId),
        inArray(renderJobs.status, ['queued', 'running']),
      ),
    )
    .returning({ id: renderJobs.id });

  if (updated.length === 0) {
    return { success: false, error: 'Job was already completed or failed.' };
  }

  revalidatePath('/internal/studio');
  revalidatePath('/internal/studio/design');
  return {
    success: true,
    data: {
      jobId: updated[0]!.id,
      status: 'completed' as const,
      processed: true,
    },
  };
}

export async function processQueuedRenderJobs(limit = 5): Promise<ActionResult> {
  if (!RENDER_WORKER_ENABLED) {
    return { success: false, error: 'Render worker processing is disabled by configuration.' };
  }
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const clampedLimit = Math.max(1, Math.min(25, limit));
  let processed = 0;

  for (let i = 0; i < clampedLimit; i++) {
    const result = await processRenderJob();
    if (!result.success) return result;
    if (!result.data?.processed) break;
    processed += 1;
  }

  return { success: true, data: { processed } };
}

export async function runRenderJobStub(jobId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const id = jobId?.trim();
  if (!id || !isValidUuid(id)) {
    return { success: false, error: 'Invalid job ID.' };
  }

  const job = await db.query.renderJobs.findFirst({
    where: eq(renderJobs.id, id),
    columns: { id: true, createdBy: true, status: true, inputJson: true },
  });
  if (!job) return { success: false, error: 'Render job not found.' };
  if (job.createdBy !== user.id) {
    return { success: false, error: 'You can only run your own render jobs.' };
  }
  if (job.status !== 'queued' && job.status !== 'running') {
    return { success: false, error: 'Job is not in a runnable state.' };
  }

  if (job.status === 'queued') {
    await db
      .update(renderJobs)
      .set({ status: 'running', error: null })
      .where(
        and(eq(renderJobs.id, id), eq(renderJobs.status, 'queued')),
      );
  }

  const outputJson = buildStubRenderOutput(job.inputJson ?? {});

  const updated = await db
    .update(renderJobs)
    .set({
      status: 'completed',
      outputJson,
      durationMs: 1000,
      completedAt: new Date(),
    })
    .where(
      and(
        eq(renderJobs.id, id),
        inArray(renderJobs.status, ['queued', 'running']),
      ),
    )
    .returning({ id: renderJobs.id });

  if (updated.length === 0) {
    return { success: false, error: 'Job was already completed or failed.' };
  }

  revalidatePath('/internal/studio');
  revalidatePath('/internal/studio/design');
  return {
    success: true,
    data: { jobId: id, status: 'completed' as const },
  };
}

/** Shared stub output shape for render jobs (used by runRenderJobStub and processRenderJobStub). */
function buildStubRenderOutput(inputSummary: Record<string, unknown>): Record<string, unknown> {
  return {
    images: [
      {
        url: '/product/placeholders/generic/flats/generic-flat-front.svg',
        label: 'Stub render output',
      },
    ],
    providerMeta: {
      provider: 'stub',
      model: 'local-render-template',
      generatedAt: new Date().toISOString(),
    },
    inputSummary,
  };
}

/** Worker-style: run one render job end-to-end with stub output. Claims next queued job if jobId omitted; otherwise processes the given job (must be queued or running, owned by caller). */
export async function processRenderJobStub(options?: {
  jobId?: string;
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  let jobId: string;
  let inputJson: Record<string, unknown>;

  if (options?.jobId?.trim()) {
    const id = options.jobId.trim();
    if (!isValidUuid(id)) {
      return { success: false, error: 'Invalid job ID.' };
    }
    const job = await db.query.renderJobs.findFirst({
      where: eq(renderJobs.id, id),
      columns: { id: true, createdBy: true, status: true, inputJson: true },
    });
    if (!job) return { success: false, error: 'Render job not found.' };
    if (job.createdBy !== user.id) {
      return { success: false, error: 'You can only process your own render jobs.' };
    }
    if (job.status !== 'queued' && job.status !== 'running') {
      return {
        success: false,
        error: `Job is not runnable (status: ${job.status}).`,
      };
    }
    jobId = job.id;
    inputJson = job.inputJson ?? {};
  } else {
    const claimResult = await claimNextRenderJob();
    if (!claimResult.success) {
      return claimResult;
    }
    const data = claimResult.data as
      | { claimed?: boolean; jobId?: string | null; status?: string }
      | undefined;
    if (!data?.claimed || !data?.jobId) {
      return {
        success: true,
        data: { jobId: null, status: null, processed: false },
      };
    }
    jobId = data.jobId;
    const job = await db.query.renderJobs.findFirst({
      where: eq(renderJobs.id, jobId),
      columns: { inputJson: true },
    });
    inputJson = job?.inputJson ?? {};
  }

  // Ensure running (idempotent if already running)
  await db
    .update(renderJobs)
    .set({ status: 'running', error: null })
    .where(
      and(
        eq(renderJobs.id, jobId),
        eq(renderJobs.status, 'queued'),
      ),
    );

  const outputJson = buildStubRenderOutput(inputJson);

  const updated = await db
    .update(renderJobs)
    .set({
      status: 'completed',
      outputJson,
      durationMs: 1000,
      completedAt: new Date(),
    })
    .where(
      and(
        eq(renderJobs.id, jobId),
        inArray(renderJobs.status, ['queued', 'running']),
      ),
    )
    .returning({ id: renderJobs.id });

  if (updated.length === 0) {
    return { success: false, error: 'Job was already completed or failed.' };
  }

  revalidatePath('/internal/studio');
  revalidatePath('/internal/studio/design');
  return {
    success: true,
    data: {
      jobId: updated[0]!.id,
      status: 'completed' as const,
      processed: true,
    },
  };
}

export async function processQueuedRenderJobsStub(limit = 5): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const clampedLimit = Math.max(1, Math.min(25, limit));
  let processed = 0;

  for (let i = 0; i < clampedLimit; i++) {
    const result = await processRenderJobStub();
    if (!result.success) return result;
    if (!result.data?.processed) break;
    processed += 1;
  }

  return { success: true, data: { processed } };
}

/** Internal/scaffold: mark a render job as failed. Call from worker or stub. */
export async function markRenderJobFailed(
  jobId: string,
  errorMessage: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const id = jobId?.trim();
  if (!id || !isValidUuid(id)) {
    return { success: false, error: 'Invalid job ID.' };
  }

  const job = await db.query.renderJobs.findFirst({
    where: eq(renderJobs.id, id),
    columns: { id: true, createdBy: true, status: true },
  });
  if (!job) return { success: false, error: 'Render job not found.' };
  if (job.createdBy !== user.id) {
    return { success: false, error: 'You can only update your own render jobs.' };
  }
  if (job.status !== 'queued' && job.status !== 'running') {
    return { success: false, error: 'Job is not in a runnable state.' };
  }

  const message =
    typeof errorMessage === 'string' && errorMessage.length > 0
      ? errorMessage.slice(0, 2000)
      : 'Unknown error';

  const updated = await db
    .update(renderJobs)
    .set({
      status: 'failed',
      error: message,
      completedAt: new Date(),
    })
    .where(
      and(
        eq(renderJobs.id, id),
        inArray(renderJobs.status, ['queued', 'running']),
      ),
    )
    .returning({ id: renderJobs.id });

  if (updated.length === 0) {
    return { success: false, error: 'Job was already completed or failed.' };
  }

  revalidatePath('/internal/studio');
  revalidatePath('/internal/studio/design');
  return { success: true, data: { jobId: id, status: 'failed' as const } };
}

// ─── Design versions (studio design version persistence) ─────────────────

export async function saveStudioDesignVersion(
  studioEntryId: string,
  snapshotJson: Record<string, unknown>,
  label?: string | null,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }
  const entryId = typeof studioEntryId === 'string' ? studioEntryId.trim() : '';
  if (!entryId || !isValidUuid(entryId)) {
    return { success: false, error: 'Invalid studio entry ID.' };
  }

  const entry = await db.query.studioEntries.findFirst({
    where: (e, { eq: eqFn }) => eqFn(e.id, entryId),
    columns: { id: true },
  });
  if (!entry) return { success: false, error: 'Studio entry not found.' };
  if (!isPlainObject(snapshotJson)) {
    return { success: false, error: 'Design snapshot must be a plain object.' };
  }
  const normalizedSnapshot = normalizeDesignDocumentSnapshot(snapshotJson);

  const existing = await db.query.studioDesignVersions.findMany({
    where: (v, { eq: eqFn }) => eqFn(v.studioEntryId, entryId),
    columns: { version: true },
    orderBy: (v, { desc: descFn }) => [descFn(v.version)],
    limit: 1,
  });
  const nextVersion = getNextDesignVersionNumber(existing[0]?.version);

  try {
    const [row] = await db
      .insert(studioDesignVersions)
      .values({
        studioEntryId: entryId,
        snapshotJson: normalizedSnapshot,
        label: typeof label === 'string' && label.trim() ? label.trim() : null,
        version: nextVersion,
        createdBy: user.id,
      })
      .returning();

    revalidatePath('/internal/studio');
    revalidatePath('/internal/studio/design');
    return { success: true, data: { versionId: row!.id, version: nextVersion } };
  } catch (err) {
    const cause = err instanceof Error && err.cause instanceof Error ? err.cause : err;
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error('[saveStudioDesignVersion] DB error:', message);
    return { success: false, error: message };
  }
}

export async function listStudioDesignVersions(
  studioEntryId: string,
  limit = 20,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }
  const entryId = typeof studioEntryId === 'string' ? studioEntryId.trim() : '';
  if (!entryId || !isValidUuid(entryId)) {
    return { success: false, error: 'Invalid studio entry ID.' };
  }

  const clamped = Math.max(1, Math.min(100, limit));
  const versions = await db.query.studioDesignVersions.findMany({
    where: (v, { eq: eqFn }) => eqFn(v.studioEntryId, entryId),
    orderBy: (v, { desc: descFn }) => [descFn(v.createdAt)],
    limit: clamped,
    columns: { id: true, version: true, label: true, createdAt: true },
  });

  return {
    success: true,
    data: {
      versions: versions.map((v) => ({
        id: v.id,
        version: v.version,
        label: v.label ?? undefined,
        createdAt: v.createdAt.toISOString(),
      })),
    },
  };
}

export async function getStudioDesignVersion(versionId: string) {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return null;
  }
  const id = typeof versionId === 'string' ? versionId.trim() : '';
  if (!id || !isValidUuid(id)) return null;

  const row = await db.query.studioDesignVersions.findFirst({
    where: (v, { eq: eqFn }) => eqFn(v.id, id),
  });
  if (!row) return null;

  const snapshot =
    row.snapshotJson && isPlainObject(row.snapshotJson)
      ? normalizeDesignDocumentSnapshot(row.snapshotJson as Record<string, unknown>)
      : normalizeDesignDocumentSnapshot({});

  return {
    id: row.id,
    studioEntryId: row.studioEntryId,
    snapshotJson: snapshot,
    label: row.label ?? undefined,
    version: row.version,
    createdAt: row.createdAt.toISOString(),
  };
}

// ─── Design asset library (scaffold: list + create record from metadata/fileUrl) ─

/** Design workflow: allowed asset types for listing (image/svg). */
const DESIGN_ASSET_TYPES = ['image', 'svg'] as const;

/** Design workflow: allowed MIME types for createDesignAssetRecord (scaffold). */
const DESIGN_ALLOWED_MIMES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export type DesignAssetListItem = {
  assetId: string;
  assetVersionId: string;
  fileUrl: string;
  fileName: string | null;
  mime: string;
  createdAt: string;
  versions?: Array<{
    assetVersionId: string;
    fileUrl: string;
    fileName: string | null;
    mime: string;
    createdAt: string;
    isLatest: boolean;
  }>;
};

export type CreateDesignAssetRecordInput = {
  fileUrl: string;
  fileName?: string | null;
  mime: string;
  title?: string | null;
};

/** Max allowed size in bytes for design asset upload requests (10MB). */
const DESIGN_ASSET_MAX_SIZE_BYTES = 10 * 1024 * 1024;

function isDesignAllowedMime(mime: string): boolean {
  const t = typeof mime === 'string' ? mime.trim().toLowerCase() : '';
  return t.length > 0 && DESIGN_ALLOWED_MIMES.includes(t);
}

/** Input for requesting an upload slot (signed URL or placeholder). */
export type CreateDesignAssetUploadRequestInput = {
  fileName: string;
  mime: string;
  desiredSizeBytes: number;
};

/** Success: upload URL (or placeholder) ready for client PUT. */
export type DesignAssetUploadReady = {
  status: 'ready';
  uploadUrl: string;
  method: 'PUT';
  fileUrl: string;
  assetKey: string;
  headers?: Record<string, string>;
  expiresAt?: string;
};

/** Not configured: no storage backend; frontend can show message and retry later. */
export type DesignAssetUploadNotConfigured = {
  status: 'not_configured';
  message: string;
  allowedMimes: readonly string[];
  maxSizeBytes: number;
};

export type CreateDesignAssetUploadRequestResult =
  | { success: true; data: DesignAssetUploadReady | DesignAssetUploadNotConfigured }
  | { success: false; error: string };

export async function createDesignAssetUploadRequest(
  input: CreateDesignAssetUploadRequestInput,
): Promise<CreateDesignAssetUploadRequestResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const fileName = typeof input.fileName === 'string' ? input.fileName.trim() : '';
  const mime = typeof input.mime === 'string' ? input.mime.trim() : '';
  const desiredSizeBytes = typeof input.desiredSizeBytes === 'number' ? input.desiredSizeBytes : 0;

  if (!fileName) {
    return { success: false, error: 'fileName is required.' };
  }
  if (!mime) {
    return { success: false, error: 'mime is required.' };
  }
  if (!isDesignAllowedMime(mime)) {
    return {
      success: false,
      error: `mime must be one of: ${DESIGN_ALLOWED_MIMES.join(', ')}.`,
    };
  }
  if (!Number.isFinite(desiredSizeBytes) || desiredSizeBytes <= 0) {
    return { success: false, error: 'desiredSizeBytes must be a positive number.' };
  }
  if (desiredSizeBytes > DESIGN_ASSET_MAX_SIZE_BYTES) {
    return {
      success: false,
      error: `desiredSizeBytes exceeds maximum ${DESIGN_ASSET_MAX_SIZE_BYTES} (${DESIGN_ASSET_MAX_SIZE_BYTES / (1024 * 1024)}MB).`,
    };
  }

  if (!isDesignAssetStorageConfigured()) {
    return {
      success: true,
      data: {
        status: 'not_configured',
        message:
          'Design asset upload storage is not configured. Set STUDIO_DESIGN_ASSET_BUCKET (and optional STUDIO_DESIGN_ASSET_PUBLIC_BASE_URL).',
        allowedMimes: DESIGN_ALLOWED_MIMES,
        maxSizeBytes: DESIGN_ASSET_MAX_SIZE_BYTES,
      },
    };
  }

  try {
    const slot = await createDesignAssetUploadSlot({
      userId: user.id,
      fileName,
      mime,
    });
    return {
      success: true,
      data: {
        status: 'ready',
        uploadUrl: slot.uploadUrl,
        method: slot.method,
        fileUrl: slot.fileUrl,
        assetKey: slot.assetKey,
        headers: slot.headers,
        expiresAt: slot.expiresAt,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create upload request.';
    console.error('[createDesignAssetUploadRequest] error:', message);
    return { success: false, error: message };
  }
}

export async function listDesignAssets(params?: {
  limit?: number;
  offset?: number;
  sortOrder?: 'newest' | 'oldest';
  includePriorVersions?: boolean;
  versionsPerAsset?: number;
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const limit = Math.max(1, Math.min(100, params?.limit ?? 50));
  const offset = Math.max(0, Math.min(10_000, params?.offset ?? 0));
  const sortOrder = params?.sortOrder === 'oldest' ? 'oldest' : 'newest';
  const includePriorVersions = params?.includePriorVersions === true;
  const versionsPerAsset = includePriorVersions
    ? Math.max(1, Math.min(10, params?.versionsPerAsset ?? 5))
    : 1;
  const assetRows = await db.query.assets.findMany({
    where: (a, { eq, inArray }) =>
      and(eq(a.createdBy, user.id), inArray(a.type, [...DESIGN_ASSET_TYPES])),
    orderBy: (a, { asc: ascFn, desc: descFn }) =>
      sortOrder === 'oldest' ? [ascFn(a.createdAt)] : [descFn(a.createdAt)],
    limit,
    offset,
    with: {
      versions: {
        orderBy: (v, { desc: descFn }) => [descFn(v.createdAt)],
        limit: versionsPerAsset,
        columns: {
          id: true,
          fileUrl: true,
          fileName: true,
          mime: true,
          createdAt: true,
        },
      },
    },
    columns: { id: true },
  });

  const items: DesignAssetListItem[] = assetRows
    .filter((a) => a.versions && a.versions.length > 0)
    .map((a) => {
      const v = a.versions![0]!;
      return {
        assetId: a.id,
        assetVersionId: v.id,
        fileUrl: v.fileUrl,
        fileName: v.fileName ?? null,
        mime: v.mime,
        createdAt: v.createdAt.toISOString(),
        versions: includePriorVersions
          ? a.versions!.map((version, index) => ({
              assetVersionId: version.id,
              fileUrl: version.fileUrl,
              fileName: version.fileName ?? null,
              mime: version.mime,
              createdAt: version.createdAt.toISOString(),
              isLatest: index === 0,
            }))
          : undefined,
      };
    });

  return { success: true, data: { assets: items } };
}

export async function createDesignAssetRecord(
  data: CreateDesignAssetRecordInput,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!hasPermission(user, 'studio.submit')) {
    return { success: false, error: 'Insufficient permissions.' };
  }

  const fileUrl = typeof data.fileUrl === 'string' ? data.fileUrl.trim() : '';
  const mime = typeof data.mime === 'string' ? data.mime.trim() : '';

  if (!fileUrl) {
    return { success: false, error: 'fileUrl is required.' };
  }
  if (!mime) {
    return { success: false, error: 'mime is required.' };
  }
  if (!isDesignAllowedMime(mime)) {
    return {
      success: false,
      error: `mime must be one of: ${DESIGN_ALLOWED_MIMES.join(', ')}.`,
    };
  }

  const fileName =
    typeof data.fileName === 'string' && data.fileName.trim()
      ? data.fileName.trim()
      : null;
  const title =
    typeof data.title === 'string' && data.title.trim()
      ? data.title.trim()
      : fileName ?? 'Untitled asset';

  const assetType = mime.toLowerCase() === 'image/svg+xml' ? 'svg' : 'image';

  try {
    const [asset] = await db
      .insert(assets)
      .values({
        title,
        type: assetType,
        tags: [],
        createdBy: user.id,
      })
      .returning();

    const [version] = await db
      .insert(assetVersions)
      .values({
        assetId: asset!.id,
        fileUrl,
        fileName: fileName ?? null,
        mime: mime.toLowerCase(),
        size: 0, // scaffold: no real upload yet
        status: 'draft',
        uploadedBy: user.id,
      })
      .returning();

    revalidatePath('/internal/studio');
    revalidatePath('/internal/studio/design');

    return {
      success: true,
      data: {
        assetId: asset!.id,
        assetVersionId: version!.id,
        fileUrl: version!.fileUrl,
        fileName: version!.fileName ?? null,
        mime: version!.mime,
      },
    };
  } catch (err) {
    const cause = err instanceof Error && err.cause instanceof Error ? err.cause : err;
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error('[createDesignAssetRecord] DB error:', message);
    return { success: false, error: message };
  }
}
