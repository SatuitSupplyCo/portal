import { randomUUID } from "node:crypto"

export type CollaborationApprovalState =
  | "none"
  | "requested"
  | "approved"
  | "revisions_requested"

export type CollaborationApprovalEvent = {
  id: string
  type: "requested" | "approved" | "revisions_requested"
  note?: string
  byUserId: string
  byLabel: string
  at: string
}

export type CollaborationApprovalPayload = {
  state: CollaborationApprovalState
  requestedAt?: string
  requestedBy?: string
  decidedAt?: string
  decidedBy?: string
  note?: string
  events: CollaborationApprovalEvent[]
}

const DEFAULT_NOW_ISO = (): string => new Date().toISOString()
const DEFAULT_ID = (): string => randomUUID()

export function readCollaborationApprovalMeta(
  meta: Record<string, unknown> | null | undefined,
  options?: { nowIso?: () => string; idGenerator?: () => string },
): CollaborationApprovalPayload {
  const now = options?.nowIso ?? DEFAULT_NOW_ISO
  const idGen = options?.idGenerator ?? DEFAULT_ID

  const raw =
    meta &&
    typeof meta.collaborationApproval === "object" &&
    meta.collaborationApproval !== null
      ? (meta.collaborationApproval as Record<string, unknown>)
      : {}
  const rawEvents = Array.isArray(raw.events) ? raw.events : []
  const events: CollaborationApprovalEvent[] = rawEvents
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : idGen(),
      type:
        item.type === "approved"
          ? "approved"
          : item.type === "revisions_requested"
            ? "revisions_requested"
            : "requested",
      note: typeof item.note === "string" ? item.note : undefined,
      byUserId: typeof item.byUserId === "string" ? item.byUserId : "unknown",
      byLabel: typeof item.byLabel === "string" ? item.byLabel : "Unknown",
      at: typeof item.at === "string" ? item.at : now(),
    }))
  return {
    state:
      raw.state === "requested" ||
      raw.state === "approved" ||
      raw.state === "revisions_requested"
        ? raw.state
        : "none",
    requestedAt: typeof raw.requestedAt === "string" ? raw.requestedAt : undefined,
    requestedBy: typeof raw.requestedBy === "string" ? raw.requestedBy : undefined,
    decidedAt: typeof raw.decidedAt === "string" ? raw.decidedAt : undefined,
    decidedBy: typeof raw.decidedBy === "string" ? raw.decidedBy : undefined,
    note: typeof raw.note === "string" ? raw.note : undefined,
    events,
  }
}

export function writeCollaborationApprovalMeta(
  meta: Record<string, unknown> | null | undefined,
  approval: CollaborationApprovalPayload,
): Record<string, unknown> {
  const base = meta && typeof meta === "object" ? { ...meta } : {}
  return {
    ...base,
    collaborationApproval: {
      state: approval.state,
      requestedAt: approval.requestedAt,
      requestedBy: approval.requestedBy,
      decidedAt: approval.decidedAt,
      decidedBy: approval.decidedBy,
      note: approval.note,
      events: approval.events.slice(-50),
    },
  }
}
