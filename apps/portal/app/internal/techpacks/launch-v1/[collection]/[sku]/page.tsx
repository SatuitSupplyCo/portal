import { notFound } from "next/navigation"
import { TechPack } from "@/components/techpacks/TechPack"
import { getSkuBySlug, allSkus } from "@/lib/content/launch-v1"

interface SkuPageProps {
  params: Promise<{
    collection: string
    sku: string
  }>
}

export async function generateStaticParams() {
  return allSkus.map((sku) => ({
    collection: sku.collectionSlug,
    sku: sku.slug,
  }))
}

export default async function SkuPage({ params }: SkuPageProps) {
  const { collection, sku: skuSlug } = await params
  const data = getSkuBySlug(collection, skuSlug)

  if (!data) {
    notFound()
  }

  return <TechPack data={data} />
}
