import type { Metadata } from "next"
import Link from "next/link"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  Factory,
  Globe,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Star,
  Shield,
  TrendingUp,
  FlaskConical,
  DollarSign,
  Truck,
  FileText,
  Users,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Factory Detail | Sourcing CRM",
}

// ─── Score Card ──────────────────────────────────────────────────────

function ScoreCard({
  label,
  value,
  max = 5,
}: {
  label: string
  value: number | null
  max?: number
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: max }, (_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full ${
                value && i < value
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-medium tabular-nums w-6 text-right">
          {value ?? "—"}
        </span>
      </div>
    </div>
  )
}

// ─── Section Card ────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────

export default async function FactoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Sourcing", href: "/internal/sourcing" },
        { label: "Factories", href: "/internal/sourcing/factories" },
        { label: "Factory Detail" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Back + Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <Link
            href="/internal/sourcing/factories"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Factories
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Factory className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Factory Profile
                  </h1>
                  <p className="text-xs text-muted-foreground font-mono">
                    {id}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button size="sm">
                Review
              </Button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="px-8 py-8 md:px-12">
          <div className="max-w-6xl">
            {/* Status + Score Banner */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-lg border p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Shield className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </p>
                  <p className="text-sm font-semibold">—</p>
                </div>
              </div>
              <div className="rounded-lg border p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Strategic Score
                  </p>
                  <p className="text-sm font-semibold">—</p>
                </div>
              </div>
              <div className="rounded-lg border p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Margin Viability
                  </p>
                  <p className="text-sm font-semibold">—</p>
                </div>
              </div>
            </div>

            {/* Detail Sections */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile */}
              <SectionCard title="Profile" icon={Factory}>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Legal Name</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trading Name</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vertical Integration</span>
                    <span className="font-medium">—</span>
                  </div>
                </div>
              </SectionCard>

              {/* Location & Contact */}
              <SectionCard title="Location & Contact" icon={MapPin}>
                <div className="space-y-3 text-[13px]">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Location not set</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">No email</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">No WhatsApp</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">No website</span>
                  </div>
                </div>
              </SectionCard>

              {/* Capabilities */}
              <SectionCard title="Capabilities" icon={Factory}>
                <p className="text-[12px] text-muted-foreground">
                  No capabilities mapped yet. Add categories and specialties to build the capability matrix.
                </p>
              </SectionCard>

              {/* Capacity & Commercials */}
              <SectionCard title="Capacity & Commercials" icon={Truck}>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity / month</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Order Qty</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Lead Time</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sample Lead Time</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Terms</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency</span>
                    <span className="font-medium">—</span>
                  </div>
                </div>
              </SectionCard>

              {/* Risk Profile */}
              <SectionCard title="Risk Profile" icon={AlertTriangle}>
                <div className="space-y-0.5">
                  <ScoreCard label="Geopolitical Risk" value={null} />
                  <ScoreCard label="Financial Stability" value={null} />
                  <ScoreCard label="Labor Risk" value={null} />
                  <ScoreCard label="Supply Chain Depth" value={null} />
                  <ScoreCard label="Redundancy" value={null} />
                </div>
              </SectionCard>

              {/* Relationship Intelligence */}
              <SectionCard title="Relationship Intelligence" icon={Users}>
                <div className="space-y-0.5">
                  <ScoreCard label="Brand Alignment" value={null} />
                  <ScoreCard label="Responsiveness" value={null} />
                  <ScoreCard label="Transparency" value={null} />
                  <ScoreCard label="Innovation" value={null} />
                  <ScoreCard label="Negotiation Flexibility" value={null} />
                  <ScoreCard label="Long-term Potential" value={null} />
                </div>
              </SectionCard>

              {/* Sample History */}
              <SectionCard title="Sample History" icon={FlaskConical}>
                <p className="text-[12px] text-muted-foreground">
                  No samples tracked yet. Create a sample request to begin building development history.
                </p>
              </SectionCard>

              {/* Costing Profiles */}
              <SectionCard title="Costing Profiles" icon={DollarSign}>
                <p className="text-[12px] text-muted-foreground">
                  No costing profiles yet. Add a cost sheet to begin tracking margin viability.
                </p>
              </SectionCard>

              {/* Documents & Attachments */}
              <SectionCard title="Documents & Attachments" icon={FileText}>
                <p className="text-[12px] text-muted-foreground">
                  No attachments yet. Upload NDAs, audit reports, certifications, and photos.
                </p>
              </SectionCard>

              {/* Production History */}
              <SectionCard title="Production History" icon={Truck}>
                <p className="text-[12px] text-muted-foreground">
                  No production runs recorded. Track POs, QC results, and delivery performance here.
                </p>
              </SectionCard>
            </div>
          </div>
        </div>
      </main>
    </DocPageShell>
  )
}
