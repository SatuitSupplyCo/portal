/**
 * AI context distillation — generates concise briefs from strategy content.
 *
 * Called after brand context or collection strategy is saved.
 * The distilled brief is optimised for inclusion in assortment planning
 * prompts, preserving constraints and numerical targets while being concise.
 */

import { generateText } from 'ai'
import { insightModel } from './client'

const BRAND_SYSTEM = `You are a brand strategist assistant. Your job is to distill brand strategy documents into concise briefs that will be used as context for product assortment planning AI.

Rules:
- Output ONLY the brief, no preamble or labels.
- Preserve specific constraints, numerical targets, price points, and brand rules verbatim.
- Keep the brief under 200 words.
- Use short declarative sentences.
- Focus on information that would influence product mix, category allocation, and assortment decisions.`

const COLLECTION_SYSTEM = `You are a product strategy assistant. Your job is to distill collection strategy documents into concise briefs that will be used as context for product assortment planning AI.

Rules:
- Output ONLY the brief, no preamble or labels.
- Preserve the collection's purpose, design constraints, and role in the broader assortment.
- Keep the brief under 150 words.
- Use short declarative sentences.
- Focus on information that would influence how many slots this collection should get and what dimension mix it implies.`

interface BrandFields {
  positioning?: string | null
  targetCustomer?: string | null
  priceArchitecture?: string | null
  aestheticDirection?: string | null
  categoryStrategy?: string | null
  antiSpec?: string | null
}

interface CollectionFields {
  name: string
  description?: string | null
  intent?: string | null
  designMandate?: string | null
  brandingMandate?: string | null
  systemRole?: string | null
}

function buildBrandSourceText(fields: BrandFields): string | null {
  const parts = [
    fields.positioning && `Positioning: ${fields.positioning}`,
    fields.targetCustomer && `Target Customer: ${fields.targetCustomer}`,
    fields.priceArchitecture && `Price Architecture: ${fields.priceArchitecture}`,
    fields.aestheticDirection && `Aesthetic Direction: ${fields.aestheticDirection}`,
    fields.categoryStrategy && `Category Strategy: ${fields.categoryStrategy}`,
    fields.antiSpec && `Anti-Spec (what we avoid): ${fields.antiSpec}`,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join('\n\n') : null
}

function buildCollectionSourceText(fields: CollectionFields): string | null {
  const parts = [
    `Collection: ${fields.name}`,
    fields.description && `Description: ${fields.description}`,
    fields.intent && `Intent: ${fields.intent}`,
    fields.designMandate && `Design Mandate: ${fields.designMandate}`,
    fields.brandingMandate && `Branding Mandate: ${fields.brandingMandate}`,
    fields.systemRole && `System Role: ${fields.systemRole}`,
  ].filter(Boolean)

  return parts.length > 1 ? parts.join('\n\n') : null
}

export async function distillBrandContext(
  fields: BrandFields,
): Promise<string | null> {
  const sourceText = buildBrandSourceText(fields)
  if (!sourceText) return null

  const { text } = await generateText({
    model: insightModel,
    system: BRAND_SYSTEM,
    prompt: `Distill the following brand strategy into a concise brief:\n\n${sourceText}`,
    temperature: 0.2,
  })

  return text || null
}

export async function distillCollectionContext(
  fields: CollectionFields,
): Promise<string | null> {
  const sourceText = buildCollectionSourceText(fields)
  if (!sourceText) return null

  const { text } = await generateText({
    model: insightModel,
    system: COLLECTION_SYSTEM,
    prompt: `Distill the following collection strategy into a concise brief:\n\n${sourceText}`,
    temperature: 0.2,
  })

  return text || null
}
