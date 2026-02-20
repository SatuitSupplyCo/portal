/**
 * Prompt builders for AI insight features.
 *
 * Each builder is a pure function: structured context in, strings out.
 * Keep them here so prompts are testable, versionable, and separate
 * from transport / UI concerns.
 */

import type { AssortmentMixContext, FieldSuggestionContext } from './types'

// ─── System Prompt (shared across assortment features) ──────────────

const ASSORTMENT_SYSTEM = `You are a product assortment strategist for Satuit, a premium men's apparel brand.
You help merchandisers plan seasonal assortments across dimensions like Category (Tops, Outerwear, Bottoms, Swim & Performance), Construction, Weight Class, Selling Window, Tenure, Use Case, Gender, and Age Group.

Guidelines:
- Be concise and data-driven.
- Refer to dimension values by their display labels, not codes.
- When suggesting allocations, ensure they sum to the target slot count.
- When critiquing, be specific about which values are over/under-allocated and why.
- Keep responses under 300 words.`

// ─── Formatting Helpers ─────────────────────────────────────────────

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

function formatKeyLabelMap(labels: Record<string, string>): string {
  return Object.entries(labels)
    .map(([key, label]) => `  "${key}" = "${label}"`)
    .join('\n')
}

function formatSeasonBlock(season: AssortmentMixContext['season']): string {
  const lines = [
    `Season: ${season.name} (${season.code}, ${season.type})`,
    season.description ? `Direction: ${season.description}` : null,
    season.launchDate ? `Launch: ${season.launchDate}` : null,
    `Target slot count: ${season.targetSlotCount}`,
    season.marginTarget != null ? `Margin target: ${season.marginTarget}%` : null,
    season.targetEvergreenPct != null ? `Evergreen target: ${season.targetEvergreenPct}%` : null,
  ]
  return lines.filter(Boolean).join('\n')
}

function formatSummaryBlock(summary: AssortmentMixContext['summary']): string {
  return `Slots: ${summary.totalSlots} total, ${summary.filledSlots} filled, ${summary.openSlots} open`
}

function formatBrandBrief(brief: string | null | undefined): string {
  if (!brief) return ''
  return `\nBrand context:\n${brief}\n`
}

function formatCollectionBriefs(
  briefs: AssortmentMixContext['collectionBriefs'],
): string {
  if (!briefs || briefs.length === 0) return ''
  const lines = briefs.map(
    (c) => `  ${c.name} (${c.slotCount} slots): ${c.brief}`,
  )
  return `\nCollections in this season:\n${lines.join('\n')}\n`
}

function formatOtherDimTargets(
  allTargets: Record<string, Record<string, number>> | undefined,
  currentDimKey: string,
): string {
  if (!allTargets) return ''
  const others = Object.entries(allTargets).filter(
    ([key]) => key !== currentDimKey,
  )
  if (others.length === 0) return ''
  const lines = others.map(([key, targets]) => {
    const vals = Object.entries(targets)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')
    return vals ? `  ${key}: ${vals}` : null
  }).filter(Boolean)
  if (lines.length === 0) return ''
  return `\nOther dimension targets already set:\n${lines.join('\n')}\n`
}

function formatFeedback(
  feedback: AssortmentMixContext['feedback'],
): string {
  if (!feedback || feedback.length === 0) return ''
  const lines = feedback.map((f) => {
    const status = f.status === 'accepted' ? 'accepted' : 'rejected'
    const reason = f.rationale ? ` — "${f.rationale}"` : ''
    return `  ${f.label}: ${f.suggestedValue} slots (${status}${reason})`
  })
  return `\nPrevious suggestion feedback from the user:\n${lines.join('\n')}\nIncorporate this feedback: keep accepted allocations close to their values, reallocate away from rejected items, and respect any stated reasons.\n`
}

// ─── Assortment Mix Prompts ─────────────────────────────────────────

export function buildAssortmentPrompt(
  mode: 'suggest' | 'critique',
  ctx: AssortmentMixContext,
): { system: string; prompt: string } {
  const { season, dimension, summary } = ctx

  const seasonBlock = formatSeasonBlock(season)
  const summaryBlock = formatSummaryBlock(summary)
  const brandBlock = formatBrandBrief(ctx.brandBrief)
  const collectionBlock = formatCollectionBriefs(ctx.collectionBriefs)
  const otherDimsBlock = formatOtherDimTargets(ctx.allDimensionTargets, dimension.key)

  if (mode === 'suggest') {
    const feedbackBlock = formatFeedback(ctx.feedback)

    const prompt = `${seasonBlock}
${summaryBlock}
${brandBlock}${collectionBlock}${otherDimsBlock}
Dimension: ${dimension.label}
Available values (key = display label):
${formatKeyLabelMap(dimension.labels)}

Current targets:
${formatTargets(dimension.targets, dimension.labels)}

Current actuals:
${formatActuals(dimension.actuals, dimension.labels)}
${feedbackBlock}
Suggest a target allocation for the "${dimension.label}" dimension that sums to ${season.targetSlotCount} slots. For each value, use the exact key from the "Available values" list above and provide a brief rationale.`

    return { system: ASSORTMENT_SYSTEM, prompt }
  }

  const prompt = `${seasonBlock}
${summaryBlock}
${brandBlock}${collectionBlock}${otherDimsBlock}
Dimension: ${dimension.label}

Current targets:
${formatTargets(dimension.targets, dimension.labels)}

Current actuals:
${formatActuals(dimension.actuals, dimension.labels)}

Critique the current target mix for "${dimension.label}". Identify gaps, imbalances, or risks. If targets aren't set, say so and recommend setting them.`

  return { system: ASSORTMENT_SYSTEM, prompt }
}

// ─── Field Suggestion Prompts ────────────────────────────────────────

const FIELD_SUGGESTION_SYSTEM = `You are a creative strategist for Satuit, a premium men's apparel brand.
You help merchandisers craft compelling, concise text for planning fields — season descriptions, collection themes, product narratives, etc.

Guidelines:
- Write in a confident, editorial tone appropriate for an internal planning tool.
- Be specific and evocative — avoid generic marketing language.
- Each suggestion should take a distinct creative angle.
- Keep suggestions concise (1–2 sentences max).`

export function buildFieldSuggestionPrompt(
  ctx: FieldSuggestionContext,
): { system: string; prompt: string } {
  const count = ctx.optionCount ?? 2
  const brandBlock = ctx.brandBrief
    ? `\nBrand context:\n${ctx.brandBrief}\n`
    : ''

  const formLines = Object.entries(ctx.formContext)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n')
  const formBlock = formLines ? `\nForm values:\n${formLines}\n` : ''

  const currentBlock = ctx.currentValue
    ? `\nCurrent value: "${ctx.currentValue}"\n`
    : ''

  const rejectedBlock =
    ctx.rejectedSuggestions && ctx.rejectedSuggestions.length > 0
      ? `\nPreviously rejected suggestions (do NOT repeat these or closely similar ideas):\n${ctx.rejectedSuggestions.map((s) => `  - "${s}"`).join('\n')}\n`
      : ''

  const prompt = `${brandBlock}${formBlock}${currentBlock}${rejectedBlock}
Generate exactly ${count} distinct suggestions for the "${ctx.fieldLabel}" field.
Each suggestion should be a complete value ready to use in the form.
Return each with a brief rationale explaining the creative angle.`

  return { system: FIELD_SUGGESTION_SYSTEM, prompt }
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
    case 'field-suggestion':
      return buildFieldSuggestionPrompt(context as FieldSuggestionContext)
    default:
      throw new Error(`Unknown AI feature: ${feature}`)
  }
}
