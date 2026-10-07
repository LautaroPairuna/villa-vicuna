"use server";

import { refresh, refreshFor, refreshEditorial } from "@/lib/adminRefresh";
import { isAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/media";
import { getSection, composeSplit } from "@/lib/editableContent";
import { baseValue } from "@/lib/translations";

/**
 * Portero de todas las acciones que escriben. Las server actions son endpoints
 * POST reales: se pueden invocar sin pasar por la UI, así que el chequeo del
 * proxy no alcanza y este tiene que estar sí o sí. La validación (JWT + rol
 * releído de la DB) está en isAdminSession.
 */
async function requireAdmin() {
  if (!(await isAdminSession())) throw new Error("No autorizado");
}

// Resultado de las subidas de archivos. Se DEVUELVE (no se lanza) para que el
// mensaje llegue al cliente sin que Next lo censure en producción, y el panel
// pueda mostrar el motivo real del fallo en vez de un falso "éxito".
export type UploadResult = { ok: true } | { ok: false; error: string };

// Mensajes del servidor que conviene traducir: son errores de Node/Prisma que
// llegarían al toast tal cual ("ENOSPC: no space left on device").
function humanizeUploadError(err: unknown): string {
  const fallback = "No se pudo guardar el archivo. Intentá de nuevo.";
  if (!(err instanceof Error) || !err.message) return fallback;

  const code = (err as { code?: string }).code;
  if (code === "ENOSPC") return "El servidor se quedó sin espacio en disco. Avisá a quien administra el hosting.";
  if (code === "EACCES" || code === "EPERM") return "El servidor no tiene permiso para guardar archivos en esa carpeta.";
  if (code === "P2025") return "El registro que querés editar ya no existe. Recargá la página.";
  if (/^(ENOENT|EACCES|EPERM|ENOSPC|EMFILE)\b/.test(err.message) || /prisma|invocation/i.test(err.message)) {
    return fallback;
  }
  // Los mensajes que escribimos nosotros (media.ts) ya están en castellano.
  return err.message;
}

function uploadError(err: unknown): UploadResult {
  console.error("[admin] falló una subida:", err);
  return { ok: false, error: humanizeUploadError(err) };
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

// ── Secciones (hero, nosotros, contacto, menú) ──────────────────────
export async function setSectionImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const file = formData.get("file") as File | null;
  if (!slug || !file || file.size === 0) return { ok: false, error: "No se recibió ningún archivo." };

  try {
    const media = await saveUpload(file, "sections", { alt: slug, baseName: slug });
    await prisma.sectionImage.upsert({
      where: { slug },
      update: { mediaId: media.id },
      create: { slug, mediaId: media.id },
    });
    refreshFor(slug);
    return { ok: true };
  } catch (err) {
    return uploadError(err);
  }
}

// ── Habitaciones ────────────────────────────────────────────────────
export async function setRoomCoverAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const roomId = String(formData.get("roomId") ?? "");
  const file = formData.get("file") as File | null;
  if (!roomId || !file || file.size === 0) return { ok: false, error: "No se recibió ningún archivo." };

  try {
    const room = await prisma.room.findUnique({ where: { id: roomId }, select: { key: true } });
    const base = room?.key ?? roomId;
    const media = await saveUpload(file, "rooms", { alt: base, baseName: base });
    await prisma.room.update({ where: { id: roomId }, data: { coverId: media.id } });
    refresh();
    return { ok: true };
  } catch (err) {
    return uploadError(err);
  }
}

export async function addRoomImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const roomId = String(formData.get("roomId") ?? "");
  const file = formData.get("file") as File | null;
  if (!roomId || !file || file.size === 0) return { ok: false, error: "No se recibió ningún archivo." };

  try {
    const room = await prisma.room.findUnique({ where: { id: roomId }, select: { key: true } });
    const base = room?.key ?? roomId;
    const media = await saveUpload(file, "rooms", { alt: base, baseName: base });
    const last = await prisma.roomImage.findFirst({
      where: { roomId },
      orderBy: { order: "desc" },
    });
    await prisma.roomImage.create({
      data: { roomId, mediaId: media.id, order: (last?.order ?? -1) + 1 },
    });
    refresh();
    return { ok: true };
  } catch (err) {
    return uploadError(err);
  }
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
export async function setReviewCoverAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  const file = formData.get("file") as File | null;
  if (!reviewId || !file || file.size === 0) return { ok: false, error: "No se recibió ningún archivo." };

  try {
    const review = await prisma.review.findUnique({ where: { id: reviewId }, select: { key: true } });
    const base = review?.key ?? reviewId;
    const media = await saveUpload(file, "reviews", { alt: base, baseName: base });
    await prisma.review.update({ where: { id: reviewId }, data: { coverId: media.id } });
    refresh();
    return { ok: true };
  } catch (err) {
    return uploadError(err);
  }
}

