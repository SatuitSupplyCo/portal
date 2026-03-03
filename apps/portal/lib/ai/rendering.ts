import { z } from 'zod';

export const renderingResponseSchema = z.object({
  title: z.string(),
  modelCasting: z.string(),
  environment: z.string(),
  lighting: z.string(),
  camera: z.string(),
  stylingNotes: z.array(z.string()),
  postProcessing: z.array(z.string()),
});

export type RenderingResponse = z.infer<typeof renderingResponseSchema>;

export interface RenderingPromptContext {
  productType?: string;
  side?: 'front' | 'back';
  frontLayerCount: number;
  backLayerCount: number;
  textLayers: string[];
  colors: string[];
  hasSvgLayers: boolean;
  qualityPreset?: string;
  fitPreset?: string;
  stylingPreset?: string;
}

const RENDER_SYSTEM = `You are a fashion render director for Satuit.
Create a concise, production-ready creative brief for a photorealistic model render of a garment concept.
The output must be practical for an image-generation/rendering pipeline and internally consistent.
Do not include brand trademarks or unsafe/explicit content.`;

export function buildRenderingPrompt(ctx: RenderingPromptContext): {
  system: string;
  prompt: string;
} {
  const textHints =
    ctx.textLayers.length > 0 ? ctx.textLayers.map((s) => `- "${s}"`).join('\n') : '- (none)';
  const colorHints =
    ctx.colors.length > 0 ? ctx.colors.map((c) => `- ${c}`).join('\n') : '- (none)';

  const prompt = `Design snapshot summary:
- Product type: ${ctx.productType ?? 'unspecified'}
- Active side: ${ctx.side ?? 'front'}
- Front layers: ${ctx.frontLayerCount}
- Back layers: ${ctx.backLayerCount}
- Includes SVG graphics: ${ctx.hasSvgLayers ? 'yes' : 'no'}
- Quality preset: ${ctx.qualityPreset ?? 'photoreal-standard'}
- Fit preset: ${ctx.fitPreset ?? 'natural'}
- Styling preset: ${ctx.stylingPreset ?? 'editorial-clean'}

Text elements:
${textHints}

Color hints:
${colorHints}

Generate a render brief with:
- title
- modelCasting (fit + vibe)
- environment (location/set)
- lighting (setup)
- camera (framing/lens/pose direction)
- stylingNotes (3-6 bullets)
- postProcessing (2-4 bullets)`;

  return { system: RENDER_SYSTEM, prompt };
}
