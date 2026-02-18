/**
 * RBAC tables — role-based access control.
 *
 * Replaces the static `product_role` column with admin-manageable roles
 * and granular permissions. Portal owners/admins can create custom roles,
 * assign multiple roles to users, and grant resource-level access.
 *
 * Tables:
 *   permissions      — code-defined atomic capabilities (seeded from code)
 *   roles            — admin-created named bundles of permissions
 *   role_permissions  — join: which permissions each role grants
 *   user_roles        — join: which roles each user holds
 *   resource_grants   — fine-grained access to specific resources
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  unique,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { users } from './auth';

// ─── Permissions ─────────────────────────────────────────────────────

export const permissions = pgTable('permissions', {
  code: text('code').primaryKey(),
  groupKey: text('group_key').notNull(),
  label: text('label').notNull(),
  description: text('description'),
});

// ─── Roles ───────────────────────────────────────────────────────────

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    isSystem: boolean('is_system').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('roles_slug_idx').on(table.slug)],
);

// ─── Role → Permission mapping ───────────────────────────────────────

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionCode: text('permission_code')
      .notNull()
      .references(() => permissions.code, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionCode] }),
  ],
);

// ─── User → Role mapping ─────────────────────────────────────────────

export const userRoles = pgTable(
  'user_roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('user_roles_user_role_unq').on(table.userId, table.roleId),
    index('user_roles_user_id_idx').on(table.userId),
    index('user_roles_role_id_idx').on(table.roleId),
  ],
);

// ─── RBAC Audit Log ──────────────────────────────────────────────────

export const rbacAuditLog = pgTable(
  'rbac_audit_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorUserId: text('actor_user_id')
      .notNull()
      .references(() => users.id),
    action: text('action').notNull(), // 'role.create' | 'role.update' | 'role.delete' | 'role.assign' | 'role.unassign' | 'permission.update' | 'grant.create' | 'grant.delete'
    targetType: text('target_type').notNull(), // 'role' | 'user' | 'org' | 'grant'
    targetId: text('target_id').notNull(),
    details: text('details'), // JSON string with before/after state
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('rbac_audit_log_actor_idx').on(table.actorUserId),
    index('rbac_audit_log_target_idx').on(table.targetType, table.targetId),
    index('rbac_audit_log_created_at_idx').on(table.createdAt),
  ],
);

// ─── Resource Grants ─────────────────────────────────────────────────

export const resourceGrants = pgTable(
  'resource_grants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    subjectType: text('subject_type').notNull(), // 'user' | 'org' | 'role'
    subjectId: text('subject_id').notNull(),
    resourceType: text('resource_type').notNull(), // 'collection' | 'season' | 'factory' | 'product_type'
    resourceId: text('resource_id').notNull(),
    permission: text('permission').notNull().default('read'), // 'read' | 'write' | 'admin'
    grantedBy: text('granted_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('resource_grants_unq').on(
      table.subjectType,
      table.subjectId,
      table.resourceType,
      table.resourceId,
      table.permission,
    ),
    index('resource_grants_subject_idx').on(table.subjectType, table.subjectId),
    index('resource_grants_resource_idx').on(table.resourceType, table.resourceId),
  ],
);
