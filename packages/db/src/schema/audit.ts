/**
 * Publish log — immutable audit trail for all publish/approval actions.
 *
 * Every publish, archive, or approval writes a row here. This log is
 * append-only and never updated or deleted.
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { publishActionEnum } from './enums';
import { users } from './auth';

// ─── Publish log ─────────────────────────────────────────────────────

export const publishLog = pgTable(
  'publish_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorUserId: text('actor_user_id')
      .notNull()
      .references(() => users.id),
    resourceType: text('resource_type').notNull(), // document | pack | asset | canon
    resourceId: uuid('resource_id').notNull(),
    action: publishActionEnum('action').notNull(),
    metadataJson: jsonb('metadata_json'), // action-specific payload (previous status, notes, etc.)
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('publish_log_resource_idx').on(
      table.resourceType,
      table.resourceId,
    ),
    index('publish_log_actor_idx').on(table.actorUserId),
    index('publish_log_created_at_idx').on(table.createdAt),
  ],
);
