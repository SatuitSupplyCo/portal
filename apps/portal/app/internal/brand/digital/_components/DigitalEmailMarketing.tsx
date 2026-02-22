import type { BrandPalette } from "./types"

interface DigitalEmailMarketingProps {
  palette: BrandPalette
}

export function DigitalEmailMarketing({
  palette: { NAVY, GRANITE, STORM, SALT },
}: DigitalEmailMarketingProps) {
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
            We do not send &ldquo;Blasts.&rdquo; We send &ldquo;Dispatches.&rdquo;
          </p>
        </div>

        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
          style={{ color: NAVY }}
        >
          Subject Lines
        </p>
        <p className="text-sm mb-5" style={{ color: `${NAVY}88` }}>
          Lowercase or Sentence Case. Factual.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <div
            className="rounded-lg p-5"
            style={{
              backgroundColor: `${NAVY}03`,
              border: `1.5px solid ${NAVY}08`,
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: NAVY }}
            >
              Yes
            </p>
            <p className="text-sm font-medium" style={{ color: `${NAVY}cc` }}>
              Restock: The Heavyweight Tee.
            </p>
          </div>
          <div
            className="rounded-lg p-5"
            style={{
              backgroundColor: `${STORM}06`,
              border: `1.5px solid ${STORM}12`,
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: STORM }}
            >
              No
            </p>
            <p className="text-sm font-medium" style={{ color: `${NAVY}cc` }}>
              HURRY! You need this NOW!!!
            </p>
          </div>
        </div>

        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
          style={{ color: NAVY }}
        >
          The Template
        </p>

        <div
          className="rounded-lg overflow-hidden mb-8"
          style={{ border: `1.5px solid ${NAVY}08` }}
        >
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

          <div
            className="flex items-center justify-center py-12"
            style={{ backgroundColor: `${NAVY}03` }}
          >
            <div className="text-center">
              <span className="text-4xl" style={{ color: `${NAVY}12` }}>
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

        <div
          className="rounded-lg p-5"
          style={{
            backgroundColor: `${NAVY}03`,
            border: `1.5px solid ${NAVY}08`,
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
            style={{ color: STORM }}
          >
            Frequency
          </p>
          <p className="text-base font-bold" style={{ color: NAVY }}>
            Low. We only speak when we have something to say.
          </p>
        </div>
      </div>
    </section>
  )
}
