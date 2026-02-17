import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import { redirect, notFound } from "next/navigation"

const ROLE_REDIRECT: Record<string, string> = {
  owner: "/internal",
  admin: "/internal",
  editor: "/internal",
  internal_viewer: "/internal",
  partner_viewer: "/partners",
  vendor_viewer: "/vendors",
}

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Must be signed in
  const session = await auth()
  if (!session?.user) {
    redirect(`/invite/${token}`)
  }

  // Load the invitation
  const invite = await db.query.invitations.findFirst({
    where: (i, { eq }) => eq(i.token, token),
  })

  if (!invite) notFound()

  // Already consumed — the JWT callback applies roles during sign-in,
  // so by the time we reach this page, the invitation is already accepted.
  // Just redirect to the right surface.
  if (invite.status === "accepted") {
    const destination = ROLE_REDIRECT[invite.role] ?? "/"
    redirect(destination)
  }

  // Expired or revoked
  if (invite.status !== "pending") {
    redirect("/")
  }

  if (invite.expiresAt < new Date()) {
    redirect(`/invite/${token}`)
  }

  // Verify the signed-in user matches the invitation email
  if (session.user.email !== invite.email) {
    return (
      <div className="w-full max-w-md space-y-4 rounded-xl border bg-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold tracking-tight">Email Mismatch</h1>
        <p className="text-muted-foreground">
          This invitation was sent to <strong>{invite.email}</strong>, but
          you&apos;re signed in as <strong>{session.user.email}</strong>.
        </p>
        <p className="text-sm text-muted-foreground">
          Please sign out and try again with the correct account.
        </p>
      </div>
    )
  }

  // If we reach here, the invitation is still pending but the user is
  // signed in with the right email. The JWT callback should have already
  // applied it during sign-in. Redirect to the appropriate surface.
  const destination = ROLE_REDIRECT[invite.role] ?? "/"
  redirect(destination)
}
