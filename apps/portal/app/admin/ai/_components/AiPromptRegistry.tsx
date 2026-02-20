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
import type { AiFeatureEntry } from '@/lib/ai/registry'

interface AiPromptRegistryProps {
  features: AiFeatureEntry[]
}

export function AiPromptRegistry({ features }: AiPromptRegistryProps) {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]" />
            <TableHead>Feature</TableHead>
            <TableHead>Modes</TableHead>
            <TableHead>Temperature</TableHead>
            <TableHead>Response Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((f) => {
            const isExpanded = expandedFeature === f.feature
            return (
              <>
                <TableRow
                  key={f.feature}
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedFeature(isExpanded ? null : f.feature)
                  }
                >
                  <TableCell className="w-[30px] pr-0">
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{f.feature}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {f.modes.map((m) => (
                        <Badge key={m} variant="secondary" className="text-[10px]">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm tabular-nums">{f.temperature}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {f.responseType}
                    </span>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow key={`${f.feature}-expanded`}>
                    <TableCell colSpan={5} className="bg-muted/30 px-6 py-4">
                      <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-2">
                        System Prompt
                      </p>
                      <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono bg-background rounded-md border p-3 max-h-[300px] overflow-y-auto">
                        {f.systemPrompt}
                      </pre>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )
          })}

          {features.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                No AI features registered.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
