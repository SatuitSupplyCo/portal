"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { acceptConceptDirection, generateConceptDirections } from "../actions"

type InspirationItem = {
  id: string
  title: string
  category: string
  owner: string
  createdAt: string
}

type RecentJob = {
  id: string
  status: "queued" | "running" | "completed" | "failed" | "cancelled"
  createdAt: string
  promptVersion: string
  outputJson: Record<string, unknown> | null
  inputJson?: Record<string, unknown> | null
  acceptedConceptIds: string[]
  acceptedConceptEntryMap?: Record<string, string>
  error?: string | null
}

/** Categorize server error message for actionable UX (no API changes). */
function categorizeError(message: string): "validation" | "in_progress" | "provider" | "unknown" {
  const lower = message.toLowerCase()
  if (
    lower.includes("select at least one") ||
    lower.includes("inspiration id") ||
    lower.includes("cannot be empty") ||
    lower.includes("valid inspiration") ||
    lower.includes("insufficient permissions")
  ) {
    return "validation"
  }
  if (lower.includes("already queued") || lower.includes("already running") || lower.includes("in progress")) {
    return "in_progress"
  }
  if (
    lower.includes("provider returned") ||
    lower.includes("rate limit") ||
    lower.includes("timeout") ||
    lower.includes("api key") ||
    lower.includes("model") ||
    /^\s*[a-z]+error\s*:/i.test(message)
  ) {
    return "provider"
  }
  return "unknown"
}

const ERROR_GUIDANCE: Record<
  "validation" | "in_progress" | "provider" | "unknown",
  { title: string; guidance: string }
> = {
  validation: {
    title: "Check your input",
    guidance: "Fix the fields above and try again.",
  },
  in_progress: {
    title: "Job already running",
    guidance: "Use Regenerate to start a new job, or wait and refresh the page to see results.",
  },
  provider: {
    title: "Generation service issue",
    guidance: "Try again in a moment. If it persists, check provider configuration or try different inspiration.",
  },
  unknown: {
    title: "Something went wrong",
    guidance: "Try again or use Regenerate to start a fresh job.",
  },
}

type ConceptCard = {
  id: string
  title: string
  rationale: string
  constructionIdeas: string[]
  graphicDirection: string[]
  colorDirection: string[]
}

interface ConceptingClientProps {
  inspirations: InspirationItem[]
  recentJobs: RecentJob[]
}

type ConceptGenerateRequest = {
  schemaVersion: "1.0"
  inspirationEntryIds: string[]
  constraints: {
    productTypeCode?: string
    seasonCode?: string
    priceTierTarget: "entry" | "mid" | "premium"
    riskLevel: "safe" | "balanced" | "exploratory"
  }
  generation: {
    numConcepts: 3 | 4 | 5
    temperatureProfile: "conservative" | "balanced" | "creative"
  }
  requestContext: {
    workspace: string
    featureFlag: string
    forceNewJob: boolean
  }
}

