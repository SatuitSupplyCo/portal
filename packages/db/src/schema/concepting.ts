/**
 * Studio AI concepting jobs.
 *
 * Stores asynchronous concept-generation requests and accepted outputs
 * that are promoted into Studio draft entries.
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
import { conceptJobStatusEnum } from './enums';
import { users } from './auth';
import { studioEntries } from './studio';

export const conceptJobs = pgTable(
  'concept_jobs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    status: conceptJobStatusEnum('status').notNull().default('queued'),
    inputJson: jsonb('input_json').$type<Record<string, unknown>>().notNull(),
    outputJson: jsonb('output_json').$type<Record<string, unknown>>(),
    error: text('error'),
    provider: text('provider'),
    model: text('model'),
    promptVersion: text('prompt_version').notNull(),
    durationMs: integer('duration_ms'),
    tokensIn: integer('tokens_in'),
    tokensOut: integer('tokens_out'),
    contentHash: text('content_hash'),
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
    index('concept_jobs_status_idx').on(table.status),
    index('concept_jobs_created_idx').on(table.createdAt),
    index('concept_jobs_created_by_idx').on(table.createdBy),
  ],
);

export const conceptJobAcceptances = pgTable(
  'concept_job_acceptances',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conceptJobId: uuid('concept_job_id')
      .notNull()
      .references(() => conceptJobs.id, { onDelete: 'cascade' }),
    conceptId: text('concept_id').notNull(),
    studioEntryId: uuid('studio_entry_id')
      .notNull()
      .references(() => studioEntries.id, { onDelete: 'cascade' }),
    acceptedBy: text('accepted_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('concept_job_acceptances_job_idx').on(table.conceptJobId),
    index('concept_job_acceptances_entry_idx').on(table.studioEntryId),
  ],
);
