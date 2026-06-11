import "server-only";
import { prisma } from "./prisma";
import { staticRoomsContent, staticReviewsContent } from "./staticContent";
import {
  STATIC_SECTION_IMAGES,
  type RoomContent,
  type ReviewContent,
  type SectionImages,
} from "./contentTypes";

// Cada getter lee de la DB y, ante DB vacía o error, cae al contenido
// estático. Esto mantiene el sitio funcionando aun antes del seed/migrate
// y permite que `next build` no necesite la base de datos.

export async function getRoomsContent(): Promise<RoomContent[]> {
  const base = staticRoomsContent();
  try {
    const rows = await prisma.room.findMany({
      orderBy: { order: "asc" },
      include: {
        cover: true,
        images: { orderBy: { order: "asc" }, include: { media: true } },
      },
    });
    if (!rows.length) return base;

    const byKey = new Map(base.map((r) => [r.key, r]));
    return rows.map((row, i) => {
      const fallback = byKey.get(row.key);
      return {
        id: i + 1,
        key: row.key,
        categoria: row.categoria || fallback?.categoria || "",
        cantidad: row.cantidad || fallback?.cantidad || "",
        amenities: fallback?.amenities ?? [],
        coverUrl: row.cover?.path ?? fallback?.coverUrl ?? "",
        images: row.images.length
          ? row.images.map((ri) => ri.media.path)
          : fallback?.images ?? [],
      };
    });
  } catch {
    return base;
  }
}

export async function getReviewsContent(): Promise<ReviewContent[]> {
  const base = staticReviewsContent();
  try {
    const rows = await prisma.review.findMany({
      orderBy: { order: "asc" },
      include: {
        cover: true,
        images: { orderBy: { order: "asc" }, include: { media: true } },
      },
    });
    if (!rows.length) return base;

    const byKey = new Map(base.map((r) => [r.key, r]));
    return rows.map((row, i) => {
      const fallback = byKey.get(row.key);
      return {
        id: i + 1,
        key: row.key,
        folder: fallback?.folder ?? `reseñas-${row.key}`,
        nombreKey: fallback?.nombreKey ?? `${row.key}.nombre`,
        textoKey: fallback?.textoKey ?? `${row.key}.texto`,
        coverUrl: row.cover?.path ?? fallback?.coverUrl ?? "",
        images: row.images.length
          ? row.images.map((ri) => ri.media.path)
          : fallback?.images ?? [],
      };
    });
  } catch {
    return base;
  }
}

export async function getSectionImages(): Promise<SectionImages> {
  const out: SectionImages = { ...STATIC_SECTION_IMAGES };
  try {
    const rows = await prisma.sectionImage.findMany({ include: { media: true } });
    for (const r of rows) {
      if (r.media?.path) out[r.slug] = r.media.path;
    }
    return out;
  } catch {
    return out;
  }
}
