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

  return (
    <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-[var(--depot-border)] overflow-y-auto bg-[var(--depot-surface)] product-sidebar">
      <nav className="px-5 py-8" style={{ fontFamily: "var(--depot-font)" }}>
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

        <ol className="flex flex-col gap-0.5">
          {productSections.map((section, i) => {
            const isActive = isSectionActive(section.href)
            const isIndex = section.href === "/internal/product"

            return (
              <li key={section.href}>
                <Link
                  href={section.href}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 text-[11px] tracking-[0.06em] transition-colors",
                    isIndex && "mb-3",
                    isActive
                      ? "text-[var(--depot-ink)] font-semibold uppercase bg-[var(--depot-surface-alt)] border-l-2 border-[var(--depot-ink)]"
                      : "text-[var(--depot-muted)] font-light hover:text-[var(--depot-ink)] hover:bg-[var(--depot-surface-alt)] border-l-2 border-transparent",
                  )}
                >
                  {!isIndex && (
                    <span className="text-[9px] font-light text-[var(--depot-faint)] tabular-nums w-4">
                      {String(i).padStart(2, "0")}
                    </span>
                  )}
                  <span className="truncate">{section.title}</span>
                </Link>
              </li>
            )
          })}
        </ol>
      </nav>
    </aside>
  )
}
