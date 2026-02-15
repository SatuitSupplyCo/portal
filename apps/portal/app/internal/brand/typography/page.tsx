import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { BrandSectionNav } from "@/components/brand/BrandSectionNav"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Typography Standards \u2014 Section 4.0 | Satuit Supply Co.",
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

const cssCode = `/* IMPORT MONTSERRAT */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');

:root {
  --satuit-font: 'Montserrat', sans-serif;
}

/* THE VOICE (Headlines) */
h1, h2, .product-title {
  font-family: var(--satuit-font);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em; /* Wide spacing mimics the logo */
  line-height: 1.2;
}

/* THE DATA (Prices & UI) */
.price, .nav-link, .btn {
  font-family: var(--satuit-font);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* THE NARRATIVE (Body) */
p, .description, body {
  font-family: var(--satuit-font);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0; /* Standard spacing for readability */
  line-height: 1.6; /* Generous breathing room */
}`

const guardrails = [
  {
    title: "NO \u201CWavy A\u201D",
    body: "The custom \u201CA\u201D with the wave crossbar is strictly for the Logo Mark ONLY. Do not attempt to use it in headlines or sentences. It is a trademark, not a letterform.",
  },
  {
    title: "NO Spaced Lowercase",
    body: "Never add tracking to lowercase text (e.g., s\u2009p\u2009a\u2009c\u2009i\u2009n\u2009g). It looks broken and amateur.",
  },
  {
    title: "NO Italic",
    body: "The SATUIT brand is upright and stable. We rarely, if ever, use italics. If emphasis is needed, use Bold or CAPITALS.",
  },
  {
    title: "NO \u201CLight\u201D Weight for Body",
    body: "Do not use Montserrat Light (300) for body copy under 12pt. It becomes too thin to read on screens. Stick to Regular (400) for legibility.",
  },
]

// ─── Page ───────────────────────────────────────────────────────────

