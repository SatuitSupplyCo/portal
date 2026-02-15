import React from 'react';
import { PageShell } from './PageShell';

export function AppendixTrims() {
  return (
    <PageShell title="APPENDIX A — TRIM REQUIREMENTS" subtitle="Status: BINDING · Applies to all launch SKUs unless otherwise noted">
      <div className="space-y-6">
        <Section title="Universal Neck Tape (MANDATORY)">
          <SpecList
            items={[
              'Type: Woven cotton',
              'Width: 12 mm',
              'Color: Off-White / Natural',
              'Design: Single continuous horizontal line',
              'Line color: Navy',
              'No text, no logos',
              'One design across all applicable SKUs',
            ]}
          />
        </Section>

        <Section title="Woven Labels">
          <SpecList
            items={[
              'One exterior placement maximum',
              'Size: micro only',
              'Location: hem or back collar',
            ]}
          />
        </Section>

        <Section title="Drawstrings">
          <SpecList
            items={[
              'Only on approved SKUs',
              'Single approved color',
              'No logos, no novelty aglets',
            ]}
          />
        </Section>
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.12em] text-[#1a1a2e] mb-2">{title}</div>
      {children}
    </div>
  );
}

function SpecList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc ml-5 space-y-1 text-[11px] text-[#2a2a3e]">
      {items.map((it) => (
        <li key={it}>{it}</li>
      ))}
    </ul>
  );
}
