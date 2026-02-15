import React from 'react';
import { PageShell } from './PageShell';

export function BrandIntent() {
  return (
    <PageShell title="02 — BRAND EXECUTION INTENT">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] text-[#2a2a3e] leading-[1.6] mb-4">
            Satuit products must feel:
          </div>
          <ul className="list-disc ml-5 space-y-1 text-[11px] text-[#2a2a3e]">
            <li>Understated</li>
            <li>Durable</li>
            <li>Calm</li>
            <li>Intentional</li>
          </ul>
        </div>

        <div>
          <div className="text-[11px] text-[#2a2a3e] leading-[1.6] mb-4">Avoid:</div>
          <ul className="list-disc ml-5 space-y-1 text-[11px] text-[#2a2a3e]">
            <li>Trend-driven styling</li>
            <li>Decorative elements</li>
            <li>Loud branding</li>
            <li>Novelty construction</li>
          </ul>
        </div>

        <div className="border border-[#1a1a2e]/20 bg-[#f8f8fb] px-5 py-4">
          <div className="text-[11px] text-[#1a1a2e] leading-[1.6]">
            If a detail draws attention to itself, it is likely incorrect.
          </div>
        </div>
      </div>
    </PageShell>
  );
}
