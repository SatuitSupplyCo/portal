import { SidebarProvider, SidebarInset } from '@repo/ui';
import { PackSidebar } from '@/components/PackSidebar';
import { TopBar } from '@/components/TopBar';
import { LaunchV1Packet } from '@/components/print/LaunchV1Packet';

export default function PackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Screen layout — hidden when printing */}
      <div data-print-hide>
        <SidebarProvider>
          <PackSidebar />
          <SidebarInset>
            <TopBar />
            <div className="flex-1 bg-[#f5f5f5] py-10">
              <div className="max-w-[8.5in] mx-auto">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>

      {/* Print packet — hidden on screen, shown when printing */}
      <div className="hidden" data-print-show>
        <LaunchV1Packet />
      </div>
    </>
  );
}
