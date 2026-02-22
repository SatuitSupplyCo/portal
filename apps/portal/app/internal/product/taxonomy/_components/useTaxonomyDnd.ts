"use client"

import { useCallback, useState } from "react"
import type { DragStartEvent, DragEndEvent, DragOverEvent, UniqueIdentifier } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import {
  parseId,
  findSubParent,
  findPtParent,
  type Category,
  type ItemType,
} from "./taxonomy-dnd-utils"
import {
  reorderCategories,
  reorderSubcategories,
  reorderProductTypes,
  moveSubcategory,
  moveProductType,
} from "../actions"

interface UseTaxonomyDndOptions {
  hierarchy: Category[]
  setHierarchy: React.Dispatch<React.SetStateAction<Category[]>>
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>
}

export function useTaxonomyDnd({ hierarchy, setHierarchy, setExpanded }: UseTaxonomyDndOptions) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id ?? null)
  }, [])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setOverId(null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setOverId(null)

      if (!over || active.id === over.id) return

      const aParsed = parseId(active.id)
      const oParsed = parseId(over.id)
      if (!aParsed || !oParsed) return

      // ── Category reorder ──
      if (aParsed.type === "category" && oParsed.type === "category") {
        const oldIdx = hierarchy.findIndex((c) => c.id === aParsed.id)
        const newIdx = hierarchy.findIndex((c) => c.id === oParsed.id)
        if (oldIdx === -1 || newIdx === -1) return

        const reordered = arrayMove(hierarchy, oldIdx, newIdx)
        setHierarchy(reordered)
        reorderCategories(reordered.map((c) => c.id))
        return
      }

      // ── Subcategory reorder / reclassify ──
      if (aParsed.type === "subcategory") {
        const srcCat = findSubParent(hierarchy, aParsed.id)
        if (!srcCat) return

        if (oParsed.type === "subcategory") {
          const dstCat = findSubParent(hierarchy, oParsed.id)
          if (!dstCat) return

          if (srcCat.id === dstCat.id) {
            const subs = [...srcCat.subcategories]
            const oldIdx = subs.findIndex((s) => s.id === aParsed.id)
            const newIdx = subs.findIndex((s) => s.id === oParsed.id)
            const reordered = arrayMove(subs, oldIdx, newIdx)

            setHierarchy((prev) =>
              prev.map((cat) =>
                cat.id === srcCat.id ? { ...cat, subcategories: reordered } : cat
              )
            )
            reorderSubcategories(srcCat.id, reordered.map((s) => s.id))
          } else {
            const movedSub = srcCat.subcategories.find((s) => s.id === aParsed.id)!
            const insertIdx = dstCat.subcategories.findIndex((s) => s.id === oParsed.id)

            setHierarchy((prev) =>
              prev.map((cat) => {
                if (cat.id === srcCat.id) {
                  return {
                    ...cat,
                    subcategories: cat.subcategories.filter((s) => s.id !== aParsed.id),
                  }
                }
                if (cat.id === dstCat.id) {
                  const newSubs = [...cat.subcategories]
                  newSubs.splice(insertIdx, 0, movedSub)
                  return { ...cat, subcategories: newSubs }
                }
                return cat
              })
            )
            moveSubcategory(aParsed.id, dstCat.id, insertIdx)
          }
          return
        }

        if (oParsed.type === "category" && oParsed.id !== srcCat.id) {
          const movedSub = srcCat.subcategories.find((s) => s.id === aParsed.id)!
          const dstCat = hierarchy.find((c) => c.id === oParsed.id)!

          setHierarchy((prev) =>
            prev.map((cat) => {
              if (cat.id === srcCat.id) {
                return {
                  ...cat,
                  subcategories: cat.subcategories.filter((s) => s.id !== aParsed.id),
                }
              }
              if (cat.id === oParsed.id) {
                return { ...cat, subcategories: [...cat.subcategories, movedSub] }
              }
              return cat
            })
          )
          setExpanded((prev) => new Set(prev).add(oParsed.id))
          moveSubcategory(aParsed.id, oParsed.id, dstCat.subcategories.length)
        }
        return
      }

      // ── Product type reorder / reclassify ──
      if (aParsed.type === "productType") {
        const srcCtx = findPtParent(hierarchy, aParsed.id)
        if (!srcCtx) return

        if (oParsed.type === "productType") {
          const dstCtx = findPtParent(hierarchy, oParsed.id)
          if (!dstCtx) return

          if (srcCtx.sub.id === dstCtx.sub.id) {
            const pts = [...srcCtx.sub.productTypes]
            const oldIdx = pts.findIndex((p) => p.id === aParsed.id)
            const newIdx = pts.findIndex((p) => p.id === oParsed.id)
            const reordered = arrayMove(pts, oldIdx, newIdx)

            setHierarchy((prev) =>
              prev.map((cat) => ({
                ...cat,
                subcategories: cat.subcategories.map((sub) =>
                  sub.id === srcCtx.sub.id ? { ...sub, productTypes: reordered } : sub
                ),
              }))
            )
            reorderProductTypes(srcCtx.sub.id, reordered.map((p) => p.id))
          } else {
            const movedPt = srcCtx.sub.productTypes.find((p) => p.id === aParsed.id)!
            const insertIdx = dstCtx.sub.productTypes.findIndex((p) => p.id === oParsed.id)

            setHierarchy((prev) =>
              prev.map((cat) => ({
                ...cat,
                subcategories: cat.subcategories.map((sub) => {
                  if (sub.id === srcCtx.sub.id) {
                    return {
                      ...sub,
                      productTypes: sub.productTypes.filter((p) => p.id !== aParsed.id),
                    }
                  }
                  if (sub.id === dstCtx.sub.id) {
                    const newPts = [...sub.productTypes]
                    newPts.splice(insertIdx, 0, movedPt)
                    return { ...sub, productTypes: newPts }
                  }
                  return sub
                }),
              }))
            )
            moveProductType(aParsed.id, dstCtx.sub.id, insertIdx)
          }
          return
        }

        if (oParsed.type === "subcategory" && oParsed.id !== srcCtx.sub.id) {
          const movedPt = srcCtx.sub.productTypes.find((p) => p.id === aParsed.id)!
          const dstSub = hierarchy.flatMap((c) => c.subcategories).find((s) => s.id === oParsed.id)!

          setHierarchy((prev) =>
            prev.map((cat) => ({
              ...cat,
              subcategories: cat.subcategories.map((sub) => {
                if (sub.id === srcCtx.sub.id) {
                  return {
                    ...sub,
                    productTypes: sub.productTypes.filter((p) => p.id !== aParsed.id),
                  }
                }
                if (sub.id === oParsed.id) {
                  return { ...sub, productTypes: [...sub.productTypes, movedPt] }
                }
                return sub
              }),
            }))
          )
          setExpanded((prev) => new Set(prev).add(oParsed.id))
          moveProductType(aParsed.id, oParsed.id, dstSub.productTypes.length)
        }
      }
    },
    [hierarchy, setHierarchy, setExpanded]
  )

  return { activeId, overId, handleDragStart, handleDragOver, handleDragCancel, handleDragEnd }
}

export function isDropTarget(
  rowType: ItemType,
  rowId: string,
  activeParsed: { type: ItemType; id: string } | null,
  overParsed: { type: ItemType; id: string } | null
): boolean {
  if (!activeParsed || !overParsed) return false
  if (overParsed.type !== rowType || overParsed.id !== rowId) return false

  if (rowType === "category") {
    return activeParsed.type === "category" || activeParsed.type === "subcategory"
  }
  if (rowType === "subcategory") {
    return activeParsed.type === "subcategory" || activeParsed.type === "productType"
  }
  if (rowType === "productType") {
    return activeParsed.type === "productType"
  }
  return false
}
