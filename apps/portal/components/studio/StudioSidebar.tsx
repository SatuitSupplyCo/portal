"use client"

import { useMemo } from "react"
import { SectionSidebar } from "@/components/shell/SectionSidebar"
import { studioSections } from "./studio-config"

const CONCEPTING_HREF = "/internal/studio/concepting"
const DESIGN_HREF = "/internal/studio/design"

export function StudioSidebar({
  conceptingEnabled = true,
  designEnabled = true,
}: {
  conceptingEnabled?: boolean
  designEnabled?: boolean
}) {
  const sections = useMemo(() => {
    let next = studioSections
    if (!conceptingEnabled) {
      next = next.filter((s) => s.href !== CONCEPTING_HREF)
    }
    if (!designEnabled) {
      next = next.filter((s) => s.href !== DESIGN_HREF)
    }
    return next
  }, [conceptingEnabled, designEnabled])
  return (
    <SectionSidebar
      label="Studio"
      sheetTitle="Satuit Studio"
      rootHref="/internal/studio"
      sections={sections}
    />
  )
}
