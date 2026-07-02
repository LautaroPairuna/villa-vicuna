import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Seed inicial: vuelca el contenido que hoy está hardcodeado en
 * src/lib/habitaciones.ts y src/lib/reseñas.ts a la base de datos,
 * apuntando a las imágenes que ya existen en /public/images.
 *
 * Las imágenes "de fábrica" se registran como Media con su ruta actual
 * (p.ej. /images/habitaciones/...). Cuando se suba un reemplazo desde el
 * panel, la nueva Media apuntará a /uploads/...
 */

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

// ── Datos actuales (espejo de src/lib/*.ts) ─────────────────────────
const ROOMS = [
  {
    key: "twin_interna",
    categoria: "standard",
    cantidad: "3",
    cover: "/images/habitaciones/twin-interna.jpg",
    carrusel: [
      "/images/habitaciones/habitaciones-twin-interna/interna-1.jpg",
      "/images/habitaciones/habitaciones-twin-interna/interna-2.png",
      "/images/habitaciones/habitaciones-twin-interna/interna-3.jpg",
    ],
  },
  {
    key: "matrimonial",
    categoria: "standard",
    cantidad: "2",
    cover: "/images/habitaciones/standard-matrimonial.jpg",
    carrusel: [
      "/images/habitaciones/habitaciones-matrimonial/matrimonial-1.png",
      "/images/habitaciones/habitaciones-matrimonial/matrimonial-2.jpeg",
      "/images/habitaciones/habitaciones-matrimonial/matrimonial-3.jpeg",
      "/images/habitaciones/habitaciones-matrimonial/matrimonial-4.jpeg",
    ],
  },
  {
    key: "triple",
    categoria: "standard",
    cantidad: "2",
    cover: "/images/habitaciones/standard-mat-triple.jpg",
    carrusel: [
      "/images/habitaciones/habitaciones-triple/triple-1.png",
      "/images/habitaciones/habitaciones-triple/triple-2.png",
      "/images/habitaciones/habitaciones-triple/triple-3.png",
    ],
  },
  {
    key: "balcon",
    categoria: "superior",
    cantidad: "2",
    cover: "/images/habitaciones/superior-balcon.jpg",
    carrusel: [
      "/images/habitaciones/habitaciones-balcon/balcon-1.png",
      "/images/habitaciones/habitaciones-balcon/balcon-2.png",
      "/images/habitaciones/habitaciones-balcon/balcon-3.png",
    ],
  },
  {
    key: "jardin",
    categoria: "superior",
    cantidad: "2",
    cover: "/images/habitaciones/superior-jardin.jpg",
    carrusel: [
      "/images/habitaciones/habitaciones-jardin/jardin-1.png",
      "/images/habitaciones/habitaciones-jardin/jardin-2.jpeg",
      "/images/habitaciones/habitaciones-jardin/jardin-3.jpeg",
    ],
  },
  {
    key: "twin_externa",
    categoria: "superior",
    cantidad: "1",
    cover: "/images/habitaciones/twin-externa.jpg",
    carrusel: [
      "/images/habitaciones/habitaciones-twin-externa/externa-1.png",
      "/images/habitaciones/habitaciones-twin-externa/externa-2.png",
      "/images/habitaciones/habitaciones-twin-externa/externa-3.png",
    ],
  },
];

const REVIEWS = [
  {
    key: "desayuno",
    cover: "/images/reseñas/el-desayuno.jpg",
    carrusel: [
      "/images/reseñas/reseñas-desayuno/desayuno-1.jpg",
      "/images/reseñas/reseñas-desayuno/desayuno-2.jpg",
      "/images/reseñas/reseñas-desayuno/desayuno-3.jpg",
      "/images/reseñas/reseñas-desayuno/desayuno-4.jpg",
    ],
  },
  {
    key: "detalles",
    cover: "/images/reseñas/los-detalles.jpg",
    carrusel: [
      "/images/reseñas/reseñas-detalles/detalles-1.jpg",
      "/images/reseñas/reseñas-detalles/detalles-2.jpeg",
      "/images/reseñas/reseñas-detalles/detalles-3.jpg",
      "/images/reseñas/reseñas-detalles/detalles-4.jpg",
    ],
  },
  {
    key: "personal",
    cover: "/images/reseñas/el-personal.jpg",
    carrusel: [
      "/images/reseñas/reseñas-personal/personal-1.jpg",
      "/images/reseñas/reseñas-personal/personal-2.jpeg",
      "/images/reseñas/reseñas-personal/personal-3.jpg",
      "/images/reseñas/reseñas-personal/personal-4.jpg",
    ],
  },
];

