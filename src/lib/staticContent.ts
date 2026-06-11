// Builders del contenido estático (rutas a /public/images), usados como
// fallback en servidor y como datos por defecto en cliente.
import { Habitaciones as getStaticRooms } from "./habitaciones";
import { reseñas as staticReviews } from "./reseñas";
import type { RoomContent, ReviewContent } from "./contentTypes";

export function staticRoomsContent(): RoomContent[] {
  return getStaticRooms().map((r, i) => ({
    id: i + 1,
    key: r.key,
    categoria: r.categoria,
    cantidad: r.cantidad,
    amenities: r.amenities,
    coverUrl: `/images/habitaciones/${r.imagen}`,
    images: r.carrusel.map((f) => `/images/habitaciones/${r.folder}/${f}`),
  }));
}

export function staticReviewsContent(): ReviewContent[] {
  return staticReviews.map((r, i) => ({
    id: i + 1,
    key: r.nombreKey.split(".")[0], // "desayuno.nombre" -> "desayuno"
    folder: r.folder,
    nombreKey: r.nombreKey,
    textoKey: r.textoKey,
    coverUrl: `/images/reseñas/${r.imagen}`,
    images: r.carrusel.map((f) => `/images/reseñas/${r.folder}/${f}`),
  }));
}
