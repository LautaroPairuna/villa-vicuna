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
