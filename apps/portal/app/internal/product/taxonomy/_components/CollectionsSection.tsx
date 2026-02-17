'use client'

import { Badge } from '@repo/ui/badge'
import { AddItemDialog } from './AddItemDialog'
import { createCollection } from '../actions'

interface Collection {
  id: string
  code: string
  name: string
  description: string | null
  status: string
  sortOrder: number
}

export function CollectionsSection({ collections }: { collections: Collection[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Collections</h2>
        <AddItemDialog
          title="Add Collection"
          onAdd={async (data) =>
            createCollection({ code: data.code, name: data.label, description: data.description })
          }
        />
      </div>

      <div className="rounded-lg border bg-card shadow-sm divide-y">
        {collections.map((col) => (
          <div key={col.id} className="flex items-center gap-3 px-4 py-3">
            <span className="font-medium text-sm">{col.name}</span>
            <code className="text-xs text-muted-foreground font-mono">{col.code}</code>
            {col.description && (
              <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                {col.description}
              </span>
            )}
            {col.status !== 'active' && (
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {col.status}
              </Badge>
            )}
          </div>
        ))}
        {collections.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No collections defined yet.
          </div>
        )}
      </div>
    </div>
  )
}
