/**
 * Documents — DB-backed, block-based content pages.
 *
 * A Document is a structured page composed of blocks. Each block has a type,
 * JSON content payload, visibility flags, and lock state. Visibility uses
 * three boolean columns so a block can be visible to multiple audiences.
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { documentStatusEnum, blockTypeEnum } from './enums';
import { users } from './auth';

// ─── Documents ───────────────────────────────────────────────────────

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    section: text('section').notNull(), // docs | assets | tests | techpacks | packs | changelog
    status: documentStatusEnum('status').notNull().default('draft'),

    // Multi-audience visibility (replaces single enum)
    visibleToInternal: boolean('visible_to_internal').notNull().default(true),
    visibleToPartners: boolean('visible_to_partners').notNull().default(false),
    visibleToVendors: boolean('visible_to_vendors').notNull().default(false),

    ownerTeam: text('owner_team'), // brand | product | ops
    createdBy: text('created_by').references(() => users.id),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('documents_section_status_idx').on(table.section, table.status),
    index('documents_status_idx').on(table.status),
  ],
);

// ─── Document blocks ─────────────────────────────────────────────────

export const documentBlocks = pgTable(
  'document_blocks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    type: blockTypeEnum('type').notNull(),
    contentJson: jsonb('content_json').notNull(), // schema varies per block type

    // Multi-audience visibility (block-level gating)
    visibleToInternal: boolean('visible_to_internal').notNull().default(true),
    visibleToPartners: boolean('visible_to_partners').notNull().default(false),
    visibleToVendors: boolean('visible_to_vendors').notNull().default(false),

    locked: boolean('locked').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('document_blocks_document_sort_idx').on(
      table.documentId,
      table.sortOrder,
    ),
  ],
);
