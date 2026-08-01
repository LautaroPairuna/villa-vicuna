"use server";

import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/media";
import { getSection, composeSplit } from "@/lib/editableContent";
import { baseValue } from "@/lib/translations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

// Resultado de las subidas de archivos. Se DEVUELVE (no se lanza) para que el
// mensaje llegue al cliente sin que Next lo censure en producción, y el panel
// pueda mostrar el motivo real del fallo en vez de un falso "éxito".
export type UploadResult = { ok: true } | { ok: false; error: string };

function uploadError(err: unknown): UploadResult {
  const msg =
    err instanceof Error && err.message
      ? err.message
      : "No se pudo guardar el archivo. Intentá de nuevo.";
  return { ok: false, error: msg };
}

function refresh() {
  // El sitio público es ISR: regeneramos las páginas al guardar, así el cambio
  // se ve al instante sin tener que renderizar en cada visita.
  //
  // Se revalida por PATRÓN de ruta (`/[locale]`) y no por URL: las páginas se
  // cachean bajo la ruta ya resuelta por el proxy de next-intl (`/es`, `/en`,
  // `/fr`), incluso las que se piden sin prefijo. Revalidar la URL "/" no
  // tocaba la entrada "/es", así que el español —el idioma por defecto, el que
  // ve la mayoría— se quedaba con la versión vieja hasta que vencía el
  // `revalidate` de 24 h. Con el patrón se cubren todos los locales de una.
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/experiencias", "page");
  revalidatePath("/admin");
}

// ── Secciones (hero, nosotros, contacto, menú) ──────────────────────
export async function setSectionImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const file = formData.get("file") as File | null;
  if (!slug || !file || file.size === 0) return { ok: false, error: "No se recibió ningún archivo." };

  try {
    const media = await saveUpload(file, "sections", slug);
    await prisma.sectionImage.upsert({
      where: { slug },
      update: { mediaId: media.id },
      create: { slug, mediaId: media.id },
    });
    refresh();
    return { ok: true };
  } catch (err) {
    return uploadError(err);
  }
}

export async function setSectionVideoAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const file = formData.get("file") as File | null;
  if (!slug || !file || file.size === 0) return { ok: false, error: "No se recibió ningún archivo." };
  if (!file.type.startsWith("video/")) {
    return { ok: false, error: "El archivo debe ser un video." };
  }

  try {
    const media = await saveUpload(file, "sections", slug);
    await prisma.sectionImage.upsert({
      where: { slug },
      update: { mediaId: media.id },
      create: { slug, mediaId: media.id },
    });
    refresh();
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
    const media = await saveUpload(file, "rooms", roomId);
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
    const media = await saveUpload(file, "rooms", roomId);
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
    const media = await saveUpload(file, "reviews", reviewId);
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
    const media = await saveUpload(file, "reviews", reviewId);
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
