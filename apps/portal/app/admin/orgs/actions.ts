"use server"

import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import { organizations, orgMemberships, users } from "@repo/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// ─── Helpers ──────────────────────────────────────────────────────────

const ADMIN_ROLES = ["owner", "admin"]

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")
  if (!ADMIN_ROLES.includes(session.user.role)) {
    throw new Error("Not authorized")
  }
  return session
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// ─── Create organization ──────────────────────────────────────────────

export async function createOrganization(formData: FormData) {
  await requireAdmin()

  const name = (formData.get("name") as string)?.trim()
  const type = formData.get("type") as "vendor" | "partner"
  if (!name || !type) throw new Error("Name and type are required")

  const slug = slugify(name)

  // Check for existing slug
  const existing = await db.query.organizations.findFirst({
    where: (o, { eq }) => eq(o.slug, slug),
  })
  if (existing) {
    throw new Error(
      `An organization with the slug "${slug}" already exists`,
    )
  }

  const [org] = await db
    .insert(organizations)
    .values({ name, slug, type })
    .returning()

  revalidatePath("/admin/orgs")
  return { success: true, orgId: org!.id }
}

// ─── Update organization details ──────────────────────────────────────

export async function updateOrganization(
  orgId: string,
  data: { name?: string; type?: "vendor" | "partner" },
) {
  await requireAdmin()

  const updates: Record<string, unknown> = {}
  if (data.name) {
    updates.name = data.name.trim()
    updates.slug = slugify(data.name)

    // Check slug uniqueness (excluding self)
    const existing = await db.query.organizations.findFirst({
      where: (o, { eq, and, ne }) =>
        and(eq(o.slug, updates.slug as string), ne(o.id, orgId)),
    })
    if (existing) {
      throw new Error(
        `An organization with the slug "${updates.slug}" already exists`,
      )
    }
  }
  if (data.type) updates.type = data.type

  if (Object.keys(updates).length === 0) return { success: true }

  await db
    .update(organizations)
    .set(updates)
    .where(eq(organizations.id, orgId))

  revalidatePath("/admin/orgs")
  revalidatePath(`/admin/orgs/${orgId}`)
  return { success: true }
}

// ─── Update organization status ───────────────────────────────────────

export async function updateOrgStatus(
  orgId: string,
  status: "active" | "suspended" | "archived",
) {
  await requireAdmin()

  await db
    .update(organizations)
    .set({ status })
    .where(eq(organizations.id, orgId))

  revalidatePath("/admin/orgs")
  revalidatePath(`/admin/orgs/${orgId}`)
  return { success: true }
}

// ─── Add member to organization ───────────────────────────────────────

export async function addOrgMember(formData: FormData) {
  await requireAdmin()

  const orgId = formData.get("orgId") as string
  const userId = formData.get("userId") as string
  const role = (formData.get("role") as string) || "member"
  if (!orgId || !userId) throw new Error("Organization and user are required")

  // Check membership doesn't already exist
  const existing = await db.query.orgMemberships.findFirst({
    where: (m, { eq, and }) =>
      and(eq(m.orgId, orgId), eq(m.userId, userId)),
  })
  if (existing) {
    throw new Error("User is already a member of this organization")
  }

  await db.insert(orgMemberships).values({
    orgId,
    userId,
    role: role as "org_admin" | "member",
  })

  // Also set the user's orgId if not already set
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  })
  if (user && !user.orgId) {
    await db.update(users).set({ orgId }).where(eq(users.id, userId))
  }

  revalidatePath(`/admin/orgs/${orgId}`)
  revalidatePath("/admin/users")
  return { success: true }
}

// ─── Remove member from organization ──────────────────────────────────

export async function removeOrgMember(membershipId: string, orgId: string) {
  await requireAdmin()

  // Get the membership to find the user
  const membership = await db.query.orgMemberships.findFirst({
    where: (m, { eq }) => eq(m.id, membershipId),
  })

  if (membership) {
    await db
      .delete(orgMemberships)
      .where(eq(orgMemberships.id, membershipId))

    // Clear user's orgId if this was their linked org
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, membership.userId),
    })
    if (user && user.orgId === membership.orgId) {
      await db
        .update(users)
        .set({ orgId: null })
        .where(eq(users.id, membership.userId))
    }
  }

  revalidatePath(`/admin/orgs/${orgId}`)
  revalidatePath("/admin/users")
  return { success: true }
}

// ─── Update member role ───────────────────────────────────────────────

export async function updateMemberRole(
  membershipId: string,
  role: "org_admin" | "member",
  orgId: string,
) {
  await requireAdmin()

  await db
    .update(orgMemberships)
    .set({ role })
    .where(eq(orgMemberships.id, membershipId))

  revalidatePath(`/admin/orgs/${orgId}`)
  return { success: true }
}
