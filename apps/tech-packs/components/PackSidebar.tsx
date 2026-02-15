'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from '@repo/ui';
import { skuGroups, packMeta } from '@/lib/content/launch-v1';

const BASE = '/pack/launch-v1';

const frontMatter = [
  { label: 'Cover', href: `${BASE}/cover` },
  { label: 'Execution Rules', href: `${BASE}/execution-rules` },
  { label: 'Brand Intent', href: `${BASE}/brand-intent` },
  { label: 'Collection Overview', href: `${BASE}/collection-overview` },
];

const appendices = [
  { label: 'Appendix A — Trims', href: `${BASE}/appendix-a-trims` },
  { label: 'Appendix B — Tees', href: `${BASE}/appendix-b-measurements/tees` },
  { label: 'Appendix B — Fleece', href: `${BASE}/appendix-b-measurements/fleece` },
  { label: 'Appendix B — Swim (Men)', href: `${BASE}/appendix-b-measurements/swim-men` },
  { label: 'Appendix B — Coastal (Women)', href: `${BASE}/appendix-b-measurements/coastal-women` },
  { label: 'Appendix C — Construction', href: `${BASE}/appendix-c-sku-construction` },
  { label: 'Final Lock Points', href: `${BASE}/final-lock-points` },
];

export function PackSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <div className="text-[10px] tracking-[0.12em] text-[#4a4a5e]">SATUIT SUPPLY CO.</div>
        <div className="text-[13px] tracking-[0.04em] text-[#1a1a2e] mt-1">
          {packMeta.title}
        </div>
        <div className="text-[10px] text-[#6a6a7e] mt-0.5">{packMeta.version}</div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Front Matter */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {frontMatter.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} size="sm">
                    <Link href={item.href}>
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Collection groups */}
        {skuGroups.map((group) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel className="text-[10px] tracking-[0.08em]">
              {group.title.replace(/^\d+\s\u2014\s/, '')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuSub>
                    {group.skus.map((sku) => {
                      const href = `${BASE}/${sku.collectionSlug}/${sku.slug}`;
                      return (
                        <SidebarMenuSubItem key={sku.slug}>
                          <SidebarMenuSubButton asChild isActive={pathname === href} size="sm">
                            <Link href={href}>
                              <span>{sku.skuName}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarSeparator />

        {/* Appendices */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.08em]">
            APPENDICES
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {appendices.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} size="sm">
                    <Link href={item.href}>
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
