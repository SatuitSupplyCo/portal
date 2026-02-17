import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { SetBreadcrumbs } from "@/components/nav/SetBreadcrumbs"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { Badge } from "@repo/ui/badge"
import { Separator } from "@repo/ui/separator"
import { Button } from "@repo/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table"
import { ArrowLeft, Mail, Building2, Calendar, Shield, Boxes } from "lucide-react"
import { UserRoleSelect } from "../_components/UserRoleSelect"
import { ProductRoleSelect } from "../_components/ProductRoleSelect"
import { RoleBadge } from "../_components/RoleBadge"

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

const SURFACE_ACCESS: Record<string, string[]> = {
  owner: ["Internal", "Partners", "Vendors", "Admin"],
  admin: ["Internal", "Partners", "Vendors", "Admin"],
  editor: ["Internal", "Partners", "Vendors"],
  internal_viewer: ["Internal", "Partners", "Vendors"],
  partner_viewer: ["Partners"],
  vendor_viewer: ["Vendors"],
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect("/auth/signin")

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, id),
    with: {
      organization: true,
      orgMemberships: {
        with: { organization: true },
      },
    },
  })

  if (!user) notFound()

  // Get invitation history for this user's email
  const invitationHistory = await db.query.invitations.findMany({
    where: (i, { eq }) => eq(i.email, user.email),
    with: { invitedByUser: true },
    orderBy: (i, { desc }) => [desc(i.createdAt)],
  })

  const surfaces = SURFACE_ACCESS[user.role] ?? []
  const isSelf = session.user.id === user.id

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: user.name ?? user.email },
        ]}
      />

      <div className="space-y-8 max-w-3xl">
        {/* Back link */}
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Users
        </Link>

        {/* Profile header */}
        <div className="flex items-start gap-5">
          <Avatar className="h-16 w-16">
            {user.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
            <AvatarFallback className="text-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight truncate">
                {user.name ?? "Unnamed User"}
              </h1>
              {isSelf && (
                <Badge variant="outline" className="shrink-0">You</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Separator />

        {/* Details grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Role */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="h-4 w-4" />
              Portal Role
            </div>
            <UserRoleSelect
              userId={user.id}
              currentRole={user.role}
              currentUserRole={session.user.role}
              currentUserId={session.user.id}
            />
          </div>

          {/* Product Role */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Boxes className="h-4 w-4" />
              Product Role
            </div>
            <ProductRoleSelect
              userId={user.id}
              currentRole={user.productRole}
              isSelf={isSelf}
            />
            <p className="text-xs text-muted-foreground">
              Controls lifecycle permissions (seasons, concepts, approvals)
            </p>
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Organization
            </div>
            {user.organization ? (
              <div>
                <p className="font-medium">{user.organization.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {user.organization.type} · {user.organization.status}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No organization assigned
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mail className="h-4 w-4" />
              Email
            </div>
            <p className="text-sm">{user.email}</p>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Account Dates
            </div>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Joined:</span>{" "}
                {formatDate(user.createdAt)}
              </p>
              <p>
                <span className="text-muted-foreground">Updated:</span>{" "}
                {formatDate(user.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Surface access */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Surface Access</h2>
          <p className="text-sm text-muted-foreground">
            Portal surfaces this user can access based on their role.
          </p>
          <div className="flex flex-wrap gap-2">
            {surfaces.map((surface) => (
              <Badge key={surface} variant="secondary">
                {surface}
              </Badge>
            ))}
            {surfaces.length === 0 && (
              <p className="text-sm text-muted-foreground">No surface access</p>
            )}
          </div>
        </section>

        {/* Org memberships */}
        {user.orgMemberships.length > 0 && (
          <>
            <Separator />
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Organization Memberships</h2>
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Org Role</TableHead>
                      <TableHead>Since</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.orgMemberships.map((membership) => (
                      <TableRow key={membership.id}>
                        <TableCell className="font-medium">
                          {membership.organization.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {membership.role.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(membership.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </>
        )}

        {/* Invitation history */}
        {invitationHistory.length > 0 && (
          <>
            <Separator />
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Invitation History</h2>
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitationHistory.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell>
                          <Badge
                            variant={
                              invite.status === "accepted"
                                ? "default"
                                : invite.status === "pending"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="capitalize"
                          >
                            {invite.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={invite.role} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {invite.invitedByUser?.name ?? "Unknown"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(invite.createdAt)}
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
