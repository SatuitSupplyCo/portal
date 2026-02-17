import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { SetBreadcrumbs } from "@/components/nav/SetBreadcrumbs"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { Badge } from "@repo/ui/badge"
import { Separator } from "@repo/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Hash,
  Activity,
  Users,
} from "lucide-react"
import { OrgTypeBadge } from "../_components/OrgTypeBadge"
import { OrgStatusSelect } from "../_components/OrgStatusSelect"
import { AddMemberDialog } from "../_components/AddMemberDialog"
import { MemberActions } from "../_components/MemberActions"
import { RoleBadge } from "../../users/_components/RoleBadge"

function getInitials(name: string | null) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect("/auth/signin")

  const org = await db.query.organizations.findFirst({
    where: (o, { eq }) => eq(o.id, id),
    with: {
      memberships: {
        with: { user: true },
      },
      invitations: {
        with: { invitedByUser: true },
      },
    },
  })

  if (!org) notFound()

  // Get users not already in this org for the Add Member dialog
  const allUsers = await db.query.users.findMany({
    orderBy: (u, { asc }) => [asc(u.name)],
  })
  const memberUserIds = new Set(org.memberships.map((m) => m.userId))
  const availableUsers = allUsers.filter((u) => !memberUserIds.has(u.id))

  // Separate pending invitations
  const pendingInvitations = org.invitations.filter(
    (i) => i.status === "pending",
  )

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", href: "/admin/orgs" },
          { label: org.name },
        ]}
      />

      <div className="space-y-8 max-w-3xl">
        {/* Back link */}
        <Link
          href="/admin/orgs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Organizations
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border bg-muted">
            <Building2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight truncate">
                {org.name}
              </h1>
              <OrgTypeBadge type={org.type} />
            </div>
            <p className="text-muted-foreground">
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {org.slug}
              </code>
            </p>
          </div>
        </div>

        <Separator />

        {/* Details grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4" />
              Status
            </div>
            <OrgStatusSelect orgId={org.id} currentStatus={org.status} />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Type
            </div>
            <p className="text-sm capitalize">{org.type}</p>
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Hash className="h-4 w-4" />
              Slug
            </div>
            <code className="text-sm bg-muted px-2 py-1 rounded block w-fit">
              {org.slug}
            </code>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Dates
            </div>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Created:</span>{" "}
                {formatDate(org.createdAt)}
              </p>
              <p>
                <span className="text-muted-foreground">Updated:</span>{" "}
                {formatDate(org.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Members */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members
              <span className="text-sm font-normal text-muted-foreground">
                ({org.memberships.length})
              </span>
            </h2>
            <AddMemberDialog orgId={org.id} availableUsers={availableUsers} />
          </div>

          {org.memberships.length > 0 ? (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">User</TableHead>
                    <TableHead>Portal Role</TableHead>
                    <TableHead>Org Role</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.memberships.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell>
                        <Link
                          href={`/admin/users/${membership.user.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <Avatar className="h-7 w-7">
                            {membership.user.image && (
                              <AvatarImage
                                src={membership.user.image}
                                alt={membership.user.name ?? ""}
                              />
                            )}
                            <AvatarFallback className="text-xs">
                              {getInitials(membership.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate group-hover:underline">
                              {membership.user.name ?? "Unnamed"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {membership.user.email}
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={membership.user.role} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {membership.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(membership.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <MemberActions
                          membershipId={membership.id}
                          orgId={org.id}
                          currentRole={membership.role}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              No members yet. Add a user to get started.
            </div>
          )}
        </section>

        {/* Pending invitations for this org */}
        {pendingInvitations.length > 0 && (
          <>
            <Separator />
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">
                Pending Invitations
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({pendingInvitations.length})
                </span>
              </h2>
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Portal Role</TableHead>
                      <TableHead>Org Role</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvitations.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-medium">
                          {invite.email}
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={invite.role} />
                        </TableCell>
                        <TableCell>
                          {invite.orgRole ? (
                            <Badge variant="outline" className="capitalize">
                              {invite.orgRole.replace("_", " ")}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invite.invitedByUser?.name ?? "Unknown"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(invite.expiresAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
