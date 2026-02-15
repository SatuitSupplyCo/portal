import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { BrandSectionNav } from "@/components/brand/BrandSectionNav"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Brand Foundations \u2014 Section 1.0 | Satuit Supply Co.",
}

// ─── Font ────────────────────────────────────────────────────────────

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

// ─── Table of Contents ──────────────────────────────────────────────

// ─── Palette (revised) ──────────────────────────────────────────────

const NAVY = "#0A1E36"
const CANVAS = "#F0EFEA"
const STORM = "#A6192E"

// ─── Page ───────────────────────────────────────────────────────────

export default function FoundationsPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Brand", href: "/internal/brand" },
        { label: "Brand Foundations" },
      ]}
    >
      <main className={`${montserrat.className} flex-1 overflow-y-auto`}>
        {/* ═══════════════════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: NAVY }}
          className="text-white px-8 py-20 md:px-16 md:py-28"
        >
          <div className="max-w-3xl">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.35em] mb-8"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Satuit Supply Co.
            </p>
            <div
              className="w-10 h-px mb-10"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-10">
              Brand
              <br />
              Foundations
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium uppercase tracking-[0.2em]">
                Section 1.0
              </span>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>&mdash;</span>
              <span
                className="uppercase tracking-[0.15em]"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Brand Operating System
              </span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            1.1 — THE BRAND PURPOSE
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: CANVAS }}
          className="px-8 py-16 md:px-16 md:py-24"
        >
          <div className="max-w-3xl">
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.04 }}
              aria-hidden
            >
              1.1
            </div>

            <h2
              id="brand-purpose"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-12"
              style={{ color: NAVY }}
            >
              The Brand Purpose
            </h2>

            <div
              className="border-l-4 pl-6 md:pl-8 py-2"
              style={{ borderColor: NAVY }}
            >
              <p
                className="text-lg md:text-xl font-medium leading-[1.7]"
                style={{ color: NAVY }}
              >
                To create well-made coastal essentials that feel familiar,
                lasting, and quietly confident&mdash;rooted in real places and
                real people.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            1.2 — THE POSITIONING
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white px-8 py-16 md:px-16 md:py-24">
          <div className="max-w-3xl">
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.03 }}
              aria-hidden
            >
              1.2
            </div>

            <h2
              id="positioning"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-12"
              style={{ color: NAVY }}
            >
              The Positioning
            </h2>

            <p
              className="text-base leading-[1.85]"
              style={{ color: NAVY }}
            >
              Satuit is a modern coastal supply company inspired by New England
              harbor towns. We design everyday essentials for life near the
              water&mdash;built to last, easy to wear, and better with time.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            1.3 — THE AUDIENCE
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: CANVAS }}
          className="px-8 py-16 md:px-16 md:py-24"
        >
          <div className="max-w-3xl">
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.04 }}
              aria-hidden
            >
              1.3
            </div>

            <h2
              id="audience"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-12"
              style={{ color: NAVY }}
            >
              The Audience
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: `${NAVY}06` }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ color: `${NAVY}80` }}
                >
                  Primary
                </p>
                <p
                  className="text-sm leading-[1.85]"
                  style={{ color: NAVY }}
                >
                  People who value quality, restraint, and longevity over
                  trends&mdash;who prefer things that feel right rather than
                  flashy.
                </p>
              </div>
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: `${NAVY}06` }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ color: `${NAVY}80` }}
                >
                  Secondary
                </p>
                <p
                  className="text-sm leading-[1.85]"
                  style={{ color: NAVY }}
                >
                  Locals and visitors seeking something authentic to the
                  place&mdash;not a souvenir, not a statement piece.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            1.4 — THE BRAND PROMISE
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white px-8 py-16 md:px-16 md:py-24">
          <div className="max-w-3xl">
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.03 }}
              aria-hidden
            >
              1.4
            </div>

            <h2
              id="brand-promise"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
              style={{ color: NAVY }}
            >
              The Brand Promise
            </h2>
            <p className="text-sm mb-12" style={{ color: `${NAVY}AA` }}>
              Everything Satuit makes must feel:
            </p>

            <div className="space-y-4 mb-14">
              {[
                "Easy to wear.",
                "Built to last.",
                "Better with time.",
              ].map((line) => (
                <p
                  key={line}
                  className="text-xl md:text-2xl font-bold"
                  style={{ color: NAVY }}
                >
                  {line}
                </p>
              ))}
            </div>

            <div
              className="border-l-2 pl-6 md:pl-8 py-2"
              style={{ borderColor: STORM }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2"
                style={{ color: STORM }}
              >
                The Rule
              </p>
              <p
                className="text-sm font-medium leading-relaxed"
                style={{ color: `${NAVY}CC` }}
              >
                Nothing precious. Nothing performative.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            1.5 — BRAND PRINCIPLES
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: NAVY }}
          className="text-white px-8 py-16 md:px-16 md:py-24"
        >
          <div className="max-w-3xl">
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: "rgba(255,255,255,0.03)" }}
              aria-hidden
            >
              1.5
            </div>

            <h2
              id="brand-principles"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
            >
              Brand Principles
            </h2>
            <p
              className="text-sm mb-14"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              The Non-Negotiables.
            </p>

            <div className="space-y-12">
              {[
                {
                  title: "Understated Always Wins.",
                  body: "If it needs explanation, it\u2019s doing too much.",
                },
                {
                  title: "Coastal, Not Contrived.",
                  body: "Inspired by the harbor\u2014not themed around it. No lobsters. No anchors. Just utility.",
                },
                {
                  title: "Familiar, Not Exclusive.",
                  body: "Welcoming, repeatable, human. We are a neighbor, not a private club.",
                },
                {
                  title: "Local Truth.",
                  body: "Real places, real use, real materials. If you can\u2019t wear it to shuck an oyster, it\u2019s not Satuit.",
                },
              ].map((principle) => (
                <div key={principle.title}>
                  <div className="flex items-center gap-4 mb-4">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.3em] shrink-0"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      Principle
                    </span>
                    <span
                      className="flex-1 h-px"
                      style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                    />
                  </div>
                  <p className="text-xl md:text-2xl font-bold leading-tight mb-3">
                    {principle.title}
                  </p>
                  <p
                    className="text-base leading-[1.75]"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {principle.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <BrandSectionNav current="/internal/brand/foundations" />

        {/* ═══════════════════════════════════════════════════════════════
            COLOPHON
        ═══════════════════════════════════════════════════════════════ */}
        <footer
          style={{ backgroundColor: NAVY }}
          className="px-8 py-14 md:px-16"
        >
          <div className="max-w-3xl">
            <div
              className="w-8 h-px mb-8"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            />
            <p
              className="text-[11px] uppercase tracking-[0.3em]"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Satuit Supply Co. &middot; Brand Operating System &middot;
              Section 1.0
            </p>
            <p
              className="text-[11px] mt-3"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Brand Foundations are permanent. They do not change with seasons.
            </p>
          </div>
        </footer>
      </main>
    </DocPageShell>
  )
}
