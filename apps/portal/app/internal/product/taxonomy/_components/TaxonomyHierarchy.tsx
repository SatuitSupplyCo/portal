'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@repo/ui/badge'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/utils'
import { ChevronRight, ChevronDown, ChevronsUpDown, GripVertical } from 'lucide-react'
import { AddItemDialog } from './AddItemDialog'
import {
  createCategory,
  createSubcategory,
  createProductType,
  reorderCategories,
  reorderSubcategories,
  reorderProductTypes,
  moveSubcategory,
  moveProductType,
} from '../actions'

// ─── Types ──────────────────────────────────────────────────────────

interface ProductType {
  id: string
  code: string
  name: string
  status: string
  sortOrder: number
}

interface Subcategory {
  id: string
  code: string
  name: string
  status: string
  sortOrder: number
  productTypes: ProductType[]
}

interface Category {
  id: string
  code: string
  name: string
  status: string
  sortOrder: number
  subcategories: Subcategory[]
}

// ─── ID helpers ─────────────────────────────────────────────────────

type ItemType = 'category' | 'subcategory' | 'productType'

function prefixId(type: ItemType, id: string): string {
  if (type === 'category') return `cat-${id}`
  if (type === 'subcategory') return `sub-${id}`
  return `pt-${id}`
}

function parseId(prefixed: UniqueIdentifier): { type: ItemType; id: string } | null {
  const str = String(prefixed)
  if (str.startsWith('cat-')) return { type: 'category', id: str.slice(4) }
  if (str.startsWith('sub-')) return { type: 'subcategory', id: str.slice(4) }
  if (str.startsWith('pt-')) return { type: 'productType', id: str.slice(3) }
  return null
}

// ─── Hierarchy lookup helpers ───────────────────────────────────────

function findSubParent(hierarchy: Category[], subId: string): Category | undefined {
  return hierarchy.find((cat) => cat.subcategories.some((s) => s.id === subId))
}

function findPtParent(
  hierarchy: Category[],
  ptId: string,
): { cat: Category; sub: Subcategory } | undefined {
  for (const cat of hierarchy) {
    for (const sub of cat.subcategories) {
      if (sub.productTypes.some((p) => p.id === ptId)) return { cat, sub }
    }
  }
  return undefined
}

function findItemByParsed(
  hierarchy: Category[],
  parsed: { type: ItemType; id: string },
): { name: string; code: string } | undefined {
  if (parsed.type === 'category') {
    return hierarchy.find((c) => c.id === parsed.id)
  }
  for (const cat of hierarchy) {
    if (parsed.type === 'subcategory') {
      const sub = cat.subcategories.find((s) => s.id === parsed.id)
      if (sub) return sub
    }
    if (parsed.type === 'productType') {
      for (const sub of cat.subcategories) {
        const pt = sub.productTypes.find((p) => p.id === parsed.id)
        if (pt) return pt
      }
    }
  }
  return undefined
}

// ─── Sortable Row: Category ─────────────────────────────────────────

function SortableCategoryRow({
  cat,
  isExpanded,
  isHighlighted,
  isDragSource,
  onToggle,
  children,
}: {
  cat: Category
  isExpanded: boolean
  isHighlighted: boolean
  isDragSource: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: prefixId('category', cat.id),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 transition-colors',
          isDragSource && 'opacity-30',
          isHighlighted && !isDragSource && 'bg-accent/50 ring-1 ring-inset ring-primary/20',
          !isDragSource && !isHighlighted && 'hover:bg-accent/50',
        )}
      >
        <button
          type="button"
          className="p-1 rounded text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="p-0.5 rounded hover:bg-accent"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <span className="font-medium text-sm">{cat.name}</span>
        <code className="text-xs text-muted-foreground font-mono">{cat.code}</code>
        <StatusBadge status={cat.status} />
        <span className="ml-auto text-xs text-muted-foreground">
          {cat.subcategories.length} subcategories
        </span>
      </div>
      {isExpanded && children}
    </div>
  )
}

// ─── Sortable Row: Subcategory ──────────────────────────────────────

