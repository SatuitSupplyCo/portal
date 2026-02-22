import { Placeholder } from "@/components/brand/Placeholder"
import type { BrandPalette } from "./types"

interface PhotographyLightingGradingProps {
  palette: BrandPalette
}

const LIGHTING_SPECS = [
  {
    label: "Light Source",
    value: "Natural light only",
    detail:
      'Prefer overcast / diffused light. Avoid "Golden Hour" — too orange, too romantic.',
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
      'A slight film grain adds "tooth" to digital images, making them feel less plastic.',
  },
] as const

export function PhotographyLightingGrading({
  palette: { NAVY, SALT },
}: PhotographyLightingGradingProps) {
  return (
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
          {LIGHTING_SPECS.map((spec) => (
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
  )
}
