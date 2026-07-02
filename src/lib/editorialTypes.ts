export interface EditorialCardItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  published: boolean;
}

export interface PromotionContent extends EditorialCardItem {
  content: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  validFrom: Date | null;
  validTo: Date | null;
}

export interface SaltaPlaceContent extends EditorialCardItem {
  category: string;
  content: string;
  address: string | null;
  mapsUrl: string | null;
  distanceFromHotel: string | null;
  recommendedDuration: string | null;
  featured: boolean;
}
