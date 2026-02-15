import type { Metadata } from "next"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  ShieldAlert,
  AlertTriangle,
  Globe,
  FileWarning,
  ShieldCheck,
  MapPin,
  Clock,
  BarChart3,
} from "lucide-react"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Risk & Compliance | Sourcing CRM",
}

// ─── Risk KPIs ───────────────────────────────────────────────────────

const riskKpis = [
  {
    label: "Factories Compliant",
    value: "—",
    sublabel: "All certs current",
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Expiring Certs",
    value: "—",
    sublabel: "Within 90 days",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "High-Risk Factories",
    value: "—",
    sublabel: "Risk score ≥ 4",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    label: "Single-Source SKUs",
    value: "—",
    sublabel: "No backup assigned",
    icon: FileWarning,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
]

// ─── Concentration risk categories ───────────────────────────────────

const concentrationCategories = [
  { category: "Tees / Knits", primaryCountry: "—", percentage: "—", status: "none" },
  { category: "Fleece", primaryCountry: "—", percentage: "—", status: "none" },
  { category: "Swim", primaryCountry: "—", percentage: "—", status: "none" },
  { category: "Woven", primaryCountry: "—", percentage: "—", status: "none" },
  { category: "Towels", primaryCountry: "—", percentage: "—", status: "none" },
  { category: "Headwear", primaryCountry: "—", percentage: "—", status: "none" },
]

// ─── Page ────────────────────────────────────────────────────────────

export default function RiskPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Sourcing", href: "/internal/sourcing" },
        { label: "Risk & Compliance" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Risk & Compliance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Certification monitoring, concentration risk, and dual-sourcing visibility
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="grid grid-cols-4 gap-4">
            {riskKpis.map((kpi) => (
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
                  <p className="text-[10px] text-muted-foreground/70">{kpi.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-8 md:px-12">
          <div className="max-w-6xl grid md:grid-cols-2 gap-8">
            {/* Category Concentration */}
            <div className="rounded-lg border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Category Concentration</h3>
              </div>
              <p className="text-[11px] text-muted-foreground mb-4">
                Geographic concentration risk by product category.
                Red flag: &gt;70% of any category in one country.
              </p>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold text-muted-foreground">Category</th>
                    <th className="text-left py-2 font-semibold text-muted-foreground">Primary Country</th>
                    <th className="text-right py-2 font-semibold text-muted-foreground">%</th>
                    <th className="text-right py-2 font-semibold text-muted-foreground">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {concentrationCategories.map((row) => (
                    <tr key={row.category}>
                      <td className="py-2 font-medium">{row.category}</td>
                      <td className="py-2 text-muted-foreground">{row.primaryCountry}</td>
                      <td className="py-2 text-right tabular-nums text-muted-foreground">{row.percentage}</td>
                      <td className="py-2 text-right">
                        <span className="inline-block h-2 w-2 rounded-full bg-muted" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Certification Tracker */}
            <div className="rounded-lg border p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Certification Tracker</h3>
              </div>
              <p className="text-[11px] text-muted-foreground mb-4">
                Track certification expiry dates across all factories.
                Alerts triggered 90 days before expiry.
              </p>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShieldAlert className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-[12px] text-muted-foreground">
                  No certifications tracked yet
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">
                  Upload factory certifications to enable expiry monitoring
                </p>
              </div>
            </div>

            {/* Dual-Sourcing Coverage */}
            <div className="rounded-lg border p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Dual-Sourcing Coverage</h3>
              </div>
              <p className="text-[11px] text-muted-foreground mb-4">
                SKUs with primary + backup factory assigned.
                Target: 100% of production SKUs dual-sourced.
              </p>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-[12px] text-muted-foreground">
                  No SKU assignments yet
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">
                  Assign factories to SKUs to track coverage
                </p>
              </div>
            </div>

            {/* Risk Scoring Reference */}
            <div className="rounded-lg border p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Risk Scoring Model</h3>
              </div>
              <p className="text-[11px] text-muted-foreground mb-4">
                Each factory is scored across five risk dimensions (1–5, lower is better):
              </p>
              <div className="space-y-3">
                {[
                  { label: "Geopolitical Risk", desc: "Country stability, trade policy exposure" },
                  { label: "Financial Stability", desc: "Business health, credit risk, payment reliability" },
                  { label: "Labor Risk", desc: "Worker conditions, compliance, strikes" },
                  { label: "Supply Chain Depth", desc: "Sub-supplier visibility, raw material access" },
                  { label: "Redundancy Score", desc: "Ability to scale, alternate capacity" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-[12px] font-medium">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="h-2 w-2 rounded-full bg-muted" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </DocPageShell>
  )
}
