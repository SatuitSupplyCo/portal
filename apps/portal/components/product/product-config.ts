// ─── Section type ────────────────────────────────────────────────────

export interface ProductSection {
  title: string
  href: string
}

// ─── All sections ────────────────────────────────────────────────────

export const productSections: ProductSection[] = [
  {
    title: "Product System",
    href: "/internal/product",
  },
  {
    title: "Core Essentials",
    href: "/internal/product/core-essentials",
  },
  {
    title: "Material Collection",
    href: "/internal/product/material-collection",
  },
  {
    title: "Origin Collection",
    href: "/internal/product/origin-collection",
  },
  {
    title: "Coastal Function",
    href: "/internal/product/coastal-function",
  },
]
