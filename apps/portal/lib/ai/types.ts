/**
 * Shared types for AI insight features.
 *
 * The `feature` discriminator lets a single API endpoint fan out
 * to different prompt builders as new AI touchpoints are added.
 */

// ─── Assortment Mix ─────────────────────────────────────────────────

export interface AssortmentMixContext {
  season: {
    code: string
    name: string
    type: string
    description: string | null
    launchDate: string | null
    targetSlotCount: number
  }
  dimension: {
    key: string
    label: string
    targets: Record<string, number>
    actuals: Record<string, number>
    labels: Record<string, string>
  }
  summary: {
    totalSlots: number
    filledSlots: number
    openSlots: number
  }
}

export interface AssortmentMixInsightRequest {
  feature: 'assortment-mix'
  mode: 'suggest' | 'critique'
  context: AssortmentMixContext
}

// ─── Union ──────────────────────────────────────────────────────────

export type InsightRequest = AssortmentMixInsightRequest
// Future: | ColorStrategyInsightRequest | SlotGapInsightRequest | ...
