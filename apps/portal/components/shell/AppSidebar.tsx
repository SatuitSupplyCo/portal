"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@repo/ui/sidebar"
import {
  FileText,
  Image,
  Package,
  TestTube,
  History,
  LayoutDashboard,
  Shield,
  Users,
  Building2,
  ClipboardList,
  BookOpen,
  Type,
  Quote,
  Layers,
  Droplet,
  Anchor,
  MessageSquare,
  Camera,
  Tag,
  Globe,
  Factory,
  Gauge,
  GitBranch,
  FlaskConical,
  DollarSign,
  Truck,
  ShieldAlert,
  BarChart3,
  Palette,
  Shirt,
  Scissors,
  Waves,
  BookMarked,
  Archive,
} from "lucide-react"

// ─── Navigation structure per surface ────────────────────────────────

type NavItem = {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

const navigationMap: Record<string, NavItem[]> = {
  internal: [
    { title: "Dashboard", href: "/internal", icon: LayoutDashboard },
    { title: "Documents", href: "/internal/docs", icon: FileText },
    { title: "Assets", href: "/internal/assets", icon: Image },
    { title: "Tech Packs", href: "/internal/techpacks", icon: Package },
    { title: "Packs", href: "/internal/packs", icon: ClipboardList },
    { title: "Tests", href: "/internal/tests", icon: TestTube },
    { title: "Changelog", href: "/internal/changelog", icon: History },
  ],
  partners: [
    { title: "Dashboard", href: "/partners", icon: LayoutDashboard },
    { title: "Documents", href: "/partners/docs", icon: FileText },
    { title: "Assets", href: "/partners/assets", icon: Image },
    { title: "Packs", href: "/partners/packs", icon: ClipboardList },
  ],
  vendors: [
    { title: "Dashboard", href: "/vendors", icon: LayoutDashboard },
    { title: "Documents", href: "/vendors/docs", icon: FileText },
    { title: "Assets", href: "/vendors/assets", icon: Image },
    { title: "Tech Packs", href: "/vendors/techpacks", icon: Package },
    { title: "Packs", href: "/vendors/packs", icon: ClipboardList },
  ],
  admin: [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Organizations", href: "/admin/orgs", icon: Building2 },
    { title: "Audit Log", href: "/admin/audit", icon: History },
  ],
}

const sourcingSectionNav: NavItem[] = [
  { title: "Sourcing Overview", href: "/internal/sourcing", icon: Gauge },
  { title: "Factories", href: "/internal/sourcing/factories", icon: Factory },
  { title: "Pipeline", href: "/internal/sourcing/pipeline", icon: GitBranch },
  { title: "Samples", href: "/internal/sourcing/samples", icon: FlaskConical },
  { title: "Costing", href: "/internal/sourcing/costing", icon: DollarSign },
  { title: "Production", href: "/internal/sourcing/production", icon: Truck },
  { title: "Risk", href: "/internal/sourcing/risk", icon: ShieldAlert },
  { title: "Reports", href: "/internal/sourcing/reports", icon: BarChart3 },
]

const productSectionNav: NavItem[] = [
  { title: "Product System", href: "/internal/product" },
  { title: "Core Essentials", href: "/internal/product/core-essentials" },
  { title: "Material Collection", href: "/internal/product/material-collection" },
  { title: "Origin Collection", href: "/internal/product/origin-collection" },
  { title: "Coastal Function", href: "/internal/product/coastal-function" },
]

const studioSectionNav: NavItem[] = [
  { title: "Studio Overview", href: "/internal/studio", icon: Palette },
  { title: "Product", href: "/internal/studio/product", icon: Shirt },
  { title: "Materials", href: "/internal/studio/materials", icon: Scissors },
  { title: "Brand", href: "/internal/studio/brand", icon: Waves },
  { title: "References", href: "/internal/studio/references", icon: BookMarked },
  { title: "Archive", href: "/internal/studio/archive", icon: Archive },
]

const brandSectionNav: NavItem[] = [
  { title: "Brand System", href: "/internal/brand", icon: BookOpen },
  { title: "1.0 Foundations", href: "/internal/brand/foundations", icon: Anchor },
  { title: "2.0 Messaging", href: "/internal/brand/messaging", icon: MessageSquare },
  { title: "3.0 Visual Standards", href: "/internal/brand/visual", icon: Layers },
  { title: "4.0 Typography", href: "/internal/brand/typography", icon: Type },
  { title: "5.0 Voice & Ethos", href: "/internal/brand/voice", icon: Quote },
  { title: "6.0 Color", href: "/internal/brand/color", icon: Droplet },
  { title: "7.0 Photography", href: "/internal/brand/photography", icon: Camera },
  { title: "8.0 Trim & Hardware", href: "/internal/brand/trim", icon: Tag },
  { title: "9.0 Packaging", href: "/internal/brand/logistics", icon: Package },
  { title: "10.0 Digital", href: "/internal/brand/digital", icon: Globe },
]

// ─── Component ───────────────────────────────────────────────────────

interface AppSidebarProps {
  surface: "internal" | "partners" | "vendors" | "admin"
}

export function AppSidebar({ surface }: AppSidebarProps) {
  const pathname = usePathname()

  const isBrandContext =
    surface === "internal" && pathname.startsWith("/internal/brand")
  const isStudioContext =
    surface === "internal" && pathname.startsWith("/internal/studio")
  const isProductContext =
    surface === "internal" && pathname.startsWith("/internal/product")
  const isSourcingContext =
    surface === "internal" && pathname.startsWith("/internal/sourcing")

  const items = isSourcingContext
    ? sourcingSectionNav
    : isStudioContext
      ? studioSectionNav
      : isProductContext
        ? productSectionNav
        : isBrandContext
          ? brandSectionNav
          : (navigationMap[surface] ?? [])
  const groupLabel = isSourcingContext
    ? "Sourcing CRM"
    : isStudioContext
      ? "Satuit Studio"
      : isProductContext
        ? "Product Intelligence"
        : isBrandContext
          ? "Brand Operating System"
          : surface

  const isActive = (href: string) => {
    // Index routes require exact match
    if (href === `/${surface}` || href === "/internal/brand" || href === "/internal/studio" || href === "/internal/product" || href === "/internal/sourcing")
      return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Package className="h-5 w-5" />
          <span className="font-semibold">Satuit Supply</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="capitalize">
            {groupLabel}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Internal users see a link to Admin */}
        {surface === "internal" && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith("/admin")}
                    >
                      <Link href="/admin">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Admin surface has a back-to-portal link */}
        {surface === "admin" && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/internal">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Back to Portal</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-muted-foreground">
          Satuit Supply Portal
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
