// ─── Section type ────────────────────────────────────────────────────

export interface ProductSection {
  title: string
  href: string
  group?: 'lifecycle' | 'admin'
}

// ─── Static sections (collections come from the taxonomy DB) ─────────

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

  // Admin — taxonomy management
  {
    title: "Product Taxonomy",
    href: "/internal/product/taxonomy",
    group: 'admin',
  },
]
