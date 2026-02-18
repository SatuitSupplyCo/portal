/**
 * Auth tables — compatible with Auth.js (NextAuth v5) Drizzle adapter.
 *
 * The `users` table extends the Auth.js base with portal-specific columns
 * (role, orgId). The adapter is configured to use these tables directly.
 */
import {
  pgTable,
  text,
  timestamp,
  integer,
  primaryKey,
  uuid,
  index,
} from 'drizzle-orm/pg-core';
import { portalRoleEnum, productRoleEnum } from './enums';

// ─── Users ───────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    // Auth.js standard fields
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: timestamp('email_verified', { mode: 'date' }),
    image: text('image'),

    // Portal extensions
    role: portalRoleEnum('role').notNull().default('internal_viewer'),
    productRole: productRoleEnum('product_role'), // @deprecated — replaced by RBAC user_roles table. Kept for backward compatibility during migration.
    orgId: uuid('org_id'), // FK to organizations — defined in relations (avoids circular import)

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('users_email_idx').on(table.email),
    index('users_org_id_idx').on(table.orgId),
  ],
);

// ─── Accounts (OAuth providers) ──────────────────────────────────────

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index('accounts_user_id_idx').on(table.userId),
  ],
);

// ─── Sessions (database strategy) ───────────────────────────────────

export const sessions = pgTable(
  'sessions',
  {
    sessionToken: text('session_token').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)],
);

// ─── Verification tokens (email / magic-link) ──────────────────────

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ],
);