export default function TypographyPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Brand", href: "/internal/brand" },
        { label: "Typography Standards" },
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
              Typography
              <br />
              Standards
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium uppercase tracking-[0.2em]">
                Section 4.0
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
            4.1 — THE PRIMARY TYPEFACE
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
              4.1
            </div>

            <h2
              id="the-primary-typeface"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
              style={{ color: NAVY }}
            >
              The Primary Typeface: Montserrat
            </h2>
            <p
              className="text-lg leading-relaxed mb-10"
              style={{ color: NAVY }}
            >
              We have selected{" "}
              <strong className="font-bold">Montserrat</strong> as the sole
              typeface for the SATUIT brand.
            </p>

            {/* Classification Tags */}
            <div className="flex flex-wrap gap-3 mb-14">
              {[
                "Geometric Sans-Serif",
                "Google Fonts",
                "SIL Open Font License",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border"
                  style={{ borderColor: `${NAVY}20`, color: NAVY }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Alphabet Specimen */}
            <div
              className="border rounded-lg p-8 md:p-12 mb-14"
              style={{ borderColor: `${NAVY}12` }}
            >
              <div
                className="text-3xl md:text-4xl font-bold leading-relaxed tracking-wide"
                style={{ color: NAVY }}
              >
                <p>Aa Bb Cc Dd Ee Ff Gg</p>
                <p>Hh Ii Jj Kk Ll Mm Nn</p>
                <p>Oo Pp Qq Rr Ss Tt Uu</p>
                <p>Vv Ww Xx Yy Zz</p>
              </div>
              <div
                className="mt-8 pt-8"
                style={{ borderTop: `1px solid ${NAVY}0A` }}
              >
                <p
                  className="text-2xl md:text-3xl font-medium tracking-wider"
                  style={{ color: NAVY }}
                >
                  0 1 2 3 4 5 6 7 8 9
                </p>
              </div>
            </div>

            {/* The Rationale */}
            <div
              className="border-l-2 pl-6 md:pl-8 py-2"
              style={{ borderColor: NAVY }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
                style={{ color: `${NAVY}80` }}
              >
                The Rationale
              </p>
              <p
                className="text-base leading-[1.85]"
                style={{ color: NAVY }}
              >
                Montserrat is built on the same geometric principles as the
                SATUIT logo&mdash;perfect circles (&lsquo;O&rsquo;), vertical
                stability, and architectural weight. It is engineered, not
                drawn. By using it exclusively, we create a seamless visual
                language where the &ldquo;Brand Voice&rdquo; feels like a
                direct extension of the &ldquo;Brand Mark.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            4.2 — THE "SINGLE-SOURCE" POLICY
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white px-8 py-16 md:px-16 md:py-24">
          <div className="max-w-3xl">
            {/* Watermark */}
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.03 }}
              aria-hidden
            >
              4.2
            </div>

            <h2
              id="single-source-policy"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-10"
              style={{ color: NAVY }}
            >
              The &ldquo;Single-Source&rdquo; Policy
            </h2>

            {/* Emphatic Statements */}
            <div className="space-y-5 mb-14">
              <p className="text-xl font-bold" style={{ color: NAVY }}>
                We do not use secondary fonts.
              </p>
              <p className="text-lg" style={{ color: `${NAVY}CC` }}>
                There are no serif pairings. There are no script accents.
                There are no &ldquo;body copy&rdquo; alternates.
              </p>
            </div>

            {/* Logic & Benefit */}
            <div className="grid md:grid-cols-2 gap-6 mb-14">
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: `${NAVY}06` }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ color: `${NAVY}80` }}
                >
                  The Logic
                </p>
                <p
                  className="text-sm leading-[1.85]"
                  style={{ color: NAVY }}
                >
                  In &ldquo;Quiet Luxury,&rdquo; restraint is the ultimate sign
                  of confidence. Adding a second font family creates visual
                  noise and suggests that the primary font isn&rsquo;t strong
                  enough to carry the message.
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
                  The Benefit
                </p>
                <p
                  className="text-sm leading-[1.85]"
                  style={{ color: NAVY }}
                >
                  Total consistency across every touchpoint&mdash;from a 12px
                  footer link to a 10ft storefront sign. Whether a customer is
                  reading a care tag or an Instagram story, the
                  &ldquo;voice&rdquo; is identical.
                </p>
              </div>
            </div>

            {/* The Exception */}
            <div
              className="border-l-2 pl-6 md:pl-8 py-2"
              style={{ borderColor: `${NAVY}30` }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2"
                style={{ color: `${NAVY}60` }}
              >
                The Exception
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: `${NAVY}BB` }}
              >
                None. If a platform forces a default font (like System UI on
                iOS), we accept it. We do not voluntarily introduce a second
                font.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            4.3 — THE HIERARCHY SYSTEM
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
              4.3
            </div>

            <h2
              id="hierarchy-system"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
            >
              The Hierarchy System
            </h2>
            <p className="text-base leading-relaxed mb-16" style={{ color: "rgba(255,255,255,0.6)" }}>
              To create contrast without changing fonts, we manipulate{" "}
              <strong className="text-white">Weight</strong>,{" "}
              <strong className="text-white">Case</strong>, and{" "}
              <strong className="text-white">Tracking</strong> (Spacing).
            </p>

            {/* ── THE VOICE ── */}
            <div id="specimen-the-voice" className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.3em] shrink-0"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  The Voice
                </span>
                <span
                  className="flex-1 h-px"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
              <p
                className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-tight mb-6"
                style={{ letterSpacing: "0.15em" }}
              >
                SATUIT SUPPLY CO.
              </p>
              <div
                className="flex flex-wrap gap-x-6 gap-y-1 text-xs mb-3"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <span>Bold (700)</span>
                <span>Uppercase</span>
                <span>Tracking +0.15em</span>
              </div>
              <p
                className="text-xs mb-2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Headlines &middot; Hero Banners &middot; Product Names
              </p>
              <p
                className="text-sm font-medium mt-3"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                <em>Architectural. Commanding. Structural.</em>
              </p>
            </div>

            {/* ── THE DATA ── */}
            <div id="specimen-the-data" className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.3em] shrink-0"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  The Data
                </span>
                <span
                  className="flex-1 h-px"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
              <p
                className="text-2xl md:text-3xl font-medium uppercase leading-tight mb-6"
                style={{ letterSpacing: "0.05em" }}
              >
                $68.00 &middot; ADD TO BAG
              </p>
              <div
                className="flex flex-wrap gap-x-6 gap-y-1 text-xs mb-3"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <span>Medium (500)</span>
                <span>Uppercase or Title Case</span>
                <span>Tracking +0.05em</span>
              </div>
              <p
                className="text-xs mb-2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Prices &middot; Specs &middot; Nav Links &middot; Buttons
              </p>
              <p
                className="text-sm font-medium mt-3"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                <em>Functional. Clear. Numeric.</em>
              </p>
            </div>

            {/* ── THE NARRATIVE ── */}
            <div id="specimen-the-narrative" className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.3em] shrink-0"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  The Narrative
                </span>
                <span
                  className="flex-1 h-px"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
              <p
                className="text-base font-normal leading-[1.7] mb-6"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                A well-made essential designed for everyday wear near the water.
                Comfortable, durable, and easy to reach for&mdash;season after
                season. Built to be worn often, not saved for later.
              </p>
              <div
                className="flex flex-wrap gap-x-6 gap-y-1 text-xs mb-3"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <span>Regular (400)</span>
                <span>Sentence Case</span>
                <span>Tracking 0</span>
              </div>
              <p
                className="text-xs mb-2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Body Copy &middot; Descriptions &middot; Policies
              </p>
              <p
                className="text-sm font-medium mt-3"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                <em>Editorial. Invisible. Effortless.</em>
              </p>
            </div>

            {/* ── Reference Table ── */}
            <div
              className="rounded-lg overflow-hidden border mb-12"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                    {["Role", "Weight", "Case", "Tracking"].map((h) => (
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
                    ["The Voice", "Bold (700)", "Uppercase", "+100 to +150"],
                    [
                      "The Data",
                      "Medium (500)",
                      "Uppercase / Title",
                      "+10",
                    ],
                    ["The Narrative", "Regular (400)", "Sentence Case", "0"],
                  ].map(([role, weight, caseVal, tracking]) => (
                    <tr
                      key={role}
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <td className="px-5 py-3 font-semibold">{role}</td>
                      <td
                        className="px-5 py-3"
                        style={{ color: "rgba(255,255,255,0.65)" }}
                      >
                        {weight}
                      </td>
                      <td
                        className="px-5 py-3"
                        style={{ color: "rgba(255,255,255,0.65)" }}
                      >
                        {caseVal}
                      </td>
                      <td
                        className="px-5 py-3"
                        style={{ color: "rgba(255,255,255,0.65)" }}
                      >
                        {tracking}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Critical Rule */}
            <div
              className="border-l-2 pl-6 md:pl-8 py-2"
              style={{ borderColor: STORM }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2"
                style={{ color: STORM }}
              >
                Critical Rule
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Never apply wide tracking to lowercase letters. It breaks the
                visual ligature of the font and destroys readability. Wide
                tracking is reserved exclusively for Uppercase.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            4.4 — TECHNICAL IMPLEMENTATION
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
              4.4
            </div>

            <h2
              id="technical-implementation"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-12"
              style={{ color: NAVY }}
            >
              Technical Implementation
            </h2>

            {/* A. Web (CSS) */}
            <div className="mb-16">
              <h3
                className="text-sm font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: NAVY }}
              >
                A. Web Development (CSS)
              </h3>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: `${NAVY}BB` }}
              >
                Give this directly to your developer or input into your
                Shopify / Squarespace &ldquo;Custom CSS&rdquo; section.
              </p>
              <div
                className="rounded-lg overflow-hidden"
                style={{ backgroundColor: "#011627" }}
              >
                {/* Code block chrome */}
                <div
                  className="flex items-center gap-2 px-5 py-3"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/70" />
                  <span
                    className="ml-3 text-[10px] font-mono"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    satuit-typography.css
                  </span>
                </div>
                {/* Code */}
                <pre className="p-6 overflow-x-auto text-[13px] leading-relaxed">
                  <code
                    className="font-mono"
                    style={{ color: "#d6deeb" }}
                  >
                    {cssCode}
                  </code>
                </pre>
              </div>
            </div>

            {/* B. Print Design */}
            <div>
              <h3
                className="text-sm font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: NAVY }}
              >
                B. Print Design (Adobe Illustrator / InDesign)
              </h3>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: `${NAVY}BB` }}
              >
                When designing packaging, lookbooks, or business cards:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div
                  className="border rounded-lg p-6"
                  style={{ borderColor: `${NAVY}12` }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-5"
                    style={{ color: `${NAVY}80` }}
                  >
                    Headlines
                  </p>
                  <ul
                    className="space-y-2.5 text-sm"
                    style={{ color: NAVY }}
                  >
                    <li>
                      <strong className="font-semibold">Font:</strong>{" "}
                      Montserrat Bold
                    </li>
                    <li>
                      <strong className="font-semibold">Tracking (VA):</strong>{" "}
                      150
                    </li>
                    <li>
                      <strong className="font-semibold">Kerning:</strong>{" "}
                      Optical
                    </li>
                  </ul>
                </div>
                <div
                  className="border rounded-lg p-6"
                  style={{ borderColor: `${NAVY}12` }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-5"
                    style={{ color: `${NAVY}80` }}
                  >
                    Body Copy
                  </p>
                  <ul
                    className="space-y-2.5 text-sm"
                    style={{ color: NAVY }}
                  >
                    <li>
                      <strong className="font-semibold">Font:</strong>{" "}
                      Montserrat Regular
                    </li>
                    <li>
                      <strong className="font-semibold">Tracking (VA):</strong>{" "}
                      0
                    </li>
                    <li>
                      <strong className="font-semibold">Leading:</strong>{" "}
                      140%&ndash;150% of font size
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            4.5 — THE "GUARDRAILS"
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white px-8 py-16 md:px-16 md:py-24">
          <div className="max-w-3xl">
            {/* Watermark */}
            <div
              className="text-[8rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: NAVY, opacity: 0.03 }}
              aria-hidden
            >
              4.5
            </div>

            <h2
              id="guardrails"
              className="text-2xl font-bold uppercase tracking-[0.1em] -mt-16 mb-3"
              style={{ color: NAVY }}
            >
              The &ldquo;Guardrails&rdquo;
            </h2>
            <p className="text-sm mb-12" style={{ color: `${NAVY}AA` }}>
              Do not do this.
            </p>

            <div className="space-y-5">
              {guardrails.map((rule) => (
                <div
                  key={rule.title}
                  className="border-l-2 pl-6 md:pl-8 py-4"
                  style={{ borderColor: STORM }}
                >
                  <p
                    className="text-sm font-bold uppercase tracking-[0.08em] mb-2"
                    style={{ color: STORM }}
                  >
                    {rule.title}
                  </p>
                  <p
                    className="text-sm leading-[1.75]"
                    style={{ color: `${NAVY}CC` }}
                  >
                    {rule.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <BrandSectionNav current="/internal/brand/typography" />

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
              Section 4.0
            </p>
            <p
              className="text-[11px] mt-3"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Montserrat is used under the SIL Open Font License.
            </p>
          </div>
        </footer>
      </main>
    </DocPageShell>
  )
}
