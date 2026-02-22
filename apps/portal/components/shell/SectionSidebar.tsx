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
import { useShell } from "@/components/shell/ShellProvider"

export interface SidebarSection {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

interface SectionSidebarProps {
  label: string
  sheetTitle: string
  rootHref: string
  sections: SidebarSection[]
}

export function SectionSidebar({ label, sheetTitle, rootHref, sections }: SectionSidebarProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { sectionNavOpen, setSectionNavOpen } = useShell()

  const isSectionActive = (href: string) => {
    if (href === rootHref) return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  const closeMobile = () => { if (isMobile) setSectionNavOpen(false) }

  const content = (
    <nav className="px-3 py-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5 px-2">
        {label}
      </p>

      <ul className="flex flex-col gap-0.5">
        {sections.map((section) => {
          const isActive = isSectionActive(section.href)
          const Icon = section.icon

          return (
            <li key={section.href}>
              <Link
                href={section.href}
                onClick={closeMobile}
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
  )

  if (isMobile) {
    return (
      <Sheet open={sectionNavOpen} onOpenChange={setSectionNavOpen}>
        <SheetContent side="left" className="w-72 p-0 overflow-y-auto">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="text-sm">{sheetTitle}</SheetTitle>
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
