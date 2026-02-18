"use server"

import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import { resourceGrants, rbacAuditLog } from "@repo/db/schema"
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

export async function createResourceGrant(data: {
  subjectType: "user" | "org" | "role"
  subjectId: string
  resourceType: string
  resourceId: string
  permission: string
}) {
  const session = await requireAdmin()

  const [grant] = await db
    .insert(resourceGrants)
    .values({
      subjectType: data.subjectType,
      subjectId: data.subjectId,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      permission: data.permission,
      grantedBy: session.user.id,
    })
    .returning()

  await db.insert(rbacAuditLog).values({
    actorUserId: session.user.id,
    action: "grant.create",
    targetType: data.subjectType,
    targetId: data.subjectId,
    details: JSON.stringify({
      grantId: grant!.id,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      permission: data.permission,
    }),
  })

  revalidatePath("/admin/users")
  revalidatePath("/admin/orgs")
  return { success: true }
}

export async function deleteResourceGrant(grantId: string) {
  const session = await requireAdmin()

  const grant = await db.query.resourceGrants.findFirst({
    where: (g, { eq: e }) => e(g.id, grantId),
  })

  await db.delete(resourceGrants).where(eq(resourceGrants.id, grantId))

  if (grant) {
    await db.insert(rbacAuditLog).values({
      actorUserId: session.user.id,
      action: "grant.delete",
      targetType: grant.subjectType,
      targetId: grant.subjectId,
      details: JSON.stringify({
        grantId,
        resourceType: grant.resourceType,
        resourceId: grant.resourceId,
        permission: grant.permission,
      }),
    })
  }

  revalidatePath("/admin/users")
  revalidatePath("/admin/orgs")
  return { success: true }
}

export async function getGrantsForSubject(
  subjectType: "user" | "org",
  subjectId: string,
) {
  return db
    .select()
    .from(resourceGrants)
    .where(
      and(
        eq(resourceGrants.subjectType, subjectType),
        eq(resourceGrants.subjectId, subjectId),
      ),
    )
}
