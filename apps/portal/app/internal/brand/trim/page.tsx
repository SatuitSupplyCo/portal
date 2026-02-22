import type { Metadata } from "next"
import Image from "next/image"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { BrandSectionNav } from "@/components/brand/BrandSectionNav"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Trim & Hardware — Section 8.0 | Satuit Supply Co.",
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

import { Placeholder } from "@/components/brand/Placeholder"

import { SpecRow } from "@/components/brand/SpecRow"

// ─── Page ───────────────────────────────────────────────────────────

export default function TrimHardwarePage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Brand", href: "/internal/brand" },
        { label: "Trim & Hardware" },
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
            8.0
          </span>

          <div className="relative max-w-3xl">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.35em] mb-8"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Section 8.0
            </p>
            <div
              className="w-10 h-px mb-10"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-8">
              Trim
              <br />
              &amp; Hardware
            </h1>
            <p
              className="text-base leading-relaxed max-w-xl"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Every stitch, label, cord, and grommet is a specification. These
              are the permanent details that outlast every wash and define the
              garment&rsquo;s identity from the inside out.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            8.1 — THE SPECIFICATION LABEL (NECK LABEL)
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
            8.1
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="spec-label"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              The Specification Label
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              Neck Label
            </p>

            <div
              className="rounded-lg p-6 mb-8"
              style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                style={{ color: GRANITE }}
              >
                Specifications
              </p>
              <SpecRow label="Format" value="Heat Transfer (Tagless)" />
              <SpecRow
                label="Design"
                value={`"Military Spec" layout — Size, Origin, Material`}
              />
              <SpecRow label="Color" value="Cool Gray 8" />
            </div>

            {/* Concept */}
            <div
              className="border-l-2 pl-6 py-1 mb-8"
              style={{ borderColor: SALT }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: SALT }}
              >
                The Concept
              </p>
              <p
                className="text-base leading-relaxed"
                style={{ color: `${NAVY}99` }}
              >
                No sewn-in label that folds and irritates. A clean heat-transfer
                print that reads like a military specification tag&mdash;size,
                origin, material. Nothing else.
              </p>
            </div>

            <Placeholder
              label="Neck Label — Detail"
              note="Heat-transfer tagless neck label with 'Military Spec' layout: Size, Origin, Material in Cool Gray 8."
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            8.2 — THE HALYARD DRAWSTRING
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
            8.2
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="halyard-drawstring"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              The Halyard Drawstring
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              Marine Rigging, Not Shoelaces
            </p>

            <div
              className="rounded-lg p-6 mb-8"
              style={{ backgroundColor: `${NAVY}02`, border: `1.5px solid ${NAVY}06` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                style={{ color: GRANITE }}
              >
                Cord Specification
              </p>
              <SpecRow label="Material" value="6mm Round Braid Cotton (Bone)" />
              <SpecRow
                label="Detail"
                value='Storm Red Whipping (1" up from aglet)'
                accent={STORM}
              />
              <SpecRow label="Tip" value="Matte Navy Silicone Dip" />
            </div>

            {/* Drawstring rendering */}
            <div className="rounded-lg overflow-hidden mb-8">
              <Image
                src="/brand/trim/halyard-drawstring.png"
                alt="Halyard Drawstring — Bone cotton cord with Storm Red thread whipping and matte Navy silicone aglet tips"
                width={1280}
                height={720}
                className="w-full h-auto"
              />
            </div>

            <p
              className="text-sm leading-relaxed max-w-xl"
              style={{ color: `${NAVY}88` }}
            >
              Dense, round-braided cotton mimics a halyard line. The Storm Red
              whipping acts as a subtle &ldquo;signal flag&rdquo; against the
              navy fleece, and the matte silicone dip provides soft-touch
              durability without shiny hardware.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            8.3 — THE NECK TAPE (REINFORCEMENT)
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
            8.3
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="neck-tape"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              The Neck Tape
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              Reinforcement
            </p>

            <div
              className="rounded-lg p-6 mb-8"
              style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                style={{ color: GRANITE }}
              >
                Specifications
              </p>
              <SpecRow label="Material" value="Cotton Herringbone Twill" />
              <SpecRow label="Color" value="Natural / Bone (Matches the Drawstring)" />
              <SpecRow label="Width" value="12mm" />
            </div>

            {/* Why callout */}
            <div
              className="border-l-2 pl-6 py-1 mb-8"
              style={{ borderColor: SALT }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: SALT }}
              >
                Why
              </p>
              <p
                className="text-base leading-relaxed"
                style={{ color: `${NAVY}99` }}
              >
                It hides the raw neck seam. Using the &ldquo;Bone&rdquo; color
                creates a clean, architectural line inside the hood that
                highlights the construction quality.
              </p>
            </div>

            <Placeholder
              label="Neck Tape — Detail"
              note="12mm Cotton Herringbone Twill in Natural/Bone, showing clean interior seam reinforcement."
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            8.4 — THE EXTERIOR HEM TAG
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
            8.4
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="hem-tag"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              The Exterior Hem Tag
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              The Badge
            </p>

            <div
              className="rounded-lg p-6 mb-8"
              style={{ backgroundColor: `${NAVY}02`, border: `1.5px solid ${NAVY}06` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                style={{ color: GRANITE }}
              >
                Specifications
              </p>
              <SpecRow label="Material" value="High-density damask weave" />
              <SpecRow
                label="Attachment"
                value="Single horizontal Storm Red box stitch"
                accent={STORM}
              />
            </div>

            {/* Signature stitch callout */}
            <div
              className="rounded-lg p-5 mb-8"
              style={{ backgroundColor: `${STORM}06`, border: `1.5px solid ${STORM}15` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: STORM }}
              >
                Signature Detail
              </p>
              <p className="text-sm font-medium" style={{ color: NAVY }}>
                The Storm Red box stitch is our subtle signature&mdash;the only
                visible color detail on the garment exterior.
              </p>
            </div>

            <div className="rounded-lg overflow-hidden">
              <Image
                src="/brand/trim/hem-tag.png"
                alt="Exterior Hem Tag — High-density damask woven badge with Storm Red box stitch on bottom left hem."
                width={1280}
                height={720}
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            8.5 — ZIPPERS & PULLS
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
            8.5
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="zippers-pulls"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            >
              Zippers &amp; Pulls
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: "rgba(255,255,255,0.50)" }}
            >
              Hardware
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div
                className="rounded-lg p-5"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1.5px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: "rgba(255,255,255,0.40)" }}
                >
                  Finish
                </p>
                <p className="text-lg font-bold mb-2">
                  Matte Gunmetal (Zinc)
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  No polished chrome. No shiny brass. Every zipper reads as
                  utilitarian hardware, not jewelry.
                </p>
              </div>

              <div
                className="rounded-lg p-5"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1.5px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: "rgba(255,255,255,0.40)" }}
                >
                  Pull Tab
                </p>
                <p className="text-lg font-bold mb-2">
                  Knotted &ldquo;Halyard&rdquo; Cord
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  A short length of the same Bone cotton cord used in our
                  drawstrings, knotted through the zipper pull for a tactile,
                  marine feel.
                </p>
              </div>
            </div>

            <Placeholder
              variant="dark"
              label="Zipper & Pull — Detail"
              note="Matte gunmetal zipper with knotted Bone cotton cord pull tab."
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            8.6 — GROMMETS & EYELETS
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
            8.6
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="grommets-eyelets"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              Grommets &amp; Eyelets
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              Application-Specific
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {/* Standard */}
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                  style={{ color: GRANITE }}
                >
                  Standard
                </p>
                <p className="text-xl font-bold mb-2" style={{ color: NAVY }}>
                  Tonal Embroidered Eyelet
                </p>
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: `${NAVY}88` }}
                >
                  Tone-on-tone Navy. Nearly invisible&mdash;the construction
                  speaks, not the hardware.
                </p>
                <Placeholder
                  label="Embroidered Eyelet"
                  note="Tonal Navy embroidered eyelet on standard garments (hoodies, joggers)."
                  aspect="1 / 1"
                />
              </div>

              {/* Outerwear */}
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                  style={{ color: GRANITE }}
                >
                  Outerwear / Heavy Duty
                </p>
                <p className="text-xl font-bold mb-2" style={{ color: NAVY }}>
                  Matte Oxide Metal Grommet
                </p>
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: `${NAVY}88` }}
                >
                  For outerwear and heavy-duty applications where strength
                  demands real metal hardware.
                </p>
                <Placeholder
                  label="Metal Grommet"
                  note="Matte oxide metal grommet with gunmetal finish for outerwear."
                  aspect="1 / 1"
                />
              </div>
            </div>
          </div>
        </section>

        <BrandSectionNav current="/internal/brand/trim" />

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
              Section 8.0 &middot; Trim &amp; Hardware
            </p>
            <p
              className="text-[11px] mt-3"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Every detail is a specification, not a decoration.
            </p>
          </div>
        </footer>
      </main>
    </DocPageShell>
  )
}
