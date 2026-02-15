/**
 * Tests / evidence — lab results, strike-offs, wash tests, etc.
 *
 * Tests can surface on tech pack pages, inside docs, and inside packs
 * via test_ref blocks and test_links.
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from 'drizzle-orm/pg-core';
import { documentStatusEnum, testResultEnum } from './enums';
import { users } from './auth';
import { organizations } from './organizations';
import { packs } from './packs';
import { assetVersions } from './assets';
import { documents } from './documents';

// ─── Tests ───────────────────────────────────────────────────────────

export const tests = pgTable(
  'tests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    category: text('category').notNull(), // embroidery | wash | colorproof | shrinkage | etc.
    vendorOrgId: uuid('vendor_org_id').references(() => organizations.id),
    status: documentStatusEnum('status').notNull().default('draft'),
    result: testResultEnum('result'),
    notes: text('notes'),
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
    index('tests_category_idx').on(table.category),
    index('tests_vendor_org_id_idx').on(table.vendorOrgId),
    index('tests_status_idx').on(table.status),
  ],
);

// ─── Test attachments ────────────────────────────────────────────────

export const testAttachments = pgTable(
  'test_attachments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    testId: uuid('test_id')
      .notNull()
      .references(() => tests.id, { onDelete: 'cascade' }),
    fileUrl: text('file_url').notNull(),
    fileName: text('file_name'),
    caption: text('caption'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('test_attachments_test_id_idx').on(table.testId)],
);

// ─── Test links (cross-references) ──────────────────────────────────

export const testLinks = pgTable(
  'test_links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    testId: uuid('test_id')
      .notNull()
      .references(() => tests.id, { onDelete: 'cascade' }),
    packId: uuid('pack_id').references(() => packs.id, {
      onDelete: 'set null',
    }),
    assetVersionId: uuid('asset_version_id').references(
      () => assetVersions.id,
      { onDelete: 'set null' },
    ),
    documentId: uuid('document_id').references(() => documents.id, {
      onDelete: 'set null',
    }),
  },
  (table) => [
    index('test_links_test_id_idx').on(table.testId),
    index('test_links_pack_id_idx').on(table.packId),
  ],
);
