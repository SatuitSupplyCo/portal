/**
 * Auth.js (NextAuth v5) configuration.
 *
 * - Google OAuth for internal employees (domain-restricted)
 * - JWT session strategy (compatible with all providers)
 * - Drizzle adapter writes users/accounts to the portal DB
 * - Session enriched with portal role + orgId
 */
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@repo/db/client"
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  invitations,
  orgMemberships,
  userRoles,
  rolePermissions,
} from "@repo/db/schema"
import { eq } from "@repo/db"
import type { DefaultSession } from "next-auth"

// ─── Type augmentation ───────────────────────────────────────────────
// Extends the built-in session and JWT types with portal-specific fields.

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      productRole: string | null
      permissions: string[]
      orgId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
    productRole?: string | null
    orgId?: string | null
  }
}

// ─── RBAC helpers ────────────────────────────────────────────────────

async function resolveUserPermissions(userId: string): Promise<string[]> {
  const rows = await db
    .select({ permissionCode: rolePermissions.permissionCode })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .where(eq(userRoles.userId, userId))

  return [...new Set(rows.map((r) => r.permissionCode))]
}

// Note: JWT type augmentation omitted — pnpm's strict resolution
// prevents augmenting next-auth/jwt or @auth/core/jwt. We use typed
// assertions in the session callback instead.

// ─── Configuration ───────────────────────────────────────────────────

const allowedDomain = process.env.AUTH_ALLOWED_DOMAIN

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

  session: { strategy: "jwt" },

  pages: {
    signIn: "/auth/signin",
  },

  providers: [
    Google,

    // Dev-only credentials provider — auto-creates users by email.
    // In production, only Google OAuth is available.
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            id: "dev-credentials",
            name: "Development",
            credentials: {
              email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
              const email = credentials?.email as string | undefined
              if (!email) return null

              // Look up existing user
              const existing = await db.query.users.findFirst({
                where: (u, { eq }) => eq(u.email, email),
              })

              if (existing) return existing

              // Auto-create user in dev mode
              const [created] = await db
                .insert(users)
                .values({
                  email,
                  name: email.split("@")[0],
                  role: "owner", // dev users get full access
                  productRole: "founder", // dev users get full product lifecycle access
                })
                .returning()

              return created ?? null
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Restrict Google OAuth to allowed email domain (if configured)
      if (account?.provider === "google" && allowedDomain) {
        if (user.email?.endsWith(`@${allowedDomain}`)) return true

        // Allow sign-in if the user has a pending invitation
        if (user.email) {
          const pendingInvite = await db.query.invitations.findFirst({
            where: (i, { eq, and }) =>
              and(eq(i.email, user.email!), eq(i.status, "pending")),
          })
          if (pendingInvite) return true
        }

        return false
      }
      return true
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        // User object is present on initial sign-in.
        // Check for a pending invitation and apply it before building the JWT,
        // so the user's very first session has the correct role.
        if (user.email) {
          const pendingInvite = await db.query.invitations.findFirst({
            where: (i, ops) =>
              ops.and(
                ops.eq(i.email, user.email!),
                ops.eq(i.status, "pending"),
              ),
          })

          if (pendingInvite && pendingInvite.expiresAt > new Date()) {
            const updateData: Record<string, unknown> = {
              role: pendingInvite.role,
            }
            if (pendingInvite.productRole) {
              updateData.productRole = pendingInvite.productRole
            }
            if (pendingInvite.orgId) {
              updateData.orgId = pendingInvite.orgId
            }

            await db
              .update(users)
              .set(updateData)
              .where(eq(users.id, user.id!))

            // Create org membership if the invite is org-scoped
            if (pendingInvite.orgId) {
              const existingMembership =
                await db.query.orgMemberships.findFirst({
                  where: (m, ops) =>
                    ops.and(
                      ops.eq(m.orgId, pendingInvite.orgId!),
                      ops.eq(m.userId, user.id!),
                    ),
                })
              if (!existingMembership) {
                await db.insert(orgMemberships).values({
                  orgId: pendingInvite.orgId,
                  userId: user.id!,
                  role: pendingInvite.orgRole ?? "member",
                })
              }
            }

            // Mark invitation as accepted
            await db
              .update(invitations)
              .set({ status: "accepted" })
              .where(eq(invitations.id, pendingInvite.id))

            // Use the invitation's roles for the JWT (not the defaults)
            token.role = pendingInvite.role
            token.productRole = pendingInvite.productRole ?? null
            token.orgId = pendingInvite.orgId ?? user.orgId ?? null
            token.permissions = await resolveUserPermissions(user.id!)
            return token
          }
        }

        // No pending invitation — use the user's existing fields
        token.role = user.role ?? "internal_viewer"
        token.productRole = user.productRole ?? null
        token.orgId = user.orgId ?? null
        token.permissions = await resolveUserPermissions(user.id!)
      }

      // On token refresh, re-read from DB so role changes take effect
      // without requiring a full re-login
      if (trigger === "update" && token.sub) {
        const freshUser = await db.query.users.findFirst({
          where: (u, ops) => ops.eq(u.id, token.sub!),
        })
        if (freshUser) {
          token.role = freshUser.role
          token.productRole = freshUser.productRole ?? null
          token.orgId = freshUser.orgId ?? null
          token.permissions = await resolveUserPermissions(freshUser.id)
        }
      }

      return token
    },

    async session({ session, token }) {
      session.user.id = token.sub!
      session.user.role = (token.role as string) ?? "internal_viewer"
      session.user.productRole = (token.productRole as string | null) ?? null
      session.user.permissions = (token.permissions as string[]) ?? []
      session.user.orgId = (token.orgId as string | null) ?? null
      return session
    },
  },
})
