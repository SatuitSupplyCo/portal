import type { ReactNode } from "react"

interface SectionNavPanelProps {
  children: ReactNode
}

export function SectionNavPanel({ children }: SectionNavPanelProps) {
  return (
    <aside className="hidden lg:block w-60 shrink-0 border-r overflow-y-auto bg-muted/20">
      {children}
    </aside>
  )
}
