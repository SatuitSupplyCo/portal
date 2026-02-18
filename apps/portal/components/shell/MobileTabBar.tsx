"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet"
import {
  LayoutDashboard,
  Shirt,
  Factory,
  Palette,
  MoreHorizontal,
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

const internalPrimaryTabs: TabItem[] = [
  { title: "Dashboard", href: "/internal", icon: LayoutDashboard },
  { title: "Product", href: "/internal/product", icon: Shirt },
  { title: "Sourcing", href: "/internal/sourcing", icon: Factory },
  { title: "Studio", href: "/internal/studio", icon: Palette },
]

const internalOverflowItems: TabItem[] = [
  { title: "Brand", href: "/internal/brand", icon: Flag },
  { title: "Documents", href: "/internal/docs", icon: FileText },
  { title: "Assets", href: "/internal/assets", icon: Image },
  { title: "Tech Packs", href: "/internal/techpacks", icon: Package },
  { title: "Packs", href: "/internal/packs", icon: ClipboardList },
  { title: "Tests", href: "/internal/tests", icon: TestTube },
  { title: "Changelog", href: "/internal/changelog", icon: History },
  { title: "Admin", href: "/admin", icon: Shield },
]

const tabMap: Record<string, { primary: TabItem[]; overflow: TabItem[] }> = {
  internal: { primary: internalPrimaryTabs, overflow: internalOverflowItems },
  partners: {
    primary: [
      { title: "Dashboard", href: "/partners", icon: LayoutDashboard },
      { title: "Documents", href: "/partners/docs", icon: FileText },
      { title: "Assets", href: "/partners/assets", icon: Image },
      { title: "Packs", href: "/partners/packs", icon: ClipboardList },
    ],
    overflow: [],
  },
  vendors: {
    primary: [
      { title: "Dashboard", href: "/vendors", icon: LayoutDashboard },
      { title: "Documents", href: "/vendors/docs", icon: FileText },
      { title: "Assets", href: "/vendors/assets", icon: Image },
      { title: "Tech Packs", href: "/vendors/techpacks", icon: Package },
      { title: "Packs", href: "/vendors/packs", icon: ClipboardList },
    ],
    overflow: [],
  },
  admin: {
    primary: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "Orgs", href: "/admin/orgs", icon: Building2 },
      { title: "Audit Log", href: "/admin/audit", icon: History },
    ],
    overflow: [],
  },
}

// ─── Component ───────────────────────────────────────────────────────

interface MobileTabBarProps {
  surface: "internal" | "partners" | "vendors" | "admin"
}

export function MobileTabBar({ surface }: MobileTabBarProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const { primary, overflow } = tabMap[surface] ?? tabMap.internal!

  const isActive = (href: string) => {
    const root = surface === "admin" ? "/admin" : `/${surface}`
    if (href === root) return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  const isOverflowActive = overflow.some((item) => isActive(item.href))

  return (
    <>
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 flex items-end border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex w-full items-center justify-around px-1 h-14">
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] transition-colors",
                isActive(item.href)
                  ? "text-primary font-medium"
                  : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate max-w-[64px]">{item.title}</span>
            </Link>
          ))}

          {overflow.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] transition-colors",
                isOverflowActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground",
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>More</span>
            </button>
          )}
        </div>
      </nav>

      {overflow.length > 0 && (
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetContent side="bottom" className="rounded-t-xl px-0">
            <SheetHeader className="px-4 pb-2">
              <SheetTitle className="text-sm">More</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-0.5 px-2 pb-2">
              {overflow.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
