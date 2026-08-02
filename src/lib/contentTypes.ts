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
  hero_video: "/videos/video-home.mp4",
  promociones_hero_video: "/videos/video-home.mp4",
  nosotros: "/images/nosotros.jpg",
  contactenos: "/images/contactenos.jpg",
  menu_foods: "/images/menu-foods.svg",
  menu_drinks: "/images/menu-drinks.svg",
  experiencias_cita_video: "/video-fondo-experiencias.mp4",
  experiencias_testimonio_video: "/images/experiencias/video-nueva-seccion-experiencias.mp4",
  experiencias_formato_intima: "/images/experiencias/degustacion-intima.webp",
  experiencias_formato_terroir: "/images/experiencias/recorrido-terroir.webp",
  experiencias_formato_atardecer: "/images/experiencias/atardecer-intimo.jpg",
  experiencias_tapeo_0: "/images/experiencias/profitelores-queso.jpg",
  experiencias_tapeo_1: "/images/experiencias/tartaletas-cerdo.jpg",
  experiencias_tapeo_2: "/images/experiencias/trufas-queso-almendras.jpg",
  experiencias_tapeo_3: "/images/experiencias/datiles-jamon-crudo.jpg",
};
