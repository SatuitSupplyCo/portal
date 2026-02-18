/**
 * RBAC permission helpers.
 *
 * Permission codes are embedded in the JWT on sign-in and refreshed
 * on token update. Server actions check permissions via hasPermission()
 * which reads the codes from the session user.
 *
 * Portal-level roles (owner, admin) bypass all permission checks —
 * they have implicit access to everything.
 */

// ─── Types ───────────────────────────────────────────────────────────

export type PortalRole =
  | 'owner'
  | 'admin'
  | 'editor'
  | 'internal_viewer'
  | 'partner_viewer'
  | 'vendor_viewer';

/** All permission codes defined in the system. */
export type PermissionCode =
  | 'studio.submit'
  | 'studio.review'
  | 'studio.promote'
  | 'seasons.manage'
  | 'seasons.lock'
  | 'slots.create'
  | 'slots.fill'
  | 'colors.manage'
  | 'colors.confirm'
  | 'concepts.advance'
  | 'concepts.kill'
  | 'concepts.override'
  | 'core_programs.manage'
  | 'sourcing.view'
  | 'sourcing.manage'
  | 'costing.view'
  | 'margins.view';

export interface SessionUser {
  id: string;
  role: string;
  permissions?: string[];
  orgId?: string | null;
  name?: string | null;
  email?: string | null;
}

// ─── Core check ──────────────────────────────────────────────────────

function isPortalAdmin(portalRole?: string | null): boolean {
  return portalRole === 'owner' || portalRole === 'admin';
}

/**
 * Check if a user has a specific permission.
 * Portal owners/admins bypass all checks.
 */
export function hasPermission(
  user: SessionUser,
  code: PermissionCode,
): boolean {
  if (isPortalAdmin(user.role)) return true;
  return user.permissions?.includes(code) ?? false;
}

/**
 * Check if a user has ALL of the given permissions.
 */
export function hasAllPermissions(
  user: SessionUser,
  codes: PermissionCode[],
): boolean {
  if (isPortalAdmin(user.role)) return true;
  return codes.every((c) => user.permissions?.includes(c) ?? false);
}

/**
 * Check if a user has ANY of the given permissions.
 */
export function hasAnyPermission(
  user: SessionUser,
  codes: PermissionCode[],
): boolean {
  if (isPortalAdmin(user.role)) return true;
  return codes.some((c) => user.permissions?.includes(c) ?? false);
}

// ─── Resource-level access ───────────────────────────────────────────

export type ResourceType = 'collection' | 'season' | 'factory' | 'product_type';

/**
 * Check if a user has access to a specific resource.
 * Queries the resource_grants table for matching grants.
 *
 * Portal owners/admins bypass all resource checks.
 *
 * This function queries the DB so should only be used in server actions
 * and page loaders, not in hot paths.
 */
export async function hasResourceAccess(
  user: SessionUser,
  resourceType: ResourceType,
  resourceId: string,
  requiredPermission: 'read' | 'write' | 'admin' = 'read',
): Promise<boolean> {
  if (isPortalAdmin(user.role)) return true;

  const { db } = await import('@repo/db/client');
  const { resourceGrants } = await import('@repo/db/schema');
  const { and, eq, or, inArray } = await import('drizzle-orm');

  const permissionHierarchy: Record<string, string[]> = {
    read: ['read', 'write', 'admin'],
    write: ['write', 'admin'],
    admin: ['admin'],
  };

  const validPermissions = permissionHierarchy[requiredPermission] ?? [requiredPermission];

  // Build subject conditions: direct user grant + org grant
  const subjectConditions = [
    and(
      eq(resourceGrants.subjectType, 'user'),
      eq(resourceGrants.subjectId, user.id),
    ),
  ];

  if (user.orgId) {
    subjectConditions.push(
      and(
        eq(resourceGrants.subjectType, 'org'),
        eq(resourceGrants.subjectId, user.orgId),
      ),
    );
  }

  const grants = await db
    .select({ id: resourceGrants.id })
    .from(resourceGrants)
    .where(
      and(
        eq(resourceGrants.resourceType, resourceType),
        eq(resourceGrants.resourceId, resourceId),
        inArray(resourceGrants.permission, validPermissions),
        or(...subjectConditions),
      ),
    )
    .limit(1);

  return grants.length > 0;
}

/**
 * Get all resource IDs of a given type that a user has access to.
 * Returns null if the user is an admin (meaning "all resources").
 */
