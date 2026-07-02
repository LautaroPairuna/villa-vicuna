"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/media";
import { getSection, composeSplit } from "@/lib/editableContent";
import { baseValue } from "@/lib/translations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

function refresh() {
  // El sitio público es ISR: regeneramos las páginas por idioma al guardar,
  // así el cambio se ve al instante sin tener que renderizar en cada visita.
  for (const locale of ["es", "en", "fr"] as const) {
    revalidatePath(locale === "es" ? "/" : `/${locale}`);
  }
  revalidatePath("/admin");
}

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function requiredText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function refreshEditorial(kind: "promociones" | "salta", slug?: string) {
  const basePath = kind === "promociones" ? "/promociones" : "/salta";
  revalidatePath(basePath);
  if (slug) {
    revalidatePath(`${basePath}/${slug}`);
  }
  revalidatePath(`/admin/${kind}`);
}

// ── Secciones (hero, nosotros, contacto, menú) ──────────────────────
export async function setSectionImageAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const file = formData.get("file") as File | null;
  if (!slug || !file || file.size === 0) return;

  const media = await saveUpload(file, "sections", slug);
  await prisma.sectionImage.upsert({
    where: { slug },
    update: { mediaId: media.id },
    create: { slug, mediaId: media.id },
  });
  refresh();
}

export async function setSectionVideoAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const file = formData.get("file") as File | null;
  if (!slug || !file || file.size === 0) return;
  if (!file.type.startsWith("video/")) {
    throw new Error("El archivo debe ser un video.");
  }

  const media = await saveUpload(file, "sections", slug);
  await prisma.sectionImage.upsert({
    where: { slug },
    update: { mediaId: media.id },
    create: { slug, mediaId: media.id },
  });
  refresh();
}

// ── Habitaciones ────────────────────────────────────────────────────
export async function setRoomCoverAction(formData: FormData) {
  await requireAdmin();
  const roomId = String(formData.get("roomId") ?? "");
  const file = formData.get("file") as File | null;
  if (!roomId || !file || file.size === 0) return;

  const media = await saveUpload(file, "rooms", roomId);
  await prisma.room.update({ where: { id: roomId }, data: { coverId: media.id } });
  refresh();
}

export async function addRoomImageAction(formData: FormData) {
  await requireAdmin();
  const roomId = String(formData.get("roomId") ?? "");
  const file = formData.get("file") as File | null;
  if (!roomId || !file || file.size === 0) return;

  const media = await saveUpload(file, "rooms", roomId);
  const last = await prisma.roomImage.findFirst({
    where: { roomId },
    orderBy: { order: "desc" },
  });
  await prisma.roomImage.create({
    data: { roomId, mediaId: media.id, order: (last?.order ?? -1) + 1 },
  });
  refresh();
}

export async function deleteRoomImageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.roomImage.delete({ where: { id } });
  refresh();
}

export async function moveRoomImageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "");
  await swapOrder("roomImage", id, dir === "up" ? -1 : 1);
  refresh();
}

// ── Reseñas ─────────────────────────────────────────────────────────
export async function setReviewCoverAction(formData: FormData) {
  await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  const file = formData.get("file") as File | null;
  if (!reviewId || !file || file.size === 0) return;

  const media = await saveUpload(file, "reviews", reviewId);
  await prisma.review.update({ where: { id: reviewId }, data: { coverId: media.id } });
  refresh();
}

export async function addReviewImageAction(formData: FormData) {
  await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  const file = formData.get("file") as File | null;
  if (!reviewId || !file || file.size === 0) return;

  const media = await saveUpload(file, "reviews", reviewId);
  const last = await prisma.reviewImage.findFirst({
    where: { reviewId },
    orderBy: { order: "desc" },
  });
  await prisma.reviewImage.create({
    data: { reviewId, mediaId: media.id, order: (last?.order ?? -1) + 1 },
  });
  refresh();
}

export async function deleteReviewImageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.reviewImage.delete({ where: { id } });
  refresh();
}

export async function moveReviewImageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "");
  await swapOrder("reviewImage", id, dir === "up" ? -1 : 1);
  refresh();
}

