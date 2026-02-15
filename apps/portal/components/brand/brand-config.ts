import {
  BookOpen,
  Anchor,
  MessageSquare,
  Layers,
  Type,
  Quote,
  Droplet,
  Camera,
  Tag,
  Package,
  Globe,
} from "lucide-react"

// ─── Heading type ───────────────────────────────────────────────────

export interface TocHeading {
  id: string
  text: string
  level: number
}

// ─── Section type ───────────────────────────────────────────────────

export interface BrandSection {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  headings: TocHeading[]
}

// ─── All sections ───────────────────────────────────────────────────

export const brandSections: BrandSection[] = [
  {
    title: "Brand System",
    href: "/internal/brand",
    icon: BookOpen,
    headings: [],
  },
  {
    title: "1.0 Foundations",
    href: "/internal/brand/foundations",
    icon: Anchor,
    headings: [
      { id: "brand-purpose", text: "1.1 The Brand Purpose", level: 2 },
      { id: "positioning", text: "1.2 The Positioning", level: 2 },
      { id: "audience", text: "1.3 The Audience", level: 2 },
      { id: "brand-promise", text: "1.4 The Brand Promise", level: 2 },
      { id: "brand-principles", text: "1.5 Brand Principles", level: 2 },
    ],
  },
  {
    title: "2.0 Messaging",
    href: "/internal/brand/messaging",
    icon: MessageSquare,
    headings: [
      { id: "core-narrative", text: "2.1 The Core Narrative", level: 2 },
      { id: "tagline-system", text: "2.2 The Tagline System", level: 2 },
      { id: "primary-anchor", text: "Primary Anchor", level: 3 },
      { id: "supporting-line", text: "Supporting Line", level: 3 },
      { id: "voice-attributes", text: "2.3 The Voice Attributes", level: 2 },
      { id: "language-guardrails", text: "2.4 Language Guardrails", level: 2 },
    ],
  },
  {
    title: "3.0 Visual Standards",
    href: "/internal/brand/visual",
    icon: Layers,
    headings: [
      { id: "two-flags-system", text: "3.1 The Two Flags System", level: 2 },
      { id: "the-architect", text: "The Architect", level: 3 },
      { id: "the-badge", text: "The Badge", level: 3 },
      { id: "official-lockups", text: "3.2 The Official Lockups", level: 2 },
      { id: "lockup-a", text: "A. Master Stack", level: 3 },
      { id: "lockup-b", text: "B. Primary Wordmark", level: 3 },
      { id: "lockup-c", text: "C. Horizontal Lockup", level: 3 },
      { id: "lockup-d", text: "D. Field Badge", level: 3 },
      { id: "clear-space", text: "3.3 Clear Space & Minimum Size", level: 2 },
      { id: "color-application", text: "3.4 Color Application", level: 2 },
    ],
  },
  {
    title: "4.0 Typography",
    href: "/internal/brand/typography",
    icon: Type,
    headings: [
      { id: "the-primary-typeface", text: "4.1 The Primary Typeface", level: 2 },
      { id: "single-source-policy", text: "4.2 Single-Source Policy", level: 2 },
      { id: "hierarchy-system", text: "4.3 The Hierarchy System", level: 2 },
      { id: "specimen-the-voice", text: "The Voice", level: 3 },
      { id: "specimen-the-data", text: "The Data", level: 3 },
      { id: "specimen-the-narrative", text: "The Narrative", level: 3 },
      { id: "technical-implementation", text: "4.4 Technical Implementation", level: 2 },
      { id: "guardrails", text: "4.5 The Guardrails", level: 2 },
    ],
  },
  {
    title: "5.0 Voice & Ethos",
    href: "/internal/brand/voice",
    icon: Quote,
    headings: [
      { id: "core-philosophy", text: "5.1 The Core Philosophy", level: 2 },
      { id: "brand-persona", text: "5.2 The Brand Persona", level: 2 },
      { id: "tagline-system", text: "5.3 The Tagline System", level: 2 },
      { id: "primary-anchor", text: "Primary Anchor", level: 3 },
      { id: "secondary-support", text: "Secondary Support", level: 3 },
      { id: "manifesto", text: "5.4 The Manifesto", level: 2 },
      { id: "language-guardrails", text: "5.5 Language Guardrails", level: 2 },
      { id: "product-copy-style", text: "5.6 Product Copy Style", level: 2 },
    ],
  },
  {
    title: "6.0 Color",
    href: "/internal/brand/color",
    icon: Droplet,
    headings: [
      { id: "philosophy", text: "6.1 The Philosophy", level: 2 },
      { id: "primary-palette", text: "6.2 The Primary Palette", level: 2 },
      { id: "utility-palette", text: "6.3 The Utility Palette", level: 2 },
      { id: "usage-ratios", text: "6.4 Usage Ratios", level: 2 },
      { id: "application-examples", text: "6.5 Application Examples", level: 2 },
      { id: "app-web", text: "Web Design", level: 3 },
      { id: "app-garment", text: "Garment Design", level: 3 },
      { id: "revision-notes", text: "Revision Notes", level: 2 },
    ],
  },
  {
    title: "7.0 Photography",
    href: "/internal/brand/photography",
    icon: Camera,
    headings: [
      { id: "visual-philosophy", text: "7.1 Visual Philosophy", level: 2 },
      { id: "three-pillars", text: "7.2 Three Pillars of Imagery", level: 2 },
      { id: "pillar-supply", text: "A. Product Construction", level: 3 },
      { id: "pillar-lifestyle", text: 'B. "Anti-Pose" Lifestyle', level: 3 },
      { id: "pillar-place", text: "C. Environmental Texture", level: 3 },
      { id: "lighting-grading", text: "7.3 Lighting & Color Grading", level: 2 },
      { id: "composition", text: "7.4 Composition Guide", level: 2 },
      { id: "do-dont", text: "7.5 Do / Don\u2019t Checklist", level: 2 },
      { id: "mood-board", text: "7.6 Mood Board", level: 2 },
    ],
  },
  {
    title: "8.0 Trim & Hardware",
    href: "/internal/brand/trim",
    icon: Tag,
    headings: [
      { id: "spec-label", text: "8.1 Specification Label", level: 2 },
      { id: "halyard-drawstring", text: "8.2 Halyard Drawstring", level: 2 },
      { id: "neck-tape", text: "8.3 Neck Tape", level: 2 },
      { id: "hem-tag", text: "8.4 Exterior Hem Tag", level: 2 },
      { id: "zippers-pulls", text: "8.5 Zippers & Pulls", level: 2 },
      { id: "grommets-eyelets", text: "8.6 Grommets & Eyelets", level: 2 },
    ],
  },
  {
    title: "9.0 Packaging",
    href: "/internal/brand/logistics",
    icon: Package,
    headings: [
      { id: "the-hull", text: "9.1 The Hull", level: 2 },
      { id: "the-shroud", text: "9.2 The Shroud", level: 2 },
      { id: "the-seal", text: "9.3 The Seal", level: 2 },
      { id: "the-manifest", text: "9.4 The Manifest", level: 2 },
      { id: "the-field-note", text: "9.5 The Field Note", level: 2 },
    ],
  },
  {
    title: "10.0 Digital",
    href: "/internal/brand/digital",
    icon: Globe,
    headings: [
      { id: "website-philosophy", text: "10.1 The Digital Depot", level: 2 },
      { id: "ui-elements", text: "10.2 UI Elements", level: 2 },
      { id: "button-style", text: "Button Style", level: 3 },
      { id: "functional-colors", text: "Functional Colors", level: 3 },
      { id: "product-detail", text: "10.3 Product Detail Page", level: 2 },
      { id: "pdp-specs", text: "The Specs Module", level: 3 },
      { id: "pdp-imagery", text: "The Imagery", level: 3 },
      { id: "social-grid", text: "10.4 The Social Grid", level: 2 },
      { id: "email", text: "10.5 Email Marketing", level: 2 },
      { id: "homepage-hero", text: "Homepage Hero Reference", level: 2 },
    ],
  },
]