export async function addReviewImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  const file = formData.get("file") as File | null;
  if (!reviewId || !file || file.size === 0) return { ok: false, error: "No se recibió ningún archivo." };

  try {
    const review = await prisma.review.findUnique({ where: { id: reviewId }, select: { key: true } });
    const base = review?.key ?? reviewId;
    const media = await saveUpload(file, "reviews", { alt: base, baseName: base });
    const last = await prisma.reviewImage.findFirst({
      where: { reviewId },
      orderBy: { order: "desc" },
    });
    await prisma.reviewImage.create({
      data: { reviewId, mediaId: media.id, order: (last?.order ?? -1) + 1 },
    });
    refresh();
    return { ok: true };
  } catch (err) {
    return uploadError(err);
  }
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

  const submittedFieldKeys = new Set(
    formData
      .getAll("fieldKey")
      .map((value) => String(value))
      .filter(Boolean),
  );
  const fields =
    submittedFieldKeys.size > 0
      ? section.fields.filter((field) => submittedFieldKeys.has(field.key))
      : section.fields;

  const operations = [];
  for (const field of fields) {
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
  refreshFor(sectionId);
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

export async function setPromotionCoverAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const id = requiredText(formData, "id");
  const file = formData.get("file") as File | null;
  if (!id || !file || file.size === 0) return { ok: false, error: "No se recibió ningún archivo." };

  try {
    const current = await prisma.promotion.findUnique({ where: { id }, select: { slug: true } });
    const base = current?.slug ?? id;
    const media = await saveUpload(file, "promotions", { alt: base, baseName: base });
    const promotion = await prisma.promotion.update({
      where: { id },
      data: { coverId: media.id },
    });
    refreshEditorial("promociones", promotion.slug);
    return { ok: true };
  } catch (err) {
    return uploadError(err);
  }
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

export async function setSaltaPlaceCoverAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const id = requiredText(formData, "id");
  const file = formData.get("file") as File | null;
  if (!id || !file || file.size === 0) return { ok: false, error: "No se recibió ningún archivo." };

  try {
    const current = await prisma.saltaPlace.findUnique({ where: { id }, select: { slug: true } });
    const base = current?.slug ?? id;
    const media = await saveUpload(file, "salta", { alt: base, baseName: base });
    const place = await prisma.saltaPlace.update({
      where: { id },
      data: { coverId: media.id },
    });
    refreshEditorial("salta", place.slug);
    return { ok: true };
  } catch (err) {
    return uploadError(err);
  }
}

// ── Carrusel de un lugar de Salta ───────────────────────────────────
export async function addSaltaPlaceImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const placeId = requiredText(formData, "placeId");
  const file = formData.get("file") as File | null;
  if (!placeId || !file || file.size === 0) return { ok: false, error: "No se recibió ningún archivo." };

  try {
    const place = await prisma.saltaPlace.findUnique({
      where: { id: placeId },
      select: { slug: true },
    });
    if (!place) return { ok: false, error: "El lugar ya no existe." };

    const media = await saveUpload(file, "salta", { alt: place.slug, baseName: place.slug });
    // La nueva foto va al final: se ordena después desde el panel.
    const last = await prisma.saltaPlaceImage.findFirst({
      where: { placeId },
      orderBy: { order: "desc" },
    });
    await prisma.saltaPlaceImage.create({
      data: { placeId, mediaId: media.id, order: (last?.order ?? -1) + 1 },
    });
    refreshEditorial("salta", place.slug);
    return { ok: true };
  } catch (err) {
    return uploadError(err);
  }
}

export async function deleteSaltaPlaceImageAction(formData: FormData) {
  await requireAdmin();
  const id = requiredText(formData, "id");
  if (!id) return;

  const image = await prisma.saltaPlaceImage.findUnique({
    where: { id },
    select: { place: { select: { slug: true } } },
  });
  await prisma.saltaPlaceImage.delete({ where: { id } });
  refreshEditorial("salta", image?.place.slug);
}

export async function moveSaltaPlaceImageAction(formData: FormData) {
  await requireAdmin();
  const id = requiredText(formData, "id");
  const dir = String(formData.get("dir") ?? "");
  if (!id) return;

  const image = await prisma.saltaPlaceImage.findUnique({
    where: { id },
    select: { place: { select: { slug: true } } },
  });
  await swapOrder("saltaPlaceImage", id, dir === "up" ? -1 : 1);
  refreshEditorial("salta", image?.place.slug);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

// ── Helper de reordenamiento (intercambia con el vecino) ────────────
async function swapOrder(
  model: "roomImage" | "reviewImage" | "saltaPlaceImage",
  id: string,
  delta: number,
) {
  if (model === "saltaPlaceImage") {
    const current = await prisma.saltaPlaceImage.findUnique({ where: { id } });
    if (!current) return;
    const neighbor = await prisma.saltaPlaceImage.findFirst({
      where: {
        placeId: current.placeId,
        order: delta < 0 ? { lt: current.order } : { gt: current.order },
      },
      orderBy: { order: delta < 0 ? "desc" : "asc" },
    });
    if (!neighbor) return;
    await prisma.$transaction([
      prisma.saltaPlaceImage.update({ where: { id: current.id }, data: { order: neighbor.order } }),
      prisma.saltaPlaceImage.update({ where: { id: neighbor.id }, data: { order: current.order } }),
    ]);
    return;
  }

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
