import type { Metadata } from "next"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Scale,
  Calculator,
  ArrowRightLeft,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Costing | Sourcing CRM",
}

// ─── KPI Cards ───────────────────────────────────────────────────────

const costingKpis = [
  {
    label: "Avg. FOB",
    value: "—",
    sublabel: "Across active profiles",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Avg. Landed Multiplier",
    value: "—",
    sublabel: "FOB → Landed cost",
    icon: Calculator,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Margin-Viable Factories",
    value: "—",
    sublabel: "Score ≥ 4",
    icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    label: "At-Risk Margins",
    value: "—",
    sublabel: "Score ≤ 2",
    icon: TrendingDown,
    color: "text-red-600",
    bg: "bg-red-50",
  },
]

import { EmptyState } from "@/components/EmptyState"

function CostingEmptyState() {
  return (
    <EmptyState icon={DollarSign} title="No costing profiles yet" description="Create cost sheets per factory per category. Track FOB, landed costs, and margin viability to protect brand economics." compact>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Cost Sheet
      </Button>
    </EmptyState>
  )
}

// ─── Page ────────────────────────────────────────────────────────────

export default function CostingPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Sourcing", href: "/internal/sourcing" },
        { label: "Costing" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Costing & Margins
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                FOB tracking, landed cost modeling, and margin validation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Compare
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Cost Sheet
              </Button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="grid grid-cols-4 gap-4">
            {costingKpis.map((kpi) => (
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

        {/* Filters */}
        <div className="px-8 py-4 md:px-12 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cost sheets..."
                className="w-full h-8 pl-9 pr-3 text-sm rounded-md border bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <Filter className="h-3 w-3" />
              Factory
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <Filter className="h-3 w-3" />
              Category
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border hover:bg-accent transition-colors">
              <Filter className="h-3 w-3" />
              Season
            </button>
          </div>
        </div>

        {/* Table header + empty */}
        <div className="px-8 md:px-12">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {[
                  "Factory",
                  "Category",
                  "Season",
                  "FOB Low",
                  "FOB High",
                  "Fabric %",
                  "Trim %",
                  "Landed ×",
                  "Viability",
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
          <CostingEmptyState />
        </div>

        {/* Landed Cost Model */}
        <div className="px-8 py-8 md:px-12 border-t">
          <div className="max-w-4xl">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              Landed Cost Model
            </h3>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-muted/30 border-b">
                    <th className="text-left px-4 py-2.5 font-semibold">Component</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Description</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    ["FOB Price", "Factory gate price per unit", "$—"],
                    ["Fabric Cost", "Material cost component", "$—"],
                    ["Trim Cost", "BOM-level trim components", "$—"],
                    ["CM / Labor", "Cut, sew, finish labor", "$—"],
                    ["Wash / Finish", "Garment processing", "$—"],
                    ["Freight", "Port-to-port + inland", "$—"],
                    ["Duties", "Import duties + fees", "$—"],
                    ["Packaging", "Poly, hangtag, box", "$—"],
                    ["Landed Cost", "Total cost per unit", "$—"],
                  ].map(([component, desc, example]) => (
                    <tr key={component} className={component === "Landed Cost" ? "bg-muted/20 font-semibold" : ""}>
                      <td className="px-4 py-2.5">{component}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{desc}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </DocPageShell>
  )
}
