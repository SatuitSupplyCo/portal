"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@repo/ui/utils"
import { useIsMobile } from "@repo/ui/use-mobile"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet"
import { productSections } from "./product-config"
import { useShell } from "@/components/shell/ShellProvider"

// ─── Types ──────────────────────────────────────────────────────────

interface SidebarCollection {
  code: string
  name: string
}

interface ProductSidebarProps {
  collections: SidebarCollection[]
}

// ─── Component ──────────────────────────────────────────────────────

export function ProductSidebar({ collections }: ProductSidebarProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { sectionNavOpen, setSectionNavOpen } = useShell()

  const isSectionActive = (href: string) => {
    if (href === "/internal/product") return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  const lifecycleSections = productSections.filter(s => s.group === 'lifecycle')
  const adminSections = productSections.filter(s => s.group === 'admin')

  const closeMobile = () => { if (isMobile) setSectionNavOpen(false) }

  const content = (
    <nav className="flex flex-col flex-1 px-5 py-8" style={{ fontFamily: "var(--depot-font)" }}>
      <div className="flex items-center gap-2 mb-6 px-2">
        <svg width="14" height="10" viewBox="0 0 18 14" fill="none" className="shrink-0">
          <rect x="0" y="0" width="8" height="14" fill="#0f1a2e" />
          <rect x="10" y="0" width="8" height="14" fill="#0f1a2e" />
        </svg>
      </div>

      <p className="depot-label mb-5 px-2">
        Product
      </p>

      <ol className="flex flex-col gap-0.5">
        {lifecycleSections.map((section) => {
          const isActive = isSectionActive(section.href)
          const isIndex = section.href === "/internal/product"

          return (
            <li key={section.href}>
              <Link
                href={section.href}
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 px-2 py-2 text-[11px] tracking-[0.06em] transition-colors",
                  isIndex && "mb-1",
                  isActive
                    ? "text-[var(--depot-ink)] font-semibold uppercase bg-[var(--depot-surface-alt)] border-l-2 border-[var(--depot-ink)]"
                    : "text-[var(--depot-muted)] font-light hover:text-[var(--depot-ink)] hover:bg-[var(--depot-surface-alt)] border-l-2 border-transparent",
                )}
              >
                <span className="truncate">{section.title}</span>
              </Link>
            </li>
          )
        })}
      </ol>

      <p className="depot-label mt-8 mb-3 px-2">
        Collections
      </p>

      <ol className="flex flex-col gap-0.5">
        {collections.map((col, i) => {
          const href = `/internal/product/collections/${col.code}`
          const isActive = isSectionActive(href)

          return (
            <li key={col.code}>
              <Link
                href={href}
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 px-2 py-2 text-[11px] tracking-[0.06em] transition-colors",
                  isActive
                    ? "text-[var(--depot-ink)] font-semibold uppercase bg-[var(--depot-surface-alt)] border-l-2 border-[var(--depot-ink)]"
                    : "text-[var(--depot-muted)] font-light hover:text-[var(--depot-ink)] hover:bg-[var(--depot-surface-alt)] border-l-2 border-transparent",
                )}
              >
                <span className="text-[9px] font-light text-[var(--depot-faint)] tabular-nums w-4">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{col.name}</span>
              </Link>
            </li>
          )
        })}
      </ol>

      <div className="flex-1" />

      <div className="border-t border-[var(--depot-border)] pt-5 mt-6">
        <p className="depot-label mb-3 px-2">
          Configure
        </p>
        <ol className="flex flex-col gap-0.5">
          {adminSections.map((section) => {
            const isActive = isSectionActive(section.href)

            return (
              <li key={section.href}>
                <Link
                  href={section.href}
                  onClick={closeMobile}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 text-[11px] tracking-[0.06em] transition-colors",
                    isActive
                      ? "text-[var(--depot-ink)] font-semibold uppercase bg-[var(--depot-surface-alt)] border-l-2 border-[var(--depot-ink)]"
                      : "text-[var(--depot-muted)] font-light hover:text-[var(--depot-ink)] hover:bg-[var(--depot-surface-alt)] border-l-2 border-transparent",
                  )}
                >
                  <span className="truncate">{section.title}</span>
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )

  if (isMobile) {
    return (
      <Sheet open={sectionNavOpen} onOpenChange={setSectionNavOpen}>
        <SheetContent side="left" className="w-72 p-0 overflow-y-auto bg-[var(--depot-surface)]">
          <SheetHeader className="border-b border-[var(--depot-border)] px-4 py-3">
            <SheetTitle className="text-sm">Product Intelligence</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-[var(--depot-border)] overflow-y-auto bg-[var(--depot-surface)] product-sidebar">
      {content}
    </aside>
  )
}
