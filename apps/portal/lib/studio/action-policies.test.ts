import { describe, expect, it } from "vitest"
import {
  canDecideCollaborationApproval,
  canRequestCollaborationApproval,
  getNextDesignVersionNumber,
  resolveStatusAfterCollaborationDecision,
} from "./action-policies"

describe("studio action policies", () => {
  it("computes next design version safely", () => {
    expect(getNextDesignVersionNumber(undefined)).toBe(1)
    expect(getNextDesignVersionNumber(null)).toBe(1)
    expect(getNextDesignVersionNumber(0)).toBe(1)
    expect(getNextDesignVersionNumber(7)).toBe(8)
    expect(getNextDesignVersionNumber(3.9)).toBe(4)
  })

  it("validates request approval status transitions", () => {
    expect(canRequestCollaborationApproval("raw")).toBe(true)
    expect(canRequestCollaborationApproval("exploring")).toBe(true)
    expect(canRequestCollaborationApproval("prototyping")).toBe(true)
    expect(canRequestCollaborationApproval("revisions_requested")).toBe(true)
    expect(canRequestCollaborationApproval("ready_for_review")).toBe(false)
    expect(canRequestCollaborationApproval("promoted")).toBe(false)
  })

  it("validates decision status transitions", () => {
    expect(canDecideCollaborationApproval("ready_for_review")).toBe(true)
    expect(canDecideCollaborationApproval("raw")).toBe(false)
  })

  it("resolves collaboration decision to status", () => {
    expect(resolveStatusAfterCollaborationDecision("approved")).toBe("ready_for_review")
    expect(resolveStatusAfterCollaborationDecision("revisions_requested")).toBe("revisions_requested")
  })
})
