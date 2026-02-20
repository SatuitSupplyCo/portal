import { Suspense } from 'react'
import { auth } from '@repo/auth'
import { db } from '@repo/db/client'
import { aiSuggestionLog } from '@repo/db/schema'
import { desc, eq, and, sql, lt } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { SetBreadcrumbs } from '@/components/nav/SetBreadcrumbs'
import { aiFeatureRegistry } from '@/lib/ai/registry'
import { AiUsageStats } from './_components/AiUsageStats'
import { AiPromptRegistry } from './_components/AiPromptRegistry'
import { AiSuggestionLog } from './_components/AiSuggestionLog'
import { AiLogFilters } from './_components/AiLogFilters'
import type { LogEntry } from './_components/AiSuggestionLog'

const PAGE_SIZE = 50

async function getAggregateStats() {
  const rows = await db
    .select({
      feature: aiSuggestionLog.feature,
      outcome: aiSuggestionLog.outcome,
      count: sql<number>`count(*)::int`,
      totalInputTokens: sql<number>`coalesce(sum(${aiSuggestionLog.inputTokens}), 0)::int`,
      totalOutputTokens: sql<number>`coalesce(sum(${aiSuggestionLog.outputTokens}), 0)::int`,
      avgLatency: sql<number | null>`avg(${aiSuggestionLog.latencyMs})`,
    })
    .from(aiSuggestionLog)
    .groupBy(aiSuggestionLog.feature, aiSuggestionLog.outcome)

  let total = 0
  let selected = 0
  let rejected = 0
  let regenerated = 0
  let totalInputTokens = 0
  let totalOutputTokens = 0
  const latencies: number[] = []

  const featureMap = new Map<string, { total: number; selected: number; rejected: number; regenerated: number }>()

  for (const row of rows) {
    const count = Number(row.count)
    total += count
    totalInputTokens += Number(row.totalInputTokens)
    totalOutputTokens += Number(row.totalOutputTokens)
    if (row.avgLatency != null) latencies.push(Number(row.avgLatency))

    if (row.outcome === 'selected') selected += count
    else if (row.outcome === 'rejected') rejected += count
    else if (row.outcome === 'regenerated') regenerated += count

    const existing = featureMap.get(row.feature) ?? { total: 0, selected: 0, rejected: 0, regenerated: 0 }
    existing.total += count
    if (row.outcome === 'selected') existing.selected += count
    else if (row.outcome === 'rejected') existing.rejected += count
    else if (row.outcome === 'regenerated') existing.regenerated += count
    featureMap.set(row.feature, existing)
  }

  const avgLatencyMs = latencies.length > 0
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length
    : null

  const byFeature = Array.from(featureMap.entries()).map(([feature, stats]) => ({
    feature,
    ...stats,
  }))

  return { total, selected, rejected, regenerated, byFeature, totalInputTokens, totalOutputTokens, avgLatencyMs }
}

async function getLogEntries(filters: {
  feature?: string
  outcome?: string
  cursor?: string
}) {
  const conditions = []
  if (filters.feature && filters.feature !== 'all') {
    conditions.push(eq(aiSuggestionLog.feature, filters.feature))
  }
  if (filters.outcome && filters.outcome !== 'all') {
    conditions.push(eq(aiSuggestionLog.outcome, filters.outcome))
  }
  if (filters.cursor) {
    conditions.push(lt(aiSuggestionLog.createdAt, new Date(filters.cursor)))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const rows = await db
    .select({
      id: aiSuggestionLog.id,
      feature: aiSuggestionLog.feature,
      fieldName: aiSuggestionLog.fieldName,
      suggestions: aiSuggestionLog.suggestions,
      selectedValue: aiSuggestionLog.selectedValue,
      outcome: aiSuggestionLog.outcome,
      inputTokens: aiSuggestionLog.inputTokens,
      outputTokens: aiSuggestionLog.outputTokens,
      latencyMs: aiSuggestionLog.latencyMs,
      createdAt: aiSuggestionLog.createdAt,
      userId: aiSuggestionLog.userId,
    })
    .from(aiSuggestionLog)
    .where(where)
    .orderBy(desc(aiSuggestionLog.createdAt))
    .limit(PAGE_SIZE + 1)

  const hasMore = rows.length > PAGE_SIZE
  const entries = rows.slice(0, PAGE_SIZE)

  const userIds = [...new Set(entries.map((e) => e.userId).filter(Boolean))] as string[]
  let userMap = new Map<string, { name: string | null; email: string | null }>()

  if (userIds.length > 0) {
    const users = await db.query.users.findMany({
      where: (u, { inArray }) => inArray(u.id, userIds),
      columns: { id: true, name: true, email: true },
    })
    userMap = new Map(users.map((u) => [u.id, { name: u.name, email: u.email }]))
  }

  const logEntries: LogEntry[] = entries.map((e) => {
    const user = e.userId ? userMap.get(e.userId) : undefined
    return {
      id: e.id,
      feature: e.feature,
      fieldName: e.fieldName,
      suggestions: (e.suggestions ?? []) as Array<{ value: string; rationale: string }>,
      selectedValue: e.selectedValue,
      outcome: e.outcome,
      inputTokens: e.inputTokens,
      outputTokens: e.outputTokens,
      latencyMs: e.latencyMs,
      createdAt: e.createdAt,
      userName: user?.name ?? null,
      userEmail: user?.email ?? null,
    }
  })

  const nextCursor = hasMore && entries.length > 0
    ? entries[entries.length - 1]!.createdAt.toISOString()
    : null

  return { entries: logEntries, hasMore, nextCursor }
}

export default async function AiAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ feature?: string; outcome?: string; cursor?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const params = await searchParams

  const [stats, logData] = await Promise.all([
    getAggregateStats(),
    getLogEntries({
      feature: params.feature,
      outcome: params.outcome,
      cursor: params.cursor,
    }),
  ])

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs
        crumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'AI' },
        ]}
      />

      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI</h1>
          <p className="text-muted-foreground">
            Usage analytics, prompt registry, and suggestion logs.
          </p>
        </div>

        {/* Usage Stats */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Usage Overview</h2>
          <AiUsageStats {...stats} />
        </section>

        {/* Prompt Registry */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Prompt Registry
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({aiFeatureRegistry.length})
            </span>
          </h2>
          <AiPromptRegistry features={aiFeatureRegistry} />
        </section>

        {/* Suggestion Log */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Suggestion Log</h2>
            <Suspense>
              <AiLogFilters />
            </Suspense>
          </div>
          <AiSuggestionLog
            entries={logData.entries}
            hasMore={logData.hasMore}
            nextCursor={logData.nextCursor}
            filters={{ feature: params.feature, outcome: params.outcome }}
          />
        </section>
      </div>
    </main>
  )
}
