"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@repo/ui/utils"

// ─── Types ───────────────────────────────────────────────────────────

export interface TocHeading {
  id: string
  text: string
  level: number
}

interface DocTableOfContentsProps {
  headings: TocHeading[]
}

// ─── Component ───────────────────────────────────────────────────────

export function DocTableOfContents({ headings }: DocTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Track which heading is currently visible
  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find the first intersecting entry (topmost visible heading)
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort(
          (a, b) =>
            a.boundingClientRect.top - b.boundingClientRect.top,
        )

      if (visible.length > 0) {
        setActiveId(visible[0].target.id)
      }
    }

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0,
    })

    // Observe all heading elements
    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observerRef.current.observe(el)
    }

    return () => observerRef.current?.disconnect()
  }, [headings])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault()
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
        setActiveId(id)
      }
    },
    [],
  )

  if (headings.length === 0) return null

  return (
    <nav className="py-4 px-3" aria-label="Table of contents">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-3">
        On this page
      </h3>
      <ul className="space-y-0.5">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={cn(
                "block rounded-md px-2 py-1.5 text-sm transition-colors leading-snug",
                heading.level >= 3 && "pl-5",
                activeId === heading.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
