import type { BrandPalette } from "./types"

interface DigitalUIElementsProps {
  palette: BrandPalette
}

export function DigitalUIElements({
  palette: { NAVY, GRANITE, STORM, YELLOW },
}: DigitalUIElementsProps) {
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

        <h3
          id="button-style"
          className="text-xl font-bold mb-6"
          style={{ color: NAVY }}
        >
          The Button Style
        </h3>

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: `${NAVY}03`,
              border: `1.5px solid ${NAVY}06`,
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: `${NAVY}50` }}
            >
              Shape
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: `${NAVY}cc` }}
            >
              Sharp Rectangles (<strong>0px radius</strong>) or Micro-Rounded (
              <strong>2px radius</strong>).
            </p>
            <div
              className="mt-3 rounded-lg p-3"
              style={{
                backgroundColor: `${STORM}06`,
                border: `1px solid ${STORM}15`,
              }}
            >
              <p className="text-[10px] font-bold" style={{ color: STORM }}>
                Absolutely no &ldquo;Pill&rdquo; shapes (too friendly/tech).
              </p>
            </div>
          </div>

          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: `${NAVY}03`,
              border: `1.5px solid ${NAVY}06`,
            }}
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
            <p
              className="text-sm leading-relaxed"
              style={{ color: `${NAVY}cc` }}
            >
              <strong>Hover:</strong> Shifts to Granite Grey (do not simply lower
              opacity&mdash;change the color).
            </p>
          </div>
        </div>

        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
          style={{ color: `${NAVY}50` }}
        >
          Live Specimens
        </p>
        <div className="flex flex-wrap gap-4 mb-12">
          <button
            type="button"
            className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white transition-colors cursor-default"
            style={{ backgroundColor: NAVY, borderRadius: 0 }}
            title="Primary Action — 0px radius"
          >
            Shop the Collection
          </button>
          <button
            type="button"
            className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white transition-colors cursor-default"
            style={{ backgroundColor: NAVY, borderRadius: 2 }}
            title="Primary Action — 2px radius"
          >
            Add to Provisions
          </button>
          <button
            type="button"
            className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white cursor-default"
            style={{ backgroundColor: GRANITE, borderRadius: 0 }}
            title="Hover State — Granite Grey"
          >
            Hover State
          </button>
          <button
            type="button"
            className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white cursor-not-allowed opacity-70"
            style={{ backgroundColor: GRANITE, borderRadius: 0 }}
            title="Sold Out — Granite Grey, unclickable"
          >
            Sold Out
          </button>
        </div>

        <h3
          id="functional-colors"
          className="text-xl font-bold mb-6"
          style={{ color: NAVY }}
        >
          Functional Colors
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div
            className="rounded-lg p-5"
            style={{
              backgroundColor: `${NAVY}03`,
              border: `1.5px solid ${NAVY}06`,
            }}
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

          <div
            className="rounded-lg p-5"
            style={{
              backgroundColor: `${NAVY}03`,
              border: `1.5px solid ${NAVY}06`,
            }}
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

          <div
            className="rounded-lg p-5"
            style={{
              backgroundColor: `${NAVY}03`,
              border: `1.5px solid ${NAVY}06`,
            }}
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
  )
}
