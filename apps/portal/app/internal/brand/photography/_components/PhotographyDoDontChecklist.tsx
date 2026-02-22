import { Placeholder } from "@/components/brand/Placeholder"
import type { BrandPalette } from "./types"

interface PhotographyDoDontChecklistProps {
  palette: BrandPalette
}

const DO_DONT_ROWS = [
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

export function PhotographyDoDontChecklist({
  palette: { NAVY, STORM },
}: PhotographyDoDontChecklistProps) {
  return (
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

        {DO_DONT_ROWS.map((row, i) => (
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
  )
}
