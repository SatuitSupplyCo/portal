import { SetBreadcrumbs } from "@/components/nav/SetBreadcrumbs"

export default function VendorsDashboard() {
  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs crumbs={[{ label: "Vendors" }]} />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Portal</h1>
          <p className="text-muted-foreground">
            Access execution documents, tech packs, and assets.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
          Vendor surface -- available in MVP-2.
        </div>
      </div>
    </main>
  )
}
