import type { BrandPalette } from "./types"

interface DigitalWebsitePhilosophyProps {
  palette: BrandPalette
}

export function DigitalWebsitePhilosophy({
  palette: { NAVY, CANVAS, GRANITE },
}: DigitalWebsitePhilosophyProps) {
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
              Give the product photos room to breathe. Do not crowd the page.
            </p>
          </div>
        </div>

        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
          style={{ color: NAVY }}
        >
          The Navigation
        </p>

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
  )
}
