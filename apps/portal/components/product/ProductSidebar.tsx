"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@repo/ui/utils"
import { productSections } from "./product-config"

// ─── Component ──────────────────────────────────────────────────────

export function ProductSidebar() {
  const pathname = usePathname()

  const isSectionActive = (href: string) => {
    if (href === "/internal/product") return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  const lifecycleSections = productSections.filter(s => s.group === 'lifecycle')
  const referenceSections = productSections.filter(s => s.group === 'reference')
  const adminSections = productSections.filter(s => s.group === 'admin')

  return (
    <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-[var(--depot-border)] overflow-y-auto bg-[var(--depot-surface)] product-sidebar">
      <nav className="flex flex-col flex-1 px-5 py-8" style={{ fontFamily: "var(--depot-font)" }}>
        {/* Two Flags mark */}
        <div className="flex items-center gap-2 mb-6 px-2">
          <svg width="14" height="10" viewBox="0 0 18 14" fill="none" className="shrink-0">
            <rect x="0" y="0" width="8" height="14" fill="#0f1a2e" />
            <rect x="10" y="0" width="8" height="14" fill="#0f1a2e" />
          </svg>
        </div>

        <p className="depot-label mb-5 px-2">
          Product
        </p>

        {/* Lifecycle section */}
        <ol className="flex flex-col gap-0.5">
          {lifecycleSections.map((section) => {
            const isActive = isSectionActive(section.href)
            const isIndex = section.href === "/internal/product"

            return (
              <li key={section.href}>
                <Link
                  href={section.href}
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

        {/* Reference catalog */}
        <p className="depot-label mt-8 mb-3 px-2">
          Collections
        </p>

        <ol className="flex flex-col gap-0.5">
          {referenceSections.map((section, i) => {
            const isActive = isSectionActive(section.href)

            return (
              <li key={section.href}>
                <Link
                  href={section.href}
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
                  <span className="truncate">{section.title}</span>
                </Link>
              </li>
            )
          })}
        </ol>

        {/* Spacer — pushes admin section to bottom */}
        <div className="flex-1" />

        {/* Admin — taxonomy management */}
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
    </aside>
  )
}