const SECTIONS: Record<string, string> = {
  hero_poster: "/images/hero-poster.webp",
  nosotros: "/images/nosotros.jpg",
  contactenos: "/images/contactenos.jpg",
  menu_foods: "/images/menu-foods.svg",
  menu_drinks: "/images/menu-drinks.svg",
};

const PROMOTIONS = [
  {
    slug: "escapada-romantica-salta-capital",
    title: "Escapada romantica en Salta Capital",
    summary:
      "Una propuesta pensada para parejas que buscan combinar descanso, arquitectura colonial y gastronomia local en el casco historico de Salta.",
    content:
      "Esta promocion esta pensada para una estadia breve con foco en descanso, ubicacion y experiencia.\n\nVilla Vicuna permite recorrer a pie buena parte del centro historico, volver al hotel con facilidad y aprovechar la atmosfera serena de la casa durante la tarde.\n\nEs una opcion ideal para escapadas de dos o tres noches, celebraciones especiales o viajes en pareja que priorizan caminar la ciudad, disfrutar la arquitectura y salir a cenar sin depender del auto.",
    cover: "/images/habitaciones/superior-balcon.jpg",
    ctaLabel: "Consultar disponibilidad",
    ctaHref: "https://hotels.cloudbeds.com/reservation/pwSXnD",
    validFrom: new Date("2026-06-01"),
    validTo: new Date("2026-12-31"),
    seoTitle: "Escapada romantica en Salta Capital | Villa Vicuna",
    seoDescription:
      "Propuesta ideal para parejas que buscan hospedarse en el centro historico de Salta Capital y vivir una experiencia boutique.",
    published: true,
  },
  {
    slug: "estadias-largas-en-el-centro-de-salta",
    title: "Estadias largas en el centro de Salta",
    summary:
      "Una opcion para quienes necesitan pasar varios dias en la ciudad y valoran ubicacion, tranquilidad y acceso rapido a los principales puntos de interes.",
    content:
      "Esta propuesta esta orientada a viajeros que planean quedarse varios dias en Salta Capital y necesitan una base comoda para moverse por el centro.\n\nLa ubicacion de Villa Vicuna facilita organizar reuniones, recorridos urbanos, salidas gastronomicas y paseos culturales sin tiempos muertos.\n\nTambien es una buena alternativa para quienes combinan trabajo remoto con una estadia corta en el norte argentino y quieren un entorno mas tranquilo que un hotel corporativo tradicional.",
    cover: "/images/habitaciones/standard-matrimonial.jpg",
    ctaLabel: "Reservar estadia",
    ctaHref: "https://hotels.cloudbeds.com/reservation/pwSXnD",
    validFrom: new Date("2026-06-01"),
    validTo: new Date("2027-03-31"),
    seoTitle: "Estadias largas en Salta Capital | Villa Vicuna",
    seoDescription:
      "Hospedaje boutique en el centro historico de Salta para quienes necesitan ubicacion, calma y buena conectividad durante varios dias.",
    published: true,
  },
];

