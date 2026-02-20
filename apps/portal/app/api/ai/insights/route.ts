import { streamText, generateObject } from 'ai'
import { auth } from '@repo/auth'
import { insightModel } from '@/lib/ai/client'
import { buildPrompt } from '@/lib/ai/prompts'
import { suggestResponseSchema, fieldSuggestResponseSchema } from '@/lib/ai/types'

export const maxDuration = 30

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await req.json()
  const { feature, mode, context } = body ?? {}

  if (!feature || !mode || !context) {
    return new Response('Missing feature, mode, or context', { status: 400 })
  }

  let prompt: { system: string; prompt: string }
  try {
    prompt = buildPrompt(feature, mode, context)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid request'
    return new Response(message, { status: 400 })
  }

  const startTime = Date.now()

  try {
    if (mode === 'suggest') {
      const schema = feature === 'field-suggestion'
        ? fieldSuggestResponseSchema
        : suggestResponseSchema

      const result = await generateObject({
        model: insightModel,
        schema,
        system: prompt.system,
        prompt: prompt.prompt,
        temperature: 0.4,
      })

      if (!result.object) {
        console.error('[ai/insights] Empty structured response from model')
        return new Response('Empty response from AI model', { status: 502 })
      }

      const latencyMs = Date.now() - startTime
      const usage = result.usage

      return Response.json({
        ...result.object,
        _usage: {
          inputTokens: usage?.inputTokens ?? null,
          outputTokens: usage?.outputTokens ?? null,
          latencyMs,
        },
      })
    }

    const result = streamText({
      model: insightModel,
      system: prompt.system,
      prompt: prompt.prompt,
      temperature: 0.4,
    })

    const text = await result.text
    if (!text) {
      console.error('[ai/insights] Empty response from model')
      return new Response('Empty response from AI model', { status: 502 })
    }
    return new Response(text)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'AI generation failed'
    const full = e instanceof Error ? e.stack ?? e.message : String(e)
    console.error('[ai/insights]', full)
    return new Response(msg, { status: 502 })
  }
}
