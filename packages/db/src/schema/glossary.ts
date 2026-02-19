/**
 * Glossary — a single-source glossary of domain terms and definitions.
 *
 * Drives both inline InfoTooltips throughout the UI and a dedicated
 * glossary page. Keyed by a unique slug so components can reference
 * terms without coupling to UUIDs.
 */
import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const glossaryTerms = pgTable('glossary_terms', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  term: text('term').notNull(),
  definition: text('definition').notNull(),
  category: text('category'), // planning | product | sourcing | lifecycle | taxonomy | general
  sortOrder: integer('sort_order').notNull().default(0),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
