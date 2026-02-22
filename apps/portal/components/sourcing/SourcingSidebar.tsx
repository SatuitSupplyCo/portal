"use client"

import { SectionSidebar } from "@/components/shell/SectionSidebar"
import { sourcingSections } from "./sourcing-config"

export function SourcingSidebar() {
  return (
    <SectionSidebar
      label="Sourcing"
      sheetTitle="Sourcing CRM"
      rootHref="/internal/sourcing"
      sections={sourcingSections}
    />
  )
}
