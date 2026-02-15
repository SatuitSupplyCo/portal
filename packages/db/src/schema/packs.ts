/**
 * Packs — containers that group SKUs, assets, docs, and tests.
 *
 * A Pack can represent:
 *   - A single tech pack (kind = tech_pack, one SKU)
 *   - A bundle (kind = bundle, groups tech packs + shared assets)
 *   - A vendor/partner pack (scoped to an org)
 *
 * Packs can nest arbitrarily deep (a bundle contains tech packs, which
 * are themselves packs). Cycle detection must be enforced at write time.
 *
 * When the same SKU is produced by multiple vendors with different
 * configurations, they share the same pack with conditional visibility
 * (tied to inventory / consumer-facing SKU identity).
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import {
  documentStatusEnum,
  packKindEnum,
  packItemTypeEnum,
  executionStatusEnum,
} from './enums';
import { users } from './auth';
import { organizations } from './organizations';

// ─── Packs ───────────────────────────────────────────────────────────

export const packs = pgTable(
  'packs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description'),
    kind: packKindEnum('kind').notNull(),
    status: documentStatusEnum('status').notNull().default('draft'),

    // Multi-audience visibility
    visibleToInternal: boolean('visible_to_internal').notNull().default(true),
    visibleToPartners: boolean('visible_to_partners').notNull().default(false),
    visibleToVendors: boolean('visible_to_vendors').notNull().default(false),

    version: text('version'),

    // Execution authority (separate from publishing status)
    executionStatus: executionStatusEnum('execution_status'),

    // Targeting
    targetType: text('target_type'), // sku | collection | season | vendor
    targetSlug: text('target_slug'),

    // Optional vendor scoping
    vendorOrgId: uuid('vendor_org_id').references(() => organizations.id),

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
    index('packs_kind_status_idx').on(table.kind, table.status),
    index('packs_vendor_org_id_idx').on(table.vendorOrgId),
    index('packs_target_idx').on(table.targetType, table.targetSlug),
  ],
);

// ─── Pack items ──────────────────────────────────────────────────────
// Uses typed FK columns instead of a single polymorphic `itemRef` text
// field. Exactly one reference column should be set per row, matching
// the itemType. This gives us DB-level FK constraints and simpler joins.

export const packItems = pgTable(
  'pack_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    packId: uuid('pack_id')
      .notNull()
      .references(() => packs.id, { onDelete: 'cascade' }),
    itemType: packItemTypeEnum('item_type').notNull(),

    // Typed references — set exactly one based on itemType
    assetVersionId: uuid('asset_version_id'), // FK defined in relations (cross-file)
    documentId: uuid('document_id'),          // FK defined in relations (cross-file)
    testId: uuid('test_id'),                  // FK defined in relations (cross-file)
    childPackId: uuid('child_pack_id').references(() => packs.id, {
      onDelete: 'set null',
    }),
    linkUrl: text('link_url'), // for itemType = 'link'

    notes: text('notes'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('pack_items_pack_sort_idx').on(table.packId, table.sortOrder),
  ],
);
