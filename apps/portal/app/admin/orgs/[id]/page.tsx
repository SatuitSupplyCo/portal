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
import { ArrowLeft, Building2, Users, Calendar } from "lucide-react"
import { ResourceGrantsManager } from "../../grants/ResourceGrantsManager"
import { getGrantsForSubject } from "../../grants/actions"

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
    },
  })

  if (!org) notFound()

  const [orgGrants, dbSeasons, dbCollections, dbFactories] = await Promise.all([
    getGrantsForSubject("org", id),
    db.query.seasons.findMany({ orderBy: (s, { asc }) => [asc(s.code)] }),
    db.query.collections.findMany({ orderBy: (c, { asc }) => [asc(c.sortOrder)] }),
    db.query.factories.findMany({ orderBy: (f, { asc }) => [asc(f.legalName)] }),
  ])

  const resourceTypes = [
    {
      type: "season",
      label: "Seasons",
      options: dbSeasons.map((s) => ({ id: s.id, label: `${s.name} (${s.code})` })),
    },
    {
      type: "collection",
      label: "Collections",
      options: dbCollections.map((c) => ({ id: c.id, label: c.name })),
    },
    {
      type: "factory",
      label: "Factories",
      options: dbFactories.map((f) => ({ id: f.id, label: f.tradingName ?? f.legalName })),
    },
  ]

  const grantsList = orgGrants.map((g) => ({
    id: g.id,
    resourceType: g.resourceType,
    resourceId: g.resourceId,
    permission: g.permission,
  }))

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
        <Link
          href="/admin/orgs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Organizations
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {org.type}
              </Badge>
              <Badge
                variant={org.status === "active" ? "default" : "secondary"}
                className="capitalize"
              >
                {org.status}
              </Badge>
              <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {org.slug}
              </code>
            </div>
          </div>
        </div>

        <Separator />

        {/* Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              Members
            </div>
            <p className="text-sm">{org.memberships.length} member(s)</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Created
            </div>
            <p className="text-sm">{formatDate(org.createdAt)}</p>
          </div>
        </div>

        {/* Members table */}
        {org.memberships.length > 0 && (
          <>
            <Separator />
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Members</h2>
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Org Role</TableHead>
                      <TableHead>Since</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {org.memberships.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <Link
                            href={`/admin/users/${m.user.id}`}
                            className="font-medium hover:underline"
                          >
                            {m.user.name ?? "Unnamed"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {m.user.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {m.role.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(m.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </>
        )}

        {/* Access grants */}
        <Separator />
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Access Grants</h2>
          <p className="text-sm text-muted-foreground">
            Grant this organization access to specific seasons, collections,
            or factories. All members of the org inherit these grants.
          </p>
          <ResourceGrantsManager
            subjectType="org"
            subjectId={org.id}
            grants={grantsList}
            resourceTypes={resourceTypes}
          />
        </section>
      </div>
    </main>
  )
}
