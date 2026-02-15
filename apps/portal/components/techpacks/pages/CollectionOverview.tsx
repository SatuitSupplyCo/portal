import React from 'react';
import { PageShell } from './PageShell';

export function CollectionOverview() {
  return (
    <PageShell title="03 — COLLECTION OVERVIEW" subtitle="Only SKUs listed in this pack are approved for production.">
      <div className="space-y-6">
        <div className="text-[11px] text-[#2a2a3e] leading-[1.6]">
          Collection
        </div>
        <div className="border border-[#1a1a2e]/10">
          <div className="grid grid-cols-2">
            <div className="px-4 py-3 text-[10px] tracking-[0.12em] text-[#1a1a2e] bg-[#fafafa] border-b border-[#1a1a2e]/10">COLLECTION</div>
            <div className="px-4 py-3 text-[10px] tracking-[0.12em] text-[#1a1a2e] bg-[#fafafa] border-b border-[#1a1a2e]/10">ROLE</div>
            <div className="px-4 py-3 text-[11px] text-[#2a2a3e] border-b border-[#1a1a2e]/10">Core Essentials</div>
            <div className="px-4 py-3 text-[11px] text-[#2a2a3e] border-b border-[#1a1a2e]/10">Brand spine; repeat-wear</div>
            <div className="px-4 py-3 text-[11px] text-[#2a2a3e] border-b border-[#1a1a2e]/10">Material Collection</div>
            <div className="px-4 py-3 text-[11px] text-[#2a2a3e] border-b border-[#1a1a2e]/10">Fabric &amp; craft forward</div>
            <div className="px-4 py-3 text-[11px] text-[#2a2a3e] border-b border-[#1a1a2e]/10">Origin Collection</div>
            <div className="px-4 py-3 text-[11px] text-[#2a2a3e] border-b border-[#1a1a2e]/10">Limited local story</div>
            <div className="px-4 py-3 text-[11px] text-[#2a2a3e]">Coastal Function</div>
            <div className="px-4 py-3 text-[11px] text-[#2a2a3e]">Real-use functional pieces</div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
