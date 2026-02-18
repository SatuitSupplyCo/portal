import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SetBreadcrumbs } from "@/components/nav/SetBreadcrumbs"
import { Badge } from "@repo/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table"
import { Shield, ArrowRight } from "lucide-react"
import { CreateRoleDialog } from "./_components/CreateRoleDialog"

export default async function RolesPage() {
  const session = await auth()
  if (!session) redirect("/auth/signin")

  const allRoles = await db.query.roles.findMany({
    with: {
      rolePermissions: true,
      userRoles: true,
    },
    orderBy: (r, { asc }) => [asc(r.name)],
  })

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Roles" },
        ]}
      />

      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage permission bundles that can be assigned to users
            </p>
          </div>
          <CreateRoleDialog />
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{role.name}</p>
                        {role.description && (
                          <p className="text-xs text-muted-foreground">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {role.rolePermissions.length}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {role.userRoles.length}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {role.isSystem ? (
                      <Badge variant="default">System</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/roles/${role.id}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {allRoles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No roles defined. Create your first role to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  )
}
