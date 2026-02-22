import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { BrandSectionNav } from "@/components/brand/BrandSectionNav"
import { DigitalHero } from "./_components/DigitalHero"
import { DigitalWebsitePhilosophy } from "./_components/DigitalWebsitePhilosophy"
import { DigitalUIElements } from "./_components/DigitalUIElements"
import { DigitalProductDetail } from "./_components/DigitalProductDetail"
import { DigitalSocialGrid } from "./_components/DigitalSocialGrid"
import { DigitalEmailMarketing } from "./_components/DigitalEmailMarketing"
import { DigitalHomepageHero } from "./_components/DigitalHomepageHero"
import { DigitalColophon } from "./_components/DigitalColophon"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Digital Strategy & UI/UX — Section 10.0 | Satuit Supply Co.",
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
const YELLOW = "#EAAA00"

const palette = { NAVY, CANVAS, GRANITE, STORM, SALT, YELLOW }

// ─── Page ───────────────────────────────────────────────────────────

export default function DigitalStrategyPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Brand", href: "/internal/brand" },
        { label: "Digital Strategy & UI/UX" },
      ]}
    >
      <main className={`${montserrat.className} flex-1 overflow-y-auto`}>
        <DigitalHero palette={palette} />
        <DigitalWebsitePhilosophy palette={palette} />
        <DigitalUIElements palette={palette} />
        <DigitalProductDetail palette={palette} />
        <DigitalSocialGrid palette={palette} />
        <DigitalEmailMarketing palette={palette} />
        <DigitalHomepageHero palette={palette} />

        <BrandSectionNav current="/internal/brand/digital" />

        <DigitalColophon palette={palette} />
      </main>
    </DocPageShell>
  )
}
