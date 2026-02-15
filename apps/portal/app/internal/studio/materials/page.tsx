import type { Metadata } from "next"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  Scissors,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Tag,
  User,
  Calendar,
  ArrowUpDown,
  Factory,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Materials Exploration | Studio",
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
        <Scissors className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-lg font-semibold mb-2">No materials captured yet</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Start with fabric-first thinking. Add swatches, mill references, weight
        and composition data, hand-feel notes, and potential applications. This
        connects directly to Sourcing once it becomes real.
      </p>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Material
      </Button>
    </div>
  )
}

// ─── Table header ────────────────────────────────────────────────────

function TableHeader() {
  const columns = [
    { label: "", sortable: false, width: "w-12" },
    { label: "Material", sortable: true },
    { label: "Composition", sortable: true },
    { label: "Weight", sortable: true },
    { label: "Mill", sortable: true },
    { label: "Status", sortable: true },
    { label: "Application", sortable: false },
    { label: "Linked Factory", sortable: true },
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

export default function StudioMaterialsPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Studio", href: "/internal/studio" },
        { label: "Materials" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Scissors className="h-4 w-4 text-primary" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">
                  Materials Exploration
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-11">
                Fabric-first thinking. Swatches, mill references, composition
                data, hand-feel notes, and factory capability linking.
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
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
                placeholder="Search materials..."
                className="w-full h-8 pl-9 pr-3 text-sm rounded-md border bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-3 w-3" />
              Status
            </Button>
            <Button variant="outline" size="sm">
              <Tag className="h-3 w-3" />
              Composition
            </Button>
            <Button variant="outline" size="sm">
              <Factory className="h-3 w-3" />
              Linked Factory
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