// ── Textos (overrides de next-intl) ─────────────────────────────────
export async function saveTranslationsAction(formData: FormData) {
  await requireAdmin();
  const locale = String(formData.get("locale") ?? "");
  const sectionId = String(formData.get("section") ?? "");
  const section = getSection(sectionId);
  if (!["es", "en", "fr"].includes(locale) || !section) return;

  const operations = [];
  for (const field of section.fields) {
    let value: string;
    if (field.type === "splitTitle" && field.wrap) {
      const a = String(formData.get(`${field.key}__a`) ?? "");
      const b = String(formData.get(`${field.key}__b`) ?? "");
      value = composeSplit(field.wrap, a, b);
    } else {
      value = String(formData.get(field.key) ?? "");
    }

    // Si el valor vuelve a coincidir con el JSON base, borramos el override
    // (mantiene la tabla con solo lo realmente editado y permite "resetear").
    if (value === baseValue(locale, field.key)) {
      operations.push(prisma.translation.deleteMany({ where: { locale, key: field.key } }));
    } else {
      operations.push(prisma.translation.upsert({
        where: { locale_key: { locale, key: field.key } },
        update: { value },
        create: { locale, key: field.key, value },
      }));
    }
  }

  await prisma.$transaction(operations);
  refresh();
}

export async function createPromotionAction(formData: FormData) {
  await requireAdmin();

  const title = requiredText(formData, "title");
  const slugInput = requiredText(formData, "slug");
  const summary = requiredText(formData, "summary");
  const content = requiredText(formData, "content");
  const slug = slugify(slugInput || title);

  if (!title || !slug || !summary || !content) {
    throw new Error("Faltan campos obligatorios para la promoción.");
  }

  const promotion = await prisma.promotion.create({
    data: {
      title,
      slug,
      summary,
      content,
      ctaLabel: optionalText(formData, "ctaLabel"),
      ctaHref: optionalText(formData, "ctaHref"),
      validFrom: parseDate(optionalText(formData, "validFrom")),
      validTo: parseDate(optionalText(formData, "validTo")),
      seoTitle: optionalText(formData, "seoTitle"),
      seoDescription: optionalText(formData, "seoDescription"),
      published: parseCheckbox(formData, "published"),
    },
  });

  refreshEditorial("promociones", promotion.slug);
  redirect(`/admin/promociones/${promotion.id}`);
}

export async function updatePromotionAction(formData: FormData) {
  await requireAdmin();

  const id = requiredText(formData, "id");
  const title = requiredText(formData, "title");
  const slugInput = requiredText(formData, "slug");
  const summary = requiredText(formData, "summary");
  const content = requiredText(formData, "content");
  const slug = slugify(slugInput || title);

  if (!id || !title || !slug || !summary || !content) {
    throw new Error("Faltan campos obligatorios para la promoción.");
  }

  await prisma.promotion.update({
    where: { id },
    data: {
      title,
      slug,
      summary,
      content,
      ctaLabel: optionalText(formData, "ctaLabel"),
      ctaHref: optionalText(formData, "ctaHref"),
      validFrom: parseDate(optionalText(formData, "validFrom")),
      validTo: parseDate(optionalText(formData, "validTo")),
      seoTitle: optionalText(formData, "seoTitle"),
      seoDescription: optionalText(formData, "seoDescription"),
      published: parseCheckbox(formData, "published"),
    },
  });

  refreshEditorial("promociones", slug);
}

export async function deletePromotionAction(formData: FormData) {
  await requireAdmin();

  const id = requiredText(formData, "id");
  if (!id) return;

  const current = await prisma.promotion.findUnique({ where: { id } });
  await prisma.promotion.delete({ where: { id } });
  refreshEditorial("promociones", current?.slug);
  redirect("/admin/promociones");
}

export async function setPromotionCoverAction(formData: FormData) {
  await requireAdmin();

  const id = requiredText(formData, "id");
  const file = formData.get("file") as File | null;
  if (!id || !file || file.size === 0) return;

  const media = await saveUpload(file, "promotions", id);
  const promotion = await prisma.promotion.update({
    where: { id },
    data: { coverId: media.id },
  });

  refreshEditorial("promociones", promotion.slug);
}

