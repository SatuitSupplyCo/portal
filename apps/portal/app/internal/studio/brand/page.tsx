import type { Metadata } from "next"
import { DocPageShell } from "@/components/nav/DocPageShell"
import {
  Waves,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Tag,
  User,
  Camera,
  Droplet,
} from "lucide-react"
import { Button } from "@repo/ui/button"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Brand Aesthetic | Studio",
}

import { STUDIO_STATUS_COLORS as statusColors } from "@/lib/status"

// ─── Empty state ─────────────────────────────────────────────────────

import { EmptyState } from "@/components/EmptyState"

function BrandEmptyState() {
  return (
    <EmptyState
      icon={Waves}
      title="No brand inspiration yet"
      description="Protect aesthetic discipline. Capture photography mood, texture references (granite, rope, canvas, brass), color studies, and editorial direction. This feeds Marketing, Packaging, and E-comm."
    >
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Inspiration
      </Button>
    </EmptyState>
  )
}

// ─── Page ────────────────────────────────────────────────────────────

export default function StudioBrandPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Studio", href: "/internal/studio" },
        { label: "Brand" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 md:px-12 border-b">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Waves className="h-4 w-4 text-primary" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">
                  Brand Aesthetic
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-11">
                Protect aesthetic discipline. Photography mood, texture
                references, color studies, and editorial direction.
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Inspiration
            </Button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="px-8 py-4 md:px-12 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search brand inspiration..."
                className="w-full h-8 pl-9 pr-3 text-sm rounded-md border bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-3 w-3" />
              Status
            </Button>
            <Button variant="outline" size="sm">
              <Camera className="h-3 w-3" />
              Photography
            </Button>
            <Button variant="outline" size="sm">
              <Droplet className="h-3 w-3" />
              Color
            </Button>
            <Button variant="outline" size="sm">
              <Tag className="h-3 w-3" />
              Tags
            </Button>
            <Button variant="outline" size="sm">
              <User className="h-3 w-3" />
              Owner
            </Button>

            <div className="ml-auto flex items-center gap-1 border rounded-md p-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7 bg-accent">
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Grid view — image-forward (default for Brand) */}
        <div className="px-8 py-8 md:px-12">
          <BrandEmptyState />
        </div>
      </main>
    </DocPageShell>
  )
}
