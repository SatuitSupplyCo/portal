"use client"

import { SectionSidebar } from "@/components/shell/SectionSidebar"
import { studioSections } from "./studio-config"

export function StudioSidebar() {
  return (
    <SectionSidebar
      label="Studio"
      sheetTitle="Satuit Studio"
      rootHref="/internal/studio"
      sections={studioSections}
    />
  )
}
