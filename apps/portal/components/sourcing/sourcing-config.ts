import {
  Gauge,
  Factory,
  GitBranch,
  FlaskConical,
  DollarSign,
  Truck,
  ShieldAlert,
  BarChart3,
} from "lucide-react"

import type { SidebarSection } from "@/components/shell/SectionSidebar"

export const sourcingSections: SidebarSection[] = [
  {
    title: "Overview",
    href: "/internal/sourcing",
    icon: Gauge,
    description: "Executive dashboard and global KPIs",
  },
  {
    title: "Factories",
    href: "/internal/sourcing/factories",
    icon: Factory,
    description: "Factory directory and system of record",
  },
  {
    title: "Pipeline",
    href: "/internal/sourcing/pipeline",
    icon: GitBranch,
    description: "Sourcing pipeline and intake workflow",
  },
  {
    title: "Samples",
    href: "/internal/sourcing/samples",
    icon: FlaskConical,
    description: "Sampling and development tracking",
  },
  {
    title: "Costing",
    href: "/internal/sourcing/costing",
    icon: DollarSign,
    description: "Cost sheets, margin guardrails, and comparisons",
  },
  {
    title: "Production",
    href: "/internal/sourcing/production",
    icon: Truck,
    description: "Production runs and performance tracking",
  },
  {
    title: "Risk",
    href: "/internal/sourcing/risk",
    icon: ShieldAlert,
    description: "Compliance, certifications, and concentration risk",
  },
  {
    title: "Reports",
    href: "/internal/sourcing/reports",
    icon: BarChart3,
    description: "Exports, season snapshots, and analytics",
  },
]
