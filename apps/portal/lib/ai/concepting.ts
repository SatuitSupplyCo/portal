/**
 * Studio concepting — prompt builder and response schema for provider-backed generation.
 * Keeps contract (ConceptJobOutputV1) in actions; this module is for prompts + structured output.
 */

import { z } from 'zod'

// ─── Response schema (matches AiConceptCard shape used in ConceptJobOutputV1) ───

export const aiConceptCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  rationale: z.string(),
  constructionIdeas: z.array(z.string()),
  graphicDirection: z.array(z.string()),
  colorDirection: z.array(z.string()),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
  safetyFlags: z.array(z.string()).optional(),
})

export const conceptingResponseSchema = z.object({
  concepts: z.array(aiConceptCardSchema),
})

export type ConceptingResponse = z.infer<typeof conceptingResponseSchema>

// ─── Prompt context (built from job input + inspiration entries) ───

export interface ConceptingPromptContext {
  inspirationTitles: string[]
  inspirationDescriptions: string[]
  numConcepts: number
  productTypeLabel?: string
  riskLevel?: string
  brandVoice?: string
  customerProfile?: string
}

const CONCEPTING_SYSTEM = `You are a product concept strategist for Satuit, a premium men's apparel brand.
You generate concise, commercially viable concept directions from Studio inspiration references.

Guidelines:
- Each concept must have a distinct title and rationale.
- constructionIdeas: 2–4 short bullets on construction/make details.
- graphicDirection: 2–4 short bullets on graphic/print placement and style.
- colorDirection: 2–4 short bullets on color story (anchor, support, accent).
- Use ids like "concept-1", "concept-2", etc.
- confidence: "low" | "medium" | "high". safetyFlags: array of strings (empty if none).
- Be specific and production-minded; avoid generic marketing fluff.`

export function buildConceptingPrompt(ctx: ConceptingPromptContext): {
  system: string
  prompt: string
} {
  const inspirationBlock =
    ctx.inspirationTitles.length > 0
      ? ctx.inspirationTitles
          .map((title, i) => {
            const desc = ctx.inspirationDescriptions[i]
            return desc
              ? `  - ${title}: ${desc}`
              : `  - ${title}`
          })
          .join('\n')
      : '  (no titles provided)'

  const productLine = ctx.productTypeLabel
    ? `Product focus: ${ctx.productTypeLabel}.`
    : ''
  const riskLine = ctx.riskLevel
    ? `Risk level: ${ctx.riskLevel}.`
    : ''
  const brandLine = ctx.brandVoice ? `Brand voice: ${ctx.brandVoice}.` : ''
  const customerLine = ctx.customerProfile
    ? `Customer: ${ctx.customerProfile}.`
    : ''

  const prompt = `Inspiration references:
${inspirationBlock}

${[productLine, riskLine, brandLine, customerLine].filter(Boolean).join(' ')}

Generate exactly ${ctx.numConcepts} distinct concept directions. Each must have id, title, rationale, constructionIdeas, graphicDirection, colorDirection, and optionally confidence and safetyFlags.`

  return { system: CONCEPTING_SYSTEM, prompt }
}
