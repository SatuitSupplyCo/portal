import React from 'react';
import { PageShell } from './PageShell';

export function DocumentRules() {
  return (
    <PageShell title="01 — EXECUTION RULES & ORDER OF AUTHORITY" subtitle="Authority Level: BINDING">
      <div className="space-y-6">
        <div className="border border-[#1a1a2e]/20 bg-[#f8f8fb] px-5 py-4">
          <div className="text-[10px] tracking-[0.12em] text-[#1a1a2e] mb-2">READ FIRST — EXECUTION RULE</div>
          <div className="text-[11px] text-[#2a2a3e] leading-[1.5]">
            If any execution risk, ambiguity, or deviation arises:
            <span className="font-semibold"> STOP. ESCALATE. DO NOT SUBSTITUTE.</span>
            {' '}Proceeding with sampling or production constitutes acceptance of all requirements in this document and its referenced appendices.
          </div>
        </div>

        <div>
          <div className="text-[10px] tracking-[0.12em] text-[#1a1a2e] mb-2">01. ORDER OF AUTHORITY (HIGHEST → LOWEST)</div>
          <ol className="list-decimal ml-5 space-y-1 text-[11px] text-[#2a2a3e]">
            <li>Approved Production Samples</li>
            <li>This Factory Execution Pack (Launch v1)</li>
            <li>Trim Requirements — Launch v1 (Appendix A)</li>
            <li>Measurement Tables (Appendix B)</li>
            <li>SKU-Specific Execution Sheets (Appendix C)</li>
          </ol>
          <div className="mt-3 text-[11px] text-[#2a2a3e]">
            No substitution, interpretation, or optimization is permitted without written approval.
          </div>
        </div>

        <div>
          <div className="text-[10px] tracking-[0.12em] text-[#1a1a2e] mb-2">DOCUMENT SCOPE</div>
          <div className="text-[11px] text-[#2a2a3e] leading-[1.6]">
            Only SKUs listed in this pack are approved for sampling and bulk production. Any deviation from the requirements in this pack and its referenced appendices is rejectable.
          </div>
        </div>
      </div>
    </PageShell>
  );
}
