import { db } from "@repo/db/client"
import { auth } from "@repo/auth"
import { notFound, redirect } from "next/navigation"
import { AcceptInviteButton } from "./_components/AcceptInviteButton"

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  internal_viewer: "Internal Viewer",
  partner_viewer: "Partner",
  vendor_viewer: "Vendor",
}

const PRODUCT_ROLE_LABELS: Record<string, string> = {
  studio_contributor: "Studio Contributor",
  product_lead: "Product Lead",
  founder: "Founder",
  external_designer: "External Designer",
  factory_partner: "Factory Partner",
}

export default async function InviteLandingPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const invite = await db.query.invitations.findFirst({
    where: (i, { eq }) => eq(i.token, token),
    with: {
      invitedByUser: true,
      organization: true,
    },
  })

  if (!invite) notFound()

  // Already accepted — redirect to sign in
  if (invite.status === "accepted") {
    redirect("/auth/signin")
  }

  // Revoked
  if (invite.status === "revoked") {
    return (
      <div className="w-full max-w-md space-y-4 rounded-xl border bg-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Invitation Revoked
        </h1>
        <p className="text-muted-foreground">
          This invitation has been revoked. Please contact the person who
          invited you for a new link.
        </p>
      </div>
    )
  }

  // Expired
  if (invite.expiresAt < new Date()) {
    return (
      <div className="w-full max-w-md space-y-4 rounded-xl border bg-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Invitation Expired
        </h1>
        <p className="text-muted-foreground">
          This invitation has expired. Please contact the person who invited
          you for a new link.
        </p>
      </div>
    )
  }

  // If the user is already signed in, go straight to accept
  const session = await auth()
  if (session?.user?.email === invite.email) {
    redirect(`/invite/${token}/accept`)
  }

  const roleLabel = ROLE_LABELS[invite.role] ?? invite.role
  const productRoleLabel = invite.productRole
    ? PRODUCT_ROLE_LABELS[invite.productRole] ?? invite.productRole
    : null
  const inviterName = invite.invitedByUser?.name ?? "A team member"

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Satuit Supply</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ve been invited to the portal
        </p>
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Invited by </span>
          <span className="font-medium">{inviterName}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Portal Role: </span>
          <span className="font-medium">{roleLabel}</span>
        </div>
        {productRoleLabel && (
          <div className="text-sm">
            <span className="text-muted-foreground">Product Role: </span>
            <span className="font-medium">{productRoleLabel}</span>
          </div>
        )}
        {invite.organization && (
          <div className="text-sm">
            <span className="text-muted-foreground">Organization: </span>
            <span className="font-medium">{invite.organization.name}</span>
          </div>
        )}
        <div className="text-sm">
          <span className="text-muted-foreground">Email: </span>
          <span className="font-medium">{invite.email}</span>
        </div>
      </div>

      <AcceptInviteButton token={token} />

      <p className="text-xs text-center text-muted-foreground">
        You&apos;ll be asked to sign in with your Google account
        ({invite.email}) to complete the setup.
      </p>
    </div>
  )
}
