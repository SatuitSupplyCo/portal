/**
 * Shared types for AI insight features.
 *
 * The `feature` discriminator lets a single API endpoint fan out
 * to different prompt builders as new AI touchpoints are added.
 */

import { z } from 'zod'

// ─── Assortment Mix ─────────────────────────────────────────────────

export interface AssortmentMixContext {
  season: {
    code: string
    name: string
    type: string
    description: string | null
    launchDate: string | null
    targetSlotCount: number
    marginTarget: number | null
    targetEvergreenPct: number | null
  }
  dimension: {
    key: string
    label: string
    targets: Record<string, number>
    actuals: Record<string, number>
    labels: Record<string, string>
  }
  allDimensionTargets?: Record<string, Record<string, number>>
  summary: {
    totalSlots: number
    filledSlots: number
    openSlots: number
  }
  brandBrief?: string | null
  collectionBriefs?: Array<{
    name: string
    brief: string
    slotCount: number
  }>
  feedback?: Array<{
    key: string
    label: string
    suggestedValue: number
    status: 'accepted' | 'rejected'
    rationale?: string
  }>
}

export interface AssortmentMixInsightRequest {
  feature: 'assortment-mix'
  mode: 'suggest' | 'critique'
  context: AssortmentMixContext
}

// ─── Structured Suggest Response ────────────────────────────────────

export const suggestResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      value: z.number(),
      rationale: z.string(),
    }),
  ),
  summary: z.string(),
})

export type SuggestResponse = z.infer<typeof suggestResponseSchema>

// ─── Union ──────────────────────────────────────────────────────────

export type InsightRequest = AssortmentMixInsightRequest
// Future: | ColorStrategyInsightRequest | SlotGapInsightRequest | ...
