"use server"

import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import {
  roles,
  rolePermissions,
  userRoles,
  permissions,
  rbacAuditLog,
} from "@repo/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

type PortalRole = "owner" | "admin"
const ADMIN_ROLES: PortalRole[] = ["owner", "admin"]

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")
  if (!ADMIN_ROLES.includes(session.user.role as PortalRole)) {
    throw new Error("Not authorized")
  }
  return session
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// ─── Role CRUD ───────────────────────────────────────────────────────

export async function createRole(formData: FormData) {
  await requireAdmin()

  const name = (formData.get("name") as string)?.trim()
  const description = (formData.get("description") as string)?.trim() || null

  if (!name) throw new Error("Role name is required")

  const slug = slugify(name)

  const existing = await db.query.roles.findFirst({
    where: (r, { eq: e }) => e(r.slug, slug),
  })
  if (existing) throw new Error("A role with this name already exists")

  const [role] = await db
    .insert(roles)
    .values({ name, slug, description, isSystem: false })
    .returning()

  await db.insert(rbacAuditLog).values({
    actorUserId: (await requireAdmin()).user.id,
    action: "role.create",
    targetType: "role",
    targetId: role!.id,
    details: JSON.stringify({ name, slug }),
  })

  revalidatePath("/admin/roles")
  return { success: true, roleId: role!.id }
}

export async function updateRole(
  roleId: string,
  data: { name?: string; description?: string },
) {
  await requireAdmin()

  const role = await db.query.roles.findFirst({
    where: (r, { eq: e }) => e(r.id, roleId),
  })
  if (!role) throw new Error("Role not found")

  const updates: Record<string, unknown> = {}
  if (data.name !== undefined) {
    updates.name = data.name.trim()
    updates.slug = slugify(data.name.trim())
  }
  if (data.description !== undefined) {
    updates.description = data.description.trim() || null
  }

  if (Object.keys(updates).length > 0) {
    await db.update(roles).set(updates).where(eq(roles.id, roleId))
  }

  revalidatePath("/admin/roles")
  revalidatePath(`/admin/roles/${roleId}`)
  return { success: true }
}

export async function deleteRole(roleId: string) {
  await requireAdmin()

  const role = await db.query.roles.findFirst({
    where: (r, { eq: e }) => e(r.id, roleId),
  })
  if (!role) throw new Error("Role not found")
  if (role.isSystem) throw new Error("Cannot delete a system role")

  const session = await requireAdmin()

  await db.delete(roles).where(eq(roles.id, roleId))

  await db.insert(rbacAuditLog).values({
    actorUserId: session.user.id,
    action: "role.delete",
    targetType: "role",
    targetId: roleId,
    details: JSON.stringify({ name: role.name, slug: role.slug }),
  })

  revalidatePath("/admin/roles")
  return { success: true }
}

// ─── Permission management ───────────────────────────────────────────

export async function setRolePermissions(
  roleId: string,
  permissionCodes: string[],
) {
  const session = await requireAdmin()

  const role = await db.query.roles.findFirst({
    where: (r, { eq: e }) => e(r.id, roleId),
    with: { rolePermissions: true },
  })
  if (!role) throw new Error("Role not found")

  const previousCodes = role.rolePermissions.map((rp) => rp.permissionCode)

  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId))

  if (permissionCodes.length > 0) {
    await db.insert(rolePermissions).values(
      permissionCodes.map((code) => ({
        roleId,
        permissionCode: code,
      })),
    )
  }

  await db.insert(rbacAuditLog).values({
    actorUserId: session.user.id,
    action: "permission.update",
    targetType: "role",
    targetId: roleId,
    details: JSON.stringify({
      roleName: role.name,
      before: previousCodes,
      after: permissionCodes,
    }),
  })

  revalidatePath("/admin/roles")
  revalidatePath(`/admin/roles/${roleId}`)
  return { success: true }
}

// ─── User role assignment ────────────────────────────────────────────

export async function assignRoleToUser(userId: string, roleId: string) {
  const session = await requireAdmin()

  if (userId === session.user.id) {
    throw new Error("You cannot change your own roles")
  }

  const existing = await db.query.userRoles.findFirst({
    where: (ur, { eq: e, and: a }) =>
      a(e(ur.userId, userId), e(ur.roleId, roleId)),
  })
  if (existing) throw new Error("User already has this role")

  await db.insert(userRoles).values({ userId, roleId })

  const role = await db.query.roles.findFirst({
    where: (r, { eq: e }) => e(r.id, roleId),
  })

  await db.insert(rbacAuditLog).values({
    actorUserId: session.user.id,
    action: "role.assign",
    targetType: "user",
    targetId: userId,
    details: JSON.stringify({ roleId, roleName: role?.name }),
  })

  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  const session = await requireAdmin()

  if (userId === session.user.id) {
    throw new Error("You cannot change your own roles")
  }

  const role = await db.query.roles.findFirst({
    where: (r, { eq: e }) => e(r.id, roleId),
  })

  await db
    .delete(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))

  await db.insert(rbacAuditLog).values({
    actorUserId: session.user.id,
    action: "role.unassign",
    targetType: "user",
    targetId: userId,
    details: JSON.stringify({ roleId, roleName: role?.name }),
  })

  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}
