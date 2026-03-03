import type { Metadata } from "next"
import { and, desc, eq } from "drizzle-orm"
import { db } from "@repo/db/client"
import { seasonColors, studioDesignVersions, studioEntries } from "@repo/db/schema"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { hasPermission } from "@/lib/permissions"
import { getSessionUser } from "@/lib/session"
import { DesignEditorClient } from "./DesignEditorClient"
import { getHex, getPantone } from "@/lib/color"

export const metadata: Metadata = {
  title: "Design | Studio",
}

const DESIGN_ENABLED = process.env.STUDIO_DESIGN_ENABLED !== "false"
const RENDER_ENABLED = process.env.STUDIO_RENDER_ENABLED !== "false"

type Props = { searchParams: Promise<{ entryId?: string }> }

type ProductTypeOption = {
  code: string
  label: string
  sides: string[]
}

type EntryColorSuggestion = {
  id: string
  title: string
  hex: string | null
  pantone: string | null
  source: "season" | "collection"
}

type DesignEntryContext = {
  initialSnapshot?: Record<string, unknown>
  initialVersionId?: string
  conceptColorDirection: string[]
  suggestedColors: EntryColorSuggestion[]
}

function readApprovalState(meta: Record<string, unknown> | null): string | null {
  const approval =
    meta && typeof meta.collaborationApproval === "object" && meta.collaborationApproval !== null
      ? (meta.collaborationApproval as Record<string, unknown>)
      : null
  return approval && typeof approval.state === "string" ? approval.state : null
}

async function loadProductTypeOptions(): Promise<ProductTypeOption[]> {
  try {
    const rows = await db.query.productTypes.findMany({
      columns: {
        code: true,
        name: true,
        sides: true,
      },
      orderBy: (pt, { asc }) => [asc(pt.sortOrder), asc(pt.name)],
    })
    return rows.map((pt) => ({
      code: pt.code,
      label: pt.name,
      sides:
        Array.isArray(pt.sides) && pt.sides.every((side) => typeof side === "string")
          ? (pt.sides as string[])
          : ["front", "back"],
    }))
  } catch {
    // Backward compatibility while local DB is pre-migration.
    const rows = await db.query.productTypes.findMany({
      columns: {
        code: true,
        name: true,
      },
      orderBy: (pt, { asc }) => [asc(pt.sortOrder), asc(pt.name)],
    })
    return rows.map((pt) => ({
      code: pt.code,
      label: pt.name,
      sides: ["front", "back"],
    }))
  }
}

function readConceptColorDirection(meta: Record<string, unknown> | null): string[] {
  const aiConcept =
    meta && typeof meta.aiConcept === "object" && meta.aiConcept !== null
      ? (meta.aiConcept as Record<string, unknown>)
      : null
  const values = aiConcept?.colorDirection
  if (!Array.isArray(values)) return []
  return values.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
}

