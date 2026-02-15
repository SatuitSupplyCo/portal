import { notFound } from "next/navigation"
import { AppendixMeasurements } from "@/components/techpacks/pages/AppendixMeasurements"
import {
  MEASUREMENT_SECTIONS,
  type MeasurementSection,
} from "@/lib/content/launch-v1"

interface MeasurementsPageProps {
  params: Promise<{
    section: string
  }>
}

export async function generateStaticParams() {
  return MEASUREMENT_SECTIONS.map((section) => ({ section }))
}

export default async function MeasurementsPage({
  params,
}: MeasurementsPageProps) {
  const { section } = await params

  if (!MEASUREMENT_SECTIONS.includes(section as MeasurementSection)) {
    notFound()
  }

  return <AppendixMeasurements section={section as MeasurementSection} />
}
