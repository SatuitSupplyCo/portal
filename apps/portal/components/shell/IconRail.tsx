"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/tooltip"
import {
  FileText,
  Image,
  Package,
  TestTube,
  History,
  LayoutDashboard,
  Shield,
  ClipboardList,
  Users,
  Building2,
  Flag,
  Shirt,
  Factory,
  Palette,
} from "lucide-react"
import { cn } from "@repo/ui/utils"

// ─── Navigation per surface ──────────────────────────────────────────

type RailItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const railNavMap: Record<string, RailItem[]> = {
  internal: [
    { title: "Dashboard", href: "/internal", icon: LayoutDashboard },
    { title: "Brand", href: "/internal/brand", icon: Flag },
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

// ─── Component ───────────────────────────────────────────────────────

interface IconRailProps {
  surface: "internal" | "partners" | "vendors" | "admin"
}

export function IconRail({ surface }: IconRailProps) {
  const pathname = usePathname()
  const items = railNavMap[surface] ?? []

  const isActive = (href: string) => {
    if (href === `/${surface}`) return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <nav className="hidden md:flex w-12 shrink-0 flex-col items-center border-r bg-muted/30 py-3 gap-1">
      {/* Logo */}
      <Link
        href={`/${surface}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg mb-3 hover:bg-accent transition-colors"
      >
        <Package className="h-5 w-5" />
      </Link>

      {/* Nav items */}
      <div className="flex flex-1 flex-col items-center gap-1">
        {items.map((item) => (
          <Tooltip key={item.href} delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent hover:text-foreground",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="sr-only">{item.title}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {item.title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Bottom: Admin link (internal only) */}
      {surface === "internal" && (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href="/admin"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors mt-auto hover:bg-accent hover:text-foreground",
                pathname.startsWith("/admin")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground",
              )}
            >
              <Shield className="h-4 w-4" />
              <span className="sr-only">Admin</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Admin
          </TooltipContent>
        </Tooltip>
      )}
    </nav>
  )
}