export async function createSaltaPlaceAction(formData: FormData) {
  await requireAdmin();

  const title = requiredText(formData, "title");
  const slugInput = requiredText(formData, "slug");
  const category = requiredText(formData, "category");
  const summary = requiredText(formData, "summary");
  const content = requiredText(formData, "content");
  const slug = slugify(slugInput || title);

  if (!title || !slug || !category || !summary || !content) {
    throw new Error("Faltan campos obligatorios para el lugar de Salta.");
  }

  const place = await prisma.saltaPlace.create({
    data: {
      title,
      slug,
      category,
      summary,
      content,
      address: optionalText(formData, "address"),
      mapsUrl: optionalText(formData, "mapsUrl"),
      distanceFromHotel: optionalText(formData, "distanceFromHotel"),
      recommendedDuration: optionalText(formData, "recommendedDuration"),
      seoTitle: optionalText(formData, "seoTitle"),
      seoDescription: optionalText(formData, "seoDescription"),
      featured: parseCheckbox(formData, "featured"),
      published: parseCheckbox(formData, "published"),
    },
  });

  refreshEditorial("salta", place.slug);
  redirect(`/admin/salta/${place.id}`);
}

export async function updateSaltaPlaceAction(formData: FormData) {
  await requireAdmin();

  const id = requiredText(formData, "id");
  const title = requiredText(formData, "title");
  const slugInput = requiredText(formData, "slug");
  const category = requiredText(formData, "category");
  const summary = requiredText(formData, "summary");
  const content = requiredText(formData, "content");
  const slug = slugify(slugInput || title);

  if (!id || !title || !slug || !category || !summary || !content) {
    throw new Error("Faltan campos obligatorios para el lugar de Salta.");
  }

  await prisma.saltaPlace.update({
    where: { id },
    data: {
      title,
      slug,
      category,
      summary,
      content,
      address: optionalText(formData, "address"),
      mapsUrl: optionalText(formData, "mapsUrl"),
      distanceFromHotel: optionalText(formData, "distanceFromHotel"),
      recommendedDuration: optionalText(formData, "recommendedDuration"),
      seoTitle: optionalText(formData, "seoTitle"),
      seoDescription: optionalText(formData, "seoDescription"),
      featured: parseCheckbox(formData, "featured"),
      published: parseCheckbox(formData, "published"),
    },
  });

  refreshEditorial("salta", slug);
}

export async function deleteSaltaPlaceAction(formData: FormData) {
  await requireAdmin();

  const id = requiredText(formData, "id");
  if (!id) return;

  const current = await prisma.saltaPlace.findUnique({ where: { id } });
  await prisma.saltaPlace.delete({ where: { id } });
  refreshEditorial("salta", current?.slug);
  redirect("/admin/salta");
}

export async function setSaltaPlaceCoverAction(formData: FormData) {
  await requireAdmin();

  const id = requiredText(formData, "id");
  const file = formData.get("file") as File | null;
  if (!id || !file || file.size === 0) return;

  const media = await saveUpload(file, "salta", id);
  const place = await prisma.saltaPlace.update({
    where: { id },
    data: { coverId: media.id },
  });

  refreshEditorial("salta", place.slug);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

// ── Helper de reordenamiento (intercambia con el vecino) ────────────
async function swapOrder(model: "roomImage" | "reviewImage", id: string, delta: number) {
  if (model === "roomImage") {
    const current = await prisma.roomImage.findUnique({ where: { id } });
    if (!current) return;
    const neighbor = await prisma.roomImage.findFirst({
      where: {
        roomId: current.roomId,
        order: delta < 0 ? { lt: current.order } : { gt: current.order },
      },
      orderBy: { order: delta < 0 ? "desc" : "asc" },
    });
    if (!neighbor) return;
    await prisma.$transaction([
      prisma.roomImage.update({ where: { id: current.id }, data: { order: neighbor.order } }),
      prisma.roomImage.update({ where: { id: neighbor.id }, data: { order: current.order } }),
    ]);
  } else {
    const current = await prisma.reviewImage.findUnique({ where: { id } });
    if (!current) return;
    const neighbor = await prisma.reviewImage.findFirst({
      where: {
        reviewId: current.reviewId,
        order: delta < 0 ? { lt: current.order } : { gt: current.order },
      },
      orderBy: { order: delta < 0 ? "desc" : "asc" },
    });
    if (!neighbor) return;
    await prisma.$transaction([
      prisma.reviewImage.update({ where: { id: current.id }, data: { order: neighbor.order } }),
      prisma.reviewImage.update({ where: { id: neighbor.id }, data: { order: current.order } }),
    ]);
  }
}
