"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
import { brandSections } from "./brand-config"
import { useShell } from "@/components/shell/ShellProvider"

// ─── Component ──────────────────────────────────────────────────────

export function BrandSidebar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { sectionNavOpen, setSectionNavOpen } = useShell()
  const [activeHeadingId, setActiveHeadingId] = useState("")
  const observerRef = useRef<IntersectionObserver | null>(null)

  const activeSectionIdx = brandSections.findIndex((s) => {
    if (s.href === "/internal/brand") return pathname === s.href
    return pathname === s.href || pathname.startsWith(s.href + "/")
  })
  const activeSection =
    activeSectionIdx >= 0 ? brandSections[activeSectionIdx] : null
  const activeHeadings = activeSection?.headings ?? []

  useEffect(() => {
    observerRef.current?.disconnect()
    if (activeHeadings.length === 0) return

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visible.length > 0) {
        setActiveHeadingId(visible[0].target.id)
      }
    }

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0,
    })

    for (const h of activeHeadings) {
      const el = document.getElementById(h.id)
      if (el) observerRef.current.observe(el)
    }

    return () => observerRef.current?.disconnect()
  }, [activeHeadings])

  useEffect(() => {
    setActiveHeadingId("")
  }, [pathname])

  const handleHeadingClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault()
      if (isMobile) setSectionNavOpen(false)
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
        setActiveHeadingId(id)
      }
    },
    [isMobile, setSectionNavOpen],
  )

  const isSectionActive = (href: string) => {
    if (href === "/internal/brand") return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  const closeMobile = () => { if (isMobile) setSectionNavOpen(false) }

  const content = (
    <nav className="px-5 py-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5">
        Contents
      </p>

      <ol className="flex flex-col">
        {brandSections.map((section) => {
          const isActive = isSectionActive(section.href)
          const hasHeadings = isActive && section.headings.length > 0
          const isIndex = section.href === "/internal/brand"

          return (
            <li key={section.href}>
              <Link
                href={section.href}
                onClick={closeMobile}
                className={cn(
                  "block py-1.5 text-[13px] leading-snug transition-colors",
                  isIndex && "mb-3",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {(() => {
                  const match = section.title.match(/^(\d+\.\d)\s+(.+)$/)
                  if (match) {
                    return (
                      <>
                        <span className="font-bold opacity-30 mr-1.5 tabular-nums">
                          {match[1]}
                        </span>
                        <span className={isActive ? "font-medium" : ""}>
                          {match[2]}
                        </span>
                      </>
                    )
                  }
                  return <span className={isActive ? "font-medium" : ""}>{section.title}</span>
                })()}
              </Link>

              {hasHeadings && (
                <div className="border-l border-border ml-1 pl-3 mb-2">
                  {section.headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      onClick={(e) => handleHeadingClick(e, h.id)}
                      className={cn(
                        "block py-1 text-[11px] leading-snug transition-colors",
                        h.level >= 3 ? "pl-3" : "",
                        activeHeadingId === h.id
                          ? "text-foreground font-medium"
                          : "text-muted-foreground/70 hover:text-foreground",
                      )}
                    >
                      {h.text}
                    </a>
                  ))}
                </div>
              )}

              {isIndex && (
                <div className="border-t border-border mb-2" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )

  if (isMobile) {
    return (
      <Sheet open={sectionNavOpen} onOpenChange={setSectionNavOpen}>
        <SheetContent side="left" className="w-72 p-0 overflow-y-auto">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="text-sm">Brand Operating System</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside className="hidden md:flex w-52 shrink-0 flex-col border-r overflow-y-auto bg-background">
      {content}
    </aside>
  )
}
