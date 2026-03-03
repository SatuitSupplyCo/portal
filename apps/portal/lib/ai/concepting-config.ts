/**
 * Studio concepting provider configuration.
 *
 * When CONCEPTING_PROVIDER_ENABLED is not "true" or model is unavailable,
 * concept generation falls back to the local stub.
 */

import { AI_MODEL_ID } from './registry'

export const CONCEPTING_PROMPT_VERSION = 'concepting-v1'

export interface ConceptingProviderConfig {
  enabled: boolean
  modelId: string
  providerLabel: string
}

/**
 * Reads env-driven concepting provider config.
 * Use stub when enabled is false or keys are missing.
 */
export function getConceptingProviderConfig(): ConceptingProviderConfig {
  const enabled = process.env.CONCEPTING_PROVIDER_ENABLED === 'true'
  const modelId =
    process.env.CONCEPTING_MODEL_ID?.trim() ||
    AI_MODEL_ID
  return {
    enabled,
    modelId: modelId || AI_MODEL_ID,
    providerLabel: 'amazon-bedrock',
  }
}
