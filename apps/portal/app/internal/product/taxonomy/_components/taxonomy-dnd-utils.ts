import type { UniqueIdentifier } from "@dnd-kit/core"

// ─── Types ──────────────────────────────────────────────────────────

export interface ProductType {
  id: string
  code: string
  name: string
  status: string
  sortOrder: number
}

export interface Subcategory {
  id: string
  code: string
  name: string
  status: string
  sortOrder: number
  productTypes: ProductType[]
}

export interface Category {
  id: string
  code: string
  name: string
  status: string
  sortOrder: number
  subcategories: Subcategory[]
}

export type ItemType = "category" | "subcategory" | "productType"

// ─── ID helpers ─────────────────────────────────────────────────────

export function prefixId(type: ItemType, id: string): string {
  if (type === "category") return `cat-${id}`
  if (type === "subcategory") return `sub-${id}`
  return `pt-${id}`
}

export function parseId(prefixed: UniqueIdentifier): { type: ItemType; id: string } | null {
  const str = String(prefixed)
  if (str.startsWith("cat-")) return { type: "category", id: str.slice(4) }
  if (str.startsWith("sub-")) return { type: "subcategory", id: str.slice(4) }
  if (str.startsWith("pt-")) return { type: "productType", id: str.slice(3) }
  return null
}

// ─── Hierarchy lookup helpers ───────────────────────────────────────

export function findSubParent(hierarchy: Category[], subId: string): Category | undefined {
  return hierarchy.find((cat) => cat.subcategories.some((s) => s.id === subId))
}

export function findPtParent(
  hierarchy: Category[],
  ptId: string
): { cat: Category; sub: Subcategory } | undefined {
  for (const cat of hierarchy) {
    for (const sub of cat.subcategories) {
      if (sub.productTypes.some((p) => p.id === ptId)) return { cat, sub }
    }
  }
  return undefined
}

export function findItemByParsed(
  hierarchy: Category[],
  parsed: { type: ItemType; id: string }
): { name: string; code: string } | undefined {
  if (parsed.type === "category") {
    return hierarchy.find((c) => c.id === parsed.id)
  }
  for (const cat of hierarchy) {
    if (parsed.type === "subcategory") {
      const sub = cat.subcategories.find((s) => s.id === parsed.id)
      if (sub) return sub
    }
    if (parsed.type === "productType") {
      for (const sub of cat.subcategories) {
        const pt = sub.productTypes.find((p) => p.id === parsed.id)
        if (pt) return pt
      }
    }
  }
  return undefined
}
