/**
 * Assets & versioning.
 *
 * An asset is a logical file (e.g. "Logo Mark"). Each upload creates a new
 * asset_version. External downloads always reference a specific version.
 * "Latest approved" is a resolver convenience, never implicit in the DB.
 *
 * Anyone with permission can upload. Expected file types: PDFs, images,
 * potentially video in the future.
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { assetVersionStatusEnum } from './enums';
import { users } from './auth';

// ─── Assets ──────────────────────────────────────────────────────────

export const assets = pgTable(
  'assets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    type: text('type').notNull(), // pdf | image | video | illustrator | spreadsheet | etc.
    tags: text('tags').array(),
    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('assets_type_idx').on(table.type),
  ],
);

// ─── Asset versions ──────────────────────────────────────────────────

export const assetVersions = pgTable(
  'asset_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),
    fileUrl: text('file_url').notNull(), // S3/R2 key — served via signed URL
    fileName: text('file_name'),
    mime: text('mime').notNull(),
    size: integer('size').notNull(), // bytes
    checksum: text('checksum'), // SHA-256 for integrity
    status: assetVersionStatusEnum('status').notNull().default('draft'),
    uploadedBy: text('uploaded_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('asset_versions_asset_status_idx').on(table.assetId, table.status),
  ],
);