function SortableSubcategoryRow({
  sub,
  isExpanded,
  isHighlighted,
  isDragSource,
  onToggle,
  children,
}: {
  sub: Subcategory
  isExpanded: boolean
  isHighlighted: boolean
  isDragSource: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: prefixId('subcategory', sub.id),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 pl-10 transition-colors',
          isDragSource && 'opacity-30',
          isHighlighted && !isDragSource && 'bg-accent/50 ring-1 ring-inset ring-primary/20',
          !isDragSource && !isHighlighted && 'hover:bg-accent/30',
        )}
      >
        <button
          type="button"
          className="p-1 rounded text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="p-0.5 rounded hover:bg-accent"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
        <span className="text-sm">{sub.name}</span>
        <code className="text-xs text-muted-foreground font-mono">{sub.code}</code>
        <StatusBadge status={sub.status} />
        <span className="ml-auto text-xs text-muted-foreground">
          {sub.productTypes.length} types
        </span>
      </div>
      {isExpanded && children}
    </div>
  )
}

// ─── Sortable Row: Product Type ─────────────────────────────────────

function SortableProductTypeRow({
  pt,
  isHighlighted,
  isDragSource,
}: {
  pt: ProductType
  isHighlighted: boolean
  isDragSource: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: prefixId('productType', pt.id),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 px-4 py-2 pl-20 transition-colors',
        isDragSource && 'opacity-30',
        isHighlighted && !isDragSource && 'bg-accent/40',
        !isDragSource && !isHighlighted && 'hover:bg-accent/20',
      )}
    >
      <button
        type="button"
        className="p-1 rounded text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <span className="text-sm text-muted-foreground">{pt.name}</span>
      <code className="text-xs text-muted-foreground/60 font-mono">{pt.code}</code>
      <StatusBadge status={pt.status} />
    </div>
  )
}

// ─── Drag Overlay ───────────────────────────────────────────────────

function DragOverlayRow({
  label,
  code,
  level,
}: {
  label: string
  code: string
  level: ItemType
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card px-4 shadow-lg',
        level === 'category' ? 'py-3' : 'py-2.5',
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/40" />
      <span className={cn('text-sm', level === 'category' && 'font-medium')}>
        {label}
      </span>
      <code className="text-xs text-muted-foreground font-mono">{code}</code>
    </div>
  )
}

// ─── Status Badge ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') return null
  return (
    <Badge variant="secondary" className="text-[10px]">
      {status}
    </Badge>
  )
}

// ─── Main Component ─────────────────────────────────────────────────

