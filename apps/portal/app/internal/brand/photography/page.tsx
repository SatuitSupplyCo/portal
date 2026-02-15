import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { DocPageShell } from "@/components/nav/DocPageShell"
import { BrandSectionNav } from "@/components/brand/BrandSectionNav"

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Photography & Art Direction — Section 7.0 | Satuit Supply Co.",
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
          style={{
            color: light ? `${NAVY}25` : "rgba(255,255,255,0.18)",
          }}
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

export default function PhotographyPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Brand", href: "/internal/brand" },
        { label: "Photography & Art Direction" },
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
          {/* Watermark */}
          <span
            aria-hidden
            className="pointer-events-none select-none absolute -right-6 bottom-0 text-[20rem] font-bold leading-none"
            style={{ color: "rgba(255,255,255,0.02)" }}
          >
            7.0
          </span>

          <div className="relative max-w-3xl">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.35em] mb-8"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Section 7.0
            </p>
            <div
              className="w-10 h-px mb-10"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-8">
              Photography
              <br />
              &amp; Art Direction
            </h1>
            <p
              className="text-base leading-relaxed max-w-xl"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              We don&rsquo;t capture aspiration. We capture texture, grain, and
              the matte finish of real life. Every image must feel like it was
              found, not staged.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            7.1 — VISUAL PHILOSOPHY
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
            7.1
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="visual-philosophy"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              Visual Philosophy
            </h2>
            <p
              className="text-sm uppercase tracking-[0.15em] font-semibold mb-10"
              style={{ color: GRANITE }}
            >
              &ldquo;Texture Over Shine&rdquo;
            </p>

            <p
              className="text-base leading-relaxed mb-8 max-w-xl"
              style={{ color: `${NAVY}cc` }}
            >
              We do not use high-gloss, high-saturation filters. We capture the
              matte finish of real life. If it looks like a postcard, don&rsquo;t
              shoot it.
            </p>

            {/* Rule card */}
            <div
              className="rounded-lg p-6 mb-8"
              style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: STORM }}
              >
                The Rule
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: NAVY }}
              >
                If it looks like a postcard, don&rsquo;t shoot it.
              </p>
            </div>

            {/* The Vibe */}
            <div
              className="border-l-2 pl-6 py-1 mb-10"
              style={{ borderColor: SALT }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: SALT }}
              >
                The Vibe
              </p>
              <p
                className="text-base leading-relaxed italic"
                style={{ color: `${NAVY}99` }}
              >
                A grey day in October, not a bright day in July.
              </p>
            </div>

            <p
              className="text-sm leading-relaxed max-w-lg"
              style={{ color: `${NAVY}88` }}
            >
              We prefer <strong style={{ color: NAVY }}>&ldquo;Flat Light&rdquo;</strong>{" "}
              (overcast) because it shows the true grain of the fabric and the
              landscape. Shadows are soft. Colors are honest.
            </p>

            {/* Example placeholder */}
            <div className="mt-10">
              <Placeholder
                label="Example: Flat Light"
                note="Overcast coastal light on a product flat lay — matte, desaturated, textured."
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            7.2 — THREE PILLARS OF IMAGERY
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
            7.2
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="three-pillars"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              The Three Pillars of Imagery
            </h2>
            <p
              className="text-sm leading-relaxed mb-12 max-w-xl"
              style={{ color: `${NAVY}88` }}
            >
              Every shoot must deliver a mix of these three categories. They work
              together to tell the complete Satuit story.
            </p>

            {/* ── Pillar A ── */}
            <div className="mb-14">
              <div className="flex items-baseline gap-4 mb-2">
                <span
                  className="text-5xl font-bold leading-none"
                  style={{ color: `${NAVY}08` }}
                >
                  A
                </span>
                <div>
                  <h3
                    id="pillar-supply"
                    className="text-xl font-bold"
                    style={{ color: NAVY }}
                  >
                    Product Construction
                  </h3>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.2em] mt-1"
                    style={{ color: GRANITE }}
                  >
                    The &ldquo;Supply&rdquo; Shot
                  </p>
                </div>
              </div>

              <div className="ml-0 md:ml-14 mt-4">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                      style={{ color: `${NAVY}50` }}
                    >
                      Subject
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: `${NAVY}cc` }}>
                      The garment is the hero.
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                      style={{ color: `${NAVY}50` }}
                    >
                      Style
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: `${NAVY}cc` }}>
                      Flat lays on natural surfaces (weathered teak, granite
                      slab, canvas drop cloth) or &ldquo;Ghost Mannequin&rdquo;
                      styling.
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                      style={{ color: `${NAVY}50` }}
                    >
                      Focus
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: `${NAVY}cc` }}>
                      Macro details. Show the zipper pull. Show the flat-lock
                      stitch. Show the weight of the French Terry.
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                      style={{ color: `${NAVY}50` }}
                    >
                      Why
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: `${NAVY}cc` }}>
                      This proves &ldquo;Well-Made.&rdquo; We sell specs, not
                      just &ldquo;vibes.&rdquo;
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Placeholder
                    label="Flat Lay — Garment Hero"
                    note="Product laid on weathered teak or canvas. Macro focus on fabric weight and construction."
                  />
                  <Placeholder
                    label="Detail — Construction Close-up"
                    note="Zipper pull, flat-lock stitch, or French Terry weight at macro distance."
                    aspect="1 / 1"
                  />
                </div>
              </div>
            </div>

            {/* ── Pillar B ── */}
            <div className="mb-14">
              <div className="flex items-baseline gap-4 mb-2">
                <span
                  className="text-5xl font-bold leading-none"
                  style={{ color: `${NAVY}08` }}
                >
                  B
                </span>
                <div>
                  <h3
                    id="pillar-lifestyle"
                    className="text-xl font-bold"
                    style={{ color: NAVY }}
                  >
                    The &ldquo;Anti-Pose&rdquo; Lifestyle
                  </h3>
                </div>
              </div>

              <div className="ml-0 md:ml-14 mt-4">
                <div
                  className="rounded-lg p-5 mb-6"
                  style={{ backgroundColor: `${NAVY}03`, border: `1.5px solid ${NAVY}06` }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                    style={{ color: STORM }}
                  >
                    The Rule
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{ color: NAVY }}
                  >
                    Never look at the camera.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                      style={{ color: `${NAVY}50` }}
                    >
                      Subject
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: `${NAVY}cc` }}>
                      People doing things, not modeling things.
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                      style={{ color: `${NAVY}50` }}
                    >
                      Action
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: `${NAVY}cc` }}>
                      Catch them in the middle of a task: coiling a line,
                      walking the dog, loading a truck, looking at the horizon.
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                      style={{ color: `${NAVY}50` }}
                    >
                      Emotion
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: `${NAVY}cc` }}>
                      Calm, focused, solitary. No fake laughing at salads.
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                      style={{ color: `${NAVY}50` }}
                    >
                      Crop
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: `${NAVY}cc` }}>
                      Don&rsquo;t be afraid to crop heads off. Focus on the
                      hands, the shoulders, the movement of the fabric.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Placeholder
                    label="Lifestyle — Mid-Task"
                    note="Subject coiling a dock line or walking — never posing, never looking at camera."
                    aspect="4 / 5"
                  />
                  <Placeholder
                    label="Lifestyle — Hands"
                    note="Tight crop on hands and fabric in motion. Head may be cropped out."
                    aspect="4 / 5"
                  />
                  <Placeholder
                    label="Lifestyle — Horizon"
                    note="Solitary figure looking away. Calm, focused, natural posture."
                    aspect="4 / 5"
                  />
                </div>
              </div>
            </div>

            {/* ── Pillar C ── */}
            <div>
              <div className="flex items-baseline gap-4 mb-2">
                <span
                  className="text-5xl font-bold leading-none"
                  style={{ color: `${NAVY}08` }}
                >
                  C
                </span>
                <div>
                  <h3
                    id="pillar-place"
                    className="text-xl font-bold"
                    style={{ color: NAVY }}
                  >
                    Environmental Texture
                  </h3>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.2em] mt-1"
                    style={{ color: GRANITE }}
                  >
                    The &ldquo;Place&rdquo;
                  </p>
                </div>
              </div>

              <div className="ml-0 md:ml-14 mt-4">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                      style={{ color: `${NAVY}50` }}
                    >
                      Subject
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: `${NAVY}cc` }}>
                      The raw materials of the coast.
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                      style={{ color: `${NAVY}50` }}
                    >
                      Elements
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: `${NAVY}cc` }}>
                      Wet granite, grey shingles, peeling paint, cold water,
                      fog.
                    </p>
                  </div>
                </div>

                <p
                  className="text-sm leading-relaxed mb-6 max-w-lg"
                  style={{ color: `${NAVY}88` }}
                >
                  This grounds the brand in reality. It provides the
                  &ldquo;Canvas&rdquo; for the Navy products to sit against.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <Placeholder
                    label="Texture — Granite"
                    note="Wet or dry stone surface. Close crop showing grain and salt residue."
                  />
                  <Placeholder
                    label="Texture — Shingles"
                    note="Weathered cedar shingles, peeling paint, grey-on-grey tones."
                  />
                  <Placeholder
                    label="Texture — Water"
                    note="Cold water, fog, overcast harbor. Muted palette, no tropical blue."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            7.3 — LIGHTING & COLOR GRADING
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
            7.3
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="lighting-grading"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            >
              Lighting &amp; Color Grading
            </h2>
            <p
              className="text-sm leading-relaxed mb-12 max-w-xl"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              We strictly control the color temperature to match the Satuit
              palette (Navy, Bone, Granite). Every parameter below is binding.
            </p>

            <div className="grid md:grid-cols-2 gap-5">
              {(
                [
                  {
                    label: "Light Source",
                    value: "Natural light only",
                    detail:
                      "Prefer overcast / diffused light. Avoid \"Golden Hour\" — too orange, too romantic.",
                  },
                  {
                    label: "Saturation",
                    value: "Low (−10 to −20)",
                    detail:
                      "Colors should feel desaturated and salted. If it pops, pull it back.",
                  },
                  {
                    label: "Contrast",
                    value: "Medium",
                    detail:
                      "Keep the blacks soft (matte), not crushed. We are matte, not glossy.",
                  },
                  {
                    label: "White Balance",
                    value: "Cool",
                    detail:
                      "Lean towards Blue / Grey. Avoid Yellow / Warm tints at all costs.",
                  },
                  {
                    label: "Grain",
                    value: "Subtle",
                    detail:
                      "A slight film grain adds \"tooth\" to digital images, making them feel less plastic.",
                  },
                ] as const
              ).map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-lg p-5"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1.5px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                    style={{ color: SALT }}
                  >
                    {spec.label}
                  </p>
                  <p className="text-base font-bold mb-2">{spec.value}</p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {spec.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Before / After placeholder */}
            <div className="mt-10 grid md:grid-cols-2 gap-4">
              <Placeholder
                variant="dark"
                label="Before — Ungraded"
                note="Raw natural-light image showing original color temperature and saturation."
              />
              <Placeholder
                variant="dark"
                label="After — Satuit Grade"
                note="Same image with low saturation, cool white balance, soft blacks, subtle grain."
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            7.4 — COMPOSITION GUIDE
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
            7.4
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="composition"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              Composition Guide
            </h2>
            <p
              className="text-sm leading-relaxed mb-12 max-w-xl"
              style={{ color: `${NAVY}88` }}
            >
              We use the &ldquo;Rule of Thirds&rdquo; to maintain our
              &ldquo;Quiet Luxury&rdquo; aesthetic. Every frame should breathe.
            </p>

            <div className="space-y-8">
              {/* Negative Space */}
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: NAVY }}
                >
                  Negative Space
                </p>
                <p
                  className="text-base leading-relaxed mb-2"
                  style={{ color: `${NAVY}cc` }}
                >
                  Leave &ldquo;air&rdquo; in the photo. Do not clutter the
                  frame. This mimics the wide tracking in our typography.
                </p>
              </div>

              {/* Asymmetry */}
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: NAVY }}
                >
                  Asymmetry
                </p>
                <p
                  className="text-base leading-relaxed mb-2"
                  style={{ color: `${NAVY}cc` }}
                >
                  Place the subject off-center. It feels more natural and less
                  staged. The eye should wander, not be directed.
                </p>
              </div>

              {/* Straight Lines */}
              <div
                className="rounded-lg p-6"
                style={{ backgroundColor: "white", border: `1.5px solid ${NAVY}08` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: STORM }}
                >
                  Straight Lines
                </p>
                <p
                  className="text-base leading-relaxed mb-2"
                  style={{ color: `${NAVY}cc` }}
                >
                  Horizon lines must be perfectly straight. We are a
                  &ldquo;Standard,&rdquo; and standards are level.
                </p>
              </div>
            </div>

            {/* Composition examples */}
            <div className="mt-10 grid md:grid-cols-2 gap-4">
              <Placeholder
                label="Composition — Negative Space"
                note="Subject occupying one-third of frame. Open sky or water filling remaining space."
              />
              <Placeholder
                label="Composition — Off-Center"
                note="Subject placed asymmetrically using rule of thirds. Horizon perfectly level."
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            7.5 — DO / DON'T CHECKLIST
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
            7.5
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="do-dont"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: NAVY }}
            >
              The Do / Don&rsquo;t Checklist
            </h2>
            <p
              className="text-sm leading-relaxed mb-10 max-w-xl"
              style={{ color: `${NAVY}88` }}
            >
              Give this list to any photographer or content creator before a
              shoot.
            </p>

            {/* Column headers */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div
                className="rounded-t-lg px-5 py-3"
                style={{ backgroundColor: `${NAVY}06` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: NAVY }}
                >
                  Do Shoot — The Satuit Way
                </p>
              </div>
              <div
                className="rounded-t-lg px-5 py-3"
                style={{ backgroundColor: `${STORM}08` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: STORM }}
                >
                  Don&rsquo;t Shoot — The Tourist Way
                </p>
              </div>
            </div>

            {/* Rows */}
            {(
              [
                {
                  category: "Weather",
                  yes: "Overcast, fog, \"grey light\"",
                  no: "Bright high-noon sun, overly saturated sunsets",
                },
                {
                  category: "Action",
                  yes: "Walking, working, looking away",
                  no: "Posing, \"cheers-ing\" drinks, looking at lens",
                },
                {
                  category: "Props",
                  yes: "Old Land Rovers, canvas totes, tools",
                  no: "Shiny yachts, tropical drinks, floaties",
                },
                {
                  category: "Backgrounds",
                  yes: "Granite, shingles, docks, sand",
                  no: "Manicured lawns, palm trees, pools",
                },
                {
                  category: "Detail",
                  yes: "Stitches, fabric loops, zippers",
                  no: "Logos only",
                },
                {
                  category: "Tone",
                  yes: "Matte, cool, desaturated",
                  no: "Glossy, warm, high-contrast",
                },
              ] as const
            ).map((row, i) => (
              <div key={row.category} className="grid grid-cols-2 gap-4 mb-1">
                <div
                  className="px-5 py-4"
                  style={{
                    backgroundColor: `${NAVY}03`,
                    borderLeft: `2px solid ${NAVY}15`,
                    borderRadius: i === 5 ? "0 0 0 8px" : undefined,
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                    style={{ color: `${NAVY}50` }}
                  >
                    {row.category}
                  </p>
                  <p className="text-sm" style={{ color: `${NAVY}cc` }}>
                    {row.yes}
                  </p>
                </div>
                <div
                  className="px-5 py-4"
                  style={{
                    backgroundColor: `${STORM}04`,
                    borderLeft: `2px solid ${STORM}20`,
                    borderRadius: i === 5 ? "0 0 0 8px" : undefined,
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                    style={{ color: `${NAVY}50` }}
                  >
                    {row.category}
                  </p>
                  <p className="text-sm" style={{ color: `${NAVY}cc` }}>
                    {row.no}
                  </p>
                </div>
              </div>
            ))}

            {/* Side-by-side example placeholders */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <Placeholder
                label="Example — The Satuit Way"
                note="Overcast light, subject mid-task, matte tones, granite background."
              />
              <Placeholder
                label="Example — The Tourist Way"
                note="Bright sun, posed subject, glossy filter, tropical setting."
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            7.6 — MOOD BOARD
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
            7.6
          </span>

          <div className="relative max-w-3xl">
            <h2
              id="mood-board"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            >
              The Mood Board
            </h2>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-10"
              style={{ color: GRANITE }}
            >
              Mental Reference
            </p>

            <p
              className="text-sm leading-relaxed mb-10 max-w-xl"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              If you need to explain the vibe to a creative partner, describe it
              like this:
            </p>

            {/* The big quote */}
            <div
              className="border-l-2 pl-8 py-2 mb-14"
              style={{ borderColor: SALT }}
            >
              <p
                className="text-xl md:text-2xl leading-relaxed italic"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                &ldquo;Imagine a black-and-white photo of a boat builder from
                1970, but colorized with just Navy, Grey, and the faded yellow of
                an old raincoat. It&rsquo;s quiet. It&rsquo;s early morning.
                There is salt on the lens.&rdquo;
              </p>
            </div>

            {/* Mood reference placeholders */}
            <div className="grid md:grid-cols-3 gap-4">
              <Placeholder
                variant="dark"
                label="Mood — Boat Builder"
                note="Black-and-white reference colorized with Navy and Grey. Quiet, early morning."
                aspect="4 / 5"
              />
              <Placeholder
                variant="dark"
                label="Mood — Salt & Grain"
                note="Close-up texture with film grain. Desaturated coastal tones."
                aspect="4 / 5"
              />
              <Placeholder
                variant="dark"
                label="Mood — Morning Fog"
                note="Harbour in overcast light. Muted palette, soft focus, no sun."
                aspect="4 / 5"
              />
            </div>
          </div>
        </section>

        <BrandSectionNav current="/internal/brand/photography" />

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
              Section 7.0 &middot; Photography &amp; Art Direction
            </p>
            <p
              className="text-[11px] mt-3"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              If it looks like a postcard, don&rsquo;t shoot it.
            </p>
          </div>
        </footer>
      </main>
    </DocPageShell>
  )
}
