import { createHash } from "node:crypto"

export type ConceptCardLite = {
  id: string
  title?: string
}

export type CompletedConceptJobLite = {
  id: string
  outputJson: unknown
}

export type InProgressConceptJobLite = {
  id: string
  status: "queued" | "running"
}

export function buildConceptContentHash(input: Record<string, unknown>): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex")
}

export function canReuseCompletedConceptOutput(outputJson: unknown): outputJson is { concepts: ConceptCardLite[] } {
  if (!outputJson || typeof outputJson !== "object" || Array.isArray(outputJson)) return false
  const row = outputJson as Record<string, unknown>
  return Array.isArray(row.concepts) && row.concepts.length > 0
}

export function evaluateConceptReuse(args: {
  forceNewJob?: boolean
  existingCompleted?: CompletedConceptJobLite | null
  existingInProgress?: InProgressConceptJobLite | null
}):
  | { action: "create_new" }
  | { action: "reuse_completed"; jobId: string; concepts: ConceptCardLite[] }
  | { action: "reject_in_progress"; message: string } {
  if (args.forceNewJob) return { action: "create_new" }

  if (args.existingCompleted && canReuseCompletedConceptOutput(args.existingCompleted.outputJson)) {
    return {
      action: "reuse_completed",
      jobId: args.existingCompleted.id,
      concepts: (args.existingCompleted.outputJson as { concepts: ConceptCardLite[] }).concepts,
    }
  }

  if (args.existingInProgress) {
    return {
      action: "reject_in_progress",
      message: `A matching concept job is already ${args.existingInProgress.status}.`,
    }
  }

  return { action: "create_new" }
}
