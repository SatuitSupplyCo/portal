/**
 * Canon documents — immutable, versioned "hard law" content.
 *
 * Canon records are referenced (not edited) inline via canon_ref blocks.
 * Each version is a separate row. The latest active version is the default
 * alias; published documents stay pinned to the version they reference.
 *
 * Canon can also be browsable as standalone pages (e.g. /docs/canon-measurement-rules).
 *
 * Examples: measurement tolerances, order of authority, logo governance.
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { canonStatusEnum } from './enums';
import { users } from './auth';

// ─── Canon documents ─────────────────────────────────────────────────

export const canonDocuments = pgTable(
  'canon_documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    version: text('version').notNull(), // v1.0, v1.1, etc.
    status: canonStatusEnum('status').notNull().default('active'),
    bodyJson: jsonb('body_json').notNull(), // structured block content

    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('canon_documents_slug_version_unq').on(table.slug, table.version),
    index('canon_documents_slug_status_idx').on(table.slug, table.status),
  ],
);