export function ConceptingClient({ inspirations, recentJobs }: ConceptingClientProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [productTypeCode, setProductTypeCode] = useState("")
  const [seasonCode, setSeasonCode] = useState("")
  const [priceTierTarget, setPriceTierTarget] = useState<"entry" | "mid" | "premium">("mid")
  const [riskLevel, setRiskLevel] = useState<"safe" | "balanced" | "exploratory">("balanced")
  const [numConcepts, setNumConcepts] = useState<3 | 4 | 5>(4)
  const [generatedConcepts, setGeneratedConcepts] = useState<ConceptCard[]>([])
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [acceptedInSession, setAcceptedInSession] = useState<Set<string>>(new Set())
  /** Map conceptId → design entryId for concepts accepted in this session (from acceptConceptDirection result). */
  const [acceptedConceptToEntryId, setAcceptedConceptToEntryId] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isGenerating, startGenerating] = useTransition()
  const [isAccepting, startAccepting] = useTransition()
  const [generateIntent, setGenerateIntent] = useState<"generate" | "regenerate" | null>(null)
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null)
  const [acceptingConceptId, setAcceptingConceptId] = useState<string | null>(null)

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const errorCategory = error ? categorizeError(error) : null
  const errorGuidance = errorCategory ? ERROR_GUIDANCE[errorCategory] : null

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id)
      if (prev.length >= 5) return prev
      return [...prev, id]
    })
  }

  function buildGenerateParams(forceNewJob: boolean): ConceptGenerateRequest {
    return {
      schemaVersion: "1.0" as const,
      inspirationEntryIds: selectedIds,
      constraints: {
        productTypeCode: productTypeCode.trim() || undefined,
        seasonCode: seasonCode.trim() || undefined,
        priceTierTarget,
        riskLevel,
      },
      generation: {
        numConcepts,
        temperatureProfile: (riskLevel === "safe" ? "conservative" : "balanced") as "conservative" | "balanced" | "creative",
      },
      requestContext: {
        workspace: "portal",
        featureFlag: "studio_concepting_v1",
        forceNewJob,
      },
    }
  }

  function parseJobInputToParams(job: RecentJob): ConceptGenerateRequest | null {
    const input = job.inputJson
    if (!input || typeof input !== "object") return null

    const inspirationEntryIds = Array.isArray(input.inspirationEntryIds)
      ? input.inspirationEntryIds.filter((id): id is string => typeof id === "string")
      : []
    const rawGeneration =
      input.generation && typeof input.generation === "object"
        ? (input.generation as Record<string, unknown>)
        : {}
    const rawConstraints =
      input.constraints && typeof input.constraints === "object"
        ? (input.constraints as Record<string, unknown>)
        : {}
    const requestContext =
      input.requestContext && typeof input.requestContext === "object"
        ? (input.requestContext as Record<string, unknown>)
        : {}

    const numRaw = Number(rawGeneration.numConcepts)
    const numConcepts = Number.isFinite(numRaw) ? Math.max(3, Math.min(5, numRaw)) : 4
    const temperatureRaw =
      typeof rawGeneration.temperatureProfile === "string"
        ? rawGeneration.temperatureProfile
        : "balanced"
    const temperatureProfile =
      temperatureRaw === "conservative" ||
      temperatureRaw === "balanced" ||
      temperatureRaw === "creative"
        ? temperatureRaw
        : "balanced"
    const riskRaw =
      typeof rawConstraints.riskLevel === "string" ? rawConstraints.riskLevel : "balanced"
    const riskLevel =
      riskRaw === "safe" || riskRaw === "balanced" || riskRaw === "exploratory"
        ? riskRaw
        : "balanced"
    const priceRaw =
      typeof rawConstraints.priceTierTarget === "string"
        ? rawConstraints.priceTierTarget
        : "mid"
    const priceTierTarget =
      priceRaw === "entry" || priceRaw === "mid" || priceRaw === "premium"
        ? priceRaw
        : "mid"

    if (inspirationEntryIds.length === 0) return null

    return {
      schemaVersion: "1.0",
      inspirationEntryIds,
      constraints: {
        productTypeCode:
          typeof rawConstraints.productTypeCode === "string"
            ? rawConstraints.productTypeCode
            : undefined,
        seasonCode:
          typeof rawConstraints.seasonCode === "string"
            ? rawConstraints.seasonCode
            : undefined,
        priceTierTarget,
        riskLevel,
      },
      generation: {
        numConcepts: numConcepts as 3 | 4 | 5,
        temperatureProfile,
      },
      requestContext: {
        workspace:
          typeof requestContext.workspace === "string"
            ? requestContext.workspace
            : "portal",
        featureFlag:
          typeof requestContext.featureFlag === "string"
            ? requestContext.featureFlag
            : "studio_concepting_v1",
        forceNewJob: true,
      },
    }
  }

  function handleGenerate() {
    setError(null)
    setSuccess(null)
    if (selectedIds.length < 1) {
      setError("Select at least one inspiration item.")
      return
    }
    setGenerateIntent("generate")
    startGenerating(async () => {
      const result = await generateConceptDirections(buildGenerateParams(false))
      if (!result.success) {
        setError(result.error ?? "Failed to generate concepts.")
        setGenerateIntent(null)
        return
      }
      const data = result.data as { jobId: string; concepts: ConceptCard[]; reused?: boolean }
      setActiveJobId(data.jobId)
      setGeneratedConcepts(data.concepts)
      setAcceptedInSession(new Set())
      setAcceptedConceptToEntryId({})
      setSuccess(
        data.reused
          ? `Loaded ${data.concepts.length} cached concept directions.`
          : `Generated ${data.concepts.length} concept directions.`,
      )
      setGenerateIntent(null)
      router.refresh()
    })
  }

  function handleRegenerate() {
    setError(null)
    setSuccess(null)
    if (selectedIds.length < 1) {
      setError("Select at least one inspiration item.")
      return
    }
    setGenerateIntent("regenerate")
    startGenerating(async () => {
      const result = await generateConceptDirections(buildGenerateParams(true))
      if (!result.success) {
        setError(result.error ?? "Failed to regenerate concepts.")
        setGenerateIntent(null)
        return
      }
      const data = result.data as { jobId: string; concepts: ConceptCard[] }
      setActiveJobId(data.jobId)
      setGeneratedConcepts(data.concepts)
      setAcceptedInSession(new Set())
      setAcceptedConceptToEntryId({})
      setSuccess(`Regenerated ${data.concepts.length} concept directions.`)
      setGenerateIntent(null)
      router.refresh()
    })
  }

  function handleRetryFromJobList(jobId: string) {
    const sourceJob = recentJobs.find((j) => j.id === jobId)
    const fromJob = sourceJob ? parseJobInputToParams(sourceJob) : null
    if (!fromJob && selectedIds.length < 1) {
      setError("Select at least one inspiration item to retry.")
      return
    }
    setError(null)
    setSuccess(null)
    setRetryingJobId(jobId)
    startGenerating(async () => {
      const result = await generateConceptDirections(fromJob ?? buildGenerateParams(true))
      setRetryingJobId(null)
      if (!result.success) {
        setError(result.error ?? "Retry failed.")
        return
      }
      const data = result.data as { jobId: string; concepts: ConceptCard[] }
      setActiveJobId(data.jobId)
      setGeneratedConcepts(data.concepts)
      setAcceptedInSession(new Set())
      setAcceptedConceptToEntryId({})
      setSuccess(`New job created with ${data.concepts.length} concept directions.`)
      router.refresh()
    })
  }

  function handleAccept(conceptId: string) {
    if (!activeJobId) {
      setError("No active concept job to accept from.")
      return
    }
    setAcceptingConceptId(conceptId)
    startAccepting(async () => {
      const result = await acceptConceptDirection({
        conceptJobId: activeJobId,
        conceptId,
      })
      setAcceptingConceptId(null)
      if (!result.success) {
        setError(result.error ?? "Failed to accept concept.")
        return
      }
      setAcceptedInSession((prev) => new Set(prev).add(conceptId))
      const entryId = result.data?.entryId
      if (typeof entryId === "string" && entryId) {
        setAcceptedConceptToEntryId((prev) => ({ ...prev, [conceptId]: entryId }))
      }
      setSuccess("Concept accepted and saved to Studio drafts.")
      router.refresh()
    })
  }

  const acceptedConceptIdsForActiveJob = useMemo(() => {
    if (!activeJobId) return new Set<string>()
    const job = recentJobs.find((j) => j.id === activeJobId)
    const fromServer = new Set(job?.acceptedConceptIds ?? [])
    acceptedInSession.forEach((id) => fromServer.add(id))
    return fromServer
  }, [activeJobId, recentJobs, acceptedInSession])

  const acceptedEntryMapForActiveJob = useMemo(() => {
    if (!activeJobId) return {} as Record<string, string>
    const job = recentJobs.find((j) => j.id === activeJobId)
    return job?.acceptedConceptEntryMap ?? {}
  }, [activeJobId, recentJobs])

  return (
    <div className="px-8 py-6 md:px-12 space-y-6">
      <section className="rounded-lg border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Generate Concept Directions</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Select up to 5 inspiration entries, set constraints, and generate 3-5 concept cards.
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="product-type-code">Product Type</Label>
              <Input
                id="product-type-code"
                value={productTypeCode}
                onChange={(e) => setProductTypeCode(e.target.value)}
                placeholder="tee_ss"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="season-code">Season</Label>
              <Input
                id="season-code"
                value={seasonCode}
                onChange={(e) => setSeasonCode(e.target.value)}
                placeholder="S26"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price-tier">Price Tier</Label>
              <select
                id="price-tier"
                value={priceTierTarget}
                onChange={(e) => setPriceTierTarget(e.target.value as "entry" | "mid" | "premium")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="risk-level">Risk Level</Label>
              <select
                id="risk-level"
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as "safe" | "balanced" | "exploratory")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="safe">Safe</option>
                <option value="balanced">Balanced</option>
                <option value="exploratory">Exploratory</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="num-concepts">Number of Concepts</Label>
            <select
              id="num-concepts"
              value={numConcepts}
              onChange={(e) => setNumConcepts(Number(e.target.value) as 3 | 4 | 5)}
              className="flex h-9 w-28 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>

          <div className="rounded-md border">
            <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
              Inspiration Selection ({selectedIds.length}/5)
            </div>
            <div className="max-h-72 overflow-y-auto divide-y">
              {inspirations.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent/40"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(item.id)}
                      onChange={() => toggleSelected(item.id)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.category} · {item.owner}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2.5">
              <p className="text-sm font-medium text-destructive">
                {errorGuidance?.title ?? "Error"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
              {errorGuidance && (
                <p className="text-xs text-muted-foreground mt-1">{errorGuidance.guidance}</p>
              )}
            </div>
          )}
          {success && <p className="text-sm text-emerald-700">{success}</p>}

          {isGenerating && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {generateIntent === "regenerate"
                ? "Regenerating concept directions…"
                : "Generating concept directions…"}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={handleGenerate} disabled={isGenerating || selectedIds.length === 0}>
              {isGenerating && generateIntent === "generate" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isGenerating && generateIntent === "generate"
                ? "Generating…"
                : "Generate Concept Directions"}
            </Button>
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isGenerating || selectedIds.length === 0}
            >
              {isGenerating && generateIntent === "regenerate" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isGenerating && generateIntent === "regenerate" ? "Regenerating…" : "Regenerate"}
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Generated Concepts</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Accept strong concepts to create Studio draft entries with provenance.
          </p>
        </div>
        <div className="p-5 grid gap-3 md:grid-cols-2">
          {generatedConcepts.length === 0 && (
            <div className="text-sm text-muted-foreground">No generated concepts yet.</div>
          )}
          {generatedConcepts.map((concept) => {
            const isAccepted = acceptedConceptIdsForActiveJob.has(concept.id)
            const acceptedInThisSession = acceptedInSession.has(concept.id)
            const designEntryId =
              acceptedConceptToEntryId[concept.id] ??
              acceptedEntryMapForActiveJob[concept.id]
            return (
              <div key={concept.id} className="rounded-md border p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">{concept.title}</h3>
                  {isAccepted && (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                      {acceptedInThisSession ? "Accepted (this session)" : "Accepted"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{concept.rationale}</p>
                <div className="text-xs text-muted-foreground">
                  <p>Construction: {concept.constructionIdeas.join(", ")}</p>
                  <p>Graphics: {concept.graphicDirection.join(", ")}</p>
                  <p>Color: {concept.colorDirection.join(", ")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAccept(concept.id)}
                    disabled={isAccepting || isAccepted}
                  >
                    {isAccepting && acceptingConceptId === concept.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Saving…
                      </>
                    ) : isAccepted ? (
                      "Accepted"
                    ) : (
                      "Accept to Studio Drafts"
                    )}
                  </Button>
                  {isAccepted && designEntryId && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/internal/studio/design?entryId=${encodeURIComponent(designEntryId)}`}>
                        Open in Design
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-lg border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Recent Concept Jobs</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Retry failed or stuck jobs with current settings (Regenerate).
          </p>
        </div>
        <div className="p-5">
          {recentJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No concept jobs yet.</p>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => {
                const output = (job.outputJson ?? {}) as { concepts?: unknown[] }
                const conceptCount = output.concepts?.length ?? 0
                const acceptedCount = job.acceptedConceptIds?.length ?? 0
                const statusLabel =
                  job.status === "completed"
                    ? "Completed"
                    : job.status === "failed"
                      ? "Failed"
                      : job.status === "running" || job.status === "queued"
                        ? "In progress"
                        : job.status === "cancelled"
                          ? "Cancelled"
                          : job.status
                const canRetry =
                  (job.status === "failed" || job.status === "running" || job.status === "queued") &&
                  selectedIds.length > 0
                const isRetryingThis = retryingJobId === job.id
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{job.id.slice(0, 8)}...</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString()} · {job.promptVersion}
                      </p>
                      {job.status === "failed" && job.error && (
                        <p className="text-[11px] text-destructive mt-1 truncate" title={job.error}>
                          {job.error}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-right">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{statusLabel}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {conceptCount} concepts
                          {acceptedCount > 0 && ` · ${acceptedCount} accepted`}
                        </p>
                      </div>
                      {canRetry && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => handleRetryFromJobList(job.id)}
                          disabled={isGenerating}
                          aria-label={isRetryingThis ? "Retrying…" : "Retry with current settings"}
                        >
                          {isRetryingThis ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                          )}
                          <span className="text-xs">{isRetryingThis ? "Retrying…" : "Retry"}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
