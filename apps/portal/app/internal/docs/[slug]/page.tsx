import { notFound } from "next/navigation"
import { db } from "@repo/db/client"
import { BlockRenderer } from "@/components/blocks/BlockRenderer"
import { SectionNavPanel } from "@/components/shell/SectionNavPanel"
import { DocTableOfContents, type TocHeading } from "@/components/nav/DocTableOfContents"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { DocPropertiesPanel } from "@/components/nav/DocPropertiesPanel"

// ─── Helpers ─────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// ─── Page ────────────────────────────────────────────────────────────

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const doc = await db.query.documents.findFirst({
    where: (d, { eq, and }) =>
      and(eq(d.slug, slug), eq(d.visibleToInternal, true)),
    with: {
      blocks: {
        where: (b, { eq }) => eq(b.visibleToInternal, true),
        orderBy: (b, { asc }) => [asc(b.sortOrder)],
      },
    },
  })

  if (!doc) notFound()

  // Extract headings for the TOC
  const headings: TocHeading[] = doc.blocks
    .filter((b) => b.type === "heading")
    .map((b) => {
      const cj = b.contentJson as { level: number; text: string }
      return {
        id: slugify(cj.text),
        text: cj.text,
        level: cj.level,
      }
    })

  // Build right rail content (serializable props for the client component)
  const propertiesPanel = (
    <DocPropertiesPanel
      title={doc.title}
      status={doc.status}
      ownerTeam={doc.ownerTeam}
      visibleToInternal={doc.visibleToInternal}
      visibleToPartners={doc.visibleToPartners}
      visibleToVendors={doc.visibleToVendors}
      createdAt={doc.createdAt.toLocaleDateString()}
      updatedAt={doc.updatedAt.toLocaleDateString()}
    />
  )

  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Documents", href: "/internal/docs" },
        { label: doc.title },
      ]}
      rightRailContent={propertiesPanel}
    >
      <SectionNavPanel>
        <DocTableOfContents headings={headings} />
      </SectionNavPanel>

      <main className="flex-1 overflow-y-auto p-6">
        <article className="max-w-4xl">
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              {doc.ownerTeam && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize">
                  {doc.ownerTeam}
                </span>
              )}
              <span className="capitalize">{doc.status}</span>
              {doc.updatedAt && (
                <>
                  <span>&middot;</span>
                  <span>Updated {doc.updatedAt.toLocaleDateString()}</span>
                </>
              )}
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{doc.title}</h1>
          </header>

          <BlockRenderer blocks={doc.blocks as any} />
        </article>
      </main>
    </DocPageShell>
  )
}
