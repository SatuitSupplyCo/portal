import type { Metadata } from "next"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Brand Operating System | Satuit Supply Co.",
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

// ─── Sections ───────────────────────────────────────────────────────

const sections = [
  {
    num: "1.0",
    title: "Foundations",
    href: "/internal/brand/foundations",
    desc: "Purpose, positioning, audience, promise, and the non-negotiable principles.",
  },
  {
    num: "2.0",
    title: "Messaging System",
    href: "/internal/brand/messaging",
    desc: "Core narrative, tagline system, voice attributes, and language guardrails.",
  },
  {
    num: "3.0",
    title: "Visual Standards",
    href: "/internal/brand/visual",
    desc: "The Two Flags icon system, official lockups, clear space, and minimum sizes.",
  },
  {
    num: "4.0",
    title: "Typography",
    href: "/internal/brand/typography",
    desc: "Montserrat as the single source. Hierarchy system, implementation, and guardrails.",
  },
  {
    num: "5.0",
    title: "Voice & Ethos",
    href: "/internal/brand/voice",
    desc: "Brand philosophy, persona, manifesto, and product copy style.",
  },
  {
    num: "6.0",
    title: "Color Architecture",
    href: "/internal/brand/color",
    desc: "Hull & Flag palette. Primary atmosphere, utility signals, and usage ratios.",
  },
  {
    num: "7.0",
    title: "Photography & Art Direction",
    href: "/internal/brand/photography",
    desc: "Texture over shine. The three pillars of imagery, lighting rules, and the do/don't checklist.",
  },
  {
    num: "8.0",
    title: "Trim & Hardware",
    href: "/internal/brand/trim",
    desc: "Specification labels, drawstrings, neck tape, hem tags, zippers, grommets. Every stitch is a spec.",
  },
  {
    num: "9.0",
    title: "Packaging & Logistics",
    href: "/internal/brand/logistics",
    desc: "The Supply Drop. Hull, shroud, seal, manifest, and field note. Provisioning, not shopping.",
  },
  {
    num: "10.0",
    title: "Digital Strategy & UI/UX",
    href: "/internal/brand/digital",
    desc: "The Digital Depot. Website philosophy, UI elements, product pages, social grid, and email dispatches.",
  },
]

// ─── Page ───────────────────────────────────────────────────────────

export default function BrandIndexPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: "Brand" }]}>
      <main className={`${montserrat.className} flex-1 overflow-y-auto`}>
        {/* ═══════════════════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: NAVY }}
          className="text-white px-8 py-20 md:px-16 md:py-28"
        >
          <div className="max-w-4xl">
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
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-8">
              Brand Operating
              <br />
              System
            </h1>
            <p
              className="text-base leading-relaxed max-w-xl"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              The single source of truth for how Satuit looks, speaks, and
              behaves. Every section is binding. If unsure, default to
              restraint.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION INDEX
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: CANVAS }}
          className="px-8 py-16 md:px-16 md:py-20"
        >
          <div className="max-w-4xl">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-10"
              style={{ color: `${NAVY}60` }}
            >
              Contents
            </p>

            {/* Two-column table of contents */}
            <div className="grid md:grid-cols-2 gap-x-16">
              {/* Left column: sections 1–5 */}
              <div>
                {sections.slice(0, 5).map((s, i) => (
                  <Link
                    key={s.num}
                    href={s.href}
                    className="group flex gap-4 py-4 transition-colors"
                    style={{
                      borderBottom: `1px solid ${NAVY}0a`,
                    }}
                  >
                    <span
                      className="text-sm font-bold tabular-nums shrink-0 w-8"
                      style={{ color: `${NAVY}25` }}
                    >
                      {s.num}
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-[15px] font-medium group-hover:underline decoration-1 underline-offset-4"
                        style={{ color: NAVY }}
                      >
                        {s.title}
                      </p>
                      <p
                        className="text-[12px] leading-relaxed mt-1"
                        style={{ color: `${NAVY}70` }}
                      >
                        {s.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right column: sections 6–10 */}
              <div>
                {sections.slice(5).map((s, i) => (
                  <Link
                    key={s.num}
                    href={s.href}
                    className="group flex gap-4 py-4 transition-colors"
                    style={{
                      borderBottom: `1px solid ${NAVY}0a`,
                    }}
                  >
                    <span
                      className="text-sm font-bold tabular-nums shrink-0 w-8"
                      style={{ color: `${NAVY}25` }}
                    >
                      {s.num}
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-[15px] font-medium group-hover:underline decoration-1 underline-offset-4"
                        style={{ color: NAVY }}
                      >
                        {s.title}
                      </p>
                      <p
                        className="text-[12px] leading-relaxed mt-1"
                        style={{ color: `${NAVY}70` }}
                      >
                        {s.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            GOVERNANCE
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: NAVY }}
          className="text-white px-8 py-16 md:px-16 md:py-20"
        >
          <div className="max-w-4xl">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-8"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Before anything ships, ask
            </p>
            <div className="space-y-4 mb-10">
              {[
                "Does this feel calm or busy?",
                "Is this familiar or performative?",
                "Would this still feel right in five years?",
              ].map((q) => (
                <p
                  key={q}
                  className="text-base md:text-lg font-medium"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {q}
                </p>
              ))}
            </div>
            <div
              className="border-l-2 pl-6 py-1"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
            >
              <p className="text-sm font-bold">
                If unsure, default to restraint.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            COLOPHON
        ═══════════════════════════════════════════════════════════════ */}
        <footer
          style={{ backgroundColor: NAVY }}
          className="px-8 py-14 md:px-16"
        >
          <div className="max-w-4xl">
            <div
              className="w-8 h-px mb-8"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            />
            <p
              className="text-[11px] uppercase tracking-[0.3em]"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Satuit Supply Co. &middot; Brand Operating System
            </p>
            <p
              className="text-[11px] mt-3"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Satuit grows by earning trust over time&mdash;not by asking for
              attention.
            </p>
          </div>
        </footer>
      </main>
    </DocPageShell>
  )
}
