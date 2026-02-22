import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  Sparkles,
} from "lucide-react"

import type { SidebarSection } from "@/components/shell/SectionSidebar"

export const adminSections: SidebarSection[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and system health",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage portal users and roles",
  },
  {
    title: "Roles",
    href: "/admin/roles",
    icon: Shield,
    description: "Manage roles and permissions",
  },
  {
    title: "Organizations",
    href: "/admin/orgs",
    icon: Building2,
    description: "Vendor and partner companies",
  },
  {
    title: "AI",
    href: "/admin/ai",
    icon: Sparkles,
    description: "AI usage, prompts, and suggestion logs",
  },
]