const SALTA_PLACES = [
  {
    slug: "plaza-9-de-julio",
    title: "Plaza 9 de Julio",
    category: "Paseos",
    summary:
      "El corazon historico de Salta Capital y uno de los mejores puntos de partida para entender la ciudad a pie.",
    content:
      "La Plaza 9 de Julio concentra buena parte del ritmo urbano de Salta Capital y funciona como punto de referencia para cualquier primer recorrido por la ciudad.\n\nDesde aqui se conectan iglesias, museos, cafes y calles historicas que se pueden recorrer sin apuro.\n\nPara un huesped de Villa Vicuna es una salida natural: permite empezar con una caminata corta, orientarse rapido y despues seguir hacia otros puntos del casco historico.",
    cover: "/images/nosotros.jpg",
    address: "Plaza 9 de Julio, Salta Capital",
    mapsUrl: "https://maps.app.goo.gl/HkENdi1r48xMmqpp6",
    distanceFromHotel: "A pocos minutos a pie",
    recommendedDuration: "45 minutos a 1 hora",
    seoTitle: "Plaza 9 de Julio en Salta Capital | Que hacer cerca de Villa Vicuna",
    seoDescription:
      "Guia rapida para visitar la Plaza 9 de Julio durante una estadia en Salta Capital, a pocos minutos de Villa Vicuna.",
    featured: true,
    published: true,
  },
  {
    slug: "catedral-basilica-de-salta",
    title: "Catedral Basilica de Salta",
    category: "Historia",
    summary:
      "Uno de los edificios mas reconocibles del centro historico, ideal para una visita corta dentro de un recorrido peatonal.",
    content:
      "La Catedral Basilica es uno de los hitos mas visibles de la Plaza 9 de Julio y forma parte del perfil arquitectonico mas reconocible de Salta Capital.\n\nVale la pena detenerse en su fachada, en el contexto urbano que la rodea y en el modo en que se integra con la vida cotidiana del centro.\n\nPara quienes se hospedan en Villa Vicuna, es una visita muy simple de incorporar en una caminata de manana o al atardecer, sin alterar el resto del plan del dia.",
    cover: "/images/contactenos.jpg",
    address: "Espana 558, Salta Capital",
    mapsUrl: "https://maps.app.goo.gl/HkENdi1r48xMmqpp6",
    distanceFromHotel: "Menos de 10 minutos a pie",
    recommendedDuration: "30 a 45 minutos",
    seoTitle: "Catedral Basilica de Salta | Guia para visitantes en Salta Capital",
    seoDescription:
      "Que ver en la Catedral Basilica de Salta y como integrarla a una recorrida a pie desde Villa Vicuna.",
    featured: true,
    published: true,
  },
  {
    slug: "museo-maam",
    title: "Museo MAAM",
    category: "Museos",
    summary:
      "Una parada clave para quienes quieren sumar una experiencia cultural fuerte dentro del centro historico de la ciudad.",
    content:
      "El MAAM es una de las visitas culturales mas relevantes de Salta Capital y suele ser una excelente opcion para complementar una estadia urbana.\n\nEs una propuesta que funciona especialmente bien en dias templados o como parte de una manana dedicada al casco historico.\n\nDesde Villa Vicuna se puede llegar caminando y combinar la visita con cafes, librerias o una recorrida mas amplia por el centro.",
    cover: "/images/reseñas/los-detalles.jpg",
    address: "Mitre 77, Salta Capital",
    mapsUrl: "https://maps.app.goo.gl/HkENdi1r48xMmqpp6",
    distanceFromHotel: "10 minutos a pie",
    recommendedDuration: "1 a 2 horas",
    seoTitle: "Visitar el MAAM en Salta Capital | Guia local desde Villa Vicuna",
    seoDescription:
      "Informacion practica para sumar el Museo MAAM a una estadia en Salta Capital, a distancia caminable desde Villa Vicuna.",
    featured: false,
    published: true,
  },
  {
    slug: "pena-folclorica-en-balneario-y-centro",
    title: "Pena folclorica en el centro de Salta",
    category: "Gastronomia",
    summary:
      "Una experiencia muy asociada a la ciudad para quienes quieren cerrar el dia con musica, cocina regional y ambiente local.",
    content:
      "Salir a una pena es una de las formas mas directas de acercarse al costado mas vivo y social de Salta Capital.\n\nSegun el dia y la agenda cultural, puede ser una muy buena opcion para la cena o para extender la noche despues de recorrer el centro.\n\nDesde Villa Vicuna se puede organizar facilmente sin grandes traslados, lo que vuelve esta salida especialmente comoda para huespedes que prefieren moverse a pie o en trayectos cortos.",
    cover: "/images/reseñas/el-desayuno.jpg",
    address: "Zona centro, Salta Capital",
    mapsUrl: "https://maps.app.goo.gl/HkENdi1r48xMmqpp6",
    distanceFromHotel: "Trayecto corto desde el hotel",
    recommendedDuration: "2 a 3 horas",
    seoTitle: "Pena folclorica en Salta Capital | Que hacer de noche en el centro",
    seoDescription:
      "Idea para sumar una noche de musica y gastronomia regional durante una estadia en Salta Capital.",
    featured: false,
    published: true,
  },
];

