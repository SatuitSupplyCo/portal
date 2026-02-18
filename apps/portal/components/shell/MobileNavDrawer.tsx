"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet"
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
import { cn } from "@repo/ui/utils"
import { useShell } from "./ShellProvider"

// ─── Navigation per surface ──────────────────────────────────────────

type NavItem = {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

const navigationMap: Record<string, NavItem[]> = {
  internal: [
    { title: "Dashboard", href: "/internal", icon: LayoutDashboard },
    { title: "Brand", href: "/internal/brand", icon: BookOpen },
    { title: "Studio", href: "/internal/studio", icon: Palette },
    { title: "Product", href: "/internal/product", icon: Shirt },
    { title: "Sourcing", href: "/internal/sourcing", icon: Factory },
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
  { title: "Seasons", href: "/internal/product/seasons" },
  { title: "Core Programs", href: "/internal/product/core" },
  { title: "Taxonomy", href: "/internal/product/taxonomy" },
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

interface MobileNavDrawerProps {
  surface: "internal" | "partners" | "vendors" | "admin"
}

export function MobileNavDrawer({ surface }: MobileNavDrawerProps) {
  const pathname = usePathname()
  const { mobileNavOpen, setMobileNavOpen } = useShell()

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
    if (href === `/${surface}` || href === "/internal/brand" || href === "/internal/studio" || href === "/internal/product" || href === "/internal/sourcing")
      return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5" />
            Satuit Supply
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-3">
          <span className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 capitalize">
            {groupLabel}
          </span>

          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive(item.href)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.title}
            </Link>
          ))}

          {surface === "internal" && (
            <>
              <div className="my-2 border-t" />
              <Link
                href="/admin"
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
