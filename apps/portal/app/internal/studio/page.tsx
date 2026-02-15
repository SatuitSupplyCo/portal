import type { Metadata } from "next"
import Link from "next/link"
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

// ─── Status badge colors ─────────────────────────────────────────────

const statusColors: Record<string, string> = {
  raw: "bg-slate-100 text-slate-700",
  exploring: "bg-blue-100 text-blue-800",
  prototyping: "bg-violet-100 text-violet-800",
  linked: "bg-emerald-100 text-emerald-800",
  archived: "bg-gray-100 text-gray-500",
}

// ─── KPI Cards ───────────────────────────────────────────────────────

const kpis = [
  {
    label: "Raw Ideas",
    value: "—",
    sublabel: "Awaiting evaluation",
    icon: Lightbulb,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Exploring",
    value: "—",
    sublabel: "Under discussion",
    icon: Sparkles,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Prototyping",
    value: "—",
    sublabel: "Approved for sampling",
    icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    label: "Linked",
    value: "—",
    sublabel: "Connected to pipeline",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
]

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

export default function StudioOverviewPage() {
  // TODO: Replace with real data from db.query.studioEntries
  const recentEntries: {
    id: string
    title: string
    category: string
    status: string
    owner: string
    createdAt: string
    hasImage: boolean
    description: string
  }[] = []

  const hasEntries = recentEntries.length > 0

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
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

        {/* ═══════ RECENT ADDITIONS / EMPTY STATE ═══════ */}
        {hasEntries ? (
          <div className="px-8 py-6 md:px-12">
            {/* Section label */}
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

            {/* Feed */}
            <div className="flex flex-col gap-2">
              {recentEntries.map((entry) => {
                const meta = categoryMeta[entry.category] ?? categoryMeta.product
                const CatIcon = meta.icon
                const statusClass =
                  statusColors[entry.status] ?? statusColors.raw

                return (
                  <div
                    key={entry.id}
                    className="group flex items-center gap-4 rounded-lg border p-4 hover:border-primary/20 hover:bg-accent/30 transition-all cursor-pointer"
                  >
                    {/* Thumbnail placeholder */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted shrink-0">
                      {entry.hasImage ? (
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
                          {entry.status}
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
                        {entry.createdAt}
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
