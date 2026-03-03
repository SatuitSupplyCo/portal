/**
 * Studio design versions and render jobs.
 *
 * Design versions are immutable snapshots of garment design state linked to
 * studio entries. Render jobs track async AI model renders (flat art, mockups,
 * etc.) with input/output payloads and provenance.
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { renderJobStatusEnum } from './enums';
import { users } from './auth';
import { studioEntries } from './studio';

// ─── 1. Studio Design Versions (immutable snapshots) ───────────────────

export const studioDesignVersions = pgTable(
  'studio_design_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    studioEntryId: uuid('studio_entry_id')
      .notNull()
      .references(() => studioEntries.id, { onDelete: 'cascade' }),

    /** Immutable design state snapshot (placement, colors, art refs, etc.) */
    snapshotJson: jsonb('snapshot_json').$type<Record<string, unknown>>().notNull(),
    /** Optional human-readable label for this version */
    label: text('label'),
    /** Version number within this studio entry (1, 2, 3...) */
    version: integer('version').notNull(),

    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('studio_design_versions_entry_idx').on(table.studioEntryId),
    index('studio_design_versions_created_idx').on(table.createdAt),
    index('studio_design_versions_entry_version_idx').on(
      table.studioEntryId,
      table.version,
    ),
  ],
);

// ─── 2. Render Jobs (async AI model render jobs) ──────────────────────

export const renderJobs = pgTable(
  'render_jobs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    status: renderJobStatusEnum('status').notNull().default('queued'),

    inputJson: jsonb('input_json').$type<Record<string, unknown>>().notNull(),
    outputJson: jsonb('output_json').$type<Record<string, unknown>>(),
    error: text('error'),

    provider: text('provider'),
    model: text('model'),
    promptVersion: text('prompt_version').notNull(),

    tokensIn: integer('tokens_in'),
    tokensOut: integer('tokens_out'),
    durationMs: integer('duration_ms'),

    studioEntryId: uuid('studio_entry_id').references(() => studioEntries.id, {
      onDelete: 'set null',
    }),
    designVersionId: uuid('design_version_id').references(
      () => studioDesignVersions.id,
      { onDelete: 'set null' },
    ),

    createdBy: text('created_by').references(() => users.id),
    completedAt: timestamp('completed_at', { mode: 'date', withTimezone: true }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('render_jobs_status_idx').on(table.status),
    index('render_jobs_created_idx').on(table.createdAt),
    index('render_jobs_created_by_idx').on(table.createdBy),
    index('render_jobs_studio_entry_idx').on(table.studioEntryId),
    index('render_jobs_design_version_idx').on(table.designVersionId),
  ],
);
