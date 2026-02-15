import {
  Palette,
  Shirt,
  Scissors,
  Waves,
  BookMarked,
  Archive,
} from "lucide-react"

// ─── Section type ────────────────────────────────────────────────────

export interface StudioSection {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

// ─── All sections ────────────────────────────────────────────────────

export const studioSections: StudioSection[] = [
  {
    title: "Overview",
    href: "/internal/studio",
    icon: Palette,
    description: "Recent additions and studio health",
  },
  {
    title: "Product",
    href: "/internal/studio/product",
    icon: Shirt,
    description: "Silhouette and construction exploration",
  },
  {
    title: "Materials",
    href: "/internal/studio/materials",
    icon: Scissors,
    description: "Fabric-first thinking and mill references",
  },
  {
    title: "Brand",
    href: "/internal/studio/brand",
    icon: Waves,
    description: "Aesthetic discipline and editorial direction",
  },
  {
    title: "References",
    href: "/internal/studio/references",
    icon: BookMarked,
    description: "Competitive and industry scanning",
  },
  {
    title: "Archive",
    href: "/internal/studio/archive",
    icon: Archive,
    description: "Shelved ideas — nothing disappears",
  },
]
