// ─── Studio entry statuses ──────────────────────────────────────────

export const STUDIO_STATUS_COLORS: Record<string, string> = {
  raw: "bg-slate-100 text-slate-700",
  exploring: "bg-blue-100 text-blue-800",
  prototyping: "bg-violet-100 text-violet-800",
  ready_for_review: "bg-amber-100 text-amber-800",
  revisions_requested: "bg-red-100 text-red-700",
  promoted: "bg-emerald-100 text-emerald-800",
  linked: "bg-emerald-100 text-emerald-800",
  archived: "bg-gray-100 text-gray-500",
}

export const STUDIO_STATUS_LABELS: Record<string, string> = {
  raw: "Raw",
  exploring: "Exploring",
  prototyping: "Prototyping",
  ready_for_review: "In Review",
  revisions_requested: "Revisions",
  promoted: "Promoted",
  linked: "Linked",
  archived: "Archived",
}

// ─── Core program statuses ──────────────────────────────────────────

export const CORE_PROGRAM_STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800",
  retired: "bg-zinc-100 text-zinc-400",
}

// ─── Factory statuses ───────────────────────────────────────────────

export const FACTORY_STATUS_COLORS: Record<string, string> = {
  prospect: "bg-slate-100 text-slate-700",
  screening: "bg-yellow-100 text-yellow-800",
  sampling: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  active: "bg-green-100 text-green-800",
  dormant: "bg-gray-100 text-gray-500",
  rejected: "bg-red-100 text-red-800",
}
