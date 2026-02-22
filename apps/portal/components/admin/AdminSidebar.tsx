"use client"

import { SectionSidebar } from "@/components/shell/SectionSidebar"
import { adminSections } from "./admin-config"

export function AdminSidebar() {
  return (
    <SectionSidebar
      label="Admin"
      sheetTitle="Admin"
      rootHref="/admin"
      sections={adminSections}
    />
  )
}
