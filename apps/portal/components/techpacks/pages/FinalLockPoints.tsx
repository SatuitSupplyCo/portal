import React from 'react';
import { PageShell } from './PageShell';

export function FinalLockPoints() {
  return (
    <PageShell title="FINAL — LOCK POINTS & FACTORY ACCEPTANCE" subtitle="Digital acknowledgement encouraged. Printable signature supported.">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] tracking-[0.12em] text-[#1a1a2e] mb-2">FINAL LOCK POINTS BEFORE BULK</div>
          <div className="text-[11px] text-[#2a2a3e] mb-3">Factories must confirm the following in writing:</div>
          <ul className="list-disc ml-5 space-y-1 text-[11px] text-[#2a2a3e]">
            <li>Micro flag placement choice (hem vs back collar)</li>
            <li>Approved drawstring color</li>
          </ul>
        </div>

        <div className="border border-[#1a1a2e]/20 bg-[#f8f8fb] px-5 py-4">
          <div className="text-[10px] tracking-[0.12em] text-[#1a1a2e] mb-2">ACCEPTANCE</div>
          <div className="text-[11px] text-[#2a2a3e] leading-[1.6]">
            Proceeding with sampling or bulk production confirms acceptance of all requirements in the Factory Execution Pack and its referenced appendices.
          </div>
        </div>

        <div>
          <div className="text-[10px] tracking-[0.12em] text-[#1a1a2e] mb-3">DIGITAL ACKNOWLEDGEMENT (PREFERRED)</div>
          <div className="text-[11px] text-[#2a2a3e] leading-[1.6]">
            Reply by email with: (1) Factory name, (2) Signer name + title, (3) Date, and (4) confirmation of the lock points above.
          </div>
        </div>

        <div>
          <div className="text-[10px] tracking-[0.12em] text-[#1a1a2e] mb-3">PRINT SIGNATURE (OPTIONAL)</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Factory" />
            <Field label="Location" />
            <Field label="Signer Name" />
            <Field label="Title" />
            <Field label="Email" />
            <Field label="Date" />
            <div className="col-span-2">
              <div className="text-[9px] tracking-[0.12em] text-[#4a4a5e] mb-1">Signature</div>
              <div className="h-12 border border-[#1a1a2e]/20 bg-white" />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Field({ label }: { label: string }) {
  return (
    <div>
      <div className="text-[9px] tracking-[0.12em] text-[#4a4a5e] mb-1">{label}</div>
      <div className="h-9 border border-[#1a1a2e]/20 bg-white" />
    </div>
  );
}
