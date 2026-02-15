import type { Metadata } from "next"
import Image from "next/image"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { BrandSectionNav } from "@/components/brand/BrandSectionNav"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Visual Standards \u2014 Section 3.0 | Satuit Supply Co.",
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

// ─── Brand Image helper ──────────────────────────────────────────────

function BrandImage({
  src,
  alt,
  className = "",
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={1280}
        height={960}
        className="w-full h-auto"
      />
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────

export default function VisualPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Brand", href: "/internal/brand" },
        { label: "Visual Standards" },
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
              Visual
              <br />
              Standards
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium uppercase tracking-[0.2em]">
                Section 3.0
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
            3.1 — THE "TWO FLAGS" SYSTEM
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
              3.1
            </div>

            <h2
              id="two-flags-system"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
              style={{ color: NAVY }}
            >
              The &ldquo;Two Flags&rdquo; System
            </h2>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-6"
              style={{ color: `${NAVY}60` }}
            >
              Technical Physics
            </p>
            <p
              className="text-base leading-[1.85] mb-14"
              style={{ color: NAVY }}
            >
              To solve the problem of scale and texture, we utilize two distinct
              versions of the &ldquo;Sierra&rdquo; icon.
            </p>

            {/* ── Two-column: Architect & Badge ── */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* The Architect */}
              <div id="the-architect">
                <BrandImage
                  src="/brand/visual/architect-outline-icon.png"
                  alt="The Architect — Outline Icon construction diagram on grid"
                />
                <div className="mt-6">
                  <p
                    className="text-lg font-bold mb-1"
                    style={{ color: NAVY }}
                  >
                    The Architect
                  </p>
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.15em] mb-5"
                    style={{ color: `${NAVY}60` }}
                  >
                    Outline Icon
                  </p>

                  <div className="space-y-4 text-sm" style={{ color: NAVY }}>
                    <div>
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1"
                        style={{ color: `${NAVY}70` }}
                      >
                        Structure
                      </p>
                      <p>Fine lines, open center.</p>
                    </div>
                    <div
                      className="border-l-2 pl-5 py-1"
                      style={{ borderColor: NAVY }}
                    >
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1"
                        style={{ color: `${NAVY}70` }}
                      >
                        Physics
                      </p>
                      <p className="font-medium">
                        Line weight must match the stroke width of the text.
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1"
                        style={{ color: `${NAVY}70` }}
                      >
                        Usage
                      </p>
                      <p style={{ color: `${NAVY}CC` }}>
                        Digital, Large Print, Packaging. Website headers,
                        Letterhead, Screen-printed chest logos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Badge */}
              <div id="the-badge">
                <BrandImage
                  src="/brand/visual/badge-solid-icon.png"
                  alt="The Badge — Solid Icon construction diagram on grid"
                />
                <div className="mt-6">
                  <p
                    className="text-lg font-bold mb-1"
                    style={{ color: NAVY }}
                  >
                    The Badge
                  </p>
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.15em] mb-5"
                    style={{ color: `${NAVY}60` }}
                  >
                    Solid Icon
                  </p>

                  <div className="space-y-4 text-sm" style={{ color: NAVY }}>
                    <div>
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1"
                        style={{ color: `${NAVY}70` }}
                      >
                        Structure
                      </p>
                      <p>Solid block with negative space center.</p>
                    </div>
                    <div
                      className="border-l-2 pl-5 py-1"
                      style={{ borderColor: NAVY }}
                    >
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1"
                        style={{ color: `${NAVY}70` }}
                      >
                        Physics
                      </p>
                      <p className="font-medium">
                        Relies on mass, not line. The center
                        &ldquo;hole&rdquo; is the signal.
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1"
                        style={{ color: `${NAVY}70` }}
                      >
                        Usage
                      </p>
                      <p style={{ color: `${NAVY}CC` }}>
                        Small Scale, Woven, Social. Hem tags, Favicons,
                        Instagram Avatars, Zipper Pulls.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            3.2 — THE OFFICIAL LOCKUPS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white px-8 py-16 md:px-16 md:py-24">
          <div className="max-w-3xl">
            {/* Watermark */}
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.03 }}
              aria-hidden
            >
              3.2
            </div>

            <h2
              id="official-lockups"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
              style={{ color: NAVY }}
            >
              The Official Lockups
            </h2>
            <p
              className="text-base leading-relaxed mb-6"
              style={{ color: NAVY }}
            >
              We have defined{" "}
              <strong className="font-bold">four (4)</strong> official
              configurations.
            </p>

            {/* Critical Rule */}
            <div
              className="border-l-2 pl-6 md:pl-8 py-2 mb-14"
              style={{ borderColor: STORM }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2"
                style={{ color: STORM }}
              >
                Binding Rule
              </p>
              <p
                className="text-sm font-medium leading-relaxed"
                style={{ color: `${NAVY}CC` }}
              >
                Do not create new combinations.
              </p>
            </div>

            {/* ── Lockup Grid ── */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* A. Master Stack */}
              <div
                id="lockup-a"
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: `${NAVY}10` }}
              >
                <BrandImage
                  src="/brand/visual/lockup-a-master-stack.png"
                  alt="Lockup A — The Master Stack: Icon + SATUIT wordmark + SUPPLY CO. vertical center alignment"
                />
                <div className="p-6">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1"
                    style={{ color: `${NAVY}50` }}
                  >
                    A
                  </p>
                  <p
                    className="text-base font-bold mb-0.5"
                    style={{ color: NAVY }}
                  >
                    The Master Stack
                  </p>
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.12em] mb-5"
                    style={{ color: `${NAVY}60` }}
                  >
                    The &ldquo;Official&rdquo; Signature
                  </p>
                  <div
                    className="space-y-2.5 text-sm"
                    style={{ color: `${NAVY}CC` }}
                  >
                    <p>
                      <strong className="font-semibold" style={{ color: NAVY }}>
                        Components:
                      </strong>{" "}
                      Outline Icon + SATUIT Wordmark + SUPPLY CO.
                    </p>
                    <p>
                      <strong className="font-semibold" style={{ color: NAVY }}>
                        Arrangement:
                      </strong>{" "}
                      Vertical Center Alignment.
                    </p>
                    <p>
                      <strong className="font-semibold" style={{ color: NAVY }}>
                        Usage:
                      </strong>{" "}
                      Storefront Signage, Packaging (Poly mailers/Boxes),
                      Hangtags. Highest level of formality.
                    </p>
                  </div>
                </div>
              </div>

              {/* B. Primary Wordmark */}
              <div
                id="lockup-b"
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: `${NAVY}10` }}
              >
                <BrandImage
                  src="/brand/visual/lockup-b-primary-wordmark.png"
                  alt="Lockup B — The Primary Wordmark: SATUIT custom letterforms with the Wavy A"
                />
                <div className="p-6">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1"
                    style={{ color: `${NAVY}50` }}
                  >
                    B
                  </p>
                  <p
                    className="text-base font-bold mb-0.5"
                    style={{ color: NAVY }}
                  >
                    The Primary Wordmark
                  </p>
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.12em] mb-5"
                    style={{ color: `${NAVY}60` }}
                  >
                    The &ldquo;Voice&rdquo;
                  </p>
                  <div
                    className="space-y-2.5 text-sm"
                    style={{ color: `${NAVY}CC` }}
                  >
                    <p>
                      <strong className="font-semibold" style={{ color: NAVY }}>
                        Components:
                      </strong>{" "}
                      SATUIT Wordmark only (No Icon, No
                      &ldquo;Supply Co.&rdquo;).
                    </p>
                    <p>
                      <strong className="font-semibold" style={{ color: NAVY }}>
                        Arrangement:
                      </strong>{" "}
                      Custom letterforms with the Wavy &lsquo;A&rsquo;.
                    </p>
                    <p>
                      <strong className="font-semibold" style={{ color: NAVY }}>
                        Usage:
                      </strong>{" "}
                      Website Headers, Neck Labels, Chest Prints. Confident
                      enough to stand alone.
                    </p>
                  </div>
                </div>
              </div>

              {/* C. Horizontal Lockup */}
              <div
                id="lockup-c"
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: `${NAVY}10` }}
              >
                <BrandImage
                  src="/brand/visual/lockup-c-horizontal.png"
                  alt="Lockup C — The Horizontal Lockup: Icon left of SATUIT wordmark"
                />
                <div className="p-6">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1"
                    style={{ color: `${NAVY}50` }}
                  >
                    C
                  </p>
                  <p
                    className="text-base font-bold mb-0.5"
                    style={{ color: NAVY }}
                  >
                    The Horizontal Lockup
                  </p>
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.12em] mb-5"
                    style={{ color: `${NAVY}60` }}
                  >
                    The &ldquo;Web&rdquo; Standard
                  </p>
                  <div
                    className="space-y-2.5 text-sm"
                    style={{ color: `${NAVY}CC` }}
                  >
                    <p>
                      <strong className="font-semibold" style={{ color: NAVY }}>
                        Components:
                      </strong>{" "}
                      Outline Icon + SATUIT Wordmark (Left-aligned).
                    </p>
                    <p>
                      <strong className="font-semibold" style={{ color: NAVY }}>
                        Arrangement:
                      </strong>{" "}
                      Icon sits left of text. Icon height matches cap-height.
                    </p>
                    <p>
                      <strong className="font-semibold" style={{ color: NAVY }}>
                        Usage:
                      </strong>{" "}
                      Thin Navigation Bars, Footer Credits. Only when vertical
                      space is restricted.
                    </p>
                  </div>
                </div>
              </div>

              {/* D. Field Badge */}
              <div
                id="lockup-d"
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: `${NAVY}10` }}
              >
                <BrandImage
                  src="/brand/visual/lockup-d-field-badge.png"
                  alt="Lockup D — The Field Badge: Solid icon only"
                />
                <div className="p-6">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1"
                    style={{ color: `${NAVY}50` }}
                  >
                    D
                  </p>
                  <p
                    className="text-base font-bold mb-0.5"
                    style={{ color: NAVY }}
                  >
                    The Field Badge
                  </p>
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.12em] mb-5"
                    style={{ color: `${NAVY}60` }}
                  >
                    The &ldquo;Symbol&rdquo;
                  </p>
                  <div
                    className="space-y-2.5 text-sm"
                    style={{ color: `${NAVY}CC` }}
                  >
                    <p>
                      <strong className="font-semibold" style={{ color: NAVY }}>
                        Components:
                      </strong>{" "}
                      Solid Icon Only.
                    </p>
                    <p>
                      <strong className="font-semibold" style={{ color: NAVY }}>
                        Usage:
                      </strong>{" "}
                      Hem Tags, Social Media Avatars, App Icons. The
                      &ldquo;shorthand&rdquo; for the brand.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            3.3 — CLEAR SPACE & MINIMUM SIZE
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
              3.3
            </div>

            <h2
              id="clear-space"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-12"
            >
              Clear Space &amp; Minimum Size
            </h2>

            {/* The "X" Rule */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.3em] shrink-0"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Clear Space
                </span>
                <span
                  className="flex-1 h-px"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
              <p
                className="text-base leading-[1.85] mb-3"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                We use the height of the letter &ldquo;S&rdquo; as our base
                unit (<strong className="text-white font-bold">1X</strong>).
              </p>
              <p
                className="text-base leading-[1.85] mb-8"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                There must be{" "}
                <strong className="text-white font-bold">
                  1X of empty space on all sides
                </strong>{" "}
                of the logo. Nothing&mdash;text, photos, buttons&mdash;can
                encroach on this zone.
              </p>

              <BrandImage
                src="/brand/visual/clear-space-x-rule.png"
                alt="Clear Space Construction — The X Rule: annotated diagram showing 1X clearance zone on all sides"
              />
            </div>

            {/* Minimum Size */}
            <div className="mt-14">
              <div className="flex items-center gap-4 mb-8">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.3em] shrink-0"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Minimum Size
                </span>
                <span
                  className="flex-1 h-px"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                />
              </div>

              <div
                className="rounded-lg overflow-hidden border"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "rgba(255,255,255,0.04)",
                      }}
                    >
                      {["Element", "Min Width", "Note"].map((h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em]"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [
                        "Master Stack",
                        '1.25\u2033 (32mm)',
                        'Below this, "Supply Co." becomes unreadable',
                      ],
                      ["Wordmark", '0.75\u2033 (20mm)', "\u2014"],
                      ["Icon (Outline)", '0.5\u2033 (12mm)', "\u2014"],
                      [
                        "Icon (Solid)",
                        '0.25\u2033 (6mm)',
                        "Smallest possible (e.g., Favicon)",
                      ],
                    ].map(([element, size, note]) => (
                      <tr
                        key={element}
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <td className="px-5 py-3 font-semibold">{element}</td>
                        <td
                          className="px-5 py-3 font-mono text-xs"
                          style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                          {size}
                        </td>
                        <td
                          className="px-5 py-3"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          {note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            3.4 — COLOR APPLICATION CONTEXT
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
              3.4
            </div>

            <h2
              id="color-application"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-12"
              style={{ color: NAVY }}
            >
              Color Application Context
            </h2>

            {/* Positive & Reverse */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: `${NAVY}06` }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ color: `${NAVY}80` }}
                >
                  Positive (Standard)
                </p>
                <p className="text-sm leading-[1.85]" style={{ color: NAVY }}>
                  Navy Logo on White / Canvas Background.
                </p>
              </div>
              <div
                className="rounded-lg p-6 text-white"
                style={{ backgroundColor: NAVY }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Reverse (Dark Mode)
                </p>
                <p
                  className="text-sm leading-[1.85]"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  White Logo on Navy / Dark Background.
                </p>
              </div>
            </div>

            {/* Sierra Logic callout */}
            <div
              className="border-l-2 pl-6 md:pl-8 py-2 mb-14"
              style={{ borderColor: NAVY }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2"
                style={{ color: `${NAVY}80` }}
              >
                Sierra Logic
              </p>
              <p
                className="text-sm leading-[1.85]"
                style={{ color: NAVY }}
              >
                When reversing the Solid Icon, the shape turns white and the
                center remains the background color. The negative space is the
                signal&mdash;not the fill.
              </p>
            </div>

            {/* Visual Reference */}
            <BrandImage
              src="/brand/visual/color-application-positive-reverse.png"
              alt="Color Application — Side-by-side comparison of positive (navy on canvas) and reverse (white on navy) logo applications"
            />

            {/* Full Lockup Sheet */}
            <div className="mt-10">
              <BrandImage
                src="/brand/visual/lockup-sheet.png"
                alt="The Lockup Sheet — Complete technical reference showing all four lockups on grid with proportions"
              />
            </div>
          </div>
        </section>

        <BrandSectionNav current="/internal/brand/visual" />

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
              Section 3.0
            </p>
            <p
              className="text-[11px] mt-3"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Visual standards are binding. Do not deviate from approved
              lockups.
            </p>
          </div>
        </footer>
      </main>
    </DocPageShell>
  )
}
