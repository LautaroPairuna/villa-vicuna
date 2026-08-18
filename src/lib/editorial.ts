import "server-only";

import { prisma } from "./prisma";
import type {
  PromotionContent,
  SaltaPlaceContent,
} from "./editorialTypes";

function toPromotion(item: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  validFrom: Date | null;
  validTo: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  published: boolean;
  cover: { path: string } | null;
}): PromotionContent {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    content: item.content,
    coverUrl: item.cover?.path ?? null,
    ctaLabel: item.ctaLabel,
    ctaHref: item.ctaHref,
    validFrom: item.validFrom,
    validTo: item.validTo,
    seoTitle: item.seoTitle,
    seoDescription: item.seoDescription,
    published: item.published,
  };
}

function toSaltaPlace(item: {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  address: string | null;
  mapsUrl: string | null;
  distanceFromHotel: string | null;
  recommendedDuration: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  featured: boolean;
  published: boolean;
  cover: { path: string } | null;
  images?: {
    id: string;
    media: { path: string; originalName: string; updatedAt: Date };
  }[];
}): SaltaPlaceContent {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    category: item.category,
    summary: item.summary,
    content: item.content,
    coverUrl: item.cover?.path ?? null,
    address: item.address,
    mapsUrl: item.mapsUrl,
    distanceFromHotel: item.distanceFromHotel,
    recommendedDuration: item.recommendedDuration,
    seoTitle: item.seoTitle,
    seoDescription: item.seoDescription,
    featured: item.featured,
    published: item.published,
    images: (item.images ?? []).map((img) => ({
      id: img.id,
      url: img.media.path,
      // Los medios cargados antes de que existiera originalName tienen la
      // cadena vacía: mostramos el archivo en disco como último recurso.
      name: img.media.originalName || img.media.path.split("/").pop() || "",
      updatedAt: img.media.updatedAt.toISOString(),
    })),
  };
}

export async function getPublishedPromotions(): Promise<PromotionContent[]> {
  try {
    const rows = await prisma.promotion.findMany({
      where: { published: true },
      include: { cover: true },
      orderBy: [{ validFrom: "desc" }, { createdAt: "desc" }],
    });

    return rows.map(toPromotion);
  } catch {
    return [];
  }
}

export async function getPromotionBySlug(slug: string): Promise<PromotionContent | null> {
  try {
    const row = await prisma.promotion.findFirst({
      where: { slug, published: true },
      include: { cover: true },
    });

    return row ? toPromotion(row) : null;
  } catch {
    return null;
  }
}

export async function getAllPromotionsAdmin(): Promise<PromotionContent[]> {
  try {
    const rows = await prisma.promotion.findMany({
      include: { cover: true },
      orderBy: [{ published: "desc" }, { createdAt: "desc" }],
    });

    return rows.map(toPromotion);
  } catch {
    return [];
  }
}

export async function getPromotionByIdAdmin(id: string): Promise<PromotionContent | null> {
  try {
    const row = await prisma.promotion.findUnique({
      where: { id },
      include: { cover: true },
    });

    return row ? toPromotion(row) : null;
  } catch {
    return null;
  }
}

// El carrusel siempre sale en el orden que fijó el panel.
const SALTA_IMAGES_INCLUDE = {
  include: { media: true },
  orderBy: { order: "asc" },
} as const;

export async function getPublishedSaltaPlaces(): Promise<SaltaPlaceContent[]> {
  try {
    const rows = await prisma.saltaPlace.findMany({
      where: { published: true },
      include: { cover: true, images: SALTA_IMAGES_INCLUDE },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });

    return rows.map(toSaltaPlace);
  } catch {
    return [];
  }
}

export async function getSaltaPlaceBySlug(slug: string): Promise<SaltaPlaceContent | null> {
  try {
    const row = await prisma.saltaPlace.findFirst({
      where: { slug, published: true },
      include: { cover: true, images: SALTA_IMAGES_INCLUDE },
    });

    return row ? toSaltaPlace(row) : null;
  } catch {
    return null;
  }
}

export async function getAllSaltaPlacesAdmin(): Promise<SaltaPlaceContent[]> {
  try {
    const rows = await prisma.saltaPlace.findMany({
      include: { cover: true, images: SALTA_IMAGES_INCLUDE },
      orderBy: [{ featured: "desc" }, { published: "desc" }, { createdAt: "desc" }],
    });

    return rows.map(toSaltaPlace);
  } catch {
    return [];
  }
}

export async function getSaltaPlaceByIdAdmin(id: string): Promise<SaltaPlaceContent | null> {
  try {
    const row = await prisma.saltaPlace.findUnique({
      where: { id },
      include: { cover: true, images: SALTA_IMAGES_INCLUDE },
    });

    return row ? toSaltaPlace(row) : null;
  } catch {
    return null;
  }
}
