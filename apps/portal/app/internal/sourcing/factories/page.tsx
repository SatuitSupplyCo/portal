import type { Metadata } from "next"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  Factory,
  Plus,
  Search,
  Filter,
  MapPin,
  Star,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Factories | Sourcing CRM",
}

// ─── Status badge colors ─────────────────────────────────────────────

const statusColors: Record<string, string> = {
  prospect: "bg-slate-100 text-slate-700",
  screening: "bg-yellow-100 text-yellow-800",
  sampling: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  active: "bg-green-100 text-green-800",
  dormant: "bg-gray-100 text-gray-500",
  rejected: "bg-red-100 text-red-800",
}

// ─── Empty state placeholder ─────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <Factory className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-lg font-semibold mb-2">No factories yet</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Start building your factory directory. Add your first factory to begin
        tracking capabilities, costing, and relationships.
      </p>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Factory
      </Button>
    </div>
  )
}

// ─── Table header ────────────────────────────────────────────────────

function TableHeader() {
  const columns = [
    { label: "Factory", sortable: true },
    { label: "Country", sortable: true },
    { label: "Type", sortable: true },
    { label: "Status", sortable: true },
    { label: "Score", sortable: true },
    { label: "MOQ", sortable: true },
    { label: "Lead Time", sortable: true },
    { label: "", sortable: false },
  ]

  return (
    <thead>
      <tr className="border-b">
        {columns.map((col) => (
          <th
            key={col.label}
            className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3"
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

export default function FactoriesPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Sourcing", href: "/internal/sourcing" },
        { label: "Factories" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Factory Directory</h1>
              <p className="text-sm text-muted-foreground mt-1">
                System of record for all factory relationships
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Factory
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
                placeholder="Search factories..."
                className="w-full h-8 pl-9 pr-3 text-sm rounded-md border bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <Filter className="h-3 w-3" />
              Status
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <MapPin className="h-3 w-3" />
              Country
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <Factory className="h-3 w-3" />
              Type
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <Star className="h-3 w-3" />
              Score
            </button>
          </div>
        </div>

        {/* Table / Empty state */}
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
