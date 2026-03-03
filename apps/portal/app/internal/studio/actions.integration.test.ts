import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
  const schema = {
    studioEntries: Symbol("studioEntries"),
    seasons: Symbol("seasons"),
    seasonColors: Symbol("seasonColors"),
    seasonSlots: Symbol("seasonSlots"),
    collections: Symbol("collections"),
    conceptJobs: Symbol("conceptJobs"),
    conceptJobAcceptances: Symbol("conceptJobAcceptances"),
    studioDesignVersions: Symbol("studioDesignVersions"),
    renderJobs: Symbol("renderJobs"),
    assets: Symbol("assets"),
    assetVersions: Symbol("assetVersions"),
  }

  const insertReturningQueue: Array<Array<Record<string, unknown>>> = []
  const updateReturningQueue: Array<Array<Record<string, unknown>>> = []

  const db = {
    query: {
      studioEntries: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      conceptJobs: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      studioDesignVersions: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      renderJobs: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      assets: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn((table: symbol) => {
      if (table === schema.conceptJobAcceptances) {
        return {
          values: vi.fn(async () => []),
        }
      }
      return {
        values: vi.fn(() => ({
          returning: vi.fn(async () => insertReturningQueue.shift() ?? []),
        })),
      }
    }),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(async () => updateReturningQueue.shift() ?? []),
        })),
      })),
    })),
  }

  return {
    schema,
    db,
    insertReturningQueue,
    updateReturningQueue,
    hasPermission: vi.fn(() => true),
    getSessionUser: vi.fn(async () => ({
      id: "user-1",
      email: "designer@example.com",
      name: "Designer",
      role: "designer",
    })),
    revalidatePath: vi.fn(),
  }
})

vi.mock("@repo/db/client", () => ({ db: mocks.db }))
vi.mock("@repo/db/schema", () => mocks.schema)
vi.mock("@/lib/permissions", () => ({ hasPermission: mocks.hasPermission }))
vi.mock("@/lib/session", () => ({ getSessionUser: mocks.getSessionUser }))
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock("ai", () => ({
  generateObject: vi.fn(async () => ({
    object: { concepts: [], images: [] },
    usage: { inputTokens: 1, outputTokens: 1 },
  })),
}))
vi.mock("@/lib/studio/render-assets", () => ({
  persistRenderOutputImages: vi.fn(async ({ imageEntries }: { imageEntries: unknown[] }) => imageEntries),
}))

import {
  acceptConceptDirection,
  createRenderJob,
  processRenderJob,
  saveStudioDesignVersion,
} from "./actions"

describe("studio actions integration-lite", () => {
  const validUuidA = "11111111-1111-4111-8111-111111111111"
  const validUuidB = "22222222-2222-4222-8222-222222222222"
  const validUuidC = "33333333-3333-4333-8333-333333333333"

  beforeEach(() => {
    mocks.insertReturningQueue.length = 0
    mocks.updateReturningQueue.length = 0
    vi.clearAllMocks()
    mocks.hasPermission.mockReturnValue(true)
  })

  it("saves a studio design version with incremented version number", async () => {
    mocks.db.query.studioEntries.findFirst.mockResolvedValueOnce({ id: validUuidA })
    mocks.db.query.studioDesignVersions.findMany.mockResolvedValueOnce([{ version: 2 }])
    mocks.insertReturningQueue.push([{ id: validUuidB }])

    const result = await saveStudioDesignVersion(validUuidA, { side: "front", frontLayers: [] })

    expect(result.success).toBe(true)
    expect(result.data?.version).toBe(3)
    expect(result.data?.versionId).toBe(validUuidB)
  })

  it("accepts a generated concept into a new studio entry", async () => {
    mocks.db.query.conceptJobs.findFirst.mockResolvedValueOnce({
      id: validUuidA,
      status: "completed",
      createdBy: "user-1",
      outputJson: {
        concepts: [
          {
            id: "concept-1",
            title: "Relaxed tee concept",
            rationale: "A balanced direction.",
            constructionIdeas: [],
            graphicDirection: [],
            colorDirection: [],
            confidence: "medium",
            safetyFlags: [],
          },
        ],
        providerMeta: {
          promptVersion: "1.0",
          provider: "stub",
          model: "local-template",
        },
      },
      inputJson: {
        inspirationEntryIds: [validUuidC],
      },
      acceptances: [],
    })
    mocks.insertReturningQueue.push([{ id: validUuidB }])

    const result = await acceptConceptDirection({
      conceptJobId: validUuidA,
      conceptId: "concept-1",
    })

    expect(result.success).toBe(true)
    expect(result.data?.entryId).toBe(validUuidB)
  })

  it("creates a render job when limits are not exceeded", async () => {
    mocks.db.query.renderJobs.findMany
      .mockResolvedValueOnce([]) // daily limit check
      .mockResolvedValueOnce([]) // active limit check
      .mockResolvedValueOnce([]) // dedupe check
    mocks.insertReturningQueue.push([{ id: validUuidC }])

    const result = await createRenderJob({
      inputJson: {
        source: "design-editor",
        snapshot: {
          side: "front",
          frontLayers: [],
          backLayers: [],
        },
      },
    })

    expect(result.success).toBe(true)
    expect(result.data?.jobId).toBe(validUuidC)
    expect(result.data?.status).toBe("queued")
  })

  it("dedupes active render jobs with the same payload", async () => {
    mocks.db.query.renderJobs.findMany
      .mockResolvedValueOnce([]) // daily limit check
      .mockResolvedValueOnce([]) // active limit check
      .mockResolvedValueOnce([
        {
          id: validUuidC,
          status: "queued",
          inputJson: {
            source: "design-editor",
            snapshot: { side: "front", frontLayers: [], backLayers: [] },
            __renderRetry: { count: 0 },
          },
          studioEntryId: null,
          designVersionId: null,
        },
      ]) // dedupe check

    const result = await createRenderJob({
      inputJson: {
        source: "design-editor",
        snapshot: {
          side: "front",
          frontLayers: [],
          backLayers: [],
        },
      },
    })

    expect(result.success).toBe(true)
    expect(result.data?.jobId).toBe(validUuidC)
    expect(result.data?.deduped).toBe(true)
    expect(mocks.db.insert).not.toHaveBeenCalled()
  })

  it("fails render processing when moderation blocks the input", async () => {
    mocks.db.query.renderJobs.findFirst.mockResolvedValueOnce({
      id: validUuidA,
      createdBy: "user-1",
      status: "queued",
      inputJson: {
        source: "design-editor",
        snapshot: {
          side: "front",
          frontLayers: [{ type: "text", text: "nazi" }],
          backLayers: [],
        },
      },
    })

    const result = await processRenderJob({ jobId: validUuidA })

    expect(result.success).toBe(false)
    expect(result.error).toContain("blocked terms")
  })
})
