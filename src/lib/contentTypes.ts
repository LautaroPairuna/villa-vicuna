// Tipos compartidos entre el servidor (capa de datos) y los componentes cliente.
// No importa Prisma ni nada de servidor: se puede usar en ambos lados.

export interface Amenity {
  nombre: string;
  icono: string;
}

export interface RoomContent {
  id: number;
  key: string;
  categoria: string;
  cantidad: string;
  amenities: Amenity[];
  coverUrl: string;
  images: string[];
}

export interface ReviewContent {
  id: number;
  key: string;
  folder: string;
  nombreKey: string;
  textoKey: string;
  coverUrl: string;
  images: string[];
}

export type SectionImages = Record<string, string>;

// Fallbacks estáticos (rutas a /public/images). Se usan cuando la DB
// está vacía o no disponible, y como datos por defecto en cliente.
export const STATIC_SECTION_IMAGES: SectionImages = {
  hero_poster: "/images/hero-poster.webp",
  nosotros: "/images/nosotros.jpg",
  contactenos: "/images/contactenos.jpg",
  menu_foods: "/images/menu-foods.svg",
  menu_drinks: "/images/menu-drinks.svg",
};
