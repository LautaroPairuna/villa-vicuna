import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/adminAuth";
import { refresh, refreshFor } from "@/lib/adminRefresh";
import { saveVideoStream, UploadTooLargeError } from "@/lib/media";
import { MAX_VIDEO_BYTES, formatBytes } from "@/lib/uploadLimits";

// Subida de videos por streaming: el cuerpo es el archivo crudo (no multipart),
// que va de la request a disco sin pasar por memoria. Es lo que permite el tope
// de GB: una server action arma el cuerpo entero en RAM antes de ejecutarse.
//
// Los datos viajan en headers para no tener que parsear multipart. Esta ruta no
// pasa por el proxy (el matcher excluye /api), así que chequea la sesión acá.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9_-]{1,80}$/i;

function fail(error: string, status: number) {
  return Response.json({ ok: false, error }, { status });
}

export async function POST(req: Request) {
  if (!(await isAdminSession())) {
    return fail("Tu sesión venció. Volvé a iniciar sesión y reintentá.", 401);
  }

  const slug = req.headers.get("x-slug") ?? "";
  const mime = req.headers.get("x-file-type") ?? "";
  let fileName = "video";
  try {
    fileName = decodeURIComponent(req.headers.get("x-file-name") ?? "") || "video";
  } catch {
    // nombre mal codificado: nos quedamos con el genérico
  }

  if (!SLUG_RE.test(slug)) return fail("Falta indicar a qué sección pertenece el video.", 400);
  if (!mime.startsWith("video/")) return fail("El archivo debe ser un video (MP4, WebM o MOV).", 400);
  if (!req.body) return fail("No se recibió ningún archivo.", 400);

  const declared = Number(req.headers.get("content-length"));
  if (declared > MAX_VIDEO_BYTES) {
    return fail(`El video pesa ${formatBytes(declared)} y el máximo es ${formatBytes(MAX_VIDEO_BYTES)}.`, 413);
  }

  try {
    const media = await saveVideoStream({
      stream: req.body,
      subdir: "sections",
      baseName: slug,
      fileName,
      mime,
      alt: slug,
      maxBytes: MAX_VIDEO_BYTES,
    });
    await prisma.sectionImage.upsert({
      where: { slug },
      update: { mediaId: media.id },
      create: { slug, mediaId: media.id },
    });
    refreshFor(slug);
    refresh();
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof UploadTooLargeError) {
      return fail(`El video supera el máximo de ${formatBytes(MAX_VIDEO_BYTES)}.`, 413);
    }
    console.error("[admin] falló la subida de video:", err);
    const code = (err as { code?: string }).code;
    if (code === "ENOSPC") {
      return fail("El servidor se quedó sin espacio en disco. Avisá a quien administra el hosting.", 507);
    }
    // Cliente que cortó la subida (cerró la pestaña, se cayó la red).
    if (code === "ERR_STREAM_PREMATURE_CLOSE" || /aborted/i.test(String((err as Error)?.message))) {
      return fail("La subida se interrumpió. Reintentá.", 499);
    }
    return fail("No se pudo guardar el video. Intentá de nuevo.", 500);
  }
}
