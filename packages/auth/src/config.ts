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
} from "@repo/db/schema"
import type { DefaultSession } from "next-auth"

// ─── Type augmentation ───────────────────────────────────────────────
// Extends the built-in session and JWT types with portal-specific fields.

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      orgId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
    orgId?: string | null
  }
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
        return user.email?.endsWith(`@${allowedDomain}`) ?? false
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        // User object is present on initial sign-in — enrich the JWT
        token.role = user.role ?? "internal_viewer"
        token.orgId = user.orgId ?? null
      }
      return token
    },

    async session({ session, token }) {
      // Surface portal fields in the client-visible session
      session.user.id = token.sub!
      session.user.role = (token.role as string) ?? "internal_viewer"
      session.user.orgId = (token.orgId as string | null) ?? null
      return session
    },
  },
})
