import type { Metadata } from "next"
import { db } from "@repo/db/client"
import { studioEntries } from "@repo/db/schema"
import { eq, desc } from "drizzle-orm"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  Shirt,
  Plus,
  Search,
  Filter,
  Tag,
  User,
  Calendar,
  ArrowUpDown,
  ImageIcon,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Product Inspiration | Studio",
}

import { STUDIO_STATUS_COLORS as statusColors, STUDIO_STATUS_LABELS as statusLabels } from "@/lib/status"

// ─── Empty state ─────────────────────────────────────────────────────

import { EmptyState } from "@/components/EmptyState"

function ProductEmptyState() {
  return (
    <EmptyState
      icon={Shirt}
      title="No product inspiration yet"
      description="Start capturing silhouette observations, construction details, fit direction, and reference garments. This feeds Assortment later — but doesn't pollute it."
    >
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Inspiration
      </Button>
    </EmptyState>
  )
}

// ─── Page ────────────────────────────────────────────────────────────

export default async function StudioProductPage() {
  const entries = await db.query.studioEntries.findMany({
    where: eq(studioEntries.category, 'product'),
    orderBy: [desc(studioEntries.createdAt)],
    with: {
      images: { limit: 1 },
      collectionRef: true,
    },
  })

  const hasEntries = entries.length > 0

  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Studio", href: "/internal/studio" },
        { label: "Product" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Shirt className="h-4 w-4 text-primary" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">
                  Product Inspiration
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-11">
                Silhouette and construction exploration. Ideas move through review
                and promotion to become SKU concepts.
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Inspiration
            </Button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="px-8 py-4 md:px-12 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search product inspiration..."
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

        {/* Content */}
        {hasEntries ? (
          <div className="px-8 md:px-12">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 w-12" />
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">
                    <span className="flex items-center gap-1">Title <ArrowUpDown className="h-3 w-3 opacity-40" /></span>
                  </th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">
                    <span className="flex items-center gap-1">Collection <ArrowUpDown className="h-3 w-3 opacity-40" /></span>
                  </th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">
                    <span className="flex items-center gap-1">Status <ArrowUpDown className="h-3 w-3 opacity-40" /></span>
                  </th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">
                    <span className="flex items-center gap-1">Complexity <ArrowUpDown className="h-3 w-3 opacity-40" /></span>
                  </th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">
                    <span className="flex items-center gap-1">Owner <ArrowUpDown className="h-3 w-3 opacity-40" /></span>
                  </th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">
                    <span className="flex items-center gap-1">Added <ArrowUpDown className="h-3 w-3 opacity-40" /></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b hover:bg-accent/30 transition-colors cursor-pointer"
                  >
                    {/* Image */}
                    <td className="px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                        {entry.images.length > 0 ? (
                          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/40" />
                        ) : (
                          <Shirt className="h-3.5 w-3.5 text-blue-600" />
                        )}
                      </div>
                    </td>

                    {/* Title + intent */}
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {entry.title}
                      </p>
                      {entry.intent && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {entry.intent}
                        </p>
                      )}
                    </td>

                    {/* Collection tag */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground capitalize">
                        {entry.collectionRef?.name ?? "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[entry.status] ?? ''}`}>
                        {statusLabels[entry.status] ?? entry.status}
                      </span>
                    </td>

                    {/* Complexity */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {entry.estimatedComplexity ? `${entry.estimatedComplexity}/5` : "—"}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {entry.owner}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ProductEmptyState />
        )}
      </main>
    </DocPageShell>
  )
}
