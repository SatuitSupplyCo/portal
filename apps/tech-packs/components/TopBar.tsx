'use client';

import { SidebarTrigger } from '@repo/ui';
import { PrinterIcon } from 'lucide-react';
import { packMeta } from '@/lib/content/launch-v1';

export function TopBar() {
  return (
    <header className="h-14 border-b border-[#1a1a2e]/10 bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <span className="text-sm tracking-wide text-[#1a1a2e]">
          SATUIT SUPPLY CO. — {packMeta.title} ({packMeta.version})
        </span>
      </div>
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-3 py-2 text-xs tracking-wide bg-white text-[#4a4a5e] border border-[#1a1a2e]/20 hover:border-[#1a1a2e]/40 transition-colors"
      >
        <PrinterIcon className="size-3.5" />
        Print Packet
      </button>
    </header>
  );
}
