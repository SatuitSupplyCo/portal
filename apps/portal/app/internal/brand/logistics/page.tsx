import type { Metadata } from "next"
import Image from "next/image"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { BrandSectionNav } from "@/components/brand/BrandSectionNav"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Packaging & Logistics — Section 9.0 | Satuit Supply Co.",
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

export default function LogisticsPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Brand", href: "/internal/brand" },
        { label: "Packaging & Logistics" },
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
            9.0
          </span>

          <div className="relative max-w-3xl">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.35em] mb-8"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Section 9.0
            </p>
            <div
              className="w-10 h-px mb-10"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-8">
              Packaging
              <br />
              &amp; Logistics
            </h1>
            <p
              className="text-base leading-relaxed max-w-xl mb-6"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              This isn&rsquo;t &ldquo;shopping&rdquo;&mdash;it is
              &ldquo;provisioning.&rdquo; The experience should feel like
              opening a sealed ration kit or a piece of equipment.
            </p>

            {/* Theme callout */}
            <div
              className="inline-block px-5 py-2.5 rounded"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: YELLOW }}
              >
                &ldquo;The Supply Drop&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            9.1 — THE "HULL" (EXTERIOR MAILER)
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
            9.1
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="the-hull"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              The &ldquo;Hull&rdquo;
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              Exterior Mailer
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
              <SpecRow label="Item" value="Matte Navy Poly Mailer" />
              <SpecRow
                label="Graphic"
                value={`The "Master Stack" Lockup (Icon | Satuit | Supply Co.) in White. Centered.`}
              />
            </div>

            <div
              className="border-l-2 pl-6 py-1 mb-8"
              style={{ borderColor: SALT }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: SALT }}
              >
                The Effect
              </p>
              <p
                className="text-base leading-relaxed"
                style={{ color: `${NAVY}99` }}
              >
                It looks like a diplomatic pouch or a naval shipment. It stands
                out in a pile of brown Amazon boxes.
              </p>
            </div>

            <Placeholder
              label="The Hull — Exterior"
              note="Matte Navy poly mailer with centered white Master Stack lockup."
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            9.2 — THE "SHROUD" (TISSUE WRAP)
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
            9.2
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="the-shroud"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              The &ldquo;Shroud&rdquo;
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              Tissue Wrap
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
              <SpecRow
                label="Item"
                value={`"Salt Air" Tissue (Translucent/Off-White)`}
              />
              <SpecRow label="Texture" value="Crisp, not soft" />
              <SpecRow
                label="Purpose"
                value="Keeps the garment clean; adds a layer of 'noise' (crinkle) to the opening"
              />
            </div>

            <p
              className="text-sm leading-relaxed max-w-xl mb-8"
              style={{ color: `${NAVY}88` }}
            >
              The crisp texture is deliberate&mdash;when the mailer is opened,
              the tissue adds an audible layer of anticipation to the unboxing.
              It wraps the garment like a protective shroud.
            </p>

            <Placeholder
              label="The Shroud — Tissue Detail"
              note="Crisp off-white 'Salt Air' tissue wrap enclosing folded garment."
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            9.3 — THE "SEAL" (STICKER)
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
            9.3
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="the-seal"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              The &ldquo;Seal&rdquo;
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              Sticker
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
              <SpecRow label="Item" value='2.5" Circle Sticker' />
              <SpecRow
                label="Color"
                value="Signal Yellow (Pantone 123 C) with Black Type"
                accent={YELLOW}
              />
              <SpecRow
                label="Text"
                value={`"PROVISIONED" or "QC INSPECTED"`}
              />
              <SpecRow label="Placement" value="Seals the tissue closed" />
            </div>

            {/* Seal sticker visual mockup */}
            <div className="flex items-center gap-6 mb-8">
              <div
                className="shrink-0 w-20 h-20 rounded-full flex flex-col items-center justify-center text-center"
                style={{ backgroundColor: YELLOW }}
              >
                <p
                  className="text-[7px] font-bold uppercase tracking-[0.15em] leading-tight"
                  style={{ color: NAVY }}
                >
                  Provisioned
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                  style={{ color: `${NAVY}50` }}
                >
                  The Purpose
                </p>
                <p className="text-sm leading-relaxed" style={{ color: `${NAVY}88` }}>
                  The yellow seal is the first brand touchpoint when the tissue
                  is revealed. It transforms a standard opening into an
                  &ldquo;inspection.&rdquo;
                </p>
              </div>
            </div>

            <Placeholder
              label="The Seal — Circle Sticker"
              note='2.5" Signal Yellow circle sticker with "PROVISIONED" in Black Type, sealing tissue wrap.'
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            9.4 — THE "MANIFEST" (HANGTAG)
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
            9.4
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="the-manifest"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              The &ldquo;Manifest&rdquo;
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              Hangtag
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
              <SpecRow
                label="Item"
                value="Heavy recycled kraft board (Gray or Natural)"
              />
              <SpecRow
                label="Attachment"
                value="Safety pin with a small scrap of canvas — not a plastic swift-tack"
              />
              <SpecRow
                label="Content"
                value={`Tells the story of the fabric (e.g., "300gsm Coastal Fleece")`}
              />
            </div>

            {/* Strict Rule */}
            <div
              className="rounded-lg p-5 mb-10"
              style={{ backgroundColor: `${STORM}06`, border: `1.5px solid ${STORM}15` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: STORM }}
              >
                Strict Rule
              </p>
              <p className="text-sm font-medium" style={{ color: NAVY }}>
                No plastic swift-tacks. The tag is attached with a safety pin
                and a small scrap of canvas. It should feel considered, not
                mass-produced.
              </p>
            </div>

            {/* Front / Back with actual images */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                  style={{ color: NAVY }}
                >
                  The Front (Identity)
                </p>
                <div className="rounded-lg overflow-hidden">
                  <Image
                    src="/brand/packaging/hangtag-front.png"
                    alt="Hangtag Front — Master Stack logo on heavy grey recycled kraft board with waxed cotton cord and metal eyelet. EST. 2024."
                    width={640}
                    height={853}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                  style={{ color: NAVY }}
                >
                  The Back (Bill of Materials)
                </p>
                <div className="rounded-lg overflow-hidden">
                  <Image
                    src="/brand/packaging/hangtag-back.png"
                    alt="Hangtag Back — Technical Bill of Materials layout with Style, Color, Size, Batch No. fields and Storm Red tagline."
                    width={640}
                    height={853}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            <p
              className="text-xs leading-relaxed"
              style={{ color: `${NAVY}50` }}
            >
              The Manifest tells the story of the garment&mdash;its fabric
              weight, its origin, its batch. This is documentation, not
              decoration.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            9.5 — THE "FIELD NOTE" (POSTCARD INSERT)
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
            9.5
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="the-field-note"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            >
              The &ldquo;Field Note&rdquo;
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: "rgba(255,255,255,0.50)" }}
            >
              Postcard Insert
            </p>

            <div
              className="rounded-lg p-6 mb-8"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1.5px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                style={{ color: "rgba(255,255,255,0.40)" }}
              >
                Specifications
              </p>
              <div
                className="flex items-baseline gap-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] w-28 shrink-0"
                  style={{ color: "rgba(255,255,255,0.40)" }}
                >
                  Item
                </p>
                <p className="text-sm font-medium">4&times;6&Prime; Matte Card</p>
              </div>
              <div
                className="flex items-baseline gap-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] w-28 shrink-0"
                  style={{ color: "rgba(255,255,255,0.40)" }}
                >
                  Visual
                </p>
                <p className="text-sm font-medium">
                  Full-bleed B&amp;W photo (Granite/Water texture)
                </p>
              </div>
              <div className="flex items-baseline gap-4 py-3">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] w-28 shrink-0"
                  style={{ color: "rgba(255,255,255,0.40)" }}
                >
                  Text
                </p>
                <p className="text-sm font-medium">
                  A short thank you note that feels like a field dispatch
                </p>
              </div>
            </div>

            {/* Sample dispatch */}
            <div
              className="rounded-lg p-6 mb-8"
              style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="text-sm italic leading-relaxed"
                style={{ color: "rgba(255,255,255,0.60)" }}
              >
                &ldquo;This was made for the variable conditions. Salt, wind,
                cold water. We don&rsquo;t make aspirational clothing. We make
                provisions. Welcome aboard.&rdquo;
              </p>
              <div
                className="w-6 h-px my-4"
                style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
              />
              <p
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Sample Dispatch Copy
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Placeholder
                variant="dark"
                label="Field Note — Front"
                note="Full-bleed B&W coastal photograph. Granite, water, matte texture."
              />
              <Placeholder
                variant="dark"
                label="Field Note — Back"
                note="Thank you dispatch text on matte white card stock."
              />
            </div>
          </div>
        </section>

        <BrandSectionNav current="/internal/brand/logistics" />

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
              Section 9.0 &middot; Packaging &amp; Logistics
            </p>
            <p
              className="text-[11px] mt-3"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              This isn&rsquo;t shopping. It&rsquo;s provisioning.
            </p>
          </div>
        </footer>
      </main>
    </DocPageShell>
  )
}
