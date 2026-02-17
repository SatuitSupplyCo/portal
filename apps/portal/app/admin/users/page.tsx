import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SetBreadcrumbs } from "@/components/nav/SetBreadcrumbs"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { Badge } from "@repo/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table"
import { RoleBadge, ProductRoleBadge } from "./_components/RoleBadge"
import { InviteUserDialog } from "./_components/InviteUserDialog"
import { InvitationActions } from "./_components/InvitationActions"

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
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default async function UsersPage() {
  const session = await auth()
  if (!session) redirect("/auth/signin")

  const allUsers = await db.query.users.findMany({
    with: {
      organization: true,
    },
    orderBy: (u, { asc }) => [asc(u.name)],
  })

  const pendingInvitations = await db.query.invitations.findMany({
    where: (i, { eq }) => eq(i.status, "pending"),
    with: {
      invitedByUser: true,
      organization: true,
    },
    orderBy: (i, { desc }) => [desc(i.createdAt)],
  })

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users" },
        ]}
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage portal users, invitations, and role assignments.
            </p>
          </div>
          <InviteUserDialog />
        </div>

        {/* Active Users */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Active Users
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({allUsers.length})
            </span>
          </h2>

          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">User</TableHead>
                  <TableHead>Portal Role</TableHead>
                  <TableHead>Product Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <Avatar className="h-8 w-8">
                          {user.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate group-hover:underline">
                            {user.name ?? "Unnamed"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <ProductRoleBadge role={user.productRole} />
                    </TableCell>
                    <TableCell>
                      {user.organization ? (
                        <span className="text-sm">{user.organization.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}

                {allUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Pending Invitations */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Pending Invitations
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({pendingInvitations.length})
            </span>
          </h2>

          {pendingInvitations.length > 0 ? (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Email</TableHead>
                    <TableHead>Portal Role</TableHead>
                    <TableHead>Product Role</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {invite.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={invite.role} />
                      </TableCell>
                      <TableCell>
                        <ProductRoleBadge role={invite.productRole} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {invite.invitedByUser?.name ?? "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(invite.expiresAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <InvitationActions
                          invitationId={invite.id}
                          status={invite.status}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              No pending invitations.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
