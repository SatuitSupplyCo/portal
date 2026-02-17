"use server"

import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import { users, invitations } from "@repo/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { sendInviteEmail } from "@/lib/invite-email"
import { headers } from "next/headers"

// ─── Helpers ──────────────────────────────────────────────────────────

type PortalRole =
  | "owner"
  | "admin"
  | "editor"
  | "internal_viewer"
  | "partner_viewer"
  | "vendor_viewer"

type ProductRole =
  | "studio_contributor"
  | "product_lead"
  | "founder"
  | "external_designer"
  | "factory_partner"

const ADMIN_ROLES: PortalRole[] = ["owner", "admin"]

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")
  if (!ADMIN_ROLES.includes(session.user.role as PortalRole)) {
    throw new Error("Not authorized")
  }
  return session
}

// ─── Update user role ─────────────────────────────────────────────────

export async function updateUserRole(userId: string, role: PortalRole) {
  const session = await requireAdmin()

  // Prevent demoting yourself
  if (userId === session.user.id && role !== session.user.role) {
    throw new Error("You cannot change your own role")
  }

  // Only owners can assign owner role
  if (role === "owner" && session.user.role !== "owner") {
    throw new Error("Only owners can assign the owner role")
  }

  await db.update(users).set({ role }).where(eq(users.id, userId))

  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

// ─── Update user product role ────────────────────────────────────────

export async function updateProductRole(
  userId: string,
  role: ProductRole | null,
) {
  const session = await requireAdmin()

  // Prevent changing your own product role
  if (userId === session.user.id) {
    throw new Error("You cannot change your own product role")
  }

  await db
    .update(users)
    .set({ productRole: role })
    .where(eq(users.id, userId))

  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

// ─── Invite user ──────────────────────────────────────────────────────

export async function inviteUser(formData: FormData) {
  const session = await requireAdmin()

  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const role = formData.get("role") as PortalRole
  const productRoleRaw = formData.get("productRole") as string | null
  const productRole =
    productRoleRaw && productRoleRaw !== "" ? (productRoleRaw as ProductRole) : null

  if (!email || !role) throw new Error("Email and role are required")

  // Only owners can invite as owner
  if (role === "owner" && session.user.role !== "owner") {
    throw new Error("Only owners can invite users as owner")
  }

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  })
  if (existingUser) {
    throw new Error("A user with this email already exists")
  }

  // Check for existing pending invitation
  const existingInvite = await db.query.invitations.findFirst({
    where: (i, { eq, and }) =>
      and(eq(i.email, email), eq(i.status, "pending")),
  })
  if (existingInvite) {
    throw new Error("A pending invitation already exists for this email")
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await db.insert(invitations).values({
    email,
    role,
    productRole,
    token,
    expiresAt,
    invitedBy: session.user.id,
  })

  // Send the invitation email
  const headerList = await headers()
  const host = headerList.get("host") ?? "localhost:3000"
  const protocol = host.startsWith("localhost") ? "http" : "https"
  const inviteUrl = `${protocol}://${host}/invite/${token}`

  await sendInviteEmail({
    to: email,
    inviteUrl,
    role,
    inviterName: session.user.name ?? null,
  })

  revalidatePath("/admin/users")
  return { success: true }
}

// ─── Revoke invitation ────────────────────────────────────────────────

export async function revokeInvitation(invitationId: string) {
  await requireAdmin()

  await db
    .update(invitations)
    .set({ status: "revoked" })
    .where(eq(invitations.id, invitationId))

  revalidatePath("/admin/users")
  return { success: true }
}

// ─── Resend invitation (create new token, reset expiry) ──────────────

export async function resendInvitation(invitationId: string) {
  const session = await requireAdmin()

  const invite = await db.query.invitations.findFirst({
    where: (i, { eq }) => eq(i.id, invitationId),
  })
  if (!invite) throw new Error("Invitation not found")

  // Revoke old, create new
  await db
    .update(invitations)
    .set({ status: "revoked" })
    .where(eq(invitations.id, invitationId))

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await db.insert(invitations).values({
    email: invite.email,
    role: invite.role,
    orgId: invite.orgId,
    orgRole: invite.orgRole,
    token,
    expiresAt,
    invitedBy: session.user.id,
  })

  revalidatePath("/admin/users")
  return { success: true }
}
