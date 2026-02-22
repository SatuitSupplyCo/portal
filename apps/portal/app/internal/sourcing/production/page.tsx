import type { Metadata } from "next"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  Truck,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Timer,
  Target,
  Package,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Production | Sourcing CRM",
}

// ─── Production stage pipeline ───────────────────────────────────────

const productionStages = [
  { name: "Pre-Production", dotColor: "bg-slate-400", count: 0 },
  { name: "Cutting", dotColor: "bg-amber-500", count: 0 },
  { name: "Sewing", dotColor: "bg-blue-500", count: 0 },
  { name: "Washing", dotColor: "bg-violet-500", count: 0 },
  { name: "Packing", dotColor: "bg-indigo-500", count: 0 },
  { name: "Shipped", dotColor: "bg-emerald-500", count: 0 },
  { name: "Delivered", dotColor: "bg-green-600", count: 0 },
]

// ─── KPI Cards ───────────────────────────────────────────────────────

const productionKpis = [
  {
    label: "Active Runs",
    value: "—",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "On-Time Rate",
    value: "—",
    icon: Timer,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "QC Pass Rate",
    value: "—",
    icon: Target,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    label: "Open Issues",
    value: "—",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
]

import { EmptyState } from "@/components/EmptyState"

function ProductionEmptyState() {
  return (
    <EmptyState icon={Truck} title="No production runs yet" description="Track POs, production timelines, QC results, and delivery performance. This is how you decide: strategic partner vs backup only." compact>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Production Run
      </Button>
    </EmptyState>
  )
}

// ─── Page ────────────────────────────────────────────────────────────

export default function ProductionPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Sourcing", href: "/internal/sourcing" },
        { label: "Production" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Production Tracking
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                PO tracking, QC results, delivery performance, and chargebacks
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Production Run
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="grid grid-cols-4 gap-4">
            {productionKpis.map((kpi) => (
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

        {/* Production stage pipeline */}
        <div className="px-8 py-6 md:px-12 border-b">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Production Pipeline
          </p>
          <div className="flex items-center gap-1">
            {productionStages.map((stage, idx) => (
              <div key={stage.name} className="flex items-center">
                <div className="flex flex-col items-center gap-1 px-3">
                  <div className={`h-3 w-3 rounded-full ${stage.dotColor}`} />
                  <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                    {stage.name}
                  </span>
                  <span className="text-[10px] font-bold tabular-nums">
                    {stage.count}
                  </span>
                </div>
                {idx < productionStages.length - 1 && (
                  <div className="h-px w-8 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-8 py-4 md:px-12 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search production runs..."
                className="w-full h-8 pl-9 pr-3 text-sm rounded-md border bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <Filter className="h-3 w-3" />
              Factory
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <Filter className="h-3 w-3" />
              Status
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <Filter className="h-3 w-3" />
              Season
            </button>
          </div>
        </div>

        {/* Table + Empty */}
        <div className="px-8 md:px-12">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {[
                  "PO #",
                  "Factory",
                  "SKU",
                  "Season",
                  "Qty",
                  "Status",
                  "Ship Date",
                  "QC Pass %",
                  "On-Time",
                  "Chargebacks",
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
          <ProductionEmptyState />
        </div>

        {/* Performance KPIs reference */}
        <div className="px-8 py-8 md:px-12 border-t">
          <div className="max-w-4xl">
            <h3 className="text-sm font-semibold mb-4">Performance KPIs</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: "On-Time Delivery %",
                  description:
                    "Percentage of runs delivered on or before planned ship date. Target: ≥ 90%.",
                },
                {
                  title: "Quality Pass Rate %",
                  description:
                    "Percentage of units passing QC inspection. Target: ≥ 95%.",
                },
                {
                  title: "Lead Time Deviation",
                  description:
                    "Average days delta between planned and actual delivery. Target: ≤ 3 days.",
                },
                {
                  title: "Production Consistency Index",
                  description:
                    "Standard deviation of quality scores across runs. Lower is better.",
                },
              ].map((kpi) => (
                <div key={kpi.title} className="rounded-lg border p-4">
                  <p className="text-[13px] font-medium mb-1">{kpi.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {kpi.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </DocPageShell>
  )
}