export function TaxonomyHierarchy({
  hierarchy: initialHierarchy,
}: {
  hierarchy: Category[]
}) {
  const [hierarchy, setHierarchy] = useState<Category[]>(initialHierarchy)
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const ids = new Set<string>()
    initialHierarchy.forEach((cat) => ids.add(cat.id))
    return ids
  })
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const categoryOnlyIds = useMemo(
    () => hierarchy.map((c) => c.id),
    [hierarchy],
  )

  const allExpandableIds = useMemo(() => {
    const ids: string[] = []
    for (const cat of hierarchy) {
      ids.push(cat.id)
      for (const sub of cat.subcategories) {
        ids.push(sub.id)
      }
    }
    return ids
  }, [hierarchy])

  // Determine current depth: 0 = collapsed, 1 = categories, 2 = all
  const currentDepth = useMemo(() => {
    if (expanded.size === 0) return 0
    const allOpen = allExpandableIds.length > 0 && allExpandableIds.every((id) => expanded.has(id))
    if (allOpen) return 2
    const catsOnly = categoryOnlyIds.length > 0 && categoryOnlyIds.every((id) => expanded.has(id))
    const noSubs = hierarchy.every((cat) =>
      cat.subcategories.every((sub) => !expanded.has(sub.id)),
    )
    if (catsOnly && noSubs) return 1
    return 1 // partial state → treat as depth 1
  }, [expanded, allExpandableIds, categoryOnlyIds, hierarchy])

  const depthLabels = ['Expand Categories', 'Expand All', 'Collapse All'] as const

  const cycleDepth = useCallback(() => {
    if (currentDepth === 0) {
      // → depth 1: expand categories only
      setExpanded(new Set(categoryOnlyIds))
    } else if (currentDepth === 1) {
      // → depth 2: expand everything
      setExpanded(new Set(allExpandableIds))
    } else {
      // → depth 0: collapse all
      setExpanded(new Set())
    }
  }, [currentDepth, categoryOnlyIds, allExpandableIds])

  const activeParsed = activeId ? parseId(activeId) : null
  const overParsed = overId ? parseId(overId) : null

  const categoryIds = useMemo(
    () => hierarchy.map((c) => prefixId('category', c.id)),
    [hierarchy],
  )

  // ── Drag event handlers ───────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id)
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over?.id ?? null)
  }

  function handleDragCancel() {
    setActiveId(null)
    setOverId(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (!over || active.id === over.id) return

    const aParsed = parseId(active.id)
    const oParsed = parseId(over.id)
    if (!aParsed || !oParsed) return

    // ── Category reorder ──
    if (aParsed.type === 'category' && oParsed.type === 'category') {
      const oldIdx = hierarchy.findIndex((c) => c.id === aParsed.id)
      const newIdx = hierarchy.findIndex((c) => c.id === oParsed.id)
      if (oldIdx === -1 || newIdx === -1) return

      const reordered = arrayMove(hierarchy, oldIdx, newIdx)
      setHierarchy(reordered)
      reorderCategories(reordered.map((c) => c.id))
      return
    }

    // ── Subcategory reorder / reclassify ──
    if (aParsed.type === 'subcategory') {
      const srcCat = findSubParent(hierarchy, aParsed.id)
      if (!srcCat) return

      if (oParsed.type === 'subcategory') {
        const dstCat = findSubParent(hierarchy, oParsed.id)
        if (!dstCat) return

        if (srcCat.id === dstCat.id) {
          // Same category → reorder
          const subs = [...srcCat.subcategories]
          const oldIdx = subs.findIndex((s) => s.id === aParsed.id)
          const newIdx = subs.findIndex((s) => s.id === oParsed.id)
          const reordered = arrayMove(subs, oldIdx, newIdx)

          setHierarchy((prev) =>
            prev.map((cat) =>
              cat.id === srcCat.id ? { ...cat, subcategories: reordered } : cat,
            ),
          )
          reorderSubcategories(srcCat.id, reordered.map((s) => s.id))
        } else {
          // Different category → reclassify
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
            }),
          )
          moveSubcategory(aParsed.id, dstCat.id, insertIdx)
        }
        return
      }

      // Dropped on a category → move into it (append)
      if (oParsed.type === 'category' && oParsed.id !== srcCat.id) {
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
          }),
        )
        setExpanded((prev) => new Set(prev).add(oParsed.id))
        moveSubcategory(aParsed.id, oParsed.id, dstCat.subcategories.length)
        return
      }
    }

    // ── Product type reorder / reclassify ──
    if (aParsed.type === 'productType') {
      const srcCtx = findPtParent(hierarchy, aParsed.id)
      if (!srcCtx) return

      if (oParsed.type === 'productType') {
        const dstCtx = findPtParent(hierarchy, oParsed.id)
        if (!dstCtx) return

        if (srcCtx.sub.id === dstCtx.sub.id) {
          // Same subcategory → reorder
          const pts = [...srcCtx.sub.productTypes]
          const oldIdx = pts.findIndex((p) => p.id === aParsed.id)
          const newIdx = pts.findIndex((p) => p.id === oParsed.id)
          const reordered = arrayMove(pts, oldIdx, newIdx)

          setHierarchy((prev) =>
            prev.map((cat) => ({
              ...cat,
              subcategories: cat.subcategories.map((sub) =>
                sub.id === srcCtx.sub.id ? { ...sub, productTypes: reordered } : sub,
              ),
            })),
          )
          reorderProductTypes(srcCtx.sub.id, reordered.map((p) => p.id))
        } else {
          // Different subcategory → reclassify
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
            })),
          )
          moveProductType(aParsed.id, dstCtx.sub.id, insertIdx)
        }
        return
      }

      // Dropped on a subcategory → move into it (append)
      if (oParsed.type === 'subcategory' && oParsed.id !== srcCtx.sub.id) {
        const movedPt = srcCtx.sub.productTypes.find((p) => p.id === aParsed.id)!
        const dstSub = hierarchy
          .flatMap((c) => c.subcategories)
          .find((s) => s.id === oParsed.id)!

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
          })),
        )
        setExpanded((prev) => new Set(prev).add(oParsed.id))
        moveProductType(aParsed.id, oParsed.id, dstSub.productTypes.length)
        return
      }
    }
  }

  // ── Resolve active item for DragOverlay ───────────────────────────

  const activeItem = activeParsed ? findItemByParsed(hierarchy, activeParsed) : null

  // ── Highlight logic ───────────────────────────────────────────────
  // Highlight a row when it's the current drop target AND it's a valid
  // target for the item being dragged.

  function isDropTarget(rowType: ItemType, rowId: string): boolean {
    if (!activeParsed || !overParsed) return false
    if (overParsed.type !== rowType || overParsed.id !== rowId) return false

    // Categories highlight when reordering categories OR receiving subcategories
    if (rowType === 'category') {
      return activeParsed.type === 'category' || activeParsed.type === 'subcategory'
    }
    // Subcategories highlight when reordering subcategories OR receiving product types
    if (rowType === 'subcategory') {
      return activeParsed.type === 'subcategory' || activeParsed.type === 'productType'
    }
    // Product types highlight only for product type reorder
    if (rowType === 'productType') {
      return activeParsed.type === 'productType'
    }
    return false
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Product Hierarchy</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground gap-1.5"
            onClick={cycleDepth}
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
            {depthLabels[currentDepth]}
          </Button>
          <AddItemDialog
            title="Add Category"
            onAdd={async (data) => createCategory({ code: data.code, name: data.label })}
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="rounded-lg border bg-card shadow-sm divide-y">
          <SortableContext
            items={categoryIds}
            strategy={verticalListSortingStrategy}
          >
            {hierarchy.map((cat) => {
              const catExpanded = expanded.has(cat.id)
              const subIds = cat.subcategories.map((s) =>
                prefixId('subcategory', s.id),
              )

              return (
                <SortableCategoryRow
                  key={cat.id}
                  cat={cat}
                  isExpanded={catExpanded}
                  isHighlighted={isDropTarget('category', cat.id)}
                  isDragSource={
                    activeParsed?.type === 'category' &&
                    activeParsed.id === cat.id
                  }
                  onToggle={() => toggle(cat.id)}
                >
                  <div className="bg-muted/30">
                    <SortableContext
                      items={subIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {cat.subcategories.map((sub) => {
                        const subExpanded = expanded.has(sub.id)
                        const ptIds = sub.productTypes.map((p) =>
                          prefixId('productType', p.id),
                        )

                        return (
                          <SortableSubcategoryRow
                            key={sub.id}
                            sub={sub}
                            isExpanded={subExpanded}
                            isHighlighted={isDropTarget('subcategory', sub.id)}
                            isDragSource={
                              activeParsed?.type === 'subcategory' &&
                              activeParsed.id === sub.id
                            }
                            onToggle={() => toggle(sub.id)}
                          >
                            <div className="bg-muted/20">
                              <SortableContext
                                items={ptIds}
                                strategy={verticalListSortingStrategy}
                              >
                                {sub.productTypes.map((pt) => (
                                  <SortableProductTypeRow
                                    key={pt.id}
                                    pt={pt}
                                    isHighlighted={isDropTarget(
                                      'productType',
                                      pt.id,
                                    )}
                                    isDragSource={
                                      activeParsed?.type === 'productType' &&
                                      activeParsed.id === pt.id
                                    }
                                  />
                                ))}
                              </SortableContext>

                              <div className="pl-20 px-4 py-2">
                                <AddItemDialog
                                  title={`Add Product Type to ${sub.name}`}
                                  onAdd={async (data) =>
                                    createProductType({
                                      subcategoryId: sub.id,
                                      code: data.code,
                                      name: data.label,
                                    })
                                  }
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs text-muted-foreground"
                                    >
                                      + Add product type
                                    </Button>
                                  }
                                />
                              </div>
                            </div>
                          </SortableSubcategoryRow>
                        )
                      })}
                    </SortableContext>

                    <div className="pl-10 px-4 py-2">
                      <AddItemDialog
                        title={`Add Subcategory to ${cat.name}`}
                        onAdd={async (data) =>
                          createSubcategory({
                            categoryId: cat.id,
                            code: data.code,
                            name: data.label,
                          })
                        }
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground"
                          >
                            + Add subcategory
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </SortableCategoryRow>
              )
            })}
          </SortableContext>

          {hierarchy.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No categories defined yet.
            </div>
          )}
        </div>

        <DragOverlay>
          {activeItem && activeParsed ? (
            <DragOverlayRow
              label={activeItem.name}
              code={activeItem.code}
              level={activeParsed.type}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
