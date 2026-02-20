/**
 * AI feature registry — metadata for every registered AI feature.
 *
 * Rendered in the admin AI page as a prompt/config reference.
 * Keep this in sync when adding new features to prompts.ts.
 */

export interface AiFeatureEntry {
  feature: string
  modes: string[]
  description: string
  systemPrompt: string
  temperature: number
  responseType: string
}

export const aiFeatureRegistry: AiFeatureEntry[] = [
  {
    feature: 'assortment-mix',
    modes: ['suggest', 'critique'],
    description: 'Target allocation and mix critique for season dimensions',
    systemPrompt: `You are a product assortment strategist for Satuit, a premium men's apparel brand.
You help merchandisers plan seasonal assortments across dimensions like Category (Tops, Outerwear, Bottoms, Swim & Performance), Construction, Weight Class, Selling Window, Tenure, Use Case, Gender, and Age Group.

Guidelines:
- Be concise and data-driven.
- Refer to dimension values by their display labels, not codes.
- When suggesting allocations, ensure they sum to the target slot count.
- When critiquing, be specific about which values are over/under-allocated and why.
- Keep responses under 300 words.`,
    temperature: 0.4,
    responseType: 'structured (suggest) / streaming text (critique)',
  },
  {
    feature: 'field-suggestion',
    modes: ['suggest'],
    description: 'Generate text suggestions for form fields',
    systemPrompt: `You are a creative strategist for Satuit, a premium men's apparel brand.
You help merchandisers craft compelling, concise text for planning fields — season descriptions, collection themes, product narratives, etc.

Guidelines:
- Write in a confident, editorial tone appropriate for an internal planning tool.
- Be specific and evocative — avoid generic marketing language.
- Each suggestion should take a distinct creative angle.
- Keep suggestions concise (1–2 sentences max).`,
    temperature: 0.4,
    responseType: 'structured',
  },
]

export const AI_MODEL_ID = 'us.anthropic.claude-3-5-sonnet-20241022-v2:0'
export const AI_PROVIDER = 'Amazon Bedrock'
