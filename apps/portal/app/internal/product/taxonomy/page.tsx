import { auth } from "@repo/auth"
import { db } from "@repo/db/client"
import { redirect } from "next/navigation"
import { SetBreadcrumbs } from "@/components/nav/SetBreadcrumbs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table"
import { Badge } from "@repo/ui/badge"
import { TaxonomyHierarchy } from "./_components/TaxonomyHierarchy"
import { DimensionSection } from "./_components/DimensionSection"
import { CollectionsSection } from "./_components/CollectionsSection"

// ─── Data fetching ──────────────────────────────────────────────────

async function getHierarchy() {
  return db.query.productCategories.findMany({
    with: {
      subcategories: {
        with: { productTypes: { orderBy: (pt, { asc }) => [asc(pt.sortOrder)] } },
        orderBy: (sc, { asc }) => [asc(sc.sortOrder)],
      },
    },
    orderBy: (c, { asc }) => [asc(c.sortOrder)],
  })
}

async function getDimensions() {
  const [
    constructions,
    materialWeightClasses,
    sellingWindows,
    assortmentTenures,
    fitBlocks,
    useCases,
    audienceGenders,
    audienceAgeGroups,
    goodsClasses,
    sizeScales,
    collections,
  ] = await Promise.all([
    db.query.constructions.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] }),
    db.query.materialWeightClasses.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] }),
    db.query.sellingWindows.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] }),
    db.query.assortmentTenures.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] }),
    db.query.fitBlocks.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] }),
    db.query.useCases.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] }),
    db.query.audienceGenders.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] }),
    db.query.audienceAgeGroups.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] }),
    db.query.goodsClasses.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] }),
    db.query.sizeScales.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] }),
    db.query.collections.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] }),
  ])

  return {
    constructions,
    materialWeightClasses,
    sellingWindows,
    assortmentTenures,
    fitBlocks,
    useCases,
    audienceGenders,
    audienceAgeGroups,
    goodsClasses,
    sizeScales,
    collections,
  }
}

// ─── Page ───────────────────────────────────────────────────────────

export default async function TaxonomyAdminPage() {
  const session = await auth()
  if (!session) redirect("/auth/signin")

  const [hierarchy, dimensions] = await Promise.all([
    getHierarchy(),
    getDimensions(),
  ])

  const totalProductTypes = hierarchy.reduce(
    (sum, cat) => sum + cat.subcategories.reduce(
      (s, sub) => s + sub.productTypes.length, 0
    ), 0
  )

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <SetBreadcrumbs
        crumbs={[
          { label: "Product", href: "/internal/product" },
          { label: "Taxonomy" },
        ]}
      />

      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Taxonomy</h1>
          <p className="text-muted-foreground mt-1">
            Manage product categories, types, dimensions, and collections.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Categories" value={hierarchy.length} />
          <SummaryCard
            label="Subcategories"
            value={hierarchy.reduce((s, c) => s + c.subcategories.length, 0)}
          />
          <SummaryCard label="Product Types" value={totalProductTypes} />
          <SummaryCard label="Collections" value={dimensions.collections.length} />
        </div>

        {/* Hierarchy */}
        <section>
          <TaxonomyHierarchy hierarchy={hierarchy} />
        </section>

        {/* Collections */}
        <section>
          <CollectionsSection collections={dimensions.collections} />
        </section>

        {/* Dimensions */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Dimensions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <DimensionSection
              title="Constructions"
              dimensionKey="constructions"
              items={dimensions.constructions}
            />
            <DimensionSection
              title="Material Weight Classes"
              dimensionKey="materialWeightClasses"
              items={dimensions.materialWeightClasses}
            />
            <DimensionSection
              title="Selling Windows"
              dimensionKey="sellingWindows"
              items={dimensions.sellingWindows}
            />
            <DimensionSection
              title="Assortment Tenures"
              dimensionKey="assortmentTenures"
              items={dimensions.assortmentTenures}
            />
            <DimensionSection
              title="Fit Blocks"
              dimensionKey="fitBlocks"
              items={dimensions.fitBlocks}
            />
            <DimensionSection
              title="Use Cases"
              dimensionKey="useCases"
              items={dimensions.useCases}
            />
            <DimensionSection
              title="Audience Genders"
              dimensionKey="audienceGenders"
              items={dimensions.audienceGenders}
            />
            <DimensionSection
              title="Audience Age Groups"
              dimensionKey="audienceAgeGroups"
              items={dimensions.audienceAgeGroups}
            />
            <DimensionSection
              title="Goods Classes"
              dimensionKey="goodsClasses"
              items={dimensions.goodsClasses}
            />
            <DimensionSection
              title="Size Scales"
              dimensionKey="sizeScales"
              items={dimensions.sizeScales}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

// ─── Components ─────────────────────────────────────────────────────

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
