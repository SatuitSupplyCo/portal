"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@repo/ui/button"
import { ChevronsUpDown } from "lucide-react"
import { AddItemDialog } from "./AddItemDialog"
import { EditNameDialog } from "./EditNameDialog"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"
import { CategoryRow } from "./CategoryRow"
import { SubcategoryRow } from "./SubcategoryRow"
import { ProductTypeRow } from "./ProductTypeRow"
import { DragOverlayRow } from "./DragOverlayRow"
import {
  prefixId,
  parseId,
  findItemByParsed,
  type Category,
  type ItemType,
} from "./taxonomy-dnd-utils"
import { useTaxonomyDnd, isDropTarget } from "./useTaxonomyDnd"
import {
  createCategory,
  createSubcategory,
  createProductType,
  updateCategory,
  updateSubcategory,
  updateProductType,
  checkCategoryUsage,
  checkSubcategoryUsage,
  checkProductTypeUsage,
  deleteCategory,
  deleteSubcategory,
  deleteProductType,
} from "../actions"

// Re-export types for backwards compatibility
export type { Category, Subcategory, ProductType } from "./taxonomy-dnd-utils"

// ─── Main Component ─────────────────────────────────────────────────

export function TaxonomyHierarchy({ hierarchy: initialHierarchy }: { hierarchy: Category[] }) {
  const [hierarchy, setHierarchy] = useState<Category[]>(initialHierarchy)
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const ids = new Set<string>()
    initialHierarchy.forEach((cat) => ids.add(cat.id))
    return ids
  })
  const [renameTarget, setRenameTarget] = useState<{
    type: ItemType
    id: string
    name: string
  } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: ItemType
    id: string
    name: string
  } | null>(null)

  useEffect(() => {
    setHierarchy(initialHierarchy)
  }, [initialHierarchy])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const { activeId, overId, handleDragStart, handleDragOver, handleDragCancel, handleDragEnd } =
    useTaxonomyDnd({ hierarchy, setHierarchy, setExpanded })

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const categoryOnlyIds = useMemo(() => hierarchy.map((c) => c.id), [hierarchy])

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

  const currentDepth = useMemo(() => {
    if (expanded.size === 0) return 0
    const allOpen = allExpandableIds.length > 0 && allExpandableIds.every((id) => expanded.has(id))
    if (allOpen) return 2
    const catsOnly = categoryOnlyIds.length > 0 && categoryOnlyIds.every((id) => expanded.has(id))
    const noSubs = hierarchy.every((cat) =>
      cat.subcategories.every((sub) => !expanded.has(sub.id))
    )
    if (catsOnly && noSubs) return 1
    return 1
  }, [expanded, allExpandableIds, categoryOnlyIds, hierarchy])

  const depthLabels = ["Expand Categories", "Expand All", "Collapse All"] as const

  const cycleDepth = useCallback(() => {
    if (currentDepth === 0) {
      setExpanded(new Set(categoryOnlyIds))
    } else if (currentDepth === 1) {
      setExpanded(new Set(allExpandableIds))
    } else {
      setExpanded(new Set())
    }
  }, [currentDepth, categoryOnlyIds, allExpandableIds])

  const activeParsed = activeId ? parseId(activeId) : null
  const overParsed = overId ? parseId(overId) : null

  const categoryIds = useMemo(
    () => hierarchy.map((c) => prefixId("category", c.id)),
    [hierarchy]
  )

  const activeItem = activeParsed ? findItemByParsed(hierarchy, activeParsed) : null

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
          <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
            {hierarchy.map((cat) => {
              const catExpanded = expanded.has(cat.id)
              const subIds = cat.subcategories.map((s) => prefixId("subcategory", s.id))

              return (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  isExpanded={catExpanded}
                  isHighlighted={isDropTarget("category", cat.id, activeParsed, overParsed)}
                  isDragSource={activeParsed?.type === "category" && activeParsed.id === cat.id}
                  onToggle={() => toggle(cat.id)}
                  onRename={() => setRenameTarget({ type: "category", id: cat.id, name: cat.name })}
                  onDelete={() => setDeleteTarget({ type: "category", id: cat.id, name: cat.name })}
                >
                  <div className="bg-muted/30">
                    <SortableContext items={subIds} strategy={verticalListSortingStrategy}>
                      {cat.subcategories.map((sub) => {
                        const subExpanded = expanded.has(sub.id)
                        const ptIds = sub.productTypes.map((p) => prefixId("productType", p.id))

                        return (
                          <SubcategoryRow
                            key={sub.id}
                            sub={sub}
                            isExpanded={subExpanded}
                            isHighlighted={isDropTarget("subcategory", sub.id, activeParsed, overParsed)}
                            isDragSource={
                              activeParsed?.type === "subcategory" && activeParsed.id === sub.id
                            }
                            onToggle={() => toggle(sub.id)}
                            onRename={() =>
                              setRenameTarget({ type: "subcategory", id: sub.id, name: sub.name })
                            }
                            onDelete={() =>
                              setDeleteTarget({ type: "subcategory", id: sub.id, name: sub.name })
                            }
                          >
                            <div className="bg-muted/20">
                              <SortableContext items={ptIds} strategy={verticalListSortingStrategy}>
                                {sub.productTypes.map((pt) => (
                                  <ProductTypeRow
                                    key={pt.id}
                                    pt={pt}
                                    isHighlighted={isDropTarget(
                                      "productType",
                                      pt.id,
                                      activeParsed,
                                      overParsed
                                    )}
                                    isDragSource={
                                      activeParsed?.type === "productType" &&
                                      activeParsed.id === pt.id
                                    }
                                    onRename={() =>
                                      setRenameTarget({
                                        type: "productType",
                                        id: pt.id,
                                        name: pt.name,
                                      })
                                    }
                                    onDelete={() =>
                                      setDeleteTarget({
                                        type: "productType",
                                        id: pt.id,
                                        name: pt.name,
                                      })
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
                          </SubcategoryRow>
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
                </CategoryRow>
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

      {renameTarget && (
        <EditNameDialog
          open={!!renameTarget}
          onOpenChange={(open) => {
            if (!open) setRenameTarget(null)
          }}
          title={`Rename ${
            renameTarget.type === "category"
              ? "Category"
              : renameTarget.type === "subcategory"
                ? "Subcategory"
                : "Product Type"
          }`}
          currentName={renameTarget.name}
          onSave={async (newName) => {
            if (renameTarget.type === "category")
              return updateCategory(renameTarget.id, { name: newName })
            if (renameTarget.type === "subcategory")
              return updateSubcategory(renameTarget.id, { name: newName })
            return updateProductType(renameTarget.id, { name: newName })
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          itemName={deleteTarget.name}
          checkUsage={async () => {
            if (deleteTarget.type === "category") return checkCategoryUsage(deleteTarget.id)
            if (deleteTarget.type === "subcategory")
              return checkSubcategoryUsage(deleteTarget.id)
            return checkProductTypeUsage(deleteTarget.id)
          }}
          onDelete={async () => {
            if (deleteTarget.type === "category") return deleteCategory(deleteTarget.id)
            if (deleteTarget.type === "subcategory") return deleteSubcategory(deleteTarget.id)
            return deleteProductType(deleteTarget.id)
          }}
        />
      )}
    </div>
  )
}
