import type { Metadata } from 'next'
import { DocPageShell } from '@/components/nav/DocPageShell'
import { getBrandContext } from '../actions'
import { BrandStrategyForm } from './BrandStrategyForm'

export const metadata: Metadata = {
  title: 'AI Strategy Context — Brand | Satuit Supply Co.',
}

export default async function BrandStrategyPage() {
  const context = await getBrandContext()

  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'Brand', href: '/internal/brand' },
        { label: 'AI Strategy Context' },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-12">
          <div className="mb-10">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              AI Strategy Context
            </h1>
            <p className="text-sm text-[var(--depot-muted)] leading-relaxed max-w-lg">
              These fields define brand-level strategy that the AI uses when
              suggesting assortment targets, critiquing product mix, and
              making planning recommendations. Changes are distilled into a
              concise brief automatically.
            </p>
          </div>

          <BrandStrategyForm
            initialValues={{
              positioning: context?.positioning ?? '',
              targetCustomer: context?.targetCustomer ?? '',
              priceArchitecture: context?.priceArchitecture ?? '',
              aestheticDirection: context?.aestheticDirection ?? '',
              categoryStrategy: context?.categoryStrategy ?? '',
              antiSpec: context?.antiSpec ?? '',
            }}
            contextBrief={context?.contextBrief ?? null}
            contextBriefUpdatedAt={context?.contextBriefUpdatedAt?.toISOString() ?? null}
          />
        </div>
      </main>
    </DocPageShell>
  )
}
