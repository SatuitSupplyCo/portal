'use client'

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react'

// ─── Types ──────────────────────────────────────────────────────────

export interface DimensionFilter {
  dimensionKey: string
  valueCode: string
}

export interface SlotFilterDatum {
  id: string
  colorwayIds: string[]
  dimensionValues: Record<string, string | null>
}

interface DimensionFilterContextValue {
  /** Currently active filter, or null when unfiltered */
  filter: DimensionFilter | null
  /** Toggle a filter value — same value again clears it */
  setFilter: (filter: DimensionFilter | null) => void
  /** Slot IDs that match the current filter (null = no filter, show all) */
  filteredSlotIds: Set<string> | null
  /** Colorway studio-entry IDs used by filtered slots (null = no filter, show all) */
  filteredColorwayIds: Set<string> | null
}

const DimensionFilterContext = createContext<DimensionFilterContextValue>({
  filter: null,
  setFilter: () => {},
  filteredSlotIds: null,
  filteredColorwayIds: null,
})

// ─── Hook ───────────────────────────────────────────────────────────

export function useDimensionFilter() {
  return useContext(DimensionFilterContext)
}

// ─── Provider ───────────────────────────────────────────────────────

interface DimensionFilterProviderProps {
  /** Lean slot data for computing filtered sets */
  slotFilterData: SlotFilterDatum[]
  children: ReactNode
}

export function DimensionFilterProvider({
  slotFilterData,
  children,
}: DimensionFilterProviderProps) {
  const [filter, setFilterRaw] = useState<DimensionFilter | null>(null)

  const setFilter = useCallback((next: DimensionFilter | null) => {
    setFilterRaw((prev) => {
      if (
        next &&
        prev &&
        prev.dimensionKey === next.dimensionKey &&
        prev.valueCode === next.valueCode
      ) {
        return null // toggle off
      }
      return next
    })
  }, [])

  const { filteredSlotIds, filteredColorwayIds } = useMemo(() => {
    if (!filter) return { filteredSlotIds: null, filteredColorwayIds: null }

    const matchingSlotIds = new Set<string>()
    const matchingColorwayIds = new Set<string>()

    for (const slot of slotFilterData) {
      const value = slot.dimensionValues[filter.dimensionKey]
      if (value === filter.valueCode) {
        matchingSlotIds.add(slot.id)
        for (const cid of slot.colorwayIds) {
          matchingColorwayIds.add(cid)
        }
      }
    }

    return {
      filteredSlotIds: matchingSlotIds,
      filteredColorwayIds: matchingColorwayIds,
    }
  }, [filter, slotFilterData])

  const value = useMemo<DimensionFilterContextValue>(
    () => ({ filter, setFilter, filteredSlotIds, filteredColorwayIds }),
    [filter, setFilter, filteredSlotIds, filteredColorwayIds],
  )

  return (
    <DimensionFilterContext.Provider value={value}>
      {children}
    </DimensionFilterContext.Provider>
  )
}
