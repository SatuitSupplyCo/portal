/**
 * Prompt builders for AI insight features.
 *
 * Each builder is a pure function: structured context in, strings out.
 * Keep them here so prompts are testable, versionable, and separate
 * from transport / UI concerns.
 */

import type { AssortmentMixContext } from './types'

// ─── System Prompt (shared across assortment features) ──────────────

const ASSORTMENT_SYSTEM = `You are a product assortment strategist for Satuit, a premium men's apparel brand.
You help merchandisers plan seasonal assortments across dimensions like Category (Tops, Outerwear, Bottoms, Swim & Performance), Construction, Weight Class, Selling Window, Tenure, Use Case, Gender, and Age Group.

Guidelines:
- Be concise and data-driven. Use bullet points or short tables.
- Refer to dimension values by their display labels, not codes.
- When suggesting allocations, ensure they sum to the target slot count.
- When critiquing, be specific about which values are over/under-allocated and why.
- Keep responses under 300 words.`

// ─── Assortment Mix ─────────────────────────────────────────────────

function formatTargets(
  targets: Record<string, number>,
  labels: Record<string, string>,
): string {
  const entries = Object.entries(targets).filter(([, v]) => v > 0)
  if (entries.length === 0) return 'No targets set yet.'
  return entries.map(([k, v]) => `  ${labels[k] ?? k}: ${v}`).join('\n')
}

function formatActuals(
  actuals: Record<string, number>,
  labels: Record<string, string>,
): string {
  const entries = Object.entries(actuals).filter(([, v]) => v > 0)
  if (entries.length === 0) return 'No slots allocated yet.'
  return entries.map(([k, v]) => `  ${labels[k] ?? k}: ${v}`).join('\n')
}

function formatLabels(labels: Record<string, string>): string {
  return Object.values(labels).join(', ')
}

export function buildAssortmentPrompt(
  mode: 'suggest' | 'critique',
  ctx: AssortmentMixContext,
): { system: string; prompt: string } {
  const { season, dimension, summary } = ctx

  const seasonLine = [
    `Season: ${season.name} (${season.code}, ${season.type})`,
    season.description ? `Direction: ${season.description}` : null,
    season.launchDate ? `Launch: ${season.launchDate}` : null,
    `Target slot count: ${season.targetSlotCount}`,
  ]
    .filter(Boolean)
    .join('\n')

  const summaryLine = `Slots: ${summary.totalSlots} total, ${summary.filledSlots} filled, ${summary.openSlots} open`

  if (mode === 'suggest') {
    const prompt = `${seasonLine}
${summaryLine}

Dimension: ${dimension.label}
Available values: ${formatLabels(dimension.labels)}

Current targets:
${formatTargets(dimension.targets, dimension.labels)}

Current actuals:
${formatActuals(dimension.actuals, dimension.labels)}

Suggest a target allocation for the "${dimension.label}" dimension that sums to ${season.targetSlotCount} slots. Explain your rationale briefly.`

    return { system: ASSORTMENT_SYSTEM, prompt }
  }

  const prompt = `${seasonLine}
${summaryLine}

Dimension: ${dimension.label}

Current targets:
${formatTargets(dimension.targets, dimension.labels)}

Current actuals:
${formatActuals(dimension.actuals, dimension.labels)}

Critique the current target mix for "${dimension.label}". Identify gaps, imbalances, or risks. If targets aren't set, say so and recommend setting them.`

  return { system: ASSORTMENT_SYSTEM, prompt }
}

// ─── Prompt Router ──────────────────────────────────────────────────

export type PromptResult = { system: string; prompt: string }

/**
 * Fan out to the right prompt builder based on feature key.
 * Extend this as new AI features are added.
 */
export function buildPrompt(
  feature: string,
  mode: string,
  context: unknown,
): PromptResult {
  switch (feature) {
    case 'assortment-mix':
      return buildAssortmentPrompt(
        mode as 'suggest' | 'critique',
        context as AssortmentMixContext,
      )
    default:
      throw new Error(`Unknown AI feature: ${feature}`)
  }
}
