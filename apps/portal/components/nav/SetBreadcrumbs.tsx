"use client"

import { useShellBreadcrumbs, type Crumb } from "@/components/shell/ShellProvider"

/**
 * Thin client component that registers breadcrumbs for the current page.
 * Renders nothing — just a side-effect wrapper for server component pages.
 */
export function SetBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  useShellBreadcrumbs(crumbs)
  return null
}
