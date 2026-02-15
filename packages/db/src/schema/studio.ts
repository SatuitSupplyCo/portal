/**
 * Studio — the structured exploration layer of Satuit OS.
 *
 * Captures product and brand inspiration, organizes raw ideas without
 * committing to SKU creation, provides traceable upstream context,
 * and feeds Assortment and Sourcing intentionally.
 *
 * Tables:
 *   studio_entries       — primary inspiration entity
 *   studio_entry_images  — multi-image support per entry
 *   studio_entry_attachments — file attachments (PDF, spec sheets, etc.)
 *   studio_entry_links   — linkable references to other system objects
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import {
  studioCategoryEnum,
  studioStatusEnum,
  studioInspirationSourceEnum,
  studioLinkTypeEnum,
} from './enums';
import { users } from './auth';

// ─── 1. Studio Entries (Primary Entity) ──────────────────────────────

export const studioEntries = pgTable(
  'studio_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Core identity
    title: text('title').notNull(),
    description: text('description').notNull(), // "why this matters"
    category: studioCategoryEnum('category').notNull(),
    status: studioStatusEnum('status').notNull().default('raw'),

    // Categorization
    tags: jsonb('tags').$type<string[]>().default([]), // Collection, Season, Silhouette, Fabric Type, etc.
    collection: text('collection'), // e.g. "FW26", "Core"
    season: text('season'), // e.g. "FW26", "SS27"

    // Source tracking
    inspirationSource: studioInspirationSourceEnum('inspiration_source'),
    sourceUrl: text('source_url'), // URL embed (articles, lookbooks, etc.)

    // Scoring
    estimatedComplexity: integer('estimated_complexity'), // 1–5
    strategicRelevanceScore: integer('strategic_relevance_score'), // 1–5

    // ── Category-specific metadata (stored as JSON) ──────────────────
    // Populated based on category:
    //
    // Product: { silhouetteType, constructionFeatures, trimNotes, fitDirection }
    // Materials: { weight, composition, handFeel, potentialApplications, millReference }
    // Brand: { photographyMood, textureReferences, colorStudies, editorialDirection }
    // Reference: { competitorName, pricingObservations, fitCommentary, verdict }
    // Operational: { factoryTechnique, finishingMethod, packagingExecution }
    categoryMetadata: jsonb('category_metadata').$type<Record<string, unknown>>().default({}),

    // Archive reason (required when status = archived)
    archiveReason: text('archive_reason'),

    // Ownership
    owner: text('owner').notNull(), // free-text owner name
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
    index('studio_entries_category_idx').on(table.category),
    index('studio_entries_status_idx').on(table.status),
    index('studio_entries_owner_idx').on(table.owner),
    index('studio_entries_season_idx').on(table.season),
    index('studio_entries_collection_idx').on(table.collection),
    index('studio_entries_relevance_idx').on(table.strategicRelevanceScore),
    index('studio_entries_created_idx').on(table.createdAt),
  ],
);

// ─── 2. Studio Entry Images ─────────────────────────────────────────

export const studioEntryImages = pgTable(
  'studio_entry_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    entryId: uuid('entry_id')
      .notNull()
      .references(() => studioEntries.id, { onDelete: 'cascade' }),

    fileUrl: text('file_url').notNull(),
    fileName: text('file_name').notNull(),
    mime: text('mime'),
    caption: text('caption'),
    sortOrder: integer('sort_order').notNull().default(0),

    uploadedBy: text('uploaded_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('studio_entry_images_entry_idx').on(table.entryId),
  ],
);

// ─── 3. Studio Entry Attachments ────────────────────────────────────

export const studioEntryAttachments = pgTable(
  'studio_entry_attachments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    entryId: uuid('entry_id')
      .notNull()
      .references(() => studioEntries.id, { onDelete: 'cascade' }),

    fileUrl: text('file_url').notNull(),
    fileName: text('file_name').notNull(),
    mime: text('mime'),
    fileSize: integer('file_size'), // bytes
    caption: text('caption'),

    uploadedBy: text('uploaded_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('studio_entry_attachments_entry_idx').on(table.entryId),
  ],
);

// ─── 4. Studio Entry Links ──────────────────────────────────────────

export const studioEntryLinks = pgTable(
  'studio_entry_links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    entryId: uuid('entry_id')
      .notNull()
      .references(() => studioEntries.id, { onDelete: 'cascade' }),

    // What this entry is linked to
    linkType: studioLinkTypeEnum('link_type').notNull(),

    // Polymorphic target — one of these will be populated
    targetId: text('target_id').notNull(), // UUID or ID of the linked object
    targetLabel: text('target_label'), // Human-readable label for display

    notes: text('notes'),

    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('studio_entry_links_entry_idx').on(table.entryId),
    index('studio_entry_links_type_idx').on(table.linkType),
    index('studio_entry_links_target_idx').on(table.targetId),
  ],
);
