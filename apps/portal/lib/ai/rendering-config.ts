import { AI_MODEL_ID } from './registry';

export const RENDER_PROMPT_VERSION = 'render-v2';

export interface RenderingProviderConfig {
  enabled: boolean;
  modelId: string;
  providerLabel: string;
}

export function getRenderingProviderConfig(): RenderingProviderConfig {
  const enabled = process.env.RENDER_PROVIDER_ENABLED === 'true';
  const modelId = process.env.RENDER_MODEL_ID?.trim() || AI_MODEL_ID;
  return {
    enabled,
    modelId,
    providerLabel: 'amazon-bedrock',
  };
}
