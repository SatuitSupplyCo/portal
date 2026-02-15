import { SetBreadcrumbs } from "@/components/nav/SetBreadcrumbs"

export default function PartnersDashboard() {
  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs crumbs={[{ label: "Partners" }]} />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partner Portal</h1>
          <p className="text-muted-foreground">
            Access shared documents, assets, and packs.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
          Partner surface -- available in MVP-3.
        </div>
      </div>
    </main>
  )
}
