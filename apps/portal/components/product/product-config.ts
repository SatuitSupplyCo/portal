// ─── Section type ────────────────────────────────────────────────────

export interface ProductSection {
  title: string
  href: string
  group?: 'lifecycle' | 'reference' | 'admin'
}

// ─── All sections ────────────────────────────────────────────────────

export const productSections: ProductSection[] = [
  // Lifecycle hub
  {
    title: "Assortment Dashboard",
    href: "/internal/product",
    group: 'lifecycle',
  },
  {
    title: "Seasons",
    href: "/internal/product/seasons",
    group: 'lifecycle',
  },
  {
    title: "Core Programs",
    href: "/internal/product/core",
    group: 'lifecycle',
  },

  // Reference catalog
  {
    title: "Core Essentials",
    href: "/internal/product/collections/core-essentials",
    group: 'reference',
  },
  {
    title: "Material Collection",
    href: "/internal/product/collections/material-collection",
    group: 'reference',
  },
  {
    title: "Origin Collection",
    href: "/internal/product/collections/origin-collection",
    group: 'reference',
  },
  {
    title: "Coastal Function",
    href: "/internal/product/collections/coastal-function",
    group: 'reference',
  },

  // Admin — taxonomy management
  {
    title: "Product Taxonomy",
    href: "/internal/product/taxonomy",
    group: 'admin',
  },
]
