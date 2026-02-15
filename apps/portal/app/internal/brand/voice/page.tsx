import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { BrandSectionNav } from "@/components/brand/BrandSectionNav"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Brand Voice & Ethos \u2014 Section 5.0 | Satuit Supply Co.",
}

// ─── Font ────────────────────────────────────────────────────────────

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

// ─── Table of Contents ──────────────────────────────────────────────

// ─── Constants ──────────────────────────────────────────────────────

const NAVY = "#0A1E36"
const CANVAS = "#F0EFEA"
const STORM = "#A6192E"

const languageRows = [
  ["Well-made", "Luxury / Premium"],
  ["Built to last", "High-End / Exclusive"],
  ["Easy to wear", "Stylish / Fashionable"],
  ["Essential / Standard", "Must-Have / Iconic"],
  ["Familiar", "Elevated / Sophisticated"],
  ["Variable Conditions", "Vibe / Mood"],
]

// ─── Page ───────────────────────────────────────────────────────────

export default function VoicePage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Brand", href: "/internal/brand" },
        { label: "Brand Voice & Ethos" },
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
              Brand Voice
              <br />
              &amp; Ethos
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium uppercase tracking-[0.2em]">
                Section 5.0
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
            5.1 — THE CORE PHILOSOPHY
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: CANVAS }}
          className="px-8 py-16 md:px-16 md:py-24"
        >
          <div className="max-w-3xl">
            {/* Watermark */}
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.04 }}
              aria-hidden
            >
              5.1
            </div>

            <h2
              id="core-philosophy"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-12"
              style={{ color: NAVY }}
            >
              The Core Philosophy
            </h2>

            {/* Featured Quote */}
            <div
              className="border-l-4 pl-6 md:pl-8 mb-14"
              style={{ borderColor: NAVY }}
            >
              <p
                className="text-3xl md:text-4xl font-bold leading-tight"
                style={{ color: NAVY }}
              >
                &ldquo;Coastal, Not Contrived.&rdquo;
              </p>
            </div>

            <p
              className="text-base leading-[1.85] mb-14"
              style={{ color: NAVY }}
            >
              This is our internal compass. We are inspired by the harbor, not
              themed around it. We do not sell a fantasy of yacht life; we sell
              the reality of life near the water.
            </p>

            {/* The Shift & The Promise */}
            <div className="grid md:grid-cols-2 gap-6">
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: `${NAVY}06` }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ color: `${NAVY}80` }}
                >
                  The Shift
                </p>
                <p
                  className="text-sm leading-[1.85]"
                  style={{ color: NAVY }}
                >
                  We are moving away from{" "}
                  <strong className="font-bold">
                    &ldquo;Luxury&rdquo;
                  </strong>{" "}
                  (which feels performative) to{" "}
                  <strong className="font-bold">
                    &ldquo;Essential&rdquo;
                  </strong>{" "}
                  (which feels indispensable).
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
                  The Promise
                </p>
                <p
                  className="text-sm mb-4"
                  style={{ color: `${NAVY}BB` }}
                >
                  Everything we make must be:
                </p>
                <ul className="space-y-2" style={{ color: NAVY }}>
                  {[
                    "Easy to wear.",
                    "Built to last.",
                    "Better with time.",
                  ].map((item) => (
                    <li key={item} className="text-sm font-bold">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            5.2 — THE BRAND PERSONA
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white px-8 py-16 md:px-16 md:py-24">
          <div className="max-w-3xl">
            {/* Watermark */}
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.03 }}
              aria-hidden
            >
              5.2
            </div>

            <h2
              id="brand-persona"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-12"
              style={{ color: NAVY }}
            >
              The Brand Persona
            </h2>

            {/* Featured Quote */}
            <div
              className="border-l-4 pl-6 md:pl-8 mb-10"
              style={{ borderColor: NAVY }}
            >
              <p
                className="text-3xl md:text-4xl font-bold leading-tight"
                style={{ color: NAVY }}
              >
                &ldquo;The Local Standard.&rdquo;
              </p>
            </div>

            <p
              className="text-base leading-[1.85] mb-14"
              style={{ color: NAVY }}
            >
              We speak like a local who knows the water, not a tourist visiting
              for the weekend. We are concise, relaxed, and confident. We
              don&rsquo;t need to shout because the quality speaks for itself.
            </p>

            {/* We Are / We Are Not */}
            <div className="grid md:grid-cols-2 gap-6">
              <div
                className="border rounded-lg p-6"
                style={{ borderColor: `${NAVY}12` }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-5"
                  style={{ color: `${NAVY}80` }}
                >
                  We Are
                </p>
                <div className="space-y-3">
                  {[
                    "Grounded",
                    "Reliable",
                    "Familiar",
                    "Utility-Focused",
                  ].map((attr) => (
                    <p
                      key={attr}
                      className="text-sm font-bold"
                      style={{ color: NAVY }}
                    >
                      {attr}
                    </p>
                  ))}
                </div>
              </div>
              <div
                className="border rounded-lg p-6"
                style={{ borderColor: `${STORM}20` }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-5"
                  style={{ color: `${STORM}CC` }}
                >
                  We Are Not
                </p>
                <div className="space-y-3">
                  {[
                    "Exclusive",
                    "Trendy",
                    "Loud",
                    "\u201CPreppy\u201D or Novelty",
                  ].map((attr) => (
                    <p
                      key={attr}
                      className="text-sm font-medium line-through decoration-1"
                      style={{ color: `${NAVY}80` }}
                    >
                      {attr}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            5.3 — THE TAGLINE SYSTEM
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: NAVY }}
          className="text-white px-8 py-16 md:px-16 md:py-24"
        >
          <div className="max-w-3xl">
            {/* Watermark */}
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: "rgba(255,255,255,0.03)" }}
              aria-hidden
            >
              5.3
            </div>

            <h2
              id="tagline-system"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
            >
              The Tagline System
            </h2>
            <p
              className="text-base leading-relaxed mb-16"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              We use a{" "}
              <strong className="text-white">two-tier system</strong> to
              communicate our value.
            </p>

            {/* ── PRIMARY ANCHOR ── */}
            <div id="primary-anchor" className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.3em] shrink-0"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Primary Anchor
                </span>
                <span
                  className="flex-1 h-px"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
              <p
                className="text-[11px] font-medium uppercase tracking-[0.25em] mb-4"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                The &ldquo;Why&rdquo;
              </p>
              <p
                className="text-3xl md:text-5xl font-bold uppercase leading-tight mb-6"
                style={{ letterSpacing: "0.12em" }}
              >
                MADE FOR LIFE
                <br />
                NEAR THE WATER.
              </p>
              <p
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Usage: Storefront signage &middot; Homepage Hero &middot;
                Packaging (Main Face)
              </p>
            </div>

            {/* ── SECONDARY SUPPORT ── */}
            <div id="secondary-support" className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.3em] shrink-0"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Secondary Support
                </span>
                <span
                  className="flex-1 h-px"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
              <p
                className="text-[11px] font-medium uppercase tracking-[0.25em] mb-4"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                The &ldquo;What&rdquo;
              </p>
              <p
                className="text-2xl md:text-3xl font-medium uppercase leading-tight mb-6"
                style={{ letterSpacing: "0.06em" }}
              >
                COASTAL ESSENTIALS,
                <br />
                DONE RIGHT.
              </p>
              <p
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Usage: E-commerce headers &middot; Social Bios &middot;
                Product Collection titles
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            5.4 — THE MANIFESTO
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: CANVAS }}
          className="px-8 py-16 md:px-16 md:py-24"
        >
          <div className="max-w-3xl">
            {/* Watermark */}
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.04 }}
              aria-hidden
            >
              5.4
            </div>

            <h2
              id="manifesto"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
              style={{ color: NAVY }}
            >
              The Manifesto
            </h2>
            <p className="text-sm mb-12" style={{ color: `${NAVY}AA` }}>
              Use this text for your &ldquo;About&rdquo; page, packaging
              inserts, and lookbooks.
            </p>

            {/* The Manifesto Block */}
            <div
              className="border-l-4 pl-8 md:pl-10 py-4"
              style={{ borderColor: NAVY }}
            >
              {/* Decorative Opening Quote */}
              <div
                className="text-7xl md:text-8xl font-bold leading-none -ml-2 -mb-8 select-none"
                style={{ color: `${NAVY}10` }}
                aria-hidden
              >
                &ldquo;
              </div>

              <div className="space-y-6">
                <p
                  className="text-lg md:text-xl font-medium leading-[1.7]"
                  style={{ color: NAVY }}
                >
                  Satuit Supply Co. was born from a simple belief: The coast
                  isn&rsquo;t a costume. It&rsquo;s a place where things need
                  to work.
                </p>
                <p
                  className="text-base leading-[1.85]"
                  style={{ color: `${NAVY}DD` }}
                >
                  We don&rsquo;t design for the &lsquo;perfect beach
                  day&rsquo;&mdash;we design for the reality of life by the
                  water. We believe in well-made essentials that feel familiar
                  from the first wear and get better with time.
                </p>
                <p
                  className="text-base leading-[1.85]"
                  style={{ color: `${NAVY}DD` }}
                >
                  Rooted in the granite and grey water of the North Atlantic,
                  we replace trend with utility and decoration with structure.
                  Nothing loud. Nothing precious. Nothing performative.
                </p>
                <p
                  className="text-lg md:text-xl font-bold leading-[1.6]"
                  style={{ color: NAVY }}
                >
                  Just coastal essentials, done right.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            5.5 — LANGUAGE GUARDRAILS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white px-8 py-16 md:px-16 md:py-24">
          <div className="max-w-3xl">
            {/* Watermark */}
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.03 }}
              aria-hidden
            >
              5.5
            </div>

            <h2
              id="language-guardrails"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
              style={{ color: NAVY }}
            >
              Language Guardrails
            </h2>
            <p className="text-sm mb-12" style={{ color: `${NAVY}AA` }}>
              To maintain the &ldquo;Grounded&rdquo; voice, strictly adhere to
              these vocabulary rules.
            </p>

            {/* Do / Don't Table */}
            <div
              className="rounded-lg overflow-hidden border mb-10"
              style={{ borderColor: `${NAVY}10` }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: `${NAVY}06` }}>
                    <th
                      className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] w-1/2"
                      style={{ color: `${NAVY}80` }}
                    >
                      Do Say (Honest / Utility)
                    </th>
                    <th
                      className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] w-1/2"
                      style={{ color: `${STORM}CC` }}
                    >
                      Don&rsquo;t Say (Hype / Marketing)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {languageRows.map(([doSay, dontSay]) => (
                    <tr
                      key={doSay}
                      style={{ borderTop: `1px solid ${NAVY}08` }}
                    >
                      <td
                        className="px-5 py-3 font-semibold"
                        style={{ color: NAVY }}
                      >
                        &ldquo;{doSay}&rdquo;
                      </td>
                      <td
                        className="px-5 py-3 line-through decoration-1"
                        style={{ color: `${NAVY}70` }}
                      >
                        &ldquo;{dontSay}&rdquo;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rule Callout */}
            <div
              className="border-l-2 pl-6 md:pl-8 py-2"
              style={{ borderColor: STORM }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2"
                style={{ color: STORM }}
              >
                Standing Rule
              </p>
              <p
                className="text-sm font-medium leading-relaxed"
                style={{ color: `${NAVY}CC` }}
              >
                If it sounds like marketing, cut it.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            5.6 — PRODUCT COPY STYLE
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: CANVAS }}
          className="px-8 py-16 md:px-16 md:py-24"
        >
          <div className="max-w-3xl">
            {/* Watermark */}
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.04 }}
              aria-hidden
            >
              5.6
            </div>

            <h2
              id="product-copy-style"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
              style={{ color: NAVY }}
            >
              Product Copy Style
            </h2>

            {/* The Rule */}
            <div
              className="border-l-2 pl-6 md:pl-8 py-2 mb-14"
              style={{ borderColor: NAVY }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2"
                style={{ color: `${NAVY}80` }}
              >
                The Rule
              </p>
              <p
                className="text-base font-medium leading-relaxed"
                style={{ color: NAVY }}
              >
                Confidence comes from restraint. Describe the physics, not the
                feelings.
              </p>
            </div>

            {/* Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Incorrect */}
              <div
                className="rounded-lg p-6 border"
                style={{
                  borderColor: `${STORM}20`,
                  backgroundColor: `${STORM}04`,
                }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-5"
                  style={{ color: STORM }}
                >
                  Incorrect (Hype)
                </p>
                <p
                  className="text-sm leading-[1.85] italic"
                  style={{ color: `${NAVY}AA` }}
                >
                  &ldquo;Get the ultimate coastal vibe with our super soft,
                  elevated hoodie. It&rsquo;s the perfect luxury piece for
                  your summer nights!&rdquo;
                </p>
              </div>

              {/* Correct */}
              <div
                className="rounded-lg p-6 border"
                style={{
                  borderColor: `${NAVY}15`,
                  backgroundColor: "white",
                }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-5"
                  style={{ color: `${NAVY}80` }}
                >
                  Correct (Satuit)
                </p>
                <p
                  className="text-sm leading-[1.85]"
                  style={{ color: NAVY }}
                >
                  <strong className="font-bold">The Harbor Hoodie.</strong>{" "}
                  Constructed from heavyweight French Terry for lasting warmth.
                  Features a reinforced hood and flat-lock stitching for
                  durability. A well-made standard for variable conditions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <BrandSectionNav current="/internal/brand/voice" />

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
              Section 5.0
            </p>
            <p
              className="text-[11px] mt-3"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Voice &amp; Ethos standards are binding across all channels and
              touchpoints.
            </p>
          </div>
        </footer>
      </main>
    </DocPageShell>
  )
}
