import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { BrandSectionNav } from "@/components/brand/BrandSectionNav"

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

// ─── Table of Contents ──────────────────────────────────────────────

// ─── Palette — The Revised SATUIT Colors ────────────────────────────

const NAVY = "#0A1E36"
const CANVAS = "#F0EFEA"
const GRANITE = "#8C92AC"
const STORM = "#A6192E"
const YELLOW = "#EAAA00"
const SALT = "#69A3B0"

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
              Color
              <br />
              Architecture
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium uppercase tracking-[0.2em]">
                Section 6.0
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
            6.1 — THE PHILOSOPHY: "HULL & FLAG"
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
              6.1
            </div>

            <h2
              id="philosophy"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
              style={{ color: NAVY }}
            >
              The Philosophy
            </h2>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-10"
              style={{ color: `${NAVY}60` }}
            >
              &ldquo;Hull &amp; Flag&rdquo;
            </p>

            <p
              className="text-base leading-[1.85] mb-10"
              style={{ color: NAVY }}
            >
              A ship is painted in neutral, industrial tones&mdash;Navy, Grey,
              White&mdash;to survive the ocean. The only bright colors on a
              ship are the signal flags and safety gear.
            </p>

            {/* The Rule */}
            <div
              className="border-l-4 pl-6 md:pl-8 py-3"
              style={{ borderColor: NAVY }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
                style={{ color: `${NAVY}70` }}
              >
                The Rule
              </p>
              <p
                className="text-lg md:text-xl font-bold leading-snug"
                style={{ color: NAVY }}
              >
                The brand is the Hull{" "}
                <span className="font-normal" style={{ color: `${NAVY}80` }}>
                  (Neutral).
                </span>
                <br />
                The accents are the Flags{" "}
                <span className="font-normal" style={{ color: `${NAVY}80` }}>
                  (Functional).
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            6.2 — THE PRIMARY PALETTE
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white px-8 py-16 md:px-16 md:py-24">
          <div className="max-w-3xl">
            {/* Watermark */}
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.03 }}
              aria-hidden
            >
              6.2
            </div>

            <h2
              id="primary-palette"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
              style={{ color: NAVY }}
            >
              The Primary Palette
            </h2>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
              style={{ color: `${NAVY}60` }}
            >
              The Atmosphere
            </p>
            <p className="text-sm mb-12" style={{ color: `${NAVY}AA` }}>
              Used for 90% of the brand presence&mdash;Store, Web, Packaging.
            </p>

            {/* ── Swatches ── */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Satuit Navy */}
              <div
                className="rounded-lg overflow-hidden border"
                style={{ borderColor: `${NAVY}10` }}
              >
                <div
                  className="h-36"
                  style={{ backgroundColor: NAVY }}
                />
                <div className="p-5">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2"
                    style={{ color: `${NAVY}60` }}
                  >
                    Dominant
                  </p>
                  <p
                    className="text-base font-bold mb-1"
                    style={{ color: NAVY }}
                  >
                    Satuit Navy
                  </p>
                  <p
                    className="text-xs font-mono mb-1"
                    style={{ color: `${NAVY}AA` }}
                  >
                    {NAVY}
                  </p>
                  <p
                    className="text-[11px] mb-3"
                    style={{ color: `${NAVY}80` }}
                  >
                    Pantone 289 C
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: `${NAVY}99` }}
                  >
                    &ldquo;Midnight.&rdquo; Richer, more premium, less sporty
                    than the previous navy.
                  </p>
                </div>
              </div>

              {/* Canvas */}
              <div
                className="rounded-lg overflow-hidden border"
                style={{ borderColor: `${NAVY}10` }}
              >
                <div
                  className="h-36 border-b"
                  style={{
                    backgroundColor: CANVAS,
                    borderColor: `${NAVY}08`,
                  }}
                />
                <div className="p-5">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2"
                    style={{ color: `${NAVY}60` }}
                  >
                    Sub-Dominant
                  </p>
                  <p
                    className="text-base font-bold mb-1"
                    style={{ color: NAVY }}
                  >
                    Canvas (Bone)
                  </p>
                  <p
                    className="text-xs font-mono mb-1"
                    style={{ color: `${NAVY}AA` }}
                  >
                    {CANVAS}
                  </p>
                  <p
                    className="text-[11px] mb-3"
                    style={{ color: `${NAVY}80` }}
                  >
                    Pantone Warm Gray 1 C
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: `${NAVY}99` }}
                  >
                    &ldquo;Stone / Sailcloth.&rdquo; Cooled down from the
                    previous warm cream.
                  </p>
                </div>
              </div>

              {/* Granite */}
              <div
                className="rounded-lg overflow-hidden border"
                style={{ borderColor: `${NAVY}10` }}
              >
                <div
                  className="h-36"
                  style={{ backgroundColor: GRANITE }}
                />
                <div className="p-5">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2"
                    style={{ color: `${NAVY}60` }}
                  >
                    Support
                  </p>
                  <p
                    className="text-base font-bold mb-1"
                    style={{ color: NAVY }}
                  >
                    Granite
                  </p>
                  <p
                    className="text-xs font-mono mb-1"
                    style={{ color: `${NAVY}AA` }}
                  >
                    {GRANITE}
                  </p>
                  <p
                    className="text-[11px] mb-3"
                    style={{ color: `${NAVY}80` }}
                  >
                    Pantone Cool Gray 7 C
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: `${NAVY}99` }}
                  >
                    The color of wet rock. For secondary text and lines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            6.3 — THE UTILITY PALETTE
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
              6.3
            </div>

            <h2
              id="utility-palette"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
            >
              The Utility Palette
            </h2>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              The Signals
            </p>
            <p
              className="text-sm mb-14"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Used for 5&ndash;10% of the brand. &ldquo;Heritage Colors&rdquo;
              inspired by signal flags and the sky. They add life without
              destroying the quiet luxury.
            </p>

            {/* ── Signal Swatches ── */}
            <div className="space-y-10">
              {/* Storm Red */}
              <div className="flex items-start gap-6">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full"
                  style={{ backgroundColor: STORM }}
                />
                <div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <p className="text-base font-bold">Storm Red</p>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      Signal A
                    </span>
                  </div>
                  <p
                    className="text-xs font-mono mb-3"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {STORM}
                  </p>
                  <p
                    className="text-sm leading-[1.75]"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    Use for &ldquo;Sale&rdquo; prices, the inside neck tape
                    stitch, or a single &ldquo;red flag&rdquo; hem tag.{" "}
                    <strong className="text-white font-semibold">
                      Never a background.
                    </strong>
                  </p>
                </div>
              </div>

              {/* Warning Yellow */}
              <div className="flex items-start gap-6">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full"
                  style={{ backgroundColor: YELLOW }}
                />
                <div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <p className="text-base font-bold">Warning Yellow</p>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      Signal B
                    </span>
                  </div>
                  <p
                    className="text-xs font-mono mb-3"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {YELLOW}
                  </p>
                  <p
                    className="text-sm leading-[1.75]"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    Use for &ldquo;New Arrival&rdquo; badges or technical
                    zipper pulls. Think &ldquo;Oilskin,&rdquo; not
                    &ldquo;Lemon.&rdquo;
                  </p>
                </div>
              </div>

              {/* Salt Air */}
              <div className="flex items-start gap-6">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full"
                  style={{ backgroundColor: SALT }}
                />
                <div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <p className="text-base font-bold">Salt Air</p>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      Element
                    </span>
                  </div>
                  <p
                    className="text-xs font-mono mb-3"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {SALT}
                  </p>
                  <p
                    className="text-sm leading-[1.75]"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    Use for tissue paper, seasonal shirt colors, or to soften a
                    stark layout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            6.4 — USAGE RATIOS
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
              6.4
            </div>

            <h2
              id="usage-ratios"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
              style={{ color: NAVY }}
            >
              Usage Ratios
            </h2>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-10"
              style={{ color: `${NAVY}60` }}
            >
              The &ldquo;Quiet&rdquo; Formula
            </p>

            {/* Ratio Bar */}
            <div
              className="flex h-4 rounded-full overflow-hidden mb-10"
              style={{ border: `1px solid ${NAVY}10` }}
            >
              <div style={{ width: "85%", backgroundColor: NAVY }} />
              <div style={{ width: "5%", backgroundColor: CANVAS }} />
              <div style={{ width: "5%", backgroundColor: GRANITE }} />
              <div style={{ width: "2.5%", backgroundColor: SALT }} />
              <div style={{ width: "1.5%", backgroundColor: STORM }} />
              <div style={{ width: "1%", backgroundColor: YELLOW }} />
            </div>

            {/* Ratio Breakdown */}
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <span
                  className="text-3xl md:text-4xl font-bold shrink-0 w-20 text-right"
                  style={{ color: NAVY }}
                >
                  85%
                </span>
                <div className="pt-2">
                  <p
                    className="text-sm font-bold mb-1"
                    style={{ color: NAVY }}
                  >
                    Navy + Canvas
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: `${NAVY}AA` }}
                  >
                    The foundation. The house.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <span
                  className="text-3xl md:text-4xl font-bold shrink-0 w-20 text-right"
                  style={{ color: GRANITE }}
                >
                  10%
                </span>
                <div className="pt-2">
                  <p
                    className="text-sm font-bold mb-1"
                    style={{ color: NAVY }}
                  >
                    Granite / Salt Air
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: `${NAVY}AA` }}
                  >
                    The texture. The fog and sky.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <span
                  className="text-3xl md:text-4xl font-bold shrink-0 w-20 text-right"
                  style={{ color: STORM }}
                >
                  5%
                </span>
                <div className="pt-2">
                  <p
                    className="text-sm font-bold mb-1"
                    style={{ color: NAVY }}
                  >
                    Red / Yellow
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: `${NAVY}AA` }}
                  >
                    The signal. The spark.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            6.5 — APPLICATION EXAMPLES
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white px-8 py-16 md:px-16 md:py-24">
          <div className="max-w-3xl">
            {/* Watermark */}
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.03 }}
              aria-hidden
            >
              6.5
            </div>

            <h2
              id="application-examples"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
              style={{ color: NAVY }}
            >
              Application Examples
            </h2>
            <p className="text-sm mb-14" style={{ color: `${NAVY}AA` }}>
              How to use the accents. This is where &ldquo;Room for
              Expansion&rdquo; happens without losing control.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* A. Web Design */}
              <div
                id="app-web"
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: `${NAVY}10` }}
              >
                <div
                  className="px-6 py-4"
                  style={{ backgroundColor: `${NAVY}04` }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                    style={{ color: `${NAVY}50` }}
                  >
                    A
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{ color: NAVY }}
                  >
                    The Web Design
                  </p>
                </div>
                <div className="p-6 space-y-4 text-sm">
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                      style={{ color: `${NAVY}60` }}
                    >
                      Background
                    </p>
                    <p style={{ color: NAVY }}>Canvas or White</p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                      style={{ color: `${NAVY}60` }}
                    >
                      Text &amp; Buttons
                    </p>
                    <p style={{ color: NAVY }}>Satuit Navy</p>
                  </div>
                  <div
                    className="border-t pt-4"
                    style={{ borderColor: `${NAVY}08` }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2"
                      style={{ color: `${NAVY}60` }}
                    >
                      The &ldquo;Accent&rdquo; Moment
                    </p>
                    <p
                      className="text-sm leading-[1.75]"
                      style={{ color: `${NAVY}CC` }}
                    >
                      &ldquo;Sold Out&rdquo; or &ldquo;Low Stock&rdquo;
                      notification dot in{" "}
                      <strong
                        className="font-semibold"
                        style={{ color: YELLOW }}
                      >
                        Warning Yellow
                      </strong>
                      . &ldquo;Final Sale&rdquo; price text in{" "}
                      <strong
                        className="font-semibold"
                        style={{ color: STORM }}
                      >
                        Storm Red
                      </strong>
                      . Functional color coding&mdash;just like on a ship.
                    </p>
                  </div>
                </div>
              </div>

              {/* B. Garment Design */}
              <div
                id="app-garment"
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: `${NAVY}10` }}
              >
                <div
                  className="px-6 py-4"
                  style={{ backgroundColor: `${NAVY}04` }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                    style={{ color: `${NAVY}50` }}
                  >
                    B
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{ color: NAVY }}
                  >
                    The Garment Design
                  </p>
                </div>
                <div className="p-6 space-y-4 text-sm">
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                      style={{ color: `${NAVY}60` }}
                    >
                      The Shirt
                    </p>
                    <p style={{ color: NAVY }}>A Heather Gray tee</p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                      style={{ color: `${NAVY}60` }}
                    >
                      The Neck Tape
                    </p>
                    <p style={{ color: NAVY }}>Canvas (Natural)</p>
                  </div>
                  <div
                    className="border-t pt-4"
                    style={{ borderColor: `${NAVY}08` }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2"
                      style={{ color: `${NAVY}60` }}
                    >
                      The &ldquo;Wink&rdquo;
                    </p>
                    <p
                      className="text-sm leading-[1.75] mb-3"
                      style={{ color: `${NAVY}CC` }}
                    >
                      The single stitch holding the hem tag is{" "}
                      <strong
                        className="font-semibold"
                        style={{ color: STORM }}
                      >
                        Storm Red
                      </strong>
                      . Or the aglets of the hoodie drawstrings are dipped in{" "}
                      <strong
                        className="font-semibold"
                        style={{ color: YELLOW }}
                      >
                        Warning Yellow
                      </strong>
                      .
                    </p>
                  </div>
                  <div
                    className="border-t pt-4"
                    style={{ borderColor: `${NAVY}08` }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2"
                      style={{ color: `${NAVY}60` }}
                    >
                      Expansion
                    </p>
                    <p
                      className="text-sm leading-[1.75]"
                      style={{ color: `${NAVY}CC` }}
                    >
                      In Summer, release a collection in{" "}
                      <strong
                        className="font-semibold"
                        style={{ color: SALT }}
                      >
                        Salt Air
                      </strong>
                      . Because it&rsquo;s in your palette, it fits
                      perfectly&mdash;but you don&rsquo;t change your website
                      header to match it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            REVISION NOTES
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: NAVY }}
          className="text-white px-8 py-16 md:px-16 md:py-24"
        >
          <div className="max-w-3xl">
            <h2
              id="revision-notes"
              className="text-lg font-bold uppercase tracking-[0.1em] mb-3"
            >
              Revision Notes
            </h2>
            <p
              className="text-sm mb-10"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Summary of changes from the previous color draft.
            </p>

            <div className="space-y-6">
              {/* Navy change */}
              <div
                className="flex items-start gap-5 border-l-2 pl-6 py-1"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}
              >
                <div>
                  <p className="text-sm font-bold mb-1">Darkened the Navy</p>
                  <p
                    className="text-sm leading-[1.75]"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    Moved from &ldquo;Royal/Bright&rdquo;{" "}
                    <span
                      className="font-mono text-xs"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      #003C68
                    </span>{" "}
                    to &ldquo;Midnight/Deep&rdquo;{" "}
                    <span className="font-mono text-xs text-white">
                      {NAVY}
                    </span>{" "}
                    to align with &ldquo;Quiet Luxury.&rdquo;
                  </p>
                </div>
              </div>

              {/* White change */}
              <div
                className="flex items-start gap-5 border-l-2 pl-6 py-1"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}
              >
                <div>
                  <p className="text-sm font-bold mb-1">Cooled the White</p>
                  <p
                    className="text-sm leading-[1.75]"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    Moved from &ldquo;Warm Paper&rdquo;{" "}
                    <span
                      className="font-mono text-xs"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      #FFFCFA
                    </span>{" "}
                    to &ldquo;Stone Canvas&rdquo;{" "}
                    <span className="font-mono text-xs text-white">
                      {CANVAS}
                    </span>{" "}
                    to feel more coastal and weathered.
                  </p>
                </div>
              </div>

              {/* Accent restriction */}
              <div
                className="flex items-start gap-5 border-l-2 pl-6 py-1"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}
              >
                <div>
                  <p className="text-sm font-bold mb-1">
                    Restricted the Red / Yellow
                  </p>
                  <p
                    className="text-sm leading-[1.75]"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    Kept them as vital DNA (Signal Flags) but strictly defined
                    them as &ldquo;Utility Signals&rdquo; so they don&rsquo;t
                    take over the brand look.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <BrandSectionNav current="/internal/brand/color" />

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
              Section 6.0
            </p>
            <p
              className="text-[11px] mt-3"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Color Architecture is binding. All hex values are final.
            </p>
          </div>
        </footer>
      </main>
    </DocPageShell>
  )
}
