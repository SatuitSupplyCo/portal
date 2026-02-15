export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface AppendixRefs {
  trims?: string;
  measurements?: string;
  construction?: string;
}

export interface TechPackData {
  slug: string;
  collectionSlug: string;
  skuName: string;
  collection: string;
  skuCode?: string;
  productType: 'tee' | 'fleece' | 'swim' | 'shorts';
  colorSwatches: ColorSwatch[];
  keyMeasurements: string[];
  intent: string[];
  fabric: string[];
  fit: string[];
  construction: string[];
  branding: string[];
  trims: string[];
  approvedColors: string[];
  restrictions: string[];
  appendixRefs: AppendixRefs;
  msrpReference?: string;
  version: string;
  date: string;
}

export interface SkuGroup {
  id: string;
  slug: string;
  title: string;
  skus: TechPackData[];
}
