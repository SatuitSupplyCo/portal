import { describe, expect, it } from "vitest"
import {
  buildConceptContentHash,
  canReuseCompletedConceptOutput,
  evaluateConceptReuse,
} from "./concept-policy"

describe("concept policy helpers", () => {
  it("creates stable content hash for same payload", () => {
    const payload = { schemaVersion: "1.0", inspirationEntryIds: ["a", "b"], generation: { numConcepts: 4 } }
    const a = buildConceptContentHash(payload)
    const b = buildConceptContentHash(payload)
    expect(a).toBe(b)
  })

  it("detects reusable completed output", () => {
    expect(canReuseCompletedConceptOutput({ concepts: [{ id: "c1" }] })).toBe(true)
    expect(canReuseCompletedConceptOutput({ concepts: [] })).toBe(false)
    expect(canReuseCompletedConceptOutput(null)).toBe(false)
  })

  it("reuses completed result when available and not forceNewJob", () => {
    const decision = evaluateConceptReuse({
      existingCompleted: {
        id: "job-1",
        outputJson: { concepts: [{ id: "c1", title: "One" }] },
      },
    })
    expect(decision.action).toBe("reuse_completed")
    if (decision.action === "reuse_completed") {
      expect(decision.jobId).toBe("job-1")
      expect(decision.concepts).toHaveLength(1)
    }
  })

  it("rejects duplicate in-progress jobs when no reusable completed result", () => {
    const decision = evaluateConceptReuse({
      existingInProgress: {
        id: "job-2",
        status: "running",
      },
    })
    expect(decision.action).toBe("reject_in_progress")
  })

  it("creates new when forceNewJob is true", () => {
    const decision = evaluateConceptReuse({
      forceNewJob: true,
      existingCompleted: {
        id: "job-1",
        outputJson: { concepts: [{ id: "c1" }] },
      },
    })
    expect(decision.action).toBe("create_new")
  })
})
