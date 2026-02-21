import type { Metadata } from "next"
import { db } from "@repo/db/client"
import { studioEntries, collections as collectionsTable } from "@repo/db/schema"
import { eq, desc, asc } from "drizzle-orm"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  Pipette,
  Search,
  Filter,
  Tag,
  User,
  Calendar,
  ArrowUpDown,
  ImageIcon,
} from "lucide-react"
import { Button } from "@repo/ui/button"
import { AddColorDialog } from "./AddColorDialog"
import { ColorExplorer } from "./ColorExplorer"
import { StudioColorGrid } from "./StudioColorGrid"
import { getSeasonOptions } from "../actions"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Color Inspiration | Studio",
}

// ─── Status badge colors ─────────────────────────────────────────────

const statusColors: Record<string, string> = {
  raw: "bg-slate-100 text-slate-700",
  exploring: "bg-blue-100 text-blue-800",
  prototyping: "bg-violet-100 text-violet-800",
  ready_for_review: "bg-amber-100 text-amber-800",
  revisions_requested: "bg-red-100 text-red-700",
  promoted: "bg-emerald-100 text-emerald-800",
  archived: "bg-gray-100 text-gray-500",
}

const statusLabels: Record<string, string> = {
  raw: "Raw",
  exploring: "Exploring",
  prototyping: "Prototyping",
  ready_for_review: "In Review",
  revisions_requested: "Revisions",
  promoted: "Promoted",
  archived: "Archived",
}

// ─── Empty state ─────────────────────────────────────────────────────

type CollectionOption = { id: string; name: string }

function EmptyState({ seasons, collections }: { seasons: { id: string; code: string; name: string }[]; collections: CollectionOption[] }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 mb-6">
        <Pipette className="h-8 w-8 text-pink-600" />
      </div>
      <h2 className="text-lg font-semibold mb-2">No color inspiration yet</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Capture Pantone pulls, dye-lot photos, seasonal palette ideas, and color
        direction references. These feed directly into seasonal color palette planning.
      </p>
      <AddColorDialog seasons={seasons} collections={collections} />
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────

export default async function StudioColorPage() {
  const [entries, seasons, collections] = await Promise.all([
    db.query.studioEntries.findMany({
      where: eq(studioEntries.category, 'color'),
      orderBy: [desc(studioEntries.createdAt)],
      with: {
        images: { limit: 1 },
        collectionRef: true,
      },
    }),
    getSeasonOptions(),
    db.select({ id: collectionsTable.id, name: collectionsTable.name })
      .from(collectionsTable)
      .orderBy(asc(collectionsTable.sortOrder)),
  ])

  const collectionOptions = collections.map((c) => ({ id: c.id, name: c.name }))
  const hasEntries = entries.length > 0

  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Studio", href: "/internal/studio" },
        { label: "Color" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-pink-50">
                  <Pipette className="h-4 w-4 text-pink-600" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">
                  Color Inspiration
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-11">
                Palette exploration and seasonal color direction. Pantone references,
                dye lots, and color stories that shape each season.
              </p>
            </div>
            <AddColorDialog seasons={seasons} collections={collectionOptions} />
          </div>
        </div>

        {/* Filters bar */}
        <div className="px-8 py-4 md:px-12 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search color inspiration..."
                className="w-full h-8 pl-9 pr-3 text-sm rounded-md border bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-3 w-3" />
              Status
            </Button>
            <Button variant="outline" size="sm">
              <Tag className="h-3 w-3" />
              Collection
            </Button>
            <Button variant="outline" size="sm">
              <User className="h-3 w-3" />
              Owner
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-3 w-3" />
              Season
            </Button>
          </div>
        </div>

        {/* Color Explorer */}
        <ColorExplorer />

        {/* Content */}
        {hasEntries ? (
          <div className="px-8 md:px-12 py-6">
            <StudioColorGrid
              entries={entries.map((entry) => {
                const meta = entry.categoryMetadata as Record<string, unknown> | null
                return {
                  id: entry.id,
                  title: entry.title,
                  description: entry.description,
                  status: entry.status,
                  tags: (entry.tags as string[]) ?? [],
                  owner: entry.owner,
                  createdAt: entry.createdAt.toISOString(),
                  hex: typeof meta?.hex === 'string' ? meta.hex : null,
                  pantone: typeof meta?.pantone === 'string' ? meta.pantone : null,
                  collectionName: entry.collectionRef?.name ?? null,
                }
              })}
            />
          </div>
        ) : (
          <EmptyState seasons={seasons} collections={collectionOptions} />
        )}
      </main>
    </DocPageShell>
  )
}
