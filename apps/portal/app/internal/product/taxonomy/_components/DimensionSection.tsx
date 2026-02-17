'use client'

import { Badge } from '@repo/ui/badge'
import { AddItemDialog } from './AddItemDialog'
import { createDimensionValue } from '../actions'

interface DimensionItem {
  id: string
  code: string
  label: string
  description?: string | null
  status: string
  sortOrder: number
}

interface DimensionSectionProps {
  title: string
  dimensionKey: string
  items: DimensionItem[]
}

export function DimensionSection({ title, dimensionKey, items }: DimensionSectionProps) {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground">{items.length} values</p>
        </div>
        <AddItemDialog
          title={`Add ${title} Value`}
          labelField
          onAdd={async (data) =>
            createDimensionValue(dimensionKey as Parameters<typeof createDimensionValue>[0], {
              code: data.code,
              label: data.label,
              description: data.description,
            })
          }
        />
      </div>

      <div className="divide-y">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <span>{item.label}</span>
            <code className="text-xs text-muted-foreground/60 font-mono">{item.code}</code>
            {item.description && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {item.description}
              </span>
            )}
            {item.status !== 'active' && (
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {item.status}
              </Badge>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No values defined.
          </div>
        )}
      </div>
    </div>
  )
}
