import { describe, expect, it } from "vitest"
import {
  readCollaborationApprovalMeta,
  writeCollaborationApprovalMeta,
} from "./collaboration-approval"

describe("collaboration approval meta", () => {
  const fixedNow = "2026-03-01T12:00:00.000Z"
  const fixedId = "evt-1"
  const opts = {
    nowIso: () => fixedNow,
    idGenerator: () => fixedId,
  }

  describe("readCollaborationApprovalMeta", () => {
    it("returns none state and empty events for empty or missing meta", () => {
      expect(readCollaborationApprovalMeta(null, opts)).toEqual({
        state: "none",
        requestedAt: undefined,
        requestedBy: undefined,
        decidedAt: undefined,
        decidedBy: undefined,
        note: undefined,
        events: [],
      })
      expect(readCollaborationApprovalMeta({}, opts)).toEqual({
        state: "none",
        requestedAt: undefined,
        requestedBy: undefined,
        decidedAt: undefined,
        decidedBy: undefined,
        note: undefined,
        events: [],
      })
    })

    it("normalizes state to valid enum or none", () => {
      expect(
        readCollaborationApprovalMeta(
          { collaborationApproval: { state: "requested" } },
          opts,
        ).state,
      ).toBe("requested")
      expect(
        readCollaborationApprovalMeta(
          { collaborationApproval: { state: "approved" } },
          opts,
        ).state,
      ).toBe("approved")
      expect(
        readCollaborationApprovalMeta(
          { collaborationApproval: { state: "revisions_requested" } },
          opts,
        ).state,
      ).toBe("revisions_requested")
      expect(
        readCollaborationApprovalMeta(
          { collaborationApproval: { state: "invalid" } },
          opts,
        ).state,
      ).toBe("none")
    })

    it("normalizes events: type to requested/approved/revisions_requested, defaults for missing fields", () => {
      const meta = {
        collaborationApproval: {
          state: "requested",
          events: [
            {
              id: "e1",
              type: "approved",
              note: "LGTM",
              byUserId: "u1",
              byLabel: "Alice",
              at: "2026-02-28T00:00:00.000Z",
            },
            {
              type: "revisions_requested",
              byUserId: "u2",
              // missing id, byLabel, at
            },
            { type: "invalid_type" },
            null,
            "string",
          ],
        },
      }
      const result = readCollaborationApprovalMeta(meta, opts)
      expect(result.events).toHaveLength(3)
      expect(result.events[0]).toEqual({
        id: "e1",
        type: "approved",
        note: "LGTM",
        byUserId: "u1",
        byLabel: "Alice",
        at: "2026-02-28T00:00:00.000Z",
      })
      expect(result.events[1]).toMatchObject({
        id: fixedId,
        type: "revisions_requested",
        byUserId: "u2",
        byLabel: "Unknown",
        at: fixedNow,
      })
      expect(result.events[2]).toMatchObject({
        id: fixedId,
        type: "requested",
        byUserId: "unknown",
        byLabel: "Unknown",
        at: fixedNow,
      })
    })

    it("preserves requestedAt, requestedBy, decidedAt, decidedBy, note when present", () => {
      const meta = {
        collaborationApproval: {
          state: "approved",
          requestedAt: "2026-02-27T00:00:00.000Z",
          requestedBy: "req-user",
          decidedAt: "2026-03-01T00:00:00.000Z",
          decidedBy: "dec-user",
          note: "Approved for production",
          events: [],
        },
      }
      expect(readCollaborationApprovalMeta(meta, opts)).toMatchObject({
        state: "approved",
        requestedAt: "2026-02-27T00:00:00.000Z",
        requestedBy: "req-user",
        decidedAt: "2026-03-01T00:00:00.000Z",
        decidedBy: "dec-user",
        note: "Approved for production",
        events: [],
      })
    })
  })

  describe("writeCollaborationApprovalMeta", () => {
    it("merges approval into meta and caps events at 50", () => {
      const existing = { otherKey: "value" }
      const events = Array.from({ length: 60 }, (_, i) => ({
        id: `evt-${i}`,
        type: "requested" as const,
        byUserId: "u",
        byLabel: "User",
        at: "2026-03-01T00:00:00.000Z",
      }))
      const approval = {
        state: "requested" as const,
        requestedAt: "2026-03-01T12:00:00.000Z",
        requestedBy: "u1",
        events,
      }
      const out = writeCollaborationApprovalMeta(existing, approval)
      expect(out).toHaveProperty("otherKey", "value")
      expect(out.collaborationApproval).toMatchObject({
        state: "requested",
        requestedAt: "2026-03-01T12:00:00.000Z",
        requestedBy: "u1",
      })
      const writtenEvents = (out.collaborationApproval as { events: unknown[] }).events
      expect(writtenEvents).toHaveLength(50)
      expect(writtenEvents[0]).toMatchObject({ id: "evt-10" })
      expect(writtenEvents[49]).toMatchObject({ id: "evt-59" })
    })

    it("preserves other meta keys and overwrites collaborationApproval", () => {
      const meta = { foo: 1, collaborationApproval: { state: "none", events: [] } }
      const approval = {
        state: "approved" as const,
        decidedAt: "2026-03-01T00:00:00.000Z",
        decidedBy: "u1",
        events: [],
      }
      const out = writeCollaborationApprovalMeta(meta, approval)
      expect(out).toMatchObject({ foo: 1 })
      expect((out as { collaborationApproval: { state: string } }).collaborationApproval.state).toBe(
        "approved",
      )
    })

    it("handles null/undefined meta", () => {
      const approval = {
        state: "none" as const,
        events: [],
      }
      expect(writeCollaborationApprovalMeta(null, approval)).toMatchObject({
        collaborationApproval: { state: "none", events: [] },
      })
      expect(writeCollaborationApprovalMeta(undefined, approval)).toMatchObject({
        collaborationApproval: { state: "none", events: [] },
      })
    })
  })
})
