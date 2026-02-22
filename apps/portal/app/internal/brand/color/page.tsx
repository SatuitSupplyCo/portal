import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { BrandSectionNav } from "@/components/brand/BrandSectionNav"
import { ColorHero } from "./_components/ColorHero"
import { ColorPhilosophy } from "./_components/ColorPhilosophy"
import { ColorPrimaryPalette } from "./_components/ColorPrimaryPalette"
import { ColorUtilityPalette } from "./_components/ColorUtilityPalette"
import { ColorUsageRatios } from "./_components/ColorUsageRatios"
import { ColorApplicationExamples } from "./_components/ColorApplicationExamples"
import { ColorRevisionNotes } from "./_components/ColorRevisionNotes"
import { ColorColophon } from "./_components/ColorColophon"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Color Architecture \u2014 Section 6.0 | Satuit Supply Co.",
}

// ─── Font ────────────────────────────────────────────────────────────

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

// ─── Palette ────────────────────────────────────────────────────────

const NAVY = "#0A1E36"
const CANVAS = "#F0EFEA"
const GRANITE = "#8C92AC"
const STORM = "#A6192E"
const YELLOW = "#EAAA00"
const SALT = "#69A3B0"

const palette = { NAVY, CANVAS, GRANITE, STORM, YELLOW, SALT }

// ─── Page ───────────────────────────────────────────────────────────

export default function ColorPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Brand", href: "/internal/brand" },
        { label: "Color Architecture" },
      ]}
    >
      <main className={`${montserrat.className} flex-1 overflow-y-auto`}>
        <ColorHero palette={palette} />
        <ColorPhilosophy palette={palette} />
        <ColorPrimaryPalette palette={palette} />
        <ColorUtilityPalette palette={palette} />
        <ColorUsageRatios palette={palette} />
        <ColorApplicationExamples palette={palette} />
        <ColorRevisionNotes palette={palette} />

        <BrandSectionNav current="/internal/brand/color" />

        <ColorColophon palette={palette} />
      </main>
    </DocPageShell>
  )
}
