"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { useShell } from "./ShellProvider"

export function Breadcrumbs() {
  const { breadcrumbs } = useShell()

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        href="/internal"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {breadcrumbs.map((crumb, i) => {
        const isLast = i === breadcrumbs.length - 1

        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {crumb.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
