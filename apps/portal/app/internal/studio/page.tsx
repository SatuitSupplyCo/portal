import type { Metadata } from "next"
import Link from "next/link"
import { db } from "@repo/db/client"
import { studioEntries } from "@repo/db/schema"
import { eq, count, desc } from "drizzle-orm"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  Palette,
  Plus,
  Shirt,
  Scissors,
  Waves,
  BookMarked,
  Settings,
  Lightbulb,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  ImageIcon,
  ArrowRight,
  MoreHorizontal,
  Eye,
  Send,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Studio | Satuit Supply Co.",
}

// ─── Category meta ───────────────────────────────────────────────────

const categoryMeta: Record<
  string,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bg: string
    href: string
  }
> = {
  product: {
    label: "Product",
    icon: Shirt,
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: "/internal/studio/product",
  },
  materials: {
    label: "Materials",
    icon: Scissors,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    href: "/internal/studio/materials",
  },
  color: {
    label: "Color",
    icon: Palette,
    color: "text-pink-600",
    bg: "bg-pink-50",
    href: "/internal/studio/color",
  },
  brand: {
    label: "Brand",
    icon: Waves,
    color: "text-violet-600",
    bg: "bg-violet-50",
    href: "/internal/studio/brand",
  },
  reference: {
    label: "Reference",
    icon: BookMarked,
    color: "text-orange-600",
    bg: "bg-orange-50",
    href: "/internal/studio/references",
  },
  operational: {
    label: "Operational",
    icon: Settings,
    color: "text-slate-600",
    bg: "bg-slate-50",
    href: "/internal/studio/product",
  },
}

import { STUDIO_STATUS_COLORS as statusColors, STUDIO_STATUS_LABELS as statusLabels } from "@/lib/status"

// ─── Data fetching ──────────────────────────────────────────────────

async function getStudioData() {
  // Counts by status
  const statusCounts = await db
    .select({ status: studioEntries.status, count: count() })
    .from(studioEntries)
    .groupBy(studioEntries.status)

  const countMap: Record<string, number> = {}
  for (const row of statusCounts) {
    countMap[row.status] = row.count
  }

  // Recent entries
  const recent = await db.query.studioEntries.findMany({
    orderBy: [desc(studioEntries.createdAt)],
    limit: 10,
    with: {
      images: { limit: 1 },
    },
  })

  return { countMap, recent }
}

// ─── Empty state ─────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <Palette className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Start capturing ideas</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
        Studio is the structured exploration layer. Capture product, material,
        and brand inspiration here. Ideas earn their way into Assortment and
        Sourcing — or they step aside.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Inspiration
        </Button>
        <p className="text-xs text-muted-foreground">
          or press{" "}
          <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">
            N
          </kbd>{" "}
          anywhere in Studio
        </p>
      </div>

      {/* Quick-add category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 w-full max-w-xl">
        {(["product", "materials", "brand", "reference"] as const).map(
          (cat) => {
            const meta = categoryMeta[cat]
            const Icon = meta.icon
            return (
              <Link
                key={cat}
                href={meta.href}
                className="group flex flex-col items-center gap-2 rounded-lg border p-4 hover:border-primary/30 hover:bg-accent/50 transition-all"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.bg}`}
                >
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {meta.label}
                </span>
              </Link>
            )
          },
        )}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────

export default async function StudioOverviewPage() {
  const { countMap, recent } = await getStudioData()

  const hasEntries = recent.length > 0

  const kpis = [
    {
      label: "Raw Ideas",
      value: countMap.raw ?? 0,
      sublabel: "Awaiting evaluation",
      icon: Lightbulb,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Exploring",
      value: countMap.exploring ?? 0,
      sublabel: "Under discussion",
      icon: Sparkles,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Prototyping",
      value: countMap.prototyping ?? 0,
      sublabel: "Being refined",
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Ready for Review",
      value: countMap.ready_for_review ?? 0,
      sublabel: "Awaiting Product Lead",
      icon: Eye,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Revisions",
      value: countMap.revisions_requested ?? 0,
      sublabel: "Needs updates",
      icon: Send,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Promoted",
      value: countMap.promoted ?? 0,
      sublabel: "Linked to concepts",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ]

  return (
    <DocPageShell breadcrumbs={[{ label: "Studio" }]}>
      <main className="flex-1 overflow-y-auto">
        {/* ═══════ HEADER ═══════ */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Studio</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Recent additions and exploration activity
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Inspiration
            </Button>
          </div>
        </div>

        {/* ═══════ KPI STRIP ═══════ */}
        <div className="px-8 py-5 md:px-12 border-b bg-muted/20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.bg} shrink-0`}
                >
                  <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight leading-none">
                    {kpi.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {kpi.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ REVIEW QUEUE (visible when items need review) ═══════ */}
        {(countMap.ready_for_review ?? 0) > 0 && (
          <div className="px-8 py-5 md:px-12 border-b bg-amber-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-800">
                  {countMap.ready_for_review} item{countMap.ready_for_review !== 1 ? 's' : ''} awaiting review
                </p>
              </div>
              <Link
                href="/internal/studio/product"
                className="text-xs text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-1"
              >
                Review Queue
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {/* ═══════ RECENT ADDITIONS / EMPTY STATE ═══════ */}
        {hasEntries ? (
          <div className="px-8 py-6 md:px-12">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Recent Additions
              </p>
              <Link
                href="/internal/studio/product"
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {recent.map((entry) => {
                const meta = categoryMeta[entry.category] ?? categoryMeta.product
                const CatIcon = meta.icon
                const statusClass = statusColors[entry.status] ?? statusColors.raw

                return (
                  <div
                    key={entry.id}
                    className="group flex items-center gap-4 rounded-lg border p-4 hover:border-primary/20 hover:bg-accent/30 transition-all cursor-pointer"
                  >
                    {/* Thumbnail placeholder */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted shrink-0">
                      {entry.images.length > 0 ? (
                        <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                      ) : (
                        <CatIcon className={`h-5 w-5 ${meta.color}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium truncate">
                          {entry.title}
                        </p>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${statusClass}`}
                        >
                          {statusLabels[entry.status] ?? entry.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {entry.description}
                      </p>
                    </div>

                    {/* Category badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded ${meta.bg}`}
                      >
                        <CatIcon className={`h-3 w-3 ${meta.color}`} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {meta.label}
                      </span>
                    </div>

                    {/* Owner + date */}
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-[11px] font-medium">
                        {entry.owner}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </DocPageShell>
  )
}
