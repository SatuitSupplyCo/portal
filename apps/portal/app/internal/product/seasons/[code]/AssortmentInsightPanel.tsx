'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@repo/ui/utils'
import { Sparkles, RefreshCw, Crosshair, MessageSquareWarning } from 'lucide-react'
import type { AssortmentMixContext } from '@/lib/ai/types'

interface AssortmentInsightPanelProps {
  seasonContext: AssortmentMixContext['season']
  dimension: {
    key: string
    label: string
    targets: Record<string, number>
    actuals: Record<string, number>
    labels: Record<string, string>
  }
  summary: AssortmentMixContext['summary']
}

export function AssortmentInsightPanel({
  seasonContext,
  dimension,
  summary,
}: AssortmentInsightPanelProps) {
  const [completion, setCompletion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastMode, setLastMode] = useState<'suggest' | 'critique' | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll while streaming
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
      setError(null)
      setLastMode(null)
    }
  }, [dimension.key])

  const handleRequest = useCallback(
    async (mode: 'suggest' | 'critique') => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLastMode(mode)
      setCompletion('')
      setError(null)
      setIsLoading(true)

      const context: AssortmentMixContext = {
        season: seasonContext,
        dimension: {
          key: dimension.key,
          label: dimension.label,
          targets: dimension.targets,
          actuals: dimension.actuals,
          labels: dimension.labels,
        },
        summary,
      }

      try {
        const res = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature: 'assortment-mix', mode, context }),
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(await res.text() || `Request failed (${res.status})`)
        }

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
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError((e as Error).message || 'Something went wrong')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [seasonContext, dimension, summary],
  )

  const hasOutput = completion.length > 0

  // Idle state
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

  // Error state
  if (error && !hasOutput) {
    return (
      <div className="border border-dashed border-red-200 rounded-md px-5 py-4 flex flex-col items-center justify-center text-center min-h-[120px] gap-2">
        <p className="text-[10px] text-red-500 leading-relaxed max-w-[220px]">{error}</p>
        <button
          type="button"
          onClick={() => { setError(null); setLastMode(null) }}
          className="text-[10px] text-[var(--depot-muted)] hover:text-[var(--depot-ink)] transition-colors"
        >
          Dismiss
        </button>
      </div>
    )
  }

  // Streaming / complete state
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
        className="px-3 py-2.5 overflow-y-auto max-h-[260px] text-[11px] text-[var(--depot-ink-light)] leading-relaxed whitespace-pre-wrap"
      >
        {completion || (
          <span className="text-[var(--depot-faint)] animate-pulse">Thinking…</span>
        )}
      </div>
    </div>
  )
}
