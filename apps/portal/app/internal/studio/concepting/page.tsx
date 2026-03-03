import type { Metadata } from "next"
import { desc, eq } from "drizzle-orm"
import { db } from "@repo/db/client"
import { conceptJobs, conceptJobAcceptances, studioEntries } from "@repo/db/schema"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { getSessionUser } from "@/lib/session"
import { ConceptingClient } from "./ConceptingClient"

export const metadata: Metadata = {
  title: "Concepting | Satuit Supply Co.",
}

const CONCEPTING_ENABLED = process.env.STUDIO_CONCEPTING_ENABLED === "true"

async function getConceptingData(userId: string) {
  const [inspirations, recentJobsRows] = await Promise.all([
    db.query.studioEntries.findMany({
      // Inspirations: shared pool for selection
      orderBy: [desc(studioEntries.createdAt)],
      limit: 30,
      columns: {
        id: true,
        title: true,
        category: true,
        owner: true,
        createdAt: true,
      },
    }),
    db.query.conceptJobs.findMany({
      where: eq(conceptJobs.createdBy, userId), // only current user's jobs
      orderBy: [desc(conceptJobs.createdAt)],
      limit: 8,
      columns: {
        id: true,
        status: true,
        createdAt: true,
        promptVersion: true,
        outputJson: true,
        error: true,
        inputJson: true,
      },
    }),
  ])

  const jobIds = recentJobsRows.map((j) => j.id)
  const acceptances =
    jobIds.length > 0
      ? await db.query.conceptJobAcceptances.findMany({
          where: (a, { inArray }) => inArray(a.conceptJobId, jobIds),
          columns: { conceptJobId: true, conceptId: true, studioEntryId: true },
        })
      : []

  const acceptedByJob = new Map<string, Set<string>>()
  const acceptedEntryMapByJob = new Map<string, Record<string, string>>()
  for (const a of acceptances) {
    let set = acceptedByJob.get(a.conceptJobId)
    if (!set) {
      set = new Set()
      acceptedByJob.set(a.conceptJobId, set)
    }
    set.add(a.conceptId)

    let entryMap = acceptedEntryMapByJob.get(a.conceptJobId)
    if (!entryMap) {
      entryMap = {}
      acceptedEntryMapByJob.set(a.conceptJobId, entryMap)
    }
    entryMap[a.conceptId] = a.studioEntryId
  }

  return {
    inspirations: inspirations.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    recentJobs: recentJobsRows.map((job) => ({
      ...job,
      createdAt: job.createdAt.toISOString(),
      acceptedConceptIds: Array.from(acceptedByJob.get(job.id) ?? []),
      acceptedConceptEntryMap: acceptedEntryMapByJob.get(job.id) ?? {},
    })),
  }
}

export default async function StudioConceptingPage() {
  const conceptingEnabled = CONCEPTING_ENABLED

  if (!conceptingEnabled) {
    return (
      <DocPageShell breadcrumbs={[{ label: "Studio", href: "/internal/studio" }, { label: "Concepting" }]}>
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 md:px-12 border-b">
            <h1 className="text-xl font-bold tracking-tight">AI Concepting</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Concepting is currently disabled. Enable it with <code className="rounded bg-muted px-1.5 py-0.5 text-xs">STUDIO_CONCEPTING_ENABLED=true</code> to use this feature.
            </p>
          </div>
          <div className="px-8 py-6 md:px-12">
            <p className="text-sm text-muted-foreground">
              Select Studio inspiration, generate concept directions, and accept strong options into Studio drafts when the feature is enabled.
            </p>
          </div>
        </main>
      </DocPageShell>
    )
  }

  const user = await getSessionUser()
  const data = await getConceptingData(user.id)

  return (
    <DocPageShell breadcrumbs={[{ label: "Studio", href: "/internal/studio" }, { label: "Concepting" }]}>
      <main className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 md:px-12 border-b">
          <h1 className="text-xl font-bold tracking-tight">AI Concepting</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select Studio inspiration, generate concept directions, and accept strong options into Studio drafts.
          </p>
        </div>
        <ConceptingClient inspirations={data.inspirations} recentJobs={data.recentJobs} />
      </main>
    </DocPageShell>
  )
}
