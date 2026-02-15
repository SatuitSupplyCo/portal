import React from 'react';
import type { TechPackData, AppendixRefs } from '@repo/types';

interface TechPackProps {
  data: TechPackData;
}

export function TechPack({ data }: TechPackProps) {
  const hasLock = data.restrictions.some((r) => r.toUpperCase().includes('LOCK REQUIRED'));

  return (
    <div className="page w-[8.5in] h-[11in] bg-white mx-auto shadow-lg print:shadow-none">
      {/* Generous margins: 0.75in */}
      <div className="h-full px-[0.75in] py-[0.75in] flex flex-col">
        {/* Header */}
        <header className="mb-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[20px] font-normal tracking-[0.05em] text-[#1a1a2e] leading-tight mb-1">
                {data.skuName}
              </h1>
              <p className="text-[11px] font-normal text-[#4a4a5e] tracking-wide">{data.collection}</p>
              {data.skuCode && (
                <p className="text-[9px] font-normal text-[#6a6a7e] mt-1 tracking-wide">{data.skuCode}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge>Authority: BINDING</Badge>
                {data.msrpReference && <Badge>MSRP Ref: {data.msrpReference}</Badge>}
                {hasLock && <Badge variant="warn">LOCK REQUIRED</Badge>}
              </div>
            </div>
            <div className="w-12 h-12 border border-[#1a1a2e]/20 flex items-center justify-center">
              <div className="text-[8px] font-normal text-[#4a4a5e] tracking-wider">LOGO</div>
            </div>
          </div>
        </header>

        {/* STOP / ESCALATE callout */}
        <div className="mb-5 border border-[#1a1a2e]/20 bg-[#f8f8fb] px-4 py-3">
          <div className="text-[9px] tracking-[0.08em] text-[#1a1a2e] mb-1">EXECUTION RULE</div>
          <div className="text-[10px] text-[#2a2a3e] leading-[1.4]">
            If any execution risk, ambiguity, or deviation arises:{' '}
            <span className="font-semibold">STOP. ESCALATE. DO NOT SUBSTITUTE.</span> Proceeding with sampling or
            production constitutes acceptance of all requirements in this document and its referenced appendices.
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left Side: Sketch Zone + Swatches + Measurements */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Sketch Placeholders (non-binding) */}
            <div className="flex items-start justify-center gap-4 mb-6">
              <SketchPlaceholder label="FRONT SKETCH" />
              <SketchPlaceholder label="BACK SKETCH" />
            </div>

            {/* Color Swatches */}
            {data.colorSwatches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-4">
                  {data.colorSwatches.slice(0, 4).map((swatch, index) => (
                    <div key={index} className="flex flex-col items-center gap-1.5">
                      <div className="w-8 h-8 border border-[#1a1a2e]/30" style={{ backgroundColor: swatch.hex }} />
                      <span className="text-[8px] font-normal text-[#2a2a3e] tracking-wide">{swatch.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Measurements / Fit Intent */}
            {data.keyMeasurements.length > 0 && (
              <div className="border-t border-[#1a1a2e]/10 pt-4">
                <h3 className="text-[9px] font-normal text-[#1a1a2e] tracking-[0.08em] mb-2.5">
                  KEY MEASUREMENTS / FIT INTENT
                </h3>
                <ul className="space-y-1.5">
                  {data.keyMeasurements.slice(0, 6).map((measurement, index) => (
                    <li
                      key={index}
                      className="text-[9px] font-normal text-[#2a2a3e] leading-[1.4] pl-3 relative before:content-['•'] before:absolute before:left-0"
                    >
                      {measurement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Specs Zone (Right) */}
          <div className="w-[240px] shrink-0 min-w-0 overflow-hidden">
            <div className="space-y-5">
              <SpecSection title="PRODUCT INTENT" items={data.intent} />
              <SpecSection title="FABRIC" items={data.fabric} />
              <SpecSection title="CONSTRUCTION" items={data.construction} />
              <SpecSection title="BRANDING & PLACEMENT" items={data.branding} />
              <SpecSection title="TRIMS" items={data.trims} />
              <SpecSection title="RESTRICTIONS" items={data.restrictions} />
              <AppendixRefsBlock refs={data.appendixRefs} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 pt-4 border-t border-[#1a1a2e]/10">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-normal text-[#4a4a5e] tracking-wide">
              Version {data.version} · {data.date}
            </p>
            <p className="text-[8px] font-normal text-[#1a1a2e] tracking-wide">Binding for production</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SpecSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden">
      <h3 className="text-[9px] font-normal text-[#1a1a2e] tracking-[0.08em] mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li
            key={index}
            className="text-[9px] font-normal text-[#2a2a3e] leading-[1.4] pl-3 relative before:content-['•'] before:absolute before:left-0 break-words"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'warn' }) {
  const cls =
    variant === 'warn'
      ? 'border-[#8a2a2a]/30 text-[#8a2a2a] bg-[#fff5f5]'
      : 'border-[#1a1a2e]/20 text-[#1a1a2e] bg-white';
  return (
    <span className={`inline-flex items-center px-2 py-1 text-[8px] tracking-[0.08em] border ${cls}`}>
      {children}
    </span>
  );
}

function SketchPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-[8px] font-normal text-[#4a4a5e] tracking-wider mb-1">{label}</div>
      <div className="w-[200px] h-[200px] border border-[#1a1a2e]/20 bg-[#fafafa] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-[9px] tracking-[0.08em] text-[#1a1a2e] mb-1">NON-BINDING — FOR REFERENCE ONLY</div>
          <div className="text-[9px] text-[#4a4a5e] leading-[1.4]">
            NOT a technical flat.
          </div>
        </div>
      </div>
    </div>
  );
}

function AppendixRefsBlock({ refs }: { refs: AppendixRefs }) {
  const items: Array<{ k: string; v?: string }> = [
    { k: 'TRIMS', v: refs.trims },
    { k: 'MEASUREMENTS', v: refs.measurements },
    { k: 'CONSTRUCTION', v: refs.construction },
  ].filter((x) => !!x.v);

  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-[9px] font-normal text-[#1a1a2e] tracking-[0.08em] mb-2">REFERENCES</h3>
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.k} className="text-[9px] text-[#2a2a3e] leading-[1.4]">
            <span className="text-[#4a4a5e] tracking-[0.08em]">{it.k}:</span> {it.v}
          </div>
        ))}
      </div>
    </div>
  );
}
