/**
 * Una foto del carrusel, con lo que el panel necesita para identificarla.
 *
 * `id` es el de la fila del carrusel (no el del Media): es lo que reciben las
 * acciones de mover y borrar. `updatedAt` va como ISO y no como Date porque
 * este tipo cruza al cliente.
 */
export interface CarouselImage {
  id: string;
  url: string;
  name: string;
  updatedAt: string;
}

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
  images: CarouselImage[];
}
