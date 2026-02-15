"use client"

import { useEffect, type ReactNode } from "react"
import { PanelRightOpen } from "lucide-react"
import { Button } from "@repo/ui/button"
import {
  useShellBreadcrumbs,
  useShell,
  type Crumb,
} from "@/components/shell/ShellProvider"

// ─── Types ───────────────────────────────────────────────────────────

interface DocPageShellProps {
  /** Breadcrumb trail for this document */
  breadcrumbs: Crumb[]
  /** Content for the right rail when opened */
  rightRailContent?: ReactNode
  /** Children rendered as the page body */
  children: ReactNode
}

// ─── Component ───────────────────────────────────────────────────────

export function DocPageShell({
  breadcrumbs,
  rightRailContent,
  children,
}: DocPageShellProps) {
  // Register breadcrumbs (auto-cleanup on unmount)
  useShellBreadcrumbs(breadcrumbs)

  // Register actions and right rail content
  const { setActions, setRightRailContent, setRightRailOpen } = useShell()

  useEffect(() => {
    // Register the right rail toggle button as an action
    if (rightRailContent) {
      setRightRailContent(rightRailContent)
      setActions(
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setRightRailOpen(true)}
        >
          <PanelRightOpen className="h-4 w-4" />
          <span className="sr-only">Open details</span>
        </Button>,
      )
    }

    return () => {
      setActions(null)
      setRightRailContent(null)
      setRightRailOpen(false)
    }
  }, [rightRailContent, setActions, setRightRailContent, setRightRailOpen])

  return <>{children}</>
}
