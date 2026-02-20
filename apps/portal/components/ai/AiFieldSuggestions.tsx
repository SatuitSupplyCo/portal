'use client'

import { useState, useCallback, useRef } from 'react'
import { cn } from '@repo/ui/utils'
import { Sparkles, RefreshCw, Check, X } from 'lucide-react'
import { logAiSuggestion } from '@/lib/ai/actions'
import type { FieldSuggestResponse } from '@/lib/ai/types'

// ─── Hook ───────────────────────────────────────────────────────────

interface UseAiFieldSuggestionsOptions {
  feature: string
  fieldName: string
  fieldLabel: string
  context: Record<string, unknown>
  optionCount?: number
  onSelect: (value: string) => void
  currentValue?: string
  brandBrief?: string | null
}

export function useAiFieldSuggestions({
  feature,
  fieldName,
  fieldLabel,
  context,
  optionCount = 2,
  onSelect,
  currentValue,
  brandBrief,
}: UseAiFieldSuggestionsOptions) {
  const [suggestions, setSuggestions] = useState<FieldSuggestResponse['suggestions'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const rejectedRef = useRef<string[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const currentSuggestionsRef = useRef<FieldSuggestResponse['suggestions'] | null>(null)
  const usageRef = useRef<{ inputTokens?: number | null; outputTokens?: number | null; latencyMs?: number | null } | null>(null)

  const fetchSuggestions = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)
    setIsOpen(true)

    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature,
          mode: 'suggest',
          context: {
            fieldName,
            fieldLabel,
            currentValue,
            optionCount,
            formContext: context,
            brandBrief,
            rejectedSuggestions:
              rejectedRef.current.length > 0 ? rejectedRef.current : undefined,
          },
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error((await res.text()) || `Request failed (${res.status})`)
      }

      const data = await res.json()
      const { _usage, ...rest } = data as FieldSuggestResponse & { _usage?: { inputTokens?: number | null; outputTokens?: number | null; latencyMs?: number | null } }
      usageRef.current = _usage ?? null
      setSuggestions(rest.suggestions)
      currentSuggestionsRef.current = rest.suggestions
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError((e as Error).message || 'Something went wrong')
      }
    } finally {
      setIsLoading(false)
    }
  }, [feature, fieldName, fieldLabel, currentValue, optionCount, context, brandBrief])

  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value)
      setIsOpen(false)
      setSuggestions(null)

      if (currentSuggestionsRef.current) {
        logAiSuggestion({
          feature,
          fieldName,
          context,
          suggestions: currentSuggestionsRef.current,
          selectedValue: value,
          outcome: 'selected',
          ...usageRef.current,
        })
      }
      rejectedRef.current = []
    },
    [onSelect, feature, fieldName, context],
  )

  const handleDismiss = useCallback(() => {
    setIsOpen(false)

    if (currentSuggestionsRef.current) {
      logAiSuggestion({
        feature,
        fieldName,
        context,
        suggestions: currentSuggestionsRef.current,
        outcome: 'rejected',
        ...usageRef.current,
      })

      for (const s of currentSuggestionsRef.current) {
        if (!rejectedRef.current.includes(s.value)) {
          rejectedRef.current.push(s.value)
        }
      }
    }
    setSuggestions(null)
  }, [feature, fieldName, context])

  const handleRegenerate = useCallback(() => {
    if (currentSuggestionsRef.current) {
      logAiSuggestion({
        feature,
        fieldName,
        context,
        suggestions: currentSuggestionsRef.current,
        outcome: 'regenerated',
        ...usageRef.current,
      })

      for (const s of currentSuggestionsRef.current) {
        if (!rejectedRef.current.includes(s.value)) {
          rejectedRef.current.push(s.value)
        }
      }
    }
    fetchSuggestions()
  }, [fetchSuggestions, feature, fieldName, context])

  return {
    suggestions,
    isLoading,
    isOpen,
    error,
    fetchSuggestions,
    handleSelect,
    handleDismiss,
    handleRegenerate,
    clearError: () => { setError(null); setIsOpen(false) },
  }
}

// ─── Trigger Button ─────────────────────────────────────────────────

interface AiFieldSuggestionsTriggerProps {
  onClick: () => void
  isLoading: boolean
  disabled?: boolean
}

export function AiFieldSuggestionsTrigger({
  onClick,
  isLoading,
  disabled,
}: AiFieldSuggestionsTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-sm p-0.5 transition-colors',
        'text-[var(--depot-faint)] hover:text-[var(--depot-ink)]',
        'disabled:pointer-events-none disabled:opacity-40',
        isLoading && 'animate-pulse text-blue-500',
      )}
      title="Generate suggestions with AI"
    >
      <Sparkles className="h-3.5 w-3.5" />
    </button>
  )
}

// ─── Suggestions Panel ──────────────────────────────────────────────

interface AiFieldSuggestionsPanelProps {
  suggestions: FieldSuggestResponse['suggestions'] | null
  isLoading: boolean
  isOpen: boolean
  error: string | null
  onSelect: (value: string) => void
  onDismiss: () => void
  onRegenerate: () => void
  onClearError: () => void
}

export function AiFieldSuggestionsPanel({
  suggestions,
  isLoading,
  isOpen,
  error,
  onSelect,
  onDismiss,
  onRegenerate,
  onClearError,
}: AiFieldSuggestionsPanelProps) {
  if (!isOpen) return null

  return (
    <div className="mt-1.5 space-y-1.5">
      {isLoading && !suggestions && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] text-[var(--depot-faint)] animate-pulse">
          <Sparkles className="h-3 w-3" />
          Generating suggestions…
        </div>
      )}

      {error && (
        <div className="px-2 py-1.5 text-[11px] text-red-500">
          {error}
          <button
            type="button"
            onClick={onClearError}
            className="ml-2 text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {suggestions && suggestions.map((s, i) => (
        <div
          key={i}
          className="group flex items-start gap-2 rounded-sm border border-[var(--depot-hairline)] px-2.5 py-2 transition-colors hover:border-[var(--depot-muted)]"
        >
          <div className="flex-1 min-w-0">
            <p className="text-[11px] leading-relaxed text-[var(--depot-ink)]">
              {s.value}
            </p>
            <p className="text-[10px] text-[var(--depot-faint)] leading-relaxed mt-0.5">
              {s.rationale}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(s.value)}
            className="shrink-0 p-1 text-[var(--depot-faint)] hover:text-emerald-600 transition-colors"
            title="Use this suggestion"
          >
            <Check className="h-3 w-3" />
          </button>
        </div>
      ))}

      {suggestions && (
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isLoading}
            className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.04em] font-medium text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-2.5 w-2.5', isLoading && 'animate-spin')} />
            Regenerate
          </button>
          <span className="text-[var(--depot-hairline)]">·</span>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.04em] font-medium text-[var(--depot-faint)] hover:text-[var(--depot-ink)] transition-colors"
          >
            <X className="h-2.5 w-2.5" />
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
