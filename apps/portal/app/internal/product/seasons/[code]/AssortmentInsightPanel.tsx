'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@repo/ui/utils'
import {
  Sparkles,
  RefreshCw,
  Crosshair,
  MessageSquareWarning,
  Check,
  X,
  ArrowRight,
} from 'lucide-react'
import type { AssortmentMixContext } from '@/lib/ai/types'
import type { SuggestResponse } from '@/lib/ai/types'

// ─── Types ──────────────────────────────────────────────────────────

interface FeedbackEntry {
  status: 'accepted' | 'rejected'
  rationale?: string
}

interface AssortmentInsightPanelProps {
  seasonContext: AssortmentMixContext['season']
  dimension: {
    key: string
    label: string
    targets: Record<string, number>
    actuals: Record<string, number>
    labels: Record<string, string>
  }
  allDimensionTargets?: Record<string, Record<string, number>>
  brandBrief?: string | null
  collectionBriefs?: Array<{ name: string; brief: string; slotCount: number }>
  summary: AssortmentMixContext['summary']
  onApplySuggestions?: (dimensionKey: string, targets: Record<string, number>) => void
}

export function AssortmentInsightPanel({
  seasonContext,
  dimension,
  allDimensionTargets,
  brandBrief,
  collectionBriefs,
  summary,
  onApplySuggestions,
}: AssortmentInsightPanelProps) {
  const [completion, setCompletion] = useState('')
  const [suggestResult, setSuggestResult] = useState<SuggestResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastMode, setLastMode] = useState<'suggest' | 'critique' | null>(null)
  const [feedback, setFeedback] = useState<Record<string, FeedbackEntry>>({})
  const [rejectingKey, setRejectingKey] = useState<string | null>(null)
  const [rejectRationale, setRejectRationale] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current && isLoading) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [completion, isLoading])

  // Reset when the active dimension changes
  const prevDimKey = useRef(dimension.key)
  useEffect(() => {
    if (dimension.key !== prevDimKey.current) {
      prevDimKey.current = dimension.key
      abortRef.current?.abort()
      setCompletion('')
      setSuggestResult(null)
      setError(null)
      setLastMode(null)
      setFeedback({})
      setRejectingKey(null)
    }
  }, [dimension.key])

  const handleRequest = useCallback(
    async (mode: 'suggest' | 'critique') => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLastMode(mode)
      setCompletion('')
      setSuggestResult(null)
      setError(null)
      setIsLoading(true)
      setRejectingKey(null)

      const feedbackArray = Object.entries(feedback).map(([key, entry]) => {
        const suggestion = suggestResult?.suggestions.find((s) => s.key === key)
        return {
          key,
          label: suggestion?.label ?? dimension.labels[key] ?? key,
          suggestedValue: suggestion?.value ?? 0,
          status: entry.status,
          rationale: entry.rationale,
        }
      })

      const context: AssortmentMixContext = {
        season: seasonContext,
        dimension: {
          key: dimension.key,
          label: dimension.label,
          targets: dimension.targets,
          actuals: dimension.actuals,
          labels: dimension.labels,
        },
        allDimensionTargets,
        summary,
        brandBrief,
        collectionBriefs,
        feedback: feedbackArray.length > 0 ? feedbackArray : undefined,
      }

      try {
        const res = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature: 'assortment-mix', mode, context }),
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error((await res.text()) || `Request failed (${res.status})`)
        }

        if (mode === 'suggest') {
          const data = (await res.json()) as SuggestResponse
          setSuggestResult(data)
        } else {
          const reader = res.body?.getReader()
          if (!reader) throw new Error('No response stream')
          const decoder = new TextDecoder()
          let text = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            text += decoder.decode(value, { stream: true })
            setCompletion(text)
          }
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError((e as Error).message || 'Something went wrong')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [seasonContext, dimension, summary, allDimensionTargets, brandBrief, collectionBriefs, feedback, suggestResult],
  )

  const handleAccept = useCallback((key: string) => {
    setFeedback((prev) => ({ ...prev, [key]: { status: 'accepted' } }))
    if (rejectingKey === key) setRejectingKey(null)
  }, [rejectingKey])

  const handleRejectStart = useCallback((key: string) => {
    setRejectingKey(key)
    setRejectRationale('')
  }, [])

  const handleRejectConfirm = useCallback((key: string) => {
    setFeedback((prev) => ({
      ...prev,
      [key]: { status: 'rejected', rationale: rejectRationale.trim() || undefined },
    }))
    setRejectingKey(null)
    setRejectRationale('')
  }, [rejectRationale])

  const handleRejectSkip = useCallback((key: string) => {
    setFeedback((prev) => ({ ...prev, [key]: { status: 'rejected' } }))
    setRejectingKey(null)
    setRejectRationale('')
  }, [])

  const handleApply = useCallback(() => {
    if (!suggestResult || !onApplySuggestions) return
    const targets: Record<string, number> = {}
    for (const s of suggestResult.suggestions) {
      if (s.value > 0) targets[s.key] = s.value
    }
    onApplySuggestions(dimension.key, targets)
  }, [suggestResult, onApplySuggestions, dimension.key])

  const clearFeedbackForKey = useCallback((key: string) => {
    setFeedback((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const hasOutput = completion.length > 0 || suggestResult !== null

  // ─── Idle state ────────────────────────────────────────────────────
  if (!hasOutput && !isLoading && !error) {
    return (
      <div className="border border-dashed border-[var(--depot-hairline)] rounded-md px-5 py-4 flex flex-col items-center justify-center text-center min-h-[120px] gap-3">
        <div className="h-6 w-6 rounded-full bg-[var(--depot-surface-alt)] flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-[var(--depot-faint)]" />
        </div>
        <p className="text-[10px] text-[var(--depot-faint)] leading-relaxed max-w-[220px]">
          Get AI-driven insights for{' '}
          <span className="font-medium text-[var(--depot-muted)]">{dimension.label}</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleRequest('suggest')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.04em] rounded-sm bg-[var(--depot-surface-alt)] text-[var(--depot-muted)] hover:text-[var(--depot-ink)] hover:bg-[var(--depot-surface)] transition-colors"
          >
            <Crosshair className="h-3 w-3" />
            Suggest Targets
          </button>
          <button
            type="button"
            onClick={() => handleRequest('critique')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.04em] rounded-sm bg-[var(--depot-surface-alt)] text-[var(--depot-muted)] hover:text-[var(--depot-ink)] hover:bg-[var(--depot-surface)] transition-colors"
          >
            <MessageSquareWarning className="h-3 w-3" />
            Critique Mix
          </button>
        </div>
      </div>
    )
  }

  // ─── Error state ───────────────────────────────────────────────────
  if (error && !hasOutput) {
    return (
      <div className="border border-dashed border-red-200 rounded-md px-5 py-4 flex flex-col items-center justify-center text-center min-h-[120px] gap-2">
        <p className="text-[10px] text-red-500 leading-relaxed max-w-[220px]">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null)
            setLastMode(null)
          }}
          className="text-[10px] text-[var(--depot-muted)] hover:text-[var(--depot-ink)] transition-colors"
        >
          Dismiss
        </button>
      </div>
    )
  }

  // ─── Streaming / complete state ────────────────────────────────────
  return (
    <div className="border border-[var(--depot-hairline)] rounded-md flex flex-col min-h-[120px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--depot-hairline)] bg-[var(--depot-surface-alt)]">
        <span className="text-[10px] uppercase tracking-[0.06em] font-medium text-[var(--depot-muted)] flex items-center gap-1.5">
          <Sparkles className={cn('h-3 w-3', isLoading && 'animate-pulse text-blue-500')} />
          {lastMode === 'suggest' ? 'Suggested Targets' : 'Mix Critique'}
        </span>
        <div className="flex items-center gap-1">
          {!isLoading && (
            <>
              {lastMode === 'suggest' && suggestResult && onApplySuggestions && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.04em] rounded-sm bg-[var(--depot-ink)] text-white hover:bg-[var(--depot-ink-light)] transition-colors mr-1"
                  title="Apply suggestions to Edit Targets dialog"
                >
                  <ArrowRight className="h-2.5 w-2.5" />
                  Apply
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRequest('suggest')}
                className="p-1 text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
                title="Suggest Targets"
              >
                <Crosshair className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => handleRequest('critique')}
                className="p-1 text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
                title="Critique Mix"
              >
                <MessageSquareWarning className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => lastMode && handleRequest(lastMode)}
                className="p-1 text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        ref={scrollRef}
        className="px-3 py-2.5 overflow-y-auto max-h-[360px] min-h-0"
      >
        {isLoading && !hasOutput && (
          <span className="text-[var(--depot-faint)] text-[11px] animate-pulse">Thinking…</span>
        )}

        {/* Structured suggest result */}
        {lastMode === 'suggest' && suggestResult && (
          <div className="space-y-2">
            {suggestResult.summary && (
              <p className="text-[11px] text-[var(--depot-ink-light)] leading-relaxed mb-3">
                {suggestResult.summary}
              </p>
            )}
            {suggestResult.suggestions.map((s) => {
              const fb = feedback[s.key]
              const isAccepted = fb?.status === 'accepted'
              const isRejected = fb?.status === 'rejected'
              const isExpanded = rejectingKey === s.key

              return (
                <div
                  key={s.key}
                  className={cn(
                    'rounded-sm border px-2.5 py-2 transition-colors',
                    isAccepted && 'border-emerald-200 bg-emerald-50/50',
                    isRejected && 'border-zinc-200 bg-zinc-50/50 opacity-60',
                    !fb && 'border-[var(--depot-hairline)]',
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className={cn(
                          'text-[11px] font-medium',
                          isRejected && 'line-through text-[var(--depot-faint)]',
                        )}>
                          {s.label}
                        </span>
                        <span className="text-[11px] tabular-nums text-[var(--depot-muted)]">
                          {s.value} slots
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--depot-faint)] leading-relaxed mt-0.5">
                        {s.rationale}
                      </p>
                      {isRejected && fb.rationale && (
                        <p className="text-[10px] text-amber-600 mt-1 italic">
                          Reason: {fb.rationale}
                        </p>
                      )}
                    </div>

                    {/* Accept/Reject buttons */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {fb ? (
                        <button
                          type="button"
                          onClick={() => clearFeedbackForKey(s.key)}
                          className="p-1 text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
                          title="Clear feedback"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAccept(s.key)}
                            className="p-1 text-[var(--depot-faint)] hover:text-emerald-600 transition-colors"
                            title="Accept this suggestion"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectStart(s.key)}
                            className="p-1 text-[var(--depot-faint)] hover:text-red-500 transition-colors"
                            title="Reject this suggestion"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rejection rationale input */}
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-[var(--depot-hairline)]">
                      <input
                        type="text"
                        value={rejectRationale}
                        onChange={(e) => setRejectRationale(e.target.value)}
                        placeholder="Why? (optional)"
                        className="w-full text-[10px] px-2 py-1 rounded border border-[var(--depot-hairline)] bg-transparent text-[var(--depot-ink)] placeholder:text-[var(--depot-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--depot-ink)]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRejectConfirm(s.key)
                        }}
                        autoFocus
                      />
                      <div className="flex gap-1.5 mt-1.5">
                        <button
                          type="button"
                          onClick={() => handleRejectConfirm(s.key)}
                          className="text-[9px] uppercase tracking-wider font-medium text-[var(--depot-muted)] hover:text-[var(--depot-ink)] transition-colors"
                        >
                          {rejectRationale.trim() ? 'Reject with reason' : 'Reject'}
                        </button>
                        <span className="text-[var(--depot-hairline)]">·</span>
                        <button
                          type="button"
                          onClick={() => handleRejectSkip(s.key)}
                          className="text-[9px] uppercase tracking-wider font-medium text-[var(--depot-faint)] hover:text-[var(--depot-muted)] transition-colors"
                        >
                          Skip reason
                        </button>
                        <span className="text-[var(--depot-hairline)]">·</span>
                        <button
                          type="button"
                          onClick={() => setRejectingKey(null)}
                          className="text-[9px] uppercase tracking-wider font-medium text-[var(--depot-faint)] hover:text-[var(--depot-muted)] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {Object.keys(feedback).length > 0 && (
              <p className="text-[9px] text-[var(--depot-faint)] mt-2 text-center">
                Feedback will be included when you regenerate
              </p>
            )}
          </div>
        )}

        {/* Plain text critique result */}
        {lastMode === 'critique' && completion && (
          <div className="text-[11px] text-[var(--depot-ink-light)] leading-relaxed whitespace-pre-wrap">
            {completion}
          </div>
        )}

        {/* Streaming critique */}
        {isLoading && lastMode === 'critique' && completion && (
          <div className="text-[11px] text-[var(--depot-ink-light)] leading-relaxed whitespace-pre-wrap">
            {completion}
          </div>
        )}
      </div>
    </div>
  )
}
