import React from 'react';

export function PageShell({
  title,
  children,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page w-[8.5in] min-h-[11in] bg-white mx-auto shadow-lg print:shadow-none">
      <div className="h-full px-[0.75in] py-[0.75in] flex flex-col">
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[18px] font-normal tracking-[0.05em] text-[#1a1a2e] leading-tight mb-1">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[10px] font-normal text-[#4a4a5e] tracking-wide">{subtitle}</p>
              )}
            </div>
            <div className="w-12 h-12 border border-[#1a1a2e]/20 flex items-center justify-center">
              <div className="text-[8px] font-normal text-[#4a4a5e] tracking-wider">LOGO</div>
            </div>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="mt-6 pt-4 border-t border-[#1a1a2e]/10">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-normal text-[#4a4a5e] tracking-wide">SATUIT SUPPLY CO. · Factory Execution Pack — Launch v1.0</p>
            <p className="text-[8px] font-normal text-[#1a1a2e] tracking-wide">Binding for production</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
