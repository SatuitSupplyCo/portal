"use client"

import { useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Shirt,
  Factory,
  Palette,
  FileText,
  Image,
  Package,
  ClipboardList,
  TestTube,
  History,
  Shield,
  Flag,
  Users,
  Building2,
} from "lucide-react"
import { cn } from "@repo/ui/utils"

// ─── Types ───────────────────────────────────────────────────────────

type TabItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// ─── Tab configurations per surface ──────────────────────────────────

const tabMap: Record<string, TabItem[]> = {
  internal: [
    { title: "Dashboard", href: "/internal", icon: LayoutDashboard },
    { title: "Product", href: "/internal/product", icon: Shirt },
    { title: "Sourcing", href: "/internal/sourcing", icon: Factory },
    { title: "Studio", href: "/internal/studio", icon: Palette },
    { title: "Brand", href: "/internal/brand", icon: Flag },
    { title: "Documents", href: "/internal/docs", icon: FileText },
    { title: "Assets", href: "/internal/assets", icon: Image },
    { title: "Tech Packs", href: "/internal/techpacks", icon: Package },
    { title: "Packs", href: "/internal/packs", icon: ClipboardList },
    { title: "Tests", href: "/internal/tests", icon: TestTube },
    { title: "Changelog", href: "/internal/changelog", icon: History },
    { title: "Admin", href: "/admin", icon: Shield },
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
    { title: "Orgs", href: "/admin/orgs", icon: Building2 },
    { title: "Audit Log", href: "/admin/audit", icon: History },
  ],
}

// ─── Component ───────────────────────────────────────────────────────

interface MobileTabBarProps {
  surface: "internal" | "partners" | "vendors" | "admin"
}

export function MobileTabBar({ surface }: MobileTabBarProps) {
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)

  const tabs = tabMap[surface] ?? tabMap.internal!

  const isActive = useCallback(
    (href: string) => {
      const root = surface === "admin" ? "/admin" : `/${surface}`
      if (href === root) return pathname === href
      return pathname === href || pathname.startsWith(href + "/")
    },
    [pathname, surface],
  )

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const activeEl = container.querySelector<HTMLElement>("[data-active=true]")
    if (!activeEl) return
    const scrollLeft =
      activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2
    container.scrollTo({ left: scrollLeft, behavior: "smooth" })
  }, [pathname])

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        ref={scrollRef}
        className="flex h-14 items-center overflow-x-auto scrollbar-none px-1"
      >
        {tabs.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active}
              className={cn(
                "flex shrink-0 flex-col items-center justify-center gap-0.5 px-3 py-1 text-[10px] transition-colors",
                active
                  ? "text-primary font-medium"
                  : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate max-w-[64px]">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
