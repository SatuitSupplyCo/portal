import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { BrandSectionNav } from "@/components/brand/BrandSectionNav"
import { PhotographyHero } from "./_components/PhotographyHero"
import { PhotographyVisualPhilosophy } from "./_components/PhotographyVisualPhilosophy"
import { PhotographyThreePillars } from "./_components/PhotographyThreePillars"
import { PhotographyLightingGrading } from "./_components/PhotographyLightingGrading"
import { PhotographyCompositionGuide } from "./_components/PhotographyCompositionGuide"
import { PhotographyDoDontChecklist } from "./_components/PhotographyDoDontChecklist"
import { PhotographyMoodBoard } from "./_components/PhotographyMoodBoard"
import { PhotographyColophon } from "./_components/PhotographyColophon"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Photography & Art Direction — Section 7.0 | Satuit Supply Co.",
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
const SALT = "#69A3B0"

const palette = { NAVY, CANVAS, GRANITE, STORM, SALT }

// ─── Page ───────────────────────────────────────────────────────────

export default function PhotographyPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Brand", href: "/internal/brand" },
        { label: "Photography & Art Direction" },
      ]}
    >
      <main className={`${montserrat.className} flex-1 overflow-y-auto`}>
        <PhotographyHero palette={palette} />
        <PhotographyVisualPhilosophy palette={palette} />
        <PhotographyThreePillars palette={palette} />
        <PhotographyLightingGrading palette={palette} />
        <PhotographyCompositionGuide palette={palette} />
        <PhotographyDoDontChecklist palette={palette} />
        <PhotographyMoodBoard palette={palette} />

        <BrandSectionNav current="/internal/brand/photography" />

        <PhotographyColophon palette={palette} />
      </main>
    </DocPageShell>
  )
}
