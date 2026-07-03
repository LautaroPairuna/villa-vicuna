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
  {
    slug: "finde-largo-en-salta",
    title: "Finde largo en Salta Capital",
    summary:
      "Una propuesta armada para aprovechar los fines de semana largos, con foco en descanso, gastronomia y recorridos a pie por el centro historico.",
    content:
      "Pensada para tres o cuatro noches, esta promocion apunta a quienes quieren cortar la rutina sin planificar demasiado.\n\nDesde Villa Vicuna se llega caminando a plazas, museos, cafes y restaurantes, lo que permite ordenar el finde sin depender de traslados largos.\n\nEs ideal para viajeros que combinan un poco de turismo cultural con tardes tranquilas en el hotel y salidas nocturnas por el centro.",
    cover: "/images/habitaciones/superior-jardin.jpg",
    ctaLabel: "Ver disponibilidad",
    ctaHref: "https://hotels.cloudbeds.com/reservation/pwSXnD",
    validFrom: new Date("2026-07-01"),
    validTo: new Date("2026-11-30"),
    seoTitle: "Finde largo en Salta Capital | Villa Vicuna",
    seoDescription:
      "Escapada de fin de semana largo en el centro historico de Salta Capital, con base en el hotel boutique Villa Vicuna.",
    published: true,
  },
  {
    slug: "beneficio-reserva-anticipada",
    title: "Beneficio por reserva anticipada",
    summary:
      "Un incentivo para quienes planifican con tiempo su viaje al norte y quieren asegurar fechas y mejor tarifa reservando por adelantado.",
    content:
      "Esta promocion premia la planificacion: cuanto antes se reserva, mas facil es conseguir las fechas deseadas y coordinar el resto del viaje.\n\nEs una buena opcion para temporada alta, fines de semana largos o eventos puntuales en Salta Capital, donde la disponibilidad se reduce rapido.\n\nVilla Vicuna acompana la reserva anticipada con la misma atencion personalizada de siempre, para que la unica preocupacion sea disfrutar la estadia.",
    cover: null,
    ctaLabel: "Reservar con anticipacion",
    ctaHref: "https://hotels.cloudbeds.com/reservation/pwSXnD",
    validFrom: new Date("2026-06-15"),
    validTo: new Date("2027-06-15"),
    seoTitle: "Reserva anticipada en Salta Capital | Villa Vicuna",
    seoDescription:
      "Beneficio por reservar con anticipacion en Villa Vicuna, hotel boutique en el centro historico de Salta Capital.",
    published: true,
  },
  {
    slug: "tarifa-flexible-todo-el-ano",
    title: "Tarifa flexible todo el ano",
    summary:
      "Una propuesta permanente para quienes necesitan flexibilidad de fechas y prefieren no atarse a un periodo promocional cerrado.",
    content:
      "No todas las estadias entran en un calendario fijo, y por eso esta propuesta se mantiene disponible durante todo el ano.\n\nEsta orientada a viajes de ultimo momento, cambios de planes o estadias que se definen sobre la marcha.\n\nDesde Villa Vicuna se prioriza que el huesped encuentre una base comoda en el centro de Salta Capital, sin importar la epoca del ano en que viaje.",
    cover: "/images/habitaciones/twin-externa.jpg",
    ctaLabel: "Consultar tarifa",
    ctaHref: "https://hotels.cloudbeds.com/reservation/pwSXnD",
    validFrom: null,
    validTo: null,
    seoTitle: "Tarifa flexible todo el ano en Salta Capital | Villa Vicuna",
    seoDescription:
      "Propuesta de alojamiento flexible durante todo el ano en Villa Vicuna, en el centro historico de Salta Capital.",
    published: true,
  },
  {
    slug: "ultimo-minuto-invierno",
    title: "Ultimo minuto de invierno",
    summary:
      "Una oportunidad para quienes deciden viajar sobre la fecha y buscan una estadia comoda en el centro durante la temporada de invierno.",
    content:
      "Esta promocion apunta a las reservas de ultimo momento dentro de la temporada invernal, cuando el clima seco del norte invita a recorrer la ciudad.\n\nEs una alternativa pensada para escapadas cortas, sin demasiada anticipacion y con foco en aprovechar los dias soleados de Salta Capital.\n\nVilla Vicuna ofrece una base tranquila y bien ubicada para quienes deciden partir con poco margen de planificacion.",
    cover: "/images/habitaciones/standard-mat-triple.jpg",
    ctaLabel: "Reservar ahora",
    ctaHref: "https://hotels.cloudbeds.com/reservation/pwSXnD",
    validFrom: null,
    validTo: new Date("2026-09-21"),
    seoTitle: "Ultimo minuto de invierno en Salta Capital | Villa Vicuna",
    seoDescription:
      "Estadia de ultimo momento en invierno en el centro historico de Salta Capital, con Villa Vicuna como base.",
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
  {
    slug: "cerro-san-bernardo",
    title: "Cerro San Bernardo",
    category: "Naturaleza",
    summary:
      "El mirador natural de la ciudad, con vistas panoramicas de Salta Capital y un ascenso que se puede hacer en teleferico, a pie o en auto.",
    content:
      "El Cerro San Bernardo es uno de los paseos mas elegidos para tener una vista completa de Salta Capital y entender como se ordena la ciudad.\n\nSe puede subir en teleferico desde el parque San Martin, por la escalinata para quienes buscan una caminata mas exigente, o en vehiculo.\n\nDesde Villa Vicuna es una excelente salida de media manana o de atardecer, facil de combinar con un paseo previo por el centro historico.",
    cover: "/images/habitaciones/superior-jardin.jpg",
    address: "Cerro San Bernardo, Salta Capital",
    mapsUrl: "https://maps.app.goo.gl/HkENdi1r48xMmqpp6",
    distanceFromHotel: "15 minutos hasta la base del teleferico",
    recommendedDuration: "1 a 2 horas",
    seoTitle: "Cerro San Bernardo en Salta Capital | Mirador cerca de Villa Vicuna",
    seoDescription:
      "Como visitar el Cerro San Bernardo y disfrutar las vistas de Salta Capital durante una estadia en Villa Vicuna.",
    featured: true,
    published: true,
  },
  {
    slug: "mercado-artesanal-de-salta",
    title: "Mercado Artesanal de Salta",
    category: "Compras",
    summary:
      "Un punto clasico para llevarse artesania regional, tejidos y productos del norte argentino en un mismo lugar.",
    content:
      "El Mercado Artesanal reune produccion de distintas zonas de la provincia y es una buena parada para quienes buscan un recuerdo autentico del viaje.\n\nEs una visita corta y tranquila, ideal para intercalar entre recorridos mas largos por el centro o antes de volver al hotel.\n\nPara un huesped de Villa Vicuna funciona bien como paseo complementario, especialmente los ultimos dias de la estadia.",
    cover: "/images/reseñas/el-personal.jpg",
    address: "San Martin 2555, Salta Capital",
    mapsUrl: "https://maps.app.goo.gl/HkENdi1r48xMmqpp6",
    distanceFromHotel: "20 minutos en auto o transporte",
    recommendedDuration: "45 minutos a 1 hora",
    seoTitle: "Mercado Artesanal de Salta | Compras cerca de Villa Vicuna",
    seoDescription:
      "Que encontrar en el Mercado Artesanal de Salta y como sumarlo a una estadia en el centro historico con Villa Vicuna.",
    featured: false,
    published: true,
  },
  {
    slug: "tren-a-las-nubes",
    title: "Tren a las Nubes",
    category: "Excursiones",
    summary:
      "Una de las experiencias mas conocidas del norte argentino, ideal para dedicar un dia completo fuera de la ciudad.",
    content:
      "El Tren a las Nubes es una excursion de dia completo que combina paisaje de altura, historia ferroviaria y una de las postales mas famosas de la region.\n\nRequiere organizar el dia con anticipacion, ya que suele implicar salir temprano y regresar por la tarde o noche.\n\nVilla Vicuna funciona como una base comoda para este tipo de excursiones: permite descansar bien antes y despues de una jornada larga fuera de Salta Capital.",
    cover: "/images/habitaciones/twin-interna.jpg",
    address: null,
    mapsUrl: null,
    distanceFromHotel: null,
    recommendedDuration: "Dia completo",
    seoTitle: "Tren a las Nubes desde Salta Capital | Guia para visitantes",
    seoDescription:
      "Como organizar la excursion al Tren a las Nubes teniendo a Villa Vicuna como base en el centro de Salta Capital.",
    featured: true,
    published: true,
  },
  {
    slug: "casco-historico-a-pie",
    title: "Casco historico a pie",
    category: "Paseos",
    summary:
      "Un recorrido autoguiado por las calles centrales de Salta Capital, pensado para descubrir la ciudad sin apuro y sin traslados.",
    content:
      "Recorrer el casco historico caminando es quizas la mejor forma de conocer Salta Capital, con sus fachadas coloniales, plazas y comercios tradicionales.\n\nNo hace falta un plan rigido: alcanza con salir del hotel y dejarse llevar por las cuadras centrales, sumando cafes y miradores segun el ritmo de cada uno.\n\nDesde Villa Vicuna todo el recorrido empieza en la puerta, lo que lo vuelve una propuesta simple y flexible para cualquier momento del dia.",
    cover: null,
    address: "Centro historico, Salta Capital",
    mapsUrl: null,
    distanceFromHotel: "Desde la puerta del hotel",
    recommendedDuration: "1 a 3 horas",
    seoTitle: "Recorrer el casco historico de Salta a pie | Villa Vicuna",
    seoDescription:
      "Ideas para caminar el centro historico de Salta Capital partiendo desde Villa Vicuna, sin necesidad de traslados.",
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
    // Algunas promos no traen imagen: así se ve el bloque azul de fallback.
    const cover = promotion.cover ? await media(promotion.cover, promotion.slug) : null;
    await prisma.promotion.upsert({
      where: { slug: promotion.slug },
      update: {
        title: promotion.title,
        summary: promotion.summary,
        content: promotion.content,
        coverId: cover?.id ?? null,
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
        coverId: cover?.id ?? null,
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
    // Algunos lugares no traen imagen: así se ve el bloque azul de fallback.
    const cover = place.cover ? await media(place.cover, place.slug) : null;
    await prisma.saltaPlace.upsert({
      where: { slug: place.slug },
      update: {
        title: place.title,
        category: place.category,
        summary: place.summary,
        content: place.content,
        coverId: cover?.id ?? null,
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
        coverId: cover?.id ?? null,
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
