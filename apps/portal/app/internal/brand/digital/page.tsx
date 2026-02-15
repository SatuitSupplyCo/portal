import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { BrandSectionNav } from "@/components/brand/BrandSectionNav"

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

// ─── Table of Contents ──────────────────────────────────────────────

// ─── Palette ────────────────────────────────────────────────────────

const NAVY = "#0A1E36"
const CANVAS = "#F0EFEA"
const GRANITE = "#8C92AC"
const STORM = "#A6192E"
const SALT = "#69A3B0"
const YELLOW = "#EAAA00"

// ─── Placeholder helper ────────────────────────────────────────────

function Placeholder({
  label,
  note,
  variant = "light",
  aspect = "3 / 2",
}: {
  label: string
  note: string
  variant?: "light" | "dark"
  aspect?: string
}) {
  const light = variant === "light"
  return (
    <div
      className="rounded-lg flex flex-col items-center justify-center text-center px-6"
      style={{
        aspectRatio: aspect,
        backgroundColor: light ? `${NAVY}06` : "rgba(255,255,255,0.03)",
        border: light
          ? `1.5px dashed ${NAVY}12`
          : "1.5px dashed rgba(255,255,255,0.10)",
      }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
        style={{
          border: light
            ? `1.5px dashed ${NAVY}18`
            : "1.5px dashed rgba(255,255,255,0.12)",
        }}
      >
        <span
          className="text-base"
          style={{ color: light ? `${NAVY}25` : "rgba(255,255,255,0.18)" }}
        >
          &#9671;
        </span>
      </div>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1"
        style={{ color: light ? `${NAVY}50` : "rgba(255,255,255,0.40)" }}
      >
        {label}
      </p>
      <p
        className="text-[10px] max-w-[220px]"
        style={{ color: light ? `${NAVY}35` : "rgba(255,255,255,0.25)" }}
      >
        {note}
      </p>
    </div>
  )
}

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
        {/* ═══════════════════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: NAVY }}
          className="relative text-white px-8 py-20 md:px-16 md:py-28 overflow-hidden"
        >
          <span
            aria-hidden
            className="pointer-events-none select-none absolute -right-6 bottom-0 text-[20rem] font-bold leading-none"
            style={{ color: "rgba(255,255,255,0.02)" }}
          >
            10.0
          </span>

          <div className="relative max-w-3xl">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.35em] mb-8"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Section 10.0
            </p>
            <div
              className="w-10 h-px mb-10"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-8">
              Digital Strategy
              <br />
              &amp; UI/UX
            </h1>
            <p
              className="text-base leading-relaxed max-w-xl"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              The website is not a store. It is a catalog. Every pixel must feel
              organized, archival, and utilitarian&mdash;a digital extension of
              the physical brand.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            10.1 — WEBSITE PHILOSOPHY
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: CANVAS }}
          className="relative px-8 py-16 md:px-16 md:py-20 overflow-hidden"
        >
          <span
            aria-hidden
            className="pointer-events-none select-none absolute -right-4 -top-10 text-[14rem] font-bold leading-none"
            style={{ color: `${NAVY}03` }}
          >
            10.1
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="website-philosophy"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              The Website Philosophy
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              &ldquo;The Digital Depot&rdquo;
            </p>

            <p
              className="text-base leading-relaxed mb-10 max-w-xl"
              style={{ color: `${NAVY}cc` }}
            >
              The website is not a &ldquo;Store&rdquo;&mdash;it is a Catalog. It
              should feel organized, archival, and utilitarian.
            </p>

            {/* Layout & White Space */}
            <div className="grid md:grid-cols-2 gap-5 mb-10">
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: NAVY }}
                >
                  The Layout
                </p>
                <p
                  className="text-sm font-bold mb-2"
                  style={{ color: NAVY }}
                >
                  Strict Grid
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}88` }}
                >
                  We use a modular, architectural layout. Images are squared
                  off&mdash;no circles, no organic blobs.
                </p>
              </div>

              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: NAVY }}
                >
                  The &ldquo;White Space&rdquo; Rule
                </p>
                <p
                  className="text-sm font-bold mb-2"
                  style={{ color: NAVY }}
                >
                  White space is a luxury material.
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}88` }}
                >
                  Give the product photos room to breathe. Do not crowd the
                  page.
                </p>
              </div>
            </div>

            {/* Navigation */}
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
              style={{ color: NAVY }}
            >
              The Navigation
            </p>

            {/* Top Nav mockup */}
            <div
              className="rounded-lg overflow-hidden mb-4"
              style={{ border: `1.5px solid ${NAVY}08` }}
            >
              <div
                className="flex items-center justify-between px-6 py-3"
                style={{ backgroundColor: "white" }}
              >
                <p
                  className="text-sm font-bold tracking-wide"
                  style={{ color: NAVY }}
                >
                  SATUIT SUPPLY CO.
                </p>
                <div className="flex gap-6">
                  {["SHOP", "ABOUT", "JOURNAL", "LOGIN"].map((item) => (
                    <span
                      key={item}
                      className="text-[11px] font-medium tracking-[0.1em]"
                      style={{ color: `${NAVY}88` }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Utility Bar mockup */}
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: `1.5px solid ${NAVY}08` }}
            >
              <div
                className="flex items-center justify-center px-6 py-2"
                style={{ backgroundColor: NAVY }}
              >
                <span
                  className="text-[10px] font-medium tracking-[0.1em] text-white"
                  style={{ opacity: 0.7 }}
                >
                  Free Shipping on Provisions over $150.
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                  style={{ color: `${NAVY}50` }}
                >
                  Top Nav
                </p>
                <p className="text-sm" style={{ color: `${NAVY}88` }}>
                  Clean and sparse. White background, Navy text.
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                  style={{ color: `${NAVY}50` }}
                >
                  Utility Bar
                </p>
                <p className="text-sm" style={{ color: `${NAVY}88` }}>
                  Thin strip in Satuit Navy. White text.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            10.2 — UI ELEMENTS
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: "white" }}
          className="relative px-8 py-16 md:px-16 md:py-20 overflow-hidden"
        >
          <span
            aria-hidden
            className="pointer-events-none select-none absolute -right-4 -top-10 text-[14rem] font-bold leading-none"
            style={{ color: `${NAVY}03` }}
          >
            10.2
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="ui-elements"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              UI Elements
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-12"
              style={{ color: GRANITE }}
            >
              The Buttons &amp; Badges
            </p>

            {/* ── Button Style ── */}
            <h3
              id="button-style"
              className="text-xl font-bold mb-6"
              style={{ color: NAVY }}
            >
              The Button Style
            </h3>

            <div className="grid md:grid-cols-2 gap-5 mb-8">
              {/* Shape */}
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: `${NAVY}03`, border: `1.5px solid ${NAVY}06` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: `${NAVY}50` }}
                >
                  Shape
                </p>
                <p className="text-sm leading-relaxed" style={{ color: `${NAVY}cc` }}>
                  Sharp Rectangles (<strong>0px radius</strong>) or
                  Micro-Rounded (<strong>2px radius</strong>).
                </p>
                <div
                  className="mt-3 rounded-lg p-3"
                  style={{ backgroundColor: `${STORM}06`, border: `1px solid ${STORM}15` }}
                >
                  <p className="text-[10px] font-bold" style={{ color: STORM }}>
                    Absolutely no &ldquo;Pill&rdquo; shapes (too friendly/tech).
                  </p>
                </div>
              </div>

              {/* States */}
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: `${NAVY}03`, border: `1.5px solid ${NAVY}06` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: `${NAVY}50` }}
                >
                  States
                </p>
                <p className="text-sm leading-relaxed mb-1" style={{ color: `${NAVY}cc` }}>
                  <strong>Primary:</strong> Solid Satuit Navy, White text.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: `${NAVY}cc` }}>
                  <strong>Hover:</strong> Shifts to Granite Grey (do not simply
                  lower opacity&mdash;change the color).
                </p>
              </div>
            </div>

            {/* Live button specimens */}
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
              style={{ color: `${NAVY}50` }}
            >
              Live Specimens
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              {/* Primary */}
              <button
                type="button"
                className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white transition-colors cursor-default"
                style={{ backgroundColor: NAVY, borderRadius: 0 }}
                title="Primary Action — 0px radius"
              >
                Shop the Collection
              </button>
              {/* Micro-rounded */}
              <button
                type="button"
                className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white transition-colors cursor-default"
                style={{ backgroundColor: NAVY, borderRadius: 2 }}
                title="Primary Action — 2px radius"
              >
                Add to Provisions
              </button>
              {/* Hover state */}
              <button
                type="button"
                className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white cursor-default"
                style={{ backgroundColor: GRANITE, borderRadius: 0 }}
                title="Hover State — Granite Grey"
              >
                Hover State
              </button>
              {/* Sold Out */}
              <button
                type="button"
                className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white cursor-not-allowed opacity-70"
                style={{ backgroundColor: GRANITE, borderRadius: 0 }}
                title="Sold Out — Granite Grey, unclickable"
              >
                Sold Out
              </button>
            </div>

            {/* ── Functional Colors ── */}
            <h3
              id="functional-colors"
              className="text-xl font-bold mb-6"
              style={{ color: NAVY }}
            >
              Functional Colors
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              {/* New Arrival */}
              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: `${NAVY}03`, border: `1.5px solid ${NAVY}06` }}
              >
                <div
                  className="inline-block px-3 py-1 rounded-sm mb-4 text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{ backgroundColor: YELLOW, color: NAVY }}
                >
                  New Arrival
                </div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                  style={{ color: `${NAVY}50` }}
                >
                  Badge
                </p>
                <p className="text-sm" style={{ color: `${NAVY}cc` }}>
                  Signal Yellow background, Black text.
                </p>
              </div>

              {/* Final Sale */}
              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: `${NAVY}03`, border: `1.5px solid ${NAVY}06` }}
              >
                <p className="text-lg font-bold mb-4" style={{ color: STORM }}>
                  <span
                    className="line-through mr-2 text-sm"
                    style={{ color: `${NAVY}40` }}
                  >
                    $68
                  </span>
                  $42
                </p>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                  style={{ color: `${NAVY}50` }}
                >
                  Final Sale
                </p>
                <p className="text-sm" style={{ color: `${NAVY}cc` }}>
                  Price text in Storm Red.
                </p>
              </div>

              {/* Sold Out */}
              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: `${NAVY}03`, border: `1.5px solid ${NAVY}06` }}
              >
                <button
                  type="button"
                  className="px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-white cursor-not-allowed opacity-60 mb-4"
                  style={{ backgroundColor: GRANITE, borderRadius: 0 }}
                >
                  Sold Out
                </button>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                  style={{ color: `${NAVY}50` }}
                >
                  Sold Out
                </p>
                <p className="text-sm" style={{ color: `${NAVY}cc` }}>
                  Granite Grey button, unclickable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            10.3 — PRODUCT DETAIL PAGE
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: NAVY }}
          className="relative text-white px-8 py-16 md:px-16 md:py-20 overflow-hidden"
        >
          <span
            aria-hidden
            className="pointer-events-none select-none absolute -right-4 -top-10 text-[14rem] font-bold leading-none"
            style={{ color: "rgba(255,255,255,0.02)" }}
          >
            10.3
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="product-detail"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            >
              The Product Detail Page
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              The &ldquo;Spec Sheet&rdquo;
            </p>

            <p
              className="text-sm leading-relaxed mb-10 max-w-xl"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              We don&rsquo;t just sell a shirt; we explain the engineering.
              Every product page is structured as technical documentation.
            </p>

            {/* PDP mockup */}
            <div
              className="rounded-lg overflow-hidden mb-10"
              style={{ border: "1.5px solid rgba(255,255,255,0.08)" }}
            >
              {/* Headline bar */}
              <div
                className="px-6 py-4"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <p className="text-lg md:text-xl font-bold tracking-[0.15em]">
                  THE MERINO QUARTER-ZIP
                </p>
                <p
                  className="text-[10px] mt-1 font-medium tracking-[0.1em]"
                  style={{ color: "rgba(255,255,255,0.40)" }}
                >
                  Montserrat Bold &middot; Wide Tracking
                </p>
              </div>

              {/* Specs module */}
              <div
                id="pdp-specs"
                className="px-6 py-5"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                  style={{ color: SALT }}
                >
                  Specifications
                </p>
                <div className="space-y-2 font-mono text-sm">
                  {(
                    [
                      ["MATERIAL", "400gsm French Terry"],
                      ["ORIGIN", "Milled in Portugal"],
                      ["FIT", "Standard / Room for layering"],
                      ["CARE", "Cold Wash / Line Dry"],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label} className="flex gap-4">
                      <span
                        className="w-24 shrink-0"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {label}:
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Imagery requirements */}
            <h3
              id="pdp-imagery"
              className="text-lg font-bold mb-6"
            >
              The Imagery
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                  style={{ color: SALT }}
                >
                  Hero
                </p>
                <Placeholder
                  variant="dark"
                  label="PDP — Flat Lay"
                  note="Whole product on canvas surface. Clean, squared-off frame."
                  aspect="1 / 1"
                />
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                  style={{ color: SALT }}
                >
                  Detail
                </p>
                <Placeholder
                  variant="dark"
                  label="PDP — Texture"
                  note="Macro shot of fabric or stitch detail. Show the engineering."
                  aspect="1 / 1"
                />
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                  style={{ color: SALT }}
                >
                  On-Body
                </p>
                <Placeholder
                  variant="dark"
                  label="PDP — Fit"
                  note="Headless or 'looking away' shot showing fit and drape."
                  aspect="1 / 1"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            10.4 — THE SOCIAL GRID
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: CANVAS }}
          className="relative px-8 py-16 md:px-16 md:py-20 overflow-hidden"
        >
          <span
            aria-hidden
            className="pointer-events-none select-none absolute -right-4 -top-10 text-[14rem] font-bold leading-none"
            style={{ color: `${NAVY}03` }}
          >
            10.4
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="social-grid"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              The Social Grid
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              &ldquo;The Field Log&rdquo;
            </p>

            <p
              className="text-base leading-relaxed mb-10 max-w-xl"
              style={{ color: `${NAVY}cc` }}
            >
              Instagram is not a billboard; it is a documentation of life near
              the water. We treat it like a field reporter&rsquo;s notebook.
            </p>

            {/* 3-3-3 Rule */}
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
              style={{ color: NAVY }}
            >
              The Rhythm (3-3-3 Rule)
            </p>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: `${NAVY}88` }}
            >
              For every 9 posts, aim for this balance:
            </p>

            {/* 3x3 grid mockup */}
            <div className="grid grid-cols-3 gap-2 mb-10">
              {/* Row 1 — Product */}
              {[1, 2, 3].map((n) => (
                <div
                  key={`product-${n}`}
                  className="flex flex-col items-center justify-center text-center p-3"
                  style={{
                    aspectRatio: "1 / 1",
                    backgroundColor: "white",
                    border: `1.5px solid ${NAVY}08`,
                    borderRadius: 8,
                  }}
                >
                  <span
                    className="text-2xl mb-2"
                    style={{ color: `${NAVY}15` }}
                  >
                    &#9671;
                  </span>
                  <p
                    className="text-[9px] font-bold uppercase tracking-[0.1em]"
                    style={{ color: NAVY }}
                  >
                    Product
                  </p>
                  <p
                    className="text-[8px] mt-0.5"
                    style={{ color: `${NAVY}50` }}
                  >
                    The &ldquo;Supply&rdquo;
                  </p>
                </div>
              ))}
              {/* Row 2 — Lifestyle */}
              {[1, 2, 3].map((n) => (
                <div
                  key={`lifestyle-${n}`}
                  className="flex flex-col items-center justify-center text-center p-3"
                  style={{
                    aspectRatio: "1 / 1",
                    backgroundColor: `${SALT}10`,
                    border: `1.5px solid ${SALT}20`,
                    borderRadius: 8,
                  }}
                >
                  <span
                    className="text-2xl mb-2"
                    style={{ color: `${SALT}40` }}
                  >
                    &#9671;
                  </span>
                  <p
                    className="text-[9px] font-bold uppercase tracking-[0.1em]"
                    style={{ color: NAVY }}
                  >
                    Lifestyle
                  </p>
                  <p
                    className="text-[8px] mt-0.5"
                    style={{ color: `${NAVY}50` }}
                  >
                    The &ldquo;Life&rdquo;
                  </p>
                </div>
              ))}
              {/* Row 3 — Texture */}
              {[1, 2, 3].map((n) => (
                <div
                  key={`texture-${n}`}
                  className="flex flex-col items-center justify-center text-center p-3"
                  style={{
                    aspectRatio: "1 / 1",
                    backgroundColor: `${GRANITE}10`,
                    border: `1.5px solid ${GRANITE}20`,
                    borderRadius: 8,
                  }}
                >
                  <span
                    className="text-2xl mb-2"
                    style={{ color: `${GRANITE}40` }}
                  >
                    &#9671;
                  </span>
                  <p
                    className="text-[9px] font-bold uppercase tracking-[0.1em]"
                    style={{ color: NAVY }}
                  >
                    Texture
                  </p>
                  <p
                    className="text-[8px] mt-0.5"
                    style={{ color: `${NAVY}50` }}
                  >
                    The &ldquo;Place&rdquo;
                  </p>
                </div>
              ))}
            </div>

            {/* Caption Style */}
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
              style={{ color: NAVY }}
            >
              The Caption Style
            </p>
            <p
              className="text-sm font-bold mb-5"
              style={{ color: `${NAVY}cc` }}
            >
              Short. Factual. Grounded.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Bad */}
              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: `${STORM}06`, border: `1.5px solid ${STORM}12` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: STORM }}
                >
                  Don&rsquo;t Write
                </p>
                <p
                  className="text-sm italic leading-relaxed"
                  style={{ color: `${NAVY}88` }}
                >
                  &ldquo;Loving these vibes! &#127754;&#10024;
                  #coastal&rdquo;
                </p>
              </div>

              {/* Good */}
              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: `${NAVY}04`, border: `1.5px solid ${NAVY}10` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: NAVY }}
                >
                  Do Write
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${NAVY}cc` }}
                >
                  &ldquo;The Quarter-Zip in Navy. Built for the variable
                  conditions of the shoulder season. Link in bio.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            10.5 — EMAIL MARKETING
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: "white" }}
          className="relative px-8 py-16 md:px-16 md:py-20 overflow-hidden"
        >
          <span
            aria-hidden
            className="pointer-events-none select-none absolute -right-4 -top-10 text-[14rem] font-bold leading-none"
            style={{ color: `${NAVY}03` }}
          >
            10.5
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="email"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              Email Marketing
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              &ldquo;The Supply Drop&rdquo;
            </p>

            <div
              className="border-l-2 pl-6 py-1 mb-10"
              style={{ borderColor: SALT }}
            >
              <p
                className="text-base leading-relaxed"
                style={{ color: `${NAVY}cc` }}
              >
                We do not send &ldquo;Blasts.&rdquo; We send
                &ldquo;Dispatches.&rdquo;
              </p>
            </div>

            {/* Subject Lines */}
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
              style={{ color: NAVY }}
            >
              Subject Lines
            </p>
            <p
              className="text-sm mb-5"
              style={{ color: `${NAVY}88` }}
            >
              Lowercase or Sentence Case. Factual.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-12">
              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: `${NAVY}03`, border: `1.5px solid ${NAVY}08` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: NAVY }}
                >
                  Yes
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: `${NAVY}cc` }}
                >
                  Restock: The Heavyweight Tee.
                </p>
              </div>
              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: `${STORM}06`, border: `1.5px solid ${STORM}12` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: STORM }}
                >
                  No
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: `${NAVY}cc` }}
                >
                  HURRY! You need this NOW!!!
                </p>
              </div>
            </div>

            {/* The Template */}
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
              style={{ color: NAVY }}
            >
              The Template
            </p>

            {/* Email mockup */}
            <div
              className="rounded-lg overflow-hidden mb-8"
              style={{ border: `1.5px solid ${NAVY}08` }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-center py-5"
                style={{ backgroundColor: "white" }}
              >
                <p
                  className="text-sm font-bold tracking-[0.15em]"
                  style={{ color: NAVY }}
                >
                  SATUIT SUPPLY CO.
                </p>
              </div>

              {/* Hero image */}
              <div
                className="flex items-center justify-center py-12"
                style={{ backgroundColor: `${NAVY}03` }}
              >
                <div className="text-center">
                  <span
                    className="text-4xl"
                    style={{ color: `${NAVY}12` }}
                  >
                    &#9671;
                  </span>
                  <p
                    className="text-[10px] mt-2 uppercase tracking-[0.15em]"
                    style={{ color: `${NAVY}30` }}
                  >
                    One large hero image
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-6" style={{ backgroundColor: "white" }}>
                <div
                  className="w-2/3 h-2 rounded mb-3"
                  style={{ backgroundColor: `${NAVY}08` }}
                />
                <div
                  className="w-1/2 h-2 rounded mb-6"
                  style={{ backgroundColor: `${NAVY}06` }}
                />
                <p
                  className="text-[10px] uppercase tracking-[0.1em]"
                  style={{ color: `${NAVY}35` }}
                >
                  Minimal text. Let the product speak.
                </p>
              </div>

              {/* Footer */}
              <div
                className="px-8 py-5 flex items-center justify-center gap-6"
                style={{ backgroundColor: NAVY }}
              >
                {["Shop", "About", "Unsubscribe"].map((link) => (
                  <span
                    key={link}
                    className="text-[10px] tracking-[0.1em]"
                    style={{ color: "rgba(255,255,255,0.50)" }}
                  >
                    {link}
                  </span>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div
              className="rounded-lg p-5"
              style={{ backgroundColor: `${NAVY}03`, border: `1.5px solid ${NAVY}08` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: STORM }}
              >
                Frequency
              </p>
              <p
                className="text-base font-bold"
                style={{ color: NAVY }}
              >
                Low. We only speak when we have something to say.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HOMEPAGE HERO — VISUAL REFERENCE
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{ backgroundColor: NAVY }}
          className="relative text-white px-8 py-16 md:px-16 md:py-20 overflow-hidden"
        >
          <div className="relative max-w-3xl">
            <h2
              id="homepage-hero"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            >
              Visual Reference
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              The Homepage Hero
            </p>

            <p
              className="text-sm leading-relaxed mb-10 max-w-xl"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Imagine opening the website on a desktop. This is the first thing
              you see.
            </p>

            {/* Homepage mockup */}
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: "1.5px solid rgba(255,255,255,0.08)" }}
            >
              {/* Utility bar */}
              <div
                className="flex items-center justify-center py-1.5"
                style={{ backgroundColor: NAVY, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span
                  className="text-[9px] tracking-[0.1em]"
                  style={{ color: "rgba(255,255,255,0.50)" }}
                >
                  Free Shipping on Provisions over $150.
                </span>
              </div>

              {/* Nav */}
              <div
                className="flex items-center justify-between px-6 py-3"
                style={{ backgroundColor: "white" }}
              >
                <p
                  className="text-xs font-bold tracking-[0.12em]"
                  style={{ color: NAVY }}
                >
                  SATUIT SUPPLY CO.
                </p>
                <div className="flex gap-5">
                  {["SHOP", "ABOUT", "JOURNAL"].map((item) => (
                    <span
                      key={item}
                      className="text-[10px] font-medium tracking-[0.08em]"
                      style={{ color: `${NAVY}70` }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hero image area */}
              <div
                className="relative flex flex-col items-center justify-center py-24 md:py-32"
                style={{ backgroundColor: `${GRANITE}18` }}
              >
                <Placeholder
                  variant="dark"
                  label="Hero — Grey Harbor"
                  note="Wide, cinematic shot of a grey harbor. Overcast, matte, textured."
                  aspect="21 / 9"
                />

                {/* Overlay text mockup */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl md:text-4xl font-bold tracking-[0.2em] text-white mb-6">
                    MADE FOR THE WATER.
                  </p>
                  <button
                    type="button"
                    className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white cursor-default"
                    style={{ backgroundColor: NAVY, borderRadius: 0 }}
                  >
                    Shop the Collection
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                  style={{ color: "rgba(255,255,255,0.40)" }}
                >
                  The Nav
                </p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Minimal, white background, Navy text.
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                  style={{ color: "rgba(255,255,255,0.40)" }}
                >
                  The Hero
                </p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Wide, cinematic grey harbor shot.
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                  style={{ color: "rgba(255,255,255,0.40)" }}
                >
                  The CTA
                </p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Solid Navy button, 0px radius.
                </p>
              </div>
            </div>
          </div>
        </section>

        <BrandSectionNav current="/internal/brand/digital" />

        {/* ═══════════════════════════════════════════════════════════════
            COLOPHON
        ═══════════════════════════════════════════════════════════════ */}
        <footer
          style={{ backgroundColor: NAVY }}
          className="text-white px-8 py-14 md:px-16"
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
              Section 10.0 &middot; Digital Strategy &amp; UI/UX
            </p>
            <p
              className="text-[11px] mt-3"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              The website is a catalog, not a store.
            </p>
          </div>
        </footer>
      </main>
    </DocPageShell>
  )
}
