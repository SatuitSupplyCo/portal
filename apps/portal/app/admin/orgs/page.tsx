import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SetBreadcrumbs } from "@/components/nav/SetBreadcrumbs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table"
import { OrgTypeBadge } from "./_components/OrgTypeBadge"
import { StatusBadge } from "./_components/StatusBadge"
import { CreateOrgDialog } from "./_components/CreateOrgDialog"

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default async function OrgsPage() {
  const session = await auth()
  if (!session) redirect("/auth/signin")

  const allOrgs = await db.query.organizations.findMany({
    with: {
      memberships: true,
    },
    orderBy: (o, { asc }) => [asc(o.name)],
  })

  // Group by type
  const vendors = allOrgs.filter((o) => o.type === "vendor")
  const partners = allOrgs.filter((o) => o.type === "partner")

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations" },
        ]}
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Organizations
            </h1>
            <p className="text-muted-foreground">
              Manage vendor and partner companies.
            </p>
          </div>
          <CreateOrgDialog />
        </div>

        {/* Vendors */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Vendors
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({vendors.length})
            </span>
          </h2>

          {vendors.length > 0 ? (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orgs/${org.id}`}
                          className="font-medium hover:underline"
                        >
                          {org.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {org.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={org.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {org.memberships.length}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(org.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/orgs/${org.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              No vendor organizations yet.
            </div>
          )}
        </section>

        {/* Partners */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Partners
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({partners.length})
            </span>
          </h2>

          {partners.length > 0 ? (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orgs/${org.id}`}
                          className="font-medium hover:underline"
                        >
                          {org.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {org.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={org.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {org.memberships.length}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(org.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/orgs/${org.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              No partner organizations yet.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
