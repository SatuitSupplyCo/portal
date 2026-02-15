import React from 'react';
import { PageShell } from './PageShell';
import type { MeasurementSection } from '@/lib/content/launch-v1';

interface AppendixMeasurementsProps {
  /** When undefined, render all sections (for print packet). */
  section?: MeasurementSection;
}

export function AppendixMeasurements({ section }: AppendixMeasurementsProps) {
  const showAll = !section;

  const sectionTitle = section
    ? SECTION_TITLES[section]
    : 'APPENDIX B — MEASUREMENT TABLES';

  const sectionSubtitle = 'Status: BINDING · Approved samples override tables only if documented in writing';

  return (
    <PageShell title={sectionTitle} subtitle={sectionSubtitle}>
      <div className="space-y-6">
        {(showAll || section === 'tees') && <TeesSection />}
        {(showAll || section === 'fleece') && <FleeceSection />}
        {(showAll || section === 'swim-men') && <SwimMenSection />}
        {(showAll || section === 'coastal-women') && <CoastalWomenSection />}
      </div>
    </PageShell>
  );
}

const SECTION_TITLES: Record<MeasurementSection, string> = {
  tees: 'APPENDIX B1 — TEES (STANDARD & HEAVY)',
  fleece: 'APPENDIX B2 — FLEECE (HOODIES & CREWNECKS)',
  'swim-men': "APPENDIX B3 — SWIM (MEN'S)",
  'coastal-women': "APPENDIX B3 — COASTAL (WOMEN'S)",
};

// ---------------------------------------------------------------------------
// Section components
// ---------------------------------------------------------------------------

function TeesSection() {
  return (
    <div>
      <SectionHeading>B1. TEES — STANDARD &amp; HEAVY</SectionHeading>
      <div className="text-[11px] text-[#2a2a3e] mb-3">Men&apos;s Tee Measurement Table (Inches)</div>
      <MeasurementTable
        columns={['Point of Measure', 'S', 'M', 'L', 'XL', 'Tolerance']}
        rows={[
          ['Chest (1" below armhole)', '20.5', '21.5', '22.5', '23.5', '±0.5'],
          ['Body Length (HPS to hem)', '27.5', '28.5', '29.5', '30.5', '±0.5'],
          ['Shoulder Width', '17.75', '18.5', '19.25', '20', '±0.375'],
          ['Sleeve Length', '8', '8.25', '8.5', '8.75', '±0.375'],
          ['Sleeve Opening', '7', '7.25', '7.5', '7.75', '±0.375'],
          ['Neck Opening (flat)', '7.25', '7.5', '7.75', '8', '±0.25'],
        ]}
      />
      <div className="mt-3 text-[11px] text-[#2a2a3e]">
        <div className="mb-2"><span className="text-[#4a4a5e] tracking-[0.08em]">Fit intent:</span> Modern classic. Straight side seam. No tapering below chest.</div>
        <div><span className="text-[#4a4a5e] tracking-[0.08em]">Heavy Tee Adjustments:</span> Add +0.25&quot; chest ease across all sizes; Sleeve opening +0.25&quot;; Body length unchanged.</div>
      </div>
    </div>
  );
}

function FleeceSection() {
  return (
    <div>
      <SectionHeading>B2. FLEECE — HOODIES &amp; CREWNECKS</SectionHeading>
      <div className="text-[11px] text-[#2a2a3e] mb-3">Men&apos;s Fleece Measurement Table (Inches)</div>
      <MeasurementTable
        columns={['Point of Measure', 'S', 'M', 'L', 'XL', 'Tolerance']}
        rows={[
          ['Chest (1" below armhole)', '22', '23', '24', '25', '±0.5'],
          ['Body Length', '27', '28', '29', '30', '±0.5'],
          ['Shoulder Width', '18.5', '19.25', '20', '20.75', '±0.375'],
          ['Sleeve Length (CB)', '34', '35', '36', '37', '±0.5'],
          ['Sleeve Opening (rib)', '3.25', '3.5', '3.75', '4', '±0.25'],
          ['Bottom Opening (rib)', '18', '19', '20', '21', '±0.5'],
        ]}
      />
      <div className="mt-3 text-[11px] text-[#2a2a3e]">
        <span className="text-[#4a4a5e] tracking-[0.08em]">Fit intent:</span> Relaxed body. Clean shoulder. No drop shoulder.
      </div>
    </div>
  );
}

function SwimMenSection() {
  return (
    <div>
      <SectionHeading>B3. SWIM &amp; FUNCTIONAL ITEMS (MEN&apos;S)</SectionHeading>
      <div className="text-[11px] text-[#2a2a3e] mb-3">Men&apos;s Tailored Swim Short (Inches)</div>
      <MeasurementTable
        columns={['Point', 'S', 'M', 'L', 'XL', 'Tol']}
        rows={[
          ['Waist (relaxed)', '28', '30', '32', '34', '±0.5'],
          ['Waist (extended)', '38', '40', '42', '44', '±0.5'],
          ['Inseam', '5', '5', '5', '5', '±0.25'],
          ['Leg Opening', '11', '11.5', '12', '12.5', '±0.375'],
          ['Rise (front)', '10', '10.5', '11', '11.5', '±0.375'],
        ]}
      />
      <div className="mt-3 text-[11px] text-[#2a2a3e]">
        <span className="text-[#4a4a5e] tracking-[0.08em]">Fit intent:</span> Tailored, clean, not athletic.
      </div>

      <div className="mt-6 text-[11px] text-[#2a2a3e] mb-3">Lightweight Performance Swim Hoodie</div>
      <MeasurementTable
        columns={['Point', 'S', 'M', 'L', 'XL', 'Tol']}
        rows={[
          ['Chest', '21', '22', '23', '24', '±0.5'],
          ['Body Length', '27', '28', '29', '30', '±0.5'],
          ['Sleeve Length', '33.5', '34.5', '35.5', '36.5', '±0.5'],
          ['Hood Depth', '13', '13.5', '14', '14.5', '±0.375'],
        ]}
      />
    </div>
  );
}

function CoastalWomenSection() {
  return (
    <div>
      <SectionHeading>B3. COASTAL (WOMEN&apos;S)</SectionHeading>
      <div className="text-[11px] text-[#2a2a3e] mb-3">Women&apos;s Coastal Short</div>
      <MeasurementTable
        columns={['Point', 'XS', 'S', 'M', 'L', 'Tol']}
        rows={[
          ['Waist', '25', '27', '29', '31', '±0.5'],
          ['Rise', '10', '10.5', '11', '11.5', '±0.375'],
          ['Inseam', '4', '4', '4', '4', '±0.25'],
          ['Leg Opening', '11', '11.5', '12', '12.5', '±0.375'],
        ]}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] tracking-[0.12em] text-[#1a1a2e] mb-2">{children}</div>
  );
}

function MeasurementTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="border border-[#1a1a2e]/10 overflow-hidden">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((c) => (
          <div
            key={c}
            className="px-3 py-2 text-[9px] tracking-[0.12em] text-[#1a1a2e] bg-[#fafafa] border-b border-[#1a1a2e]/10"
          >
            {c}
          </div>
        ))}

        {rows.flatMap((r, idx) =>
          r.map((cell, i) => (
            <div
              key={`${idx}-${i}`}
              className={`px-3 py-2 text-[10px] text-[#2a2a3e] ${idx !== rows.length - 1 ? 'border-b border-[#1a1a2e]/10' : ''}`}
            >
              {cell}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
