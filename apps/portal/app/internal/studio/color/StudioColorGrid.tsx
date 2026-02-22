'use client'

import { useState, useEffect, useCallback } from 'react'
import { Pipette } from 'lucide-react'
import { ColorDetailDialog } from '@/components/ColorDetailDialog'
import type { ColorDetailData } from '@/lib/color'

// ─── Types ───────────────────────────────────────────────────────────

interface StudioColorEntry {
  id: string
  title: string
  description: string | null
  status: string
  tags: string[] | null
  owner: string
  createdAt: string
  hex: string | null
  pantone: string | null
  collectionName: string | null
}

import { STUDIO_STATUS_COLORS as STATUS_COLORS, STUDIO_STATUS_LABELS as STATUS_LABELS } from "@/lib/status"

// ─── Component ───────────────────────────────────────────────────────

export function StudioColorGrid({ entries: propEntries }: { entries: StudioColorEntry[] }) {
  const [entries, setEntries] = useState(propEntries)
  const [selectedColor, setSelectedColor] = useState<ColorDetailData | null>(null)

  useEffect(() => { setEntries(propEntries) }, [propEntries])

  const handleColorSaved = useCallback((updated: ColorDetailData) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== updated.id) return e
      return {
        ...e,
        title: updated.title,
        hex: updated.hex,
        pantone: updated.pantone,
        description: updated.description ?? e.description,
        tags: updated.tags ?? e.tags,
      }
    }))
    setSelectedColor(updated)
  }, [])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {entries.map((entry) => {
          const validHex =
            entry.hex && /^#[0-9a-fA-F]{3,8}$/.test(entry.hex)
              ? entry.hex
              : null

          return (
            <button
              key={entry.id}
              type="button"
              onClick={() =>
                setSelectedColor({
                  id: entry.id,
                  title: entry.title,
                  hex: entry.hex,
                  pantone: entry.pantone,
                  description: entry.description,
                  status: entry.status,
                  tags: entry.tags,
                  owner: entry.owner,
                  createdAt: entry.createdAt,
                  collectionName: entry.collectionName,
                })
              }
              className="group rounded-lg border border-border bg-card hover:border-primary/40 transition-colors cursor-pointer overflow-hidden text-left"
            >
              {/* Color swatch */}
              <div
                className="h-24 w-full"
                style={{ backgroundColor: validHex ?? '#e5e7eb' }}
              >
                {!validHex && (
                  <div className="h-full w-full flex items-center justify-center">
                    <Pipette className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{entry.title}</p>
                    {entry.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {entry.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ${STATUS_COLORS[entry.status] ?? ''}`}
                  >
                    {STATUS_LABELS[entry.status] ?? entry.status}
                  </span>
                </div>

                {/* Pantone / Hex codes */}
                <div className="flex items-center gap-2 flex-wrap">
                  {entry.pantone && (
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">
                      {entry.pantone}
                    </span>
                  )}
                  {entry.hex && (
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded uppercase">
                      {entry.hex}
                    </span>
                  )}
                  {entry.collectionName && (
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {entry.collectionName}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                  <span>{entry.owner}</span>
                  <span className="tabular-nums">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <ColorDetailDialog
        color={selectedColor}
        open={!!selectedColor}
        onOpenChange={(open) => {
          if (!open) setSelectedColor(null)
        }}
        onColorSaved={handleColorSaved}
      />
    </>
  )
}
