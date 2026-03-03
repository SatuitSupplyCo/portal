export function getNextDesignVersionNumber(latestVersion?: number | null): number {
  const base = typeof latestVersion === "number" && Number.isFinite(latestVersion) ? latestVersion : 0
  return Math.max(0, Math.floor(base)) + 1
}

export function canRequestCollaborationApproval(status: string): boolean {
  return ["raw", "exploring", "prototyping", "revisions_requested"].includes(status)
}

export function canDecideCollaborationApproval(status: string): boolean {
  return status === "ready_for_review"
}

export function resolveStatusAfterCollaborationDecision(
  decision: "approved" | "revisions_requested",
): "ready_for_review" | "revisions_requested" {
  return decision === "approved" ? "ready_for_review" : "revisions_requested"
}
