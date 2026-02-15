import { db } from "@repo/db/client"
import Link from "next/link"
import { SetBreadcrumbs } from "@/components/nav/SetBreadcrumbs"

export default async function DocsListingPage() {
  const docs = await db.query.documents.findMany({
    where: (d, { eq, and }) =>
      and(
        eq(d.section, "docs"),
        eq(d.status, "published"),
        eq(d.visibleToInternal, true),
      ),
    orderBy: (d, { asc }) => [asc(d.ownerTeam), asc(d.title)],
  })

  // Group documents by ownerTeam
  const grouped = docs.reduce(
    (acc, doc) => {
      const team = doc.ownerTeam ?? "general"
      ;(acc[team] ??= []).push(doc)
      return acc
    },
    {} as Record<string, typeof docs>,
  )

  // Show "brand" first, then alphabetical
  const teamOrder = [
    "brand",
    ...Object.keys(grouped)
      .filter((t) => t !== "brand")
      .sort(),
  ]

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs crumbs={[{ label: "Documents" }]} />

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Guidelines, playbooks, and standards.
          </p>
        </div>

        {teamOrder.map((team) => {
          const teamDocs = grouped[team]
          if (!teamDocs?.length) return null

          return (
            <section key={team}>
              <h2 className="text-lg font-semibold capitalize mb-3">{team}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {teamDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/internal/docs/${doc.slug}`}
                    className="block rounded-lg border bg-card p-5 shadow-sm transition-colors hover:bg-accent"
                  >
                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Updated {doc.updatedAt.toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}

        {docs.length === 0 && (
          <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
            No documents published yet.
          </div>
        )}
      </div>
    </main>
  )
}
