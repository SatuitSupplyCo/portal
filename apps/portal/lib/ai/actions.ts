'use server'

import { auth } from '@repo/auth'
import { db } from '@repo/db/client'
import { aiSuggestionLog } from '@repo/db/schema'

export async function logAiSuggestion(data: {
  feature: string
  fieldName?: string
  context: Record<string, unknown>
  suggestions: Array<{ value: string; rationale: string }>
  selectedValue?: string
  outcome: 'selected' | 'rejected' | 'regenerated'
  inputTokens?: number | null
  outputTokens?: number | null
  latencyMs?: number | null
}): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  await db.insert(aiSuggestionLog).values({
    feature: data.feature,
    fieldName: data.fieldName ?? null,
    context: data.context,
    suggestions: data.suggestions,
    selectedValue: data.selectedValue ?? null,
    outcome: data.outcome,
    inputTokens: data.inputTokens ?? null,
    outputTokens: data.outputTokens ?? null,
    latencyMs: data.latencyMs ?? null,
    userId: session.user.id,
  })
}