async function loadDesignEntryContext(entryId: string): Promise<DesignEntryContext> {
  const entry = await db.query.studioEntries.findFirst({
    where: eq(studioEntries.id, entryId),
    columns: {
      id: true,
      title: true,
      categoryMetadata: true,
      targetSeasonId: true,
      collectionId: true,
    },
  })
  if (!entry) {
    return { conceptColorDirection: [], suggestedColors: [] }
  }

  const latestVersion = await db.query.studioDesignVersions.findFirst({
    where: eq(studioDesignVersions.studioEntryId, entryId),
    orderBy: [desc(studioDesignVersions.version)],
    columns: {
      id: true,
      snapshotJson: true,
    },
  })

  const seasonRows =
    entry.targetSeasonId != null
      ? await db.query.seasonColors.findMany({
          where: eq(seasonColors.seasonId, entry.targetSeasonId),
          limit: 30,
          orderBy: [desc(seasonColors.createdAt)],
          with: {
            studioEntry: {
              columns: {
                id: true,
                title: true,
                categoryMetadata: true,
              },
            },
          },
        })
      : []

  const collectionRows =
    entry.collectionId != null
      ? await db.query.studioEntries.findMany({
          where: and(
            eq(studioEntries.category, "color"),
            eq(studioEntries.collectionId, entry.collectionId),
          ),
          columns: {
            id: true,
            title: true,
            categoryMetadata: true,
          },
          orderBy: [desc(studioEntries.createdAt)],
          limit: 30,
        })
      : []

  const seasonSuggestions: EntryColorSuggestion[] = seasonRows.map((row) => ({
    id: row.studioEntry.id,
    title: row.studioEntry.title,
    hex: getHex((row.studioEntry.categoryMetadata as Record<string, unknown> | null) ?? null),
    pantone: getPantone((row.studioEntry.categoryMetadata as Record<string, unknown> | null) ?? null),
    source: "season",
  }))
  const collectionSuggestions: EntryColorSuggestion[] = collectionRows.map((row) => ({
    id: row.id,
    title: row.title,
    hex: getHex((row.categoryMetadata as Record<string, unknown> | null) ?? null),
    pantone: getPantone((row.categoryMetadata as Record<string, unknown> | null) ?? null),
    source: "collection",
  }))
  const deduped = new Map<string, EntryColorSuggestion>()
  for (const suggestion of [...seasonSuggestions, ...collectionSuggestions]) {
    if (!deduped.has(suggestion.id)) deduped.set(suggestion.id, suggestion)
  }

  return {
    initialSnapshot: (
      latestVersion?.snapshotJson &&
      typeof latestVersion.snapshotJson === "object" &&
      !Array.isArray(latestVersion.snapshotJson)
        ? (latestVersion.snapshotJson as Record<string, unknown>)
        : { title: entry.title }
    ),
    initialVersionId: latestVersion?.id ?? undefined,
    conceptColorDirection: readConceptColorDirection(
      (entry.categoryMetadata as Record<string, unknown> | null) ?? null,
    ),
    suggestedColors: Array.from(deduped.values()),
  }
}

export default async function StudioDesignPage({ searchParams }: Props) {
  if (!DESIGN_ENABLED) {
    return (
      <DocPageShell
        breadcrumbs={[
          { label: "Studio", href: "/internal/studio" },
          { label: "Design" },
        ]}
      >
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 md:px-12 border-b">
            <h1 className="text-xl font-bold tracking-tight">Design Editor</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Design is currently disabled. Enable it with{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                STUDIO_DESIGN_ENABLED=true
              </code>{" "}
              to use this feature.
            </p>
          </div>
        </main>
      </DocPageShell>
    )
  }

  const { entryId } = await searchParams
  const user = await getSessionUser()
  const canRequestApproval = hasPermission(user, "studio.review")
  const canDecideApproval = hasPermission(user, "studio.promote")
  const entry =
    entryId && /^[0-9a-fA-F-]{36}$/.test(entryId)
      ? await db.query.studioEntries.findFirst({
          where: eq(studioEntries.id, entryId),
          columns: {
            status: true,
            categoryMetadata: true,
          },
        })
      : null
  const approvalState = readApprovalState(
    (entry?.categoryMetadata as Record<string, unknown> | null) ?? null,
  )
  const productTypeOptions = await loadProductTypeOptions()
  const entryContext =
    entryId && /^[0-9a-fA-F-]{36}$/.test(entryId)
      ? await loadDesignEntryContext(entryId)
      : null

  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Studio", href: "/internal/studio" },
        { label: "Design" },
      ]}
    >
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="px-8 py-4 md:px-12 border-b shrink-0">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold tracking-tight">Design Editor</h1>
            <div className="flex items-center gap-1.5">
              {entry?.status ? (
                <span className="rounded border bg-muted px-2 py-0.5 text-[11px] font-medium">
                  Entry: {entry.status}
                </span>
              ) : null}
              {approvalState ? (
                <span className="rounded border bg-muted px-2 py-0.5 text-[11px] font-medium">
                  Approval: {approvalState}
                </span>
              ) : null}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Garment canvas, component library, and production-ready design properties.
          </p>
        </div>
        <DesignEditorClient
          studioEntryId={entryId ?? undefined}
          renderEnabled={RENDER_ENABLED}
          canRequestApproval={canRequestApproval}
          canDecideApproval={canDecideApproval}
          productTypeOptions={productTypeOptions}
          initialSnapshot={entryContext?.initialSnapshot}
          initialVersionId={entryContext?.initialVersionId}
          conceptColorDirection={entryContext?.conceptColorDirection ?? []}
          suggestedColors={entryContext?.suggestedColors ?? []}
        />
      </main>
    </DocPageShell>
  )
}