// Crea (o reutiliza) una Media por su path.
async function media(path: string, alt = "") {
  const existing = await prisma.media.findFirst({ where: { path } });
  if (existing) return existing;
  return prisma.media.create({ data: { path, alt } });
}

async function main() {
  // ── Habitaciones ──
  for (let i = 0; i < ROOMS.length; i++) {
    const r = ROOMS[i];
    const cover = await media(r.cover, r.key);
    const room = await prisma.room.upsert({
      where: { key: r.key },
      update: { categoria: r.categoria, cantidad: r.cantidad, order: i, coverId: cover.id },
      create: { key: r.key, categoria: r.categoria, cantidad: r.cantidad, order: i, coverId: cover.id },
    });
    await prisma.roomImage.deleteMany({ where: { roomId: room.id } });
    for (let j = 0; j < r.carrusel.length; j++) {
      const m = await media(r.carrusel[j], `${r.key}-${j + 1}`);
      await prisma.roomImage.create({ data: { roomId: room.id, mediaId: m.id, order: j } });
    }
  }

  // ── Reseñas ──
  for (let i = 0; i < REVIEWS.length; i++) {
    const r = REVIEWS[i];
    const cover = await media(r.cover, r.key);
    const review = await prisma.review.upsert({
      where: { key: r.key },
      update: { order: i, coverId: cover.id },
      create: { key: r.key, order: i, coverId: cover.id },
    });
    await prisma.reviewImage.deleteMany({ where: { reviewId: review.id } });
    for (let j = 0; j < r.carrusel.length; j++) {
      const m = await media(r.carrusel[j], `${r.key}-${j + 1}`);
      await prisma.reviewImage.create({ data: { reviewId: review.id, mediaId: m.id, order: j } });
    }
  }

  // ── Secciones ──
  for (const [slug, path] of Object.entries(SECTIONS)) {
    const m = await media(path, slug);
    await prisma.sectionImage.upsert({
      where: { slug },
      update: { mediaId: m.id },
      create: { slug, mediaId: m.id },
    });
  }

  // ── Promociones ──
  for (const promotion of PROMOTIONS) {
    const cover = await media(promotion.cover, promotion.slug);
    await prisma.promotion.upsert({
      where: { slug: promotion.slug },
      update: {
        title: promotion.title,
        summary: promotion.summary,
        content: promotion.content,
        coverId: cover.id,
        ctaLabel: promotion.ctaLabel,
        ctaHref: promotion.ctaHref,
        validFrom: promotion.validFrom,
        validTo: promotion.validTo,
        seoTitle: promotion.seoTitle,
        seoDescription: promotion.seoDescription,
        published: promotion.published,
      },
      create: {
        slug: promotion.slug,
        title: promotion.title,
        summary: promotion.summary,
        content: promotion.content,
        coverId: cover.id,
        ctaLabel: promotion.ctaLabel,
        ctaHref: promotion.ctaHref,
        validFrom: promotion.validFrom,
        validTo: promotion.validTo,
        seoTitle: promotion.seoTitle,
        seoDescription: promotion.seoDescription,
        published: promotion.published,
      },
    });
  }

  // ── Salta Capital ──
  for (const place of SALTA_PLACES) {
    const cover = await media(place.cover, place.slug);
    await prisma.saltaPlace.upsert({
      where: { slug: place.slug },
      update: {
        title: place.title,
        category: place.category,
        summary: place.summary,
        content: place.content,
        coverId: cover.id,
        address: place.address,
        mapsUrl: place.mapsUrl,
        distanceFromHotel: place.distanceFromHotel,
        recommendedDuration: place.recommendedDuration,
        seoTitle: place.seoTitle,
        seoDescription: place.seoDescription,
        featured: place.featured,
        published: place.published,
      },
      create: {
        slug: place.slug,
        title: place.title,
        category: place.category,
        summary: place.summary,
        content: place.content,
        coverId: cover.id,
        address: place.address,
        mapsUrl: place.mapsUrl,
        distanceFromHotel: place.distanceFromHotel,
        recommendedDuration: place.recommendedDuration,
        seoTitle: place.seoTitle,
        seoDescription: place.seoDescription,
        featured: place.featured,
        published: place.published,
      },
    });
  }

  console.log("✅ Seed completado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
