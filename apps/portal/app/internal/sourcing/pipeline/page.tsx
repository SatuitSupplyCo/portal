import type { Metadata } from "next"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  GitBranch,
  Plus,
  ArrowRight,
  Factory,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Pipeline | Sourcing CRM",
}

// ─── Pipeline stages ─────────────────────────────────────────────────

const stages = [
  {
    name: "Prospect",
    description: "Initial discovery. Factory has been identified as a potential fit.",
    color: "bg-slate-200 text-slate-700",
    dotColor: "bg-slate-400",
    count: 0,
  },
  {
    name: "Screening",
    description: "Reviewing capabilities, certifications, and initial fit assessment.",
    color: "bg-yellow-100 text-yellow-800",
    dotColor: "bg-yellow-500",
    count: 0,
  },
  {
    name: "Sampling",
    description: "Proto or fit samples requested. Actively evaluating output.",
    color: "bg-blue-100 text-blue-800",
    dotColor: "bg-blue-500",
    count: 0,
  },
  {
    name: "Approved",
    description: "Passed all gates. Ready for production allocation.",
    color: "bg-emerald-100 text-emerald-800",
    dotColor: "bg-emerald-500",
    count: 0,
  },
  {
    name: "Active",
    description: "Currently producing. Performance being tracked.",
    color: "bg-green-100 text-green-800",
    dotColor: "bg-green-500",
    count: 0,
  },
  {
    name: "Dormant",
    description: "No active orders. May re-engage in future seasons.",
    color: "bg-gray-100 text-gray-500",
    dotColor: "bg-gray-400",
    count: 0,
  },
]

// ─── Page ────────────────────────────────────────────────────────────

export default function PipelinePage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Sourcing", href: "/internal/sourcing" },
        { label: "Pipeline" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Sourcing Pipeline</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track factory prospects through governed intake stages
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Prospect
            </Button>
          </div>
        </div>

        {/* Pipeline stages board */}
        <div className="px-8 py-8 md:px-12">
          <div className="max-w-6xl">
            {/* Stage columns */}
            <div className="grid grid-cols-6 gap-4">
              {stages.map((stage, idx) => (
                <div key={stage.name} className="flex flex-col">
                  {/* Column header */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`h-2 w-2 rounded-full ${stage.dotColor}`} />
                      <h3 className="text-[12px] font-semibold uppercase tracking-wide">
                        {stage.name}
                      </h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-snug">
                      {stage.description}
                    </p>
                  </div>

                  {/* Column body */}
                  <div className="flex-1 rounded-lg border border-dashed bg-muted/20 p-3 min-h-[300px]">
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <Factory className="h-5 w-5 text-muted-foreground/40 mb-2" />
                      <p className="text-[11px] text-muted-foreground/60">
                        No factories
                      </p>
                    </div>
                  </div>

                  {/* Count footer */}
                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {stage.count} {stage.count === 1 ? "factory" : "factories"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Intake checklist */}
            <div className="mt-12 rounded-lg border p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                Intake Checklist
              </h3>
              <p className="text-[12px] text-muted-foreground mb-4">
                Every factory must pass these gates before advancing stages:
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Prospect → Screening
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "Basic profile complete",
                      "Category needs identified",
                      "Initial contact made",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Screening → Sampling
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "Capabilities verified",
                      "NDA signed",
                      "No red flags identified",
                      "Pricing range acceptable",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Sampling → Approved
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "Sample quality ≥ 4.0",
                      "Fit approved",
                      "Communication responsive",
                      "Margin target achievable",
                      "Compliance docs on file",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DocPageShell>
  )
}
