import React from 'react';

export function DocumentCover({ version }: { version: string }) {
  return (
    <div className="page w-[8.5in] h-[11in] bg-white mx-auto shadow-lg print:shadow-none">
      <div className="h-full px-[0.75in] py-[0.75in] flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[12px] tracking-[0.12em] text-[#1a1a2e]">SATUIT SUPPLY CO.</div>
          <div className="mt-2 text-[28px] tracking-[0.08em] text-[#1a1a2e] leading-tight">
            FACTORY EXECUTION PACK — {version.toUpperCase()}
          </div>
          <div className="mt-6 space-y-2 text-[11px] text-[#2a2a3e]">
            <div><span className="text-[#4a4a5e] tracking-[0.08em]">Status:</span> APPROVED FOR SAMPLING &amp; BULK</div>
            <div><span className="text-[#4a4a5e] tracking-[0.08em]">Audience:</span> Factories &amp; Production Partners</div>
            <div><span className="text-[#4a4a5e] tracking-[0.08em]">Authority Level:</span> BINDING</div>
            <div><span className="text-[#4a4a5e] tracking-[0.08em]">Effective Date:</span> Launch v1</div>
          </div>

          <div className="mt-10 border border-[#1a1a2e]/20 bg-[#f8f8fb] px-5 py-4">
            <div className="text-[10px] tracking-[0.12em] text-[#1a1a2e] mb-2">READ FIRST — EXECUTION RULE</div>
            <div className="text-[12px] text-[#1a1a2e] leading-[1.5]">
              If any execution risk, ambiguity, or deviation arises:
              <div className="mt-2 text-[14px] tracking-[0.06em]"><span className="font-semibold">STOP. ESCALATE. DO NOT SUBSTITUTE.</span></div>
              <div className="mt-2 text-[11px] text-[#2a2a3e]">
                Proceeding with sampling or production constitutes acceptance of all requirements in this document and its referenced appendices.
              </div>
            </div>
          </div>
        </div>

        <footer className="pt-4 border-t border-[#1a1a2e]/10">
          <div className="flex items-center justify-between">
            <p className="text-[8px] text-[#4a4a5e] tracking-wide">SATUIT SUPPLY CO.</p>
            <p className="text-[8px] text-[#1a1a2e] tracking-wide">Binding for production</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
