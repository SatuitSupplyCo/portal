import { Placeholder } from "@/components/brand/Placeholder"
import type { BrandPalette } from "./types"

interface PhotographyVisualPhilosophyProps {
  palette: BrandPalette
}

export function PhotographyVisualPhilosophy({
  palette: { NAVY, CANVAS, GRANITE, STORM, SALT },
}: PhotographyVisualPhilosophyProps) {
  return (
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
          <p className="text-lg font-bold" style={{ color: NAVY }}>
            If it looks like a postcard, don&rsquo;t shoot it.
          </p>
        </div>

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

        <div className="mt-10">
          <Placeholder
            label="Example: Flat Light"
            note="Overcast coastal light on a product flat lay — matte, desaturated, textured."
          />
        </div>
      </div>
    </section>
  )
}
