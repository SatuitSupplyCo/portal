/**
 * AI provider configuration.
 *
 * Centralised so every feature imports the model from here.
 * To swap providers, change the import and the model ID — nothing
 * else in the codebase needs to change.
 *
 * Auth: Bedrock API key via AWS_BEARER_TOKEN_BEDROCK env var.
 */

import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock'

const bedrock = createAmazonBedrock({
  region: process.env.AWS_REGION ?? 'us-east-1',
})

export const insightModel = bedrock('us.anthropic.claude-3-5-sonnet-20241022-v2:0')
