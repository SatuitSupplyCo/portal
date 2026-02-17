/**
 * Organizations — vendor and partner companies.
 *
 * An org is the unit of external access. Users belong to at most one org.
 * Org admins can invite members within their org after the initial admin
 * is invited by a portal admin.
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { orgTypeEnum, orgStatusEnum, orgRoleEnum, portalRoleEnum, productRoleEnum, invitationStatusEnum } from './enums';
import { users } from './auth';

// ─── Organizations ───────────────────────────────────────────────────

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    type: orgTypeEnum('type').notNull(),
    status: orgStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('organizations_type_idx').on(table.type),
    index('organizations_status_idx').on(table.status),
  ],
);

// ─── Org memberships ─────────────────────────────────────────────────

export const orgMemberships = pgTable(
  'org_memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: orgRoleEnum('role').notNull().default('member'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('org_memberships_org_user_unq').on(table.orgId, table.userId),
    index('org_memberships_user_id_idx').on(table.userId),
  ],
);

// ─── Invitations ─────────────────────────────────────────────────────

export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    orgId: uuid('org_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    role: portalRoleEnum('role').notNull(),
    productRole: productRoleEnum('product_role'),
    orgRole: orgRoleEnum('org_role'),
    status: invitationStatusEnum('status').notNull().default('pending'),
    invitedBy: text('invited_by')
      .notNull()
      .references(() => users.id),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('invitations_email_idx').on(table.email),
    index('invitations_token_idx').on(table.token),
    index('invitations_org_id_idx').on(table.orgId),
  ],
);
