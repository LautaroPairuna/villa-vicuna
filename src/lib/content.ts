import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { staticRoomsContent, staticReviewsContent } from "./staticContent";
import {
  STATIC_SECTION_IMAGES,
  type RoomContent,
  type ReviewContent,
  type SectionImages,
} from "./contentTypes";

// Tag de caché de las imágenes/videos de sección (tabla sectionImage). Se
// invalida al subir una imagen o video desde el panel (updateTag), así el
// resultado queda cacheado (estático) y NO se consulta la DB en cada render
// hasta que realmente cambia algo. Mismo patrón que TRANSLATIONS_TAG.
export const SECTIONS_TAG = "sections";

// Lectura cacheada de las imágenes de sección. Selecciona solo lo que se usa
// (slug + path) para que el valor cacheado sea serializable y liviano. Solo
// se cachean lecturas exitosas: si Prisma falla, la promesa se rechaza y
// unstable_cache no guarda nada, cayendo al fallback estático en el caller.
const fetchSectionImageRows = unstable_cache(
  (): Promise<{ slug: string; media: { path: string } | null }[]> =>
    prisma.sectionImage.findMany({
      select: { slug: true, media: { select: { path: true } } },
    }),
  ["section-images"],
  { tags: [SECTIONS_TAG] },
);

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
    const rows = await fetchSectionImageRows();
    for (const r of rows) {
      if (r.media?.path) out[r.slug] = r.media.path;
    }
    return out;
  } catch {
    return out;
  }
}
