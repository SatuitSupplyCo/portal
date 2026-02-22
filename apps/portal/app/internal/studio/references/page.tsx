import type { Metadata } from "next"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  BookMarked,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Tag,
  User,
  ArrowUpDown,
  DollarSign,
  Eye,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "References & Scanning | Studio",
}

import { STUDIO_STATUS_COLORS as statusColors } from "@/lib/status"

import { EmptyState } from "@/components/EmptyState"

function ReferencesEmptyState() {
  return (
    <EmptyState
      icon={BookMarked}
      title="No references captured yet"
      description='Keep your thinking sharp without copying. Capture garment teardown photos, competitor pricing observations, fit commentary, and honest "what works / what feels wrong" assessments.'
    >
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Reference
      </Button>
    </EmptyState>
  )
}

// ─── Table header ────────────────────────────────────────────────────

function TableHeader() {
  const columns = [
    { label: "", sortable: false, width: "w-12" },
    { label: "Reference", sortable: true },
    { label: "Source", sortable: true },
    { label: "Status", sortable: true },
    { label: "Pricing", sortable: true },
    { label: "Fit Notes", sortable: false },
    { label: "Verdict", sortable: false },
    { label: "Owner", sortable: true },
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

export default function StudioReferencesPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Studio", href: "/internal/studio" },
        { label: "References" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <BookMarked className="h-4 w-4 text-primary" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">
                  References & Scanning
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-11">
                Competitive and industry intelligence. Garment teardowns,
                pricing observations, and honest fit commentary.
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Reference
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
                placeholder="Search references..."
                className="w-full h-8 pl-9 pr-3 text-sm rounded-md border bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-3 w-3" />
              Status
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3" />
              Source
            </Button>
            <Button variant="outline" size="sm">
              <DollarSign className="h-3 w-3" />
              Price Range
            </Button>
            <Button variant="outline" size="sm">
              <Tag className="h-3 w-3" />
              Tags
            </Button>
            <Button variant="outline" size="sm">
              <User className="h-3 w-3" />
              Owner
            </Button>

            <div className="ml-auto flex items-center gap-1 border rounded-md p-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 bg-accent">
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
          <ReferencesEmptyState />
        </div>
      </main>
    </DocPageShell>
  )
}
