/**
 * ACL tables — fine-grained access control.
 *
 * The visibility booleans on documents/packs handle audience-level gating.
 * These ACL tables provide granular overrides: granting (or restricting)
 * access to specific users or orgs on specific resources.
 *
 * Resolution order:
 *   1. user → org memberships → portal role
 *   2. surface (internal / partner / vendor)
 *   3. resource.status + visibility booleans
 *   4. ACL grants (these tables)
 *   5. block.visibility (if applicable)
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from 'drizzle-orm/pg-core';
import { aclPermissionEnum } from './enums';
import { users } from './auth';
import { organizations } from './organizations';
import { documents } from './documents';
import { packs } from './packs';
import { assets } from './assets';

// ─── Documents ACL ───────────────────────────────────────────────────

export const documentsAcl = pgTable(
  'documents_acl',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    orgId: uuid('org_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    permission: aclPermissionEnum('permission').notNull().default('read'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('documents_acl_document_id_idx').on(table.documentId),
    index('documents_acl_user_id_idx').on(table.userId),
    index('documents_acl_org_id_idx').on(table.orgId),
  ],
);

// ─── Packs ACL ───────────────────────────────────────────────────────

export const packsAcl = pgTable(
  'packs_acl',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    packId: uuid('pack_id')
      .notNull()
      .references(() => packs.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    orgId: uuid('org_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    permission: aclPermissionEnum('permission').notNull().default('read'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('packs_acl_pack_id_idx').on(table.packId),
    index('packs_acl_user_id_idx').on(table.userId),
    index('packs_acl_org_id_idx').on(table.orgId),
  ],
);

// ─── Assets ACL ──────────────────────────────────────────────────────

export const assetsAcl = pgTable(
  'assets_acl',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    orgId: uuid('org_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    permission: aclPermissionEnum('permission').notNull().default('read'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('assets_acl_asset_id_idx').on(table.assetId),
    index('assets_acl_user_id_idx').on(table.userId),
    index('assets_acl_org_id_idx').on(table.orgId),
  ],
);
