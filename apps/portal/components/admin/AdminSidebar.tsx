"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@repo/ui/utils"
import { adminSections } from "./admin-config"

// ─── Component ──────────────────────────────────────────────────────

export function AdminSidebar() {
  const pathname = usePathname()

  const isSectionActive = (href: string) => {
    if (href === "/admin") return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside className="hidden md:flex w-52 shrink-0 flex-col border-r overflow-y-auto bg-background">
      <nav className="px-3 py-6">
        {/* Title */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5 px-2">
          Admin
        </p>

        {/* Section list */}
        <ul className="flex flex-col gap-0.5">
          {adminSections.map((section) => {
            const isActive = isSectionActive(section.href)
            const Icon = section.icon

            return (
              <li key={section.href}>
                <Link
                  href={section.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] leading-snug transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{section.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
