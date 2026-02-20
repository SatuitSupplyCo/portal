'use client'

import { useState } from 'react'
import { Badge } from '@repo/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface CurrentFilters {
  feature?: string
  outcome?: string
}

export interface LogEntry {
  id: string
  feature: string
  fieldName: string | null
  suggestions: Array<{ value: string; rationale: string }>
  selectedValue: string | null
  outcome: string
  inputTokens: number | null
  outputTokens: number | null
  latencyMs: number | null
  createdAt: Date
  userName: string | null
  userEmail: string | null
}

interface AiSuggestionLogProps {
  entries: LogEntry[]
  hasMore: boolean
  nextCursor: string | null
  filters?: CurrentFilters
}

const outcomeBadge: Record<string, { label: string; className: string }> = {
  selected: { label: 'Selected', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
  regenerated: { label: 'Regenerated', className: 'bg-amber-100 text-amber-800 border-amber-200' },
}

function buildLoadMoreHref(cursor: string, filters?: CurrentFilters): string {
  const params = new URLSearchParams()
  if (filters?.feature && filters.feature !== 'all') params.set('feature', filters.feature)
  if (filters?.outcome && filters.outcome !== 'all') params.set('outcome', filters.outcome)
  params.set('cursor', cursor)
  return `/admin/ai?${params.toString()}`
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatFullDate(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function AiSuggestionLog({ entries, hasMore, nextCursor, filters }: AiSuggestionLogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]" />
            <TableHead>Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Feature</TableHead>
            <TableHead>Field</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Selected</TableHead>
            <TableHead>Tokens</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id
            const badge = outcomeBadge[entry.outcome] ?? {
              label: entry.outcome,
              className: 'bg-zinc-100 text-zinc-800',
            }

            return (
              <>
                <TableRow
                  key={entry.id}
                  className="cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <TableCell className="w-[30px] pr-0">
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-sm"
                      title={formatFullDate(entry.createdAt)}
                    >
                      {timeAgo(entry.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {entry.userName ?? entry.userEmail ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {entry.feature}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {entry.fieldName ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                      {entry.selectedValue ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {entry.inputTokens != null || entry.outputTokens != null ? (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {entry.inputTokens ?? '?'} / {entry.outputTokens ?? '?'}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow key={`${entry.id}-detail`}>
                    <TableCell colSpan={8} className="bg-muted/30 px-6 py-4">
                      <div className="space-y-3">
                        <div className="flex gap-6 text-xs text-muted-foreground">
                          <span>ID: {entry.id.slice(0, 8)}...</span>
                          <span>{formatFullDate(entry.createdAt)}</span>
                          {entry.latencyMs != null && (
                            <span>{entry.latencyMs}ms latency</span>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-1.5">
                            Suggestions ({entry.suggestions.length})
                          </p>
                          <div className="space-y-2">
                            {entry.suggestions.map((s, i) => (
                              <div
                                key={i}
                                className={`rounded-md border p-2.5 text-sm ${
                                  entry.selectedValue === s.value
                                    ? 'border-emerald-200 bg-emerald-50/50'
                                    : 'border-border'
                                }`}
                              >
                                <p className="font-medium">{s.value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {s.rationale}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )
          })}

          {entries.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-24 text-center text-muted-foreground"
              >
                No suggestion logs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {hasMore && nextCursor && (
        <div className="border-t px-4 py-3 text-center">
          <a
            href={buildLoadMoreHref(nextCursor, filters)}
            className="text-sm text-primary hover:underline"
          >
            Load more
          </a>
        </div>
      )}
    </div>
  )
}
