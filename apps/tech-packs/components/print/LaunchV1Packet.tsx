import { DocumentCover } from '@/components/pages/DocumentCover';
import { DocumentRules } from '@/components/pages/DocumentRules';
import { BrandIntent } from '@/components/pages/BrandIntent';
import { CollectionOverview } from '@/components/pages/CollectionOverview';
import { TechPack } from '@/components/TechPack';
import { AppendixTrims } from '@/components/pages/AppendixTrims';
import { AppendixMeasurements } from '@/components/pages/AppendixMeasurements';
import { AppendixConstruction } from '@/components/pages/AppendixConstruction';
import { FinalLockPoints } from '@/components/pages/FinalLockPoints';
import { skuGroups } from '@/lib/content/launch-v1';

export function LaunchV1Packet() {
  return (
    <>
      <DocumentCover version="Launch v1.0" />
      <DocumentRules />
      <BrandIntent />
      <CollectionOverview />

      {skuGroups.map((g) => (
        <div key={g.id}>
          {/* Section divider page */}
          <div className="page w-[8.5in] h-[11in] bg-white mx-auto print:mx-0 shadow-lg print:shadow-none">
            <div className="h-full px-[0.75in] py-[0.75in] flex flex-col justify-center">
              <div className="border border-[#1a1a2e]/15 p-10">
                <div className="text-[10px] tracking-[0.12em] text-[#4a4a5e] mb-3">SECTION</div>
                <div className="text-[22px] tracking-[0.06em] text-[#1a1a2e]">{g.title}</div>
              </div>
            </div>
          </div>
          {g.skus.map((sku) => (
            <TechPack key={sku.skuCode} data={sku} />
          ))}
        </div>
      ))}

      <AppendixTrims />
      <AppendixMeasurements />
      <AppendixConstruction />
      <FinalLockPoints />
    </>
  );
}
