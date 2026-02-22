import type { Metadata } from "next"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Samples | Sourcing CRM",
}

// ─── Sample type badges ──────────────────────────────────────────────

const typeColors: Record<string, { bg: string; text: string; label: string }> = {
  proto: { bg: "bg-slate-100", text: "text-slate-700", label: "Proto" },
  fit: { bg: "bg-blue-100", text: "text-blue-800", label: "Fit" },
  sms: { bg: "bg-violet-100", text: "text-violet-800", label: "SMS" },
  top: { bg: "bg-emerald-100", text: "text-emerald-800", label: "TOP" },
}

// ─── KPI Cards ───────────────────────────────────────────────────────

const sampleKpis = [
  {
    label: "Pending Review",
    value: "—",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Approved",
    value: "—",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Revisions Needed",
    value: "—",
    icon: RotateCcw,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    label: "Rejected",
    value: "—",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
]

import { EmptyState } from "@/components/EmptyState"

function SamplesEmptyState() {
  return (
    <EmptyState icon={FlaskConical} title="No samples yet" description="Track every sample request, revision, and decision. Over time this becomes your historical memory for which factories deliver clean work." compact>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Request Sample
      </Button>
    </EmptyState>
  )
}

// ─── Page ────────────────────────────────────────────────────────────

export default function SamplesPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Sourcing", href: "/internal/sourcing" },
        { label: "Samples" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Samples & Development
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track sample requests, scorecards, and revision history
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Sample
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="grid grid-cols-4 gap-4">
            {sampleKpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-lg border p-4 flex items-center gap-3"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{kpi.value}</p>
                  <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters bar */}
        <div className="px-8 py-4 md:px-12 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search samples..."
                className="w-full h-8 pl-9 pr-3 text-sm rounded-md border bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <Filter className="h-3 w-3" />
              Type
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <Filter className="h-3 w-3" />
              Factory
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <Filter className="h-3 w-3" />
              Decision
            </button>
          </div>
        </div>

        {/* Table columns header */}
        <div className="px-8 md:px-12">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {[
                  "Sample",
                  "Factory",
                  "SKU",
                  "Type",
                  "Requested",
                  "Received",
                  "Quality",
                  "Fit",
                  "Revisions",
                  "Decision",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3"
                  >
                    <span className="flex items-center gap-1">
                      {col}
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
          </table>
          <SamplesEmptyState />
        </div>

        {/* Scoring Guide */}
        <div className="px-8 py-8 md:px-12 border-t">
          <div className="max-w-4xl">
            <h3 className="text-sm font-semibold mb-4">Sample Scoring Guide</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-lg border p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Per-Sample Scores (1–5)
                </p>
                <ul className="space-y-2 text-[12px] text-muted-foreground">
                  <li><span className="font-medium text-foreground">Quality:</span> Construction, stitching, finishing</li>
                  <li><span className="font-medium text-foreground">Fit:</span> Accuracy to measurement spec</li>
                  <li><span className="font-medium text-foreground">Construction:</span> Structural integrity, seam quality</li>
                  <li><span className="font-medium text-foreground">Accuracy:</span> Fidelity to tech pack spec</li>
                  <li><span className="font-medium text-foreground">Communication:</span> Responsiveness and clarity</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Factory-Level Metrics
                </p>
                <ul className="space-y-2 text-[12px] text-muted-foreground">
                  <li><span className="font-medium text-foreground">Avg. Sample Cycles:</span> Time from request to approval</li>
                  <li><span className="font-medium text-foreground">First-Pass Rate:</span> % approved on first submission</li>
                  <li><span className="font-medium text-foreground">Revision Rate:</span> Avg. revisions per sample</li>
                  <li><span className="font-medium text-foreground">Turnaround Time:</span> Auto-calculated from dates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DocPageShell>
  )
}
