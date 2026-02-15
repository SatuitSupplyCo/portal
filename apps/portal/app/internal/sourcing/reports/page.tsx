import type { Metadata } from "next"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  BarChart3,
  Download,
  TrendingUp,
  Star,
  Clock,
  Globe,
  DollarSign,
  Target,
  AlertTriangle,
  Factory,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Reports | Sourcing CRM",
}

// ─── Report cards ────────────────────────────────────────────────────

const reports = [
  {
    title: "Factory Quality Trend",
    description: "Quality scores over time across all factories. Identify improving or declining partners.",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Strategic Score Distribution",
    description: "Distribution of factory strategic scores. See how many are at each tier.",
    icon: Star,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Lead Time Reliability",
    description: "Planned vs actual lead times. Track which factories consistently deliver on time.",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Geographic Distribution",
    description: "Factory map by country and region. Visualize sourcing concentration.",
    icon: Globe,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    title: "Margin Heat Map",
    description: "Margin viability by factory and category. Identify the most profitable sourcing paths.",
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Sampling Velocity",
    description: "Time from sample request to approval by factory. Measure development efficiency.",
    icon: Target,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    title: "Risk Concentration",
    description: "Category dependency by country. Flag single-point-of-failure exposure.",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    title: "Factory Comparison",
    description: "Side-by-side comparison of factories for a given SKU or category.",
    icon: Factory,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
]

// ─── Strategic scoring reference ─────────────────────────────────────

const scoringWeights = [
  { component: "Quality Metrics", weight: "25%", description: "Avg sample scores, QC pass rates, first-pass approval" },
  { component: "Margin Viability", weight: "20%", description: "FOB competitiveness, landed cost efficiency" },
  { component: "Brand Alignment", weight: "15%", description: "Cultural fit, innovation contribution, transparency" },
  { component: "Risk Mitigation", weight: "15%", description: "Geopolitical, financial, labor, supply chain risks" },
  { component: "Capability Depth", weight: "15%", description: "Category coverage, technical rating, finishing quality" },
  { component: "Responsiveness", weight: "10%", description: "Communication speed, flexibility, proactive updates" },
]

const scoreThresholds = [
  { range: "< 3.0", tier: "Not Approved", color: "bg-red-500" },
  { range: "3.0 – 3.8", tier: "Backup", color: "bg-amber-500" },
  { range: "3.8 – 4.5", tier: "Approved", color: "bg-emerald-500" },
  { range: "4.5+", tier: "Strategic", color: "bg-green-600" },
]

// ─── Page ────────────────────────────────────────────────────────────

export default function ReportsPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Sourcing", href: "/internal/sourcing" },
        { label: "Reports" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Reports & Analytics
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Season snapshots, trend analysis, strategic scoring, and exports
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Season Snapshot
            </Button>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="px-8 py-8 md:px-12">
          <div className="max-w-5xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Available Reports
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <div
                  key={report.title}
                  className="group rounded-lg border p-5 hover:border-primary/30 hover:bg-accent/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${report.bg} shrink-0`}>
                      <report.icon className={`h-4 w-4 ${report.color}`} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold mb-1 group-hover:text-primary transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {report.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center py-8 rounded-md bg-muted/30 border border-dashed">
                    <p className="text-[11px] text-muted-foreground/50">
                      Data will appear once factories are added
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategic Scoring Engine */}
        <div className="px-8 py-8 md:px-12 border-t">
          <div className="max-w-5xl">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Strategic Scoring Engine</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Weights */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/30 px-4 py-2.5 border-b">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Score Composition
                  </p>
                </div>
                <table className="w-full text-[12px]">
                  <tbody className="divide-y">
                    {scoringWeights.map((w) => (
                      <tr key={w.component}>
                        <td className="px-4 py-2.5 font-medium w-32">{w.component}</td>
                        <td className="px-4 py-2.5 font-bold tabular-nums text-primary w-12">
                          {w.weight}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {w.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Thresholds */}
              <div>
                <div className="rounded-lg border overflow-hidden mb-6">
                  <div className="bg-muted/30 px-4 py-2.5 border-b">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Tier Thresholds
                    </p>
                  </div>
                  <table className="w-full text-[12px]">
                    <tbody className="divide-y">
                      {scoreThresholds.map((t) => (
                        <tr key={t.range}>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className={`h-2.5 w-2.5 rounded-full ${t.color}`} />
                              <span className="font-bold tabular-nums">{t.range}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 font-medium">{t.tier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-dashed p-4 bg-muted/10">
                  <p className="text-[11px] font-medium mb-1">Formula</p>
                  <code className="text-[10px] text-muted-foreground leading-relaxed block">
                    Strategic Score = (0.25 × Quality) + (0.20 × Margin) +
                    (0.15 × Brand Alignment) + (0.15 × Risk) +
                    (0.15 × Capability) + (0.10 × Responsiveness)
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DocPageShell>
  )
}