export async function getAccessibleResourceIds(
  user: SessionUser,
  resourceType: ResourceType,
  requiredPermission: 'read' | 'write' | 'admin' = 'read',
): Promise<string[] | null> {
  if (isPortalAdmin(user.role)) return null;

  const { db } = await import('@repo/db/client');
  const { resourceGrants } = await import('@repo/db/schema');
  const { and, eq, or, inArray } = await import('drizzle-orm');

  const permissionHierarchy: Record<string, string[]> = {
    read: ['read', 'write', 'admin'],
    write: ['write', 'admin'],
    admin: ['admin'],
  };

  const validPermissions = permissionHierarchy[requiredPermission] ?? [requiredPermission];

  const subjectConditions = [
    and(
      eq(resourceGrants.subjectType, 'user'),
      eq(resourceGrants.subjectId, user.id),
    ),
  ];

  if (user.orgId) {
    subjectConditions.push(
      and(
        eq(resourceGrants.subjectType, 'org'),
        eq(resourceGrants.subjectId, user.orgId),
      ),
    );
  }

  const grants = await db
    .select({ resourceId: resourceGrants.resourceId })
    .from(resourceGrants)
    .where(
      and(
        eq(resourceGrants.resourceType, resourceType),
        inArray(resourceGrants.permission, validPermissions),
        or(...subjectConditions),
      ),
    );

  return [...new Set(grants.map((g) => g.resourceId))];
}

// ─── Legacy-compatible wrappers ──────────────────────────────────────
// These maintain the old function signatures so existing call sites
// continue working during the migration. They now delegate to the
// RBAC system via the session's permission codes.

/** @deprecated Use hasPermission(user, 'studio.submit') */
export type ProductRole =
  | 'studio_contributor'
  | 'product_lead'
  | 'founder'
  | 'external_designer'
  | 'factory_partner';

/** @deprecated Use hasPermission(user, 'studio.submit') */
export function canSubmitStudio(role: ProductRole | null, portalRole?: string | null): boolean {
  if (isPortalAdmin(portalRole)) return true;
  if (!role) return false;
  return ['studio_contributor', 'product_lead', 'founder', 'external_designer'].includes(role);
}

/** @deprecated Use hasPermission(user, 'studio.review') */
export function canSubmitForReview(role: ProductRole | null, portalRole?: string | null): boolean {
  if (isPortalAdmin(portalRole)) return true;
  if (!role) return false;
  return ['studio_contributor', 'product_lead', 'founder'].includes(role);
}

/** @deprecated Use hasPermission(user, 'studio.promote') */
export function canPromoteToConcept(role: ProductRole | null, portalRole?: string | null): boolean {
  if (isPortalAdmin(portalRole)) return true;
  if (!role) return false;
  return ['product_lead', 'founder'].includes(role);
}

/** @deprecated Use hasPermission(user, 'seasons.manage') */
export function canManageSeasons(role: ProductRole | null, portalRole?: string | null): boolean {
  if (isPortalAdmin(portalRole)) return true;
  if (!role) return false;
  return ['product_lead', 'founder'].includes(role);
}

/** @deprecated Use hasPermission(user, 'slots.fill') */
export function canFillSeasonSlot(role: ProductRole | null, portalRole?: string | null): boolean {
  if (isPortalAdmin(portalRole)) return true;
  if (!role) return false;
  return ['product_lead', 'founder'].includes(role);
}

/** @deprecated Use hasPermission(user, 'concepts.advance') */
export function canApproveTransition(role: ProductRole | null, portalRole?: string | null): boolean {
  if (isPortalAdmin(portalRole)) return true;
  if (!role) return false;
  return ['product_lead', 'founder'].includes(role);
}

/** @deprecated Use hasPermission(user, 'concepts.override') */
export function canOverride(role: ProductRole | null, portalRole?: string | null): boolean {
  if (isPortalAdmin(portalRole)) return true;
  if (!role) return false;
  return role === 'founder';
}

/** @deprecated Use hasPermission(user, 'concepts.kill') */
export function canKill(role: ProductRole | null, portalRole?: string | null): boolean {
  if (isPortalAdmin(portalRole)) return true;
  if (!role) return false;
  return role === 'founder';
}

/** @deprecated Use hasPermission(user, 'core_programs.manage') */
export function canManageCorePrograms(role: ProductRole | null, portalRole?: string | null): boolean {
  if (isPortalAdmin(portalRole)) return true;
  if (!role) return false;
  return ['product_lead', 'founder'].includes(role);
}

/** @deprecated Use hasPermission(user, 'sourcing.view') */
export function canViewSpecs(role: ProductRole | null, portalRole?: string | null): boolean {
  if (isPortalAdmin(portalRole)) return true;
  if (!role) return false;
  return true;
}

/** @deprecated Use hasPermission(user, 'margins.view') */
export function canViewMargins(role: ProductRole | null, portalRole?: string | null): boolean {
  if (isPortalAdmin(portalRole)) return true;
  if (!role) return false;
  return role !== 'factory_partner';
}

/** @deprecated Use hasPermission(user, 'concepts.override') */
export function canCommentOnAnyStage(role: ProductRole | null, portalRole?: string | null): boolean {
  if (isPortalAdmin(portalRole)) return true;
  if (!role) return false;
  return role === 'founder';
}
