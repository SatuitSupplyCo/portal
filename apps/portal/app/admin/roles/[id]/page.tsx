import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { SetBreadcrumbs } from "@/components/nav/SetBreadcrumbs"
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
import { ArrowLeft, Shield, Users } from "lucide-react"
import { PermissionEditor } from "./_components/PermissionEditor"
import { DeleteRoleButton } from "./_components/DeleteRoleButton"

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect("/auth/signin")

  const role = await db.query.roles.findFirst({
    where: (r, { eq }) => eq(r.id, id),
    with: {
      rolePermissions: true,
      userRoles: {
        with: { user: true },
      },
    },
  })

  if (!role) notFound()

  const allPermissions = await db.query.permissions.findMany({
    orderBy: (p, { asc }) => [asc(p.groupKey), asc(p.code)],
  })

  const currentPermissionCodes = role.rolePermissions.map(
    (rp) => rp.permissionCode,
  )

  const permissionGroups = allPermissions.reduce(
    (acc, p) => {
      if (!acc[p.groupKey]) acc[p.groupKey] = []
      acc[p.groupKey].push(p)
      return acc
    },
    {} as Record<string, typeof allPermissions>,
  )

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Roles", href: "/admin/roles" },
          { label: role.name },
        ]}
      />

      <div className="space-y-8 max-w-3xl">
        <Link
          href="/admin/roles"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Roles
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {role.name}
                </h1>
                {role.isSystem ? (
                  <Badge variant="default">System</Badge>
                ) : (
                  <Badge variant="outline">Custom</Badge>
                )}
              </div>
              {role.description && (
                <p className="text-muted-foreground text-sm mt-1">
                  {role.description}
                </p>
              )}
            </div>
          </div>
          {!role.isSystem && <DeleteRoleButton roleId={role.id} roleName={role.name} />}
        </div>

        <Separator />

        {/* Permissions */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Permissions</h2>
            <p className="text-sm text-muted-foreground">
              Toggle which capabilities this role grants. Changes are saved
              immediately.
            </p>
          </div>

          <PermissionEditor
            roleId={role.id}
            permissionGroups={permissionGroups}
            currentPermissionCodes={currentPermissionCodes}
          />
        </section>

        <Separator />

        {/* Users with this role */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              Users ({role.userRoles.length})
            </h2>
          </div>

          {role.userRoles.length > 0 ? (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {role.userRoles.map((ur) => (
                    <TableRow key={ur.id}>
                      <TableCell>
                        <Link
                          href={`/admin/users/${ur.user.id}`}
                          className="font-medium hover:underline"
                        >
                          {ur.user.name ?? "Unnamed"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ur.user.email}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ur.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No users have been assigned this role yet.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
