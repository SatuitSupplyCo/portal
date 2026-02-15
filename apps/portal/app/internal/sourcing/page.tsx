import type { Metadata } from "next"
import Link from "next/link"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  Factory,
  GitBranch,
  FlaskConical,
  DollarSign,
  Truck,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
} from "lucide-react"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Sourcing CRM | Satuit Supply Co.",
}

// ─── KPI Cards ───────────────────────────────────────────────────────

const kpis = [
  {
    label: "Active Factories",
    value: "—",
    sublabel: "Across all categories",
    icon: Factory,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Strategic Partners",
    value: "—",
    sublabel: "Score ≥ 4.5",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Margin Health",
    value: "—",
    sublabel: "Avg. viability score",
    icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    label: "Avg. Lead Time",
    value: "—",
    sublabel: "Days across active",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Open Samples",
    value: "—",
    sublabel: "Awaiting decision",
    icon: FlaskConical,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    label: "Risk Alerts",
    value: "—",
    sublabel: "Requiring attention",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
]

// ─── Module Cards ────────────────────────────────────────────────────

const modules = [
  {
    title: "Factory Directory",
    description: "System of record for every factory. Profiles, capabilities, contacts, and status lifecycle.",
    href: "/internal/sourcing/factories",
    icon: Factory,
  },
  {
    title: "Sourcing Pipeline",
    description: "Structured intake workflow. Turn prospects into approved vendors through governed stages.",
    href: "/internal/sourcing/pipeline",
    icon: GitBranch,
  },
  {
    title: "Samples & Development",
    description: "Track every sample request, revision, and decision. Build historical memory.",
    href: "/internal/sourcing/samples",
    icon: FlaskConical,
  },
  {
    title: "Costing & Margins",
    description: "FOB tracking, landed cost modeling, margin validation. Protect brand economics.",
    href: "/internal/sourcing/costing",
    icon: DollarSign,
  },
  {
    title: "Production Tracking",
    description: "PO tracking, QC results, delivery performance. Earn strategic partner status.",
    href: "/internal/sourcing/production",
    icon: Truck,
  },
  {
    title: "Risk & Compliance",
    description: "Certification monitoring, concentration risk, dual-sourcing visibility.",
    href: "/internal/sourcing/risk",
    icon: ShieldAlert,
  },
  {
    title: "Reports & Analytics",
    description: "Season snapshots, quality trends, lead time analysis, and strategic scoring.",
    href: "/internal/sourcing/reports",
    icon: BarChart3,
  },
]

// ─── Page ────────────────────────────────────────────────────────────

export default function SourcingOverviewPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: "Sourcing" }]}>
      <main className="flex-1 overflow-y-auto">
        {/* ═══════ HERO ═══════ */}
        <section className="bg-[#0f172a] text-white px-8 py-16 md:px-12 md:py-20">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Factory className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/40">
                Satuit Sourcing CRM
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
              Sourcing
              <br />
              Intelligence
            </h1>
            <p className="text-base leading-relaxed max-w-xl text-white/50">
              Factory relationships, margin discipline, risk monitoring, and
              institutional memory. Not a vendor list — a decision engine.
            </p>
          </div>
        </section>

        {/* ═══════ KPI GRID ═══════ */}
        <section className="px-8 py-10 md:px-12 border-b">
          <div className="max-w-5xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Global KPIs
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg border p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-md ${kpi.bg}`}>
                      <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                    <p className="text-[11px] font-medium text-foreground">{kpi.label}</p>
                    <p className="text-[10px] text-muted-foreground">{kpi.sublabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ MODULE CARDS ═══════ */}
        <section className="px-8 py-10 md:px-12">
          <div className="max-w-5xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Modules
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((mod) => (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="group rounded-lg border p-5 hover:border-primary/30 hover:bg-accent/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <mod.icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                      {mod.title}
                    </h3>
                  </div>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    {mod.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ GOVERNANCE FOOTER ═══════ */}
        <section className="bg-[#0f172a] text-white px-8 py-12 md:px-12">
          <div className="max-w-5xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35 mb-6">
              Governance Controls
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-medium text-white/80 mb-3">
                  Production Approval Requires:
                </p>
                <ul className="space-y-2">
                  {[
                    "Factory status = Approved or Active",
                    "Strategic score ≥ 3.8 threshold",
                    "Compliance verified & current",
                    "Margin target validated",
                    "Primary + backup factory assigned",
                  ].map((rule) => (
                    <li key={rule} className="flex items-start gap-2 text-[12px] text-white/50">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/60 shrink-0 mt-0.5" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-white/80 mb-3">
                  Strategic Partner Requires:
                </p>
                <ul className="space-y-2">
                  {[
                    "3+ successful production runs",
                    "≥ 4.0 average quality score",
                    "On-time delivery ≥ 90%",
                    "No open compliance issues",
                    "Brand alignment score ≥ 4.0",
                  ].map((rule) => (
                    <li key={rule} className="flex items-start gap-2 text-[12px] text-white/50">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/60 shrink-0 mt-0.5" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </DocPageShell>
  )
}
