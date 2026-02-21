'use client'

import { useState, useEffect, useCallback } from 'react'
import { ColorDetailDialog } from '@/components/ColorDetailDialog'
import type { ColorDetailData } from '@/lib/color'

interface HeaderColor {
  id: string
  studioEntryId: string
  status: 'confirmed' | 'proposed'
  title: string
  hex: string | null
  pantone: string | null
  tags: string[] | null
}

interface SeasonHeaderSwatchesProps {
  colors: HeaderColor[]
}

export function SeasonHeaderSwatches({ colors: propColors }: SeasonHeaderSwatchesProps) {
  const [colors, setColors] = useState(propColors)
  const [selectedColor, setSelectedColor] = useState<ColorDetailData | null>(null)

  useEffect(() => { setColors(propColors) }, [propColors])

  const handleColorSaved = useCallback((updated: ColorDetailData) => {
    setColors(prev => prev.map(c => {
      if (c.studioEntryId !== updated.id) return c
      return {
        ...c,
        title: updated.title,
        hex: updated.hex,
        pantone: updated.pantone,
        tags: updated.tags ?? c.tags,
      }
    }))
    setSelectedColor(updated)
  }, [])

  const confirmedCount = colors.filter((c) => c.status === 'confirmed').length

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-0.5">
        {colors.slice(0, 12).map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() =>
              setSelectedColor({
                id: color.studioEntryId,
                title: color.title,
                hex: color.hex,
                pantone: color.pantone,
                tags: color.tags,
              })
            }
            className="w-7 h-7 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110 hover:z-10 cursor-pointer relative"
            style={{ backgroundColor: color.hex ?? '#e5e7eb' }}
            title={color.title}
          />
        ))}
        {colors.length > 12 && (
          <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-zinc-100 flex items-center justify-center">
            <span className="text-[8px] font-medium text-zinc-500">
              +{colors.length - 12}
            </span>
          </div>
        )}
      </div>
      <span className="text-[10px] text-[var(--depot-faint)] tracking-wide">
        {colors.length} color{colors.length !== 1 ? 's' : ''}
        {confirmedCount > 0 && <> · {confirmedCount} confirmed</>}
      </span>

      <ColorDetailDialog
        color={selectedColor}
        open={!!selectedColor}
        onOpenChange={(open) => {
          if (!open) setSelectedColor(null)
        }}
        onColorSaved={handleColorSaved}
      />
    </div>
  )
}
