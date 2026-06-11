"use server";

import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/media";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

function refresh() {
  // El sitio público es ISR: regeneramos las páginas por idioma al guardar,
  // así el cambio se ve al instante sin tener que renderizar en cada visita.
  for (const locale of ["es", "en", "fr"]) {
    revalidatePath(`/${locale}`);
  }
  revalidatePath("/admin");
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
