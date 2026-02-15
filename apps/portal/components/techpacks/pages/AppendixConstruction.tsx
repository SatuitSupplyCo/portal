import React from 'react';
import { PageShell } from './PageShell';

export function AppendixConstruction() {
  return (
    <PageShell title="APPENDIX C — SKU-SPECIFIC CONSTRUCTION RULES" subtitle="Status: BINDING · Any SKU deviation requires written approval">
      <div className="space-y-4">
        <RuleBlock
          code="C1"
          title="Essential Tee — Core Essentials"
          bullets={[
            'Single needle shoulder',
            'Double needle sleeve & hem',
            'Clean neck rib (no contrast)',
            'Interior printed label (symbol only)',
            'Exterior micro flag (LOCK placement before bulk)',
            'Universal neck tape',
          ]}
        />

        <RuleBlock
          code="C2"
          title="Essential Heavy Tee"
          bullets={[
            'Fabric: 8.5 oz',
            'Slightly wider sleeve opening',
            'No other construction changes allowed',
          ]}
        />

        <RuleBlock
          code="C3"
          title="Core Pullover Hoodie"
          bullets={[
            'Set-in sleeve',
            'Clean hood shape (no exaggerated volume)',
            'No kangaroo pocket shaping details',
            'Custom drawstring; plain metal aglet',
            'Micro flag only',
          ]}
        />

        <RuleBlock
          code="C4"
          title="Core Crewneck Sweatshirt"
          bullets={['Standard rib at neck, cuffs, hem', 'No side panels']}
        />

        <RuleBlock
          code="C5"
          title="Material Tee"
          bullets={[
            'Construction: Same as Essential Tee',
            'Branding: Interior only — NO exterior branding',
          ]}
        />

        <RuleBlock
          code="C6"
          title="Material Fleece Crew"
          bullets={[
            'Reinforced shoulder seam allowed (hidden)',
            'No decorative stitching',
            'Branding: micro flag (LOCKED)',
          ]}
        />

        <RuleBlock
          code="C7"
          title="Origin Graphic Tee"
          bullets={[
            'Graphic: One placement only',
            'No text-heavy designs',
            'No town name as headline',
            'Print: Soft hand',
            'Finish: Matte',
            'No puff, foil, or specialty inks',
          ]}
        />

        <RuleBlock
          code="C8"
          title="Origin Hoodie"
          bullets={[
            'Construction: Same as Core Hoodie',
            'Graphic: Minimal, symbolic',
            'Trim: Custom drawstring allowed',
          ]}
        />

        <RuleBlock
          code="C9"
          title="Lightweight Performance Swim Hoodie"
          bullets={[
            'No ribbing',
            'No kangaroo pocket',
            'Clean hem finish',
            'Hood must lay flat',
            'Micro flag only',
          ]}
        />

        <RuleBlock
          code="C10"
          title="Men's Tailored Swim Short"
          bullets={[
            'Matte fabric only',
            'Internal drawcord',
            'Clean waistband (no contrast)',
            'Branding: Interior label only',
          ]}
        />

        <RuleBlock
          code="C11"
          title="Women's Coastal Short"
          bullets={[
            'Clean waistband',
            'No cargo elements',
            'Functional pockets allowed if flat',
          ]}
        />
      </div>
    </PageShell>
  );
}

function RuleBlock({
  code,
  title,
  bullets,
}: {
  code: string;
  title: string;
  bullets: string[];
}) {
  return (
    <div className="border border-[#1a1a2e]/10 p-4">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[10px] tracking-[0.12em] text-[#1a1a2e]">{code}</div>
        <div className="text-[11px] text-[#2a2a3e]">{title}</div>
      </div>
      <ul className="list-disc ml-5 space-y-1 text-[11px] text-[#2a2a3e]">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}
