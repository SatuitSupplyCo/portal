"use client"

import { Info } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@repo/ui"

type GlossaryEntry = { slug: string; term: string; definition: string }

/**
 * Inline info icon that shows a glossary definition on hover.
 *
 * Accepts either a pre-resolved `definition` string or a glossary entry
 * looked up from the DB. The `glossary` prop is a slug→entry map passed
 * down from a server component so this client component needs no fetch.
 */
export function InfoTooltip({
  slug,
  glossary,
  definition,
  side = "top",
}: {
  slug: string
  glossary?: Record<string, GlossaryEntry>
  definition?: string
  side?: "top" | "right" | "bottom" | "left"
}) {
  const entry = glossary?.[slug]
  const text = definition ?? entry?.definition
  if (!text) return null

  const label = entry?.term ?? slug

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center align-middle text-[var(--depot-faint)] hover:text-[var(--depot-muted)] transition-colors cursor-help"
          aria-label={`What is ${label}?`}
        >
          <Info className="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={6} className="max-w-72 text-xs leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}

export type { GlossaryEntry }
