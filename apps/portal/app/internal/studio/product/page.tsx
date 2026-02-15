import type { Metadata } from "next"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  Shirt,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Tag,
  User,
  Calendar,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Product Inspiration | Studio",
}

// ─── Status badge colors ─────────────────────────────────────────────

const statusColors: Record<string, string> = {
  raw: "bg-slate-100 text-slate-700",
  exploring: "bg-blue-100 text-blue-800",
  prototyping: "bg-violet-100 text-violet-800",
  linked: "bg-emerald-100 text-emerald-800",
  archived: "bg-gray-100 text-gray-500",
}

// ─── Empty state ─────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <Shirt className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-lg font-semibold mb-2">No product inspiration yet</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Start capturing silhouette observations, construction details, fit
        direction, and reference garments. This feeds Assortment later — but
        doesn&apos;t pollute it.
      </p>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Inspiration
      </Button>
    </div>
  )
}

// ─── Table header ────────────────────────────────────────────────────

function TableHeader() {
  const columns = [
    { label: "", sortable: false, width: "w-12" },
    { label: "Title", sortable: true },
    { label: "Silhouette", sortable: true },
    { label: "Status", sortable: true },
    { label: "Owner", sortable: true },
    { label: "Relevance", sortable: true },
    { label: "Season", sortable: true },
    { label: "Added", sortable: true },
    { label: "", sortable: false },
  ]

  return (
    <thead>
      <tr className="border-b">
        {columns.map((col, i) => (
          <th
            key={col.label || `col-${i}`}
            className={`text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 ${col.width ?? ""}`}
          >
            <span className="flex items-center gap-1">
              {col.label}
              {col.sortable && col.label && (
                <ArrowUpDown className="h-3 w-3 opacity-40" />
              )}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  )
}

// ─── Page ────────────────────────────────────────────────────────────

export default function StudioProductPage() {
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
                Silhouette and construction exploration. Reference garments, fit
                observations, and construction details worth testing.
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
              Tags
            </Button>
            <Button variant="outline" size="sm">
              <User className="h-3 w-3" />
              Owner
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-3 w-3" />
              Season
            </Button>

            <div className="ml-auto flex items-center gap-1 border rounded-md p-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7 bg-accent">
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 md:px-12">
          <table className="w-full">
            <TableHeader />
          </table>
          <EmptyState />
        </div>
      </main>
    </DocPageShell>
  )
}
