import "server-only";
import { UploadValidationError } from "./chunkedUpload";

/** Traduce un error de la subida a una respuesta JSON con mensaje en castellano. */
export function uploadErrorResponse(err: unknown): Response {
  if (err instanceof UploadValidationError) {
    return Response.json({ ok: false, error: err.message }, { status: err.status });
  }
  console.error("[admin] falló la subida de video:", err);
  const code = (err as { code?: string })?.code;
  if (code === "ENOSPC") {
    return Response.json(
      { ok: false, error: "El servidor se quedó sin espacio en disco. Avisá a quien administra el hosting." },
      { status: 507 },
    );
  }
  if (code === "EACCES" || code === "EPERM") {
    return Response.json(
      { ok: false, error: "El servidor no tiene permiso para guardar archivos en esa carpeta." },
      { status: 500 },
    );
  }
  // Cliente que cortó el pedido (cerró la pestaña, se cayó la red).
  if (code === "ERR_STREAM_PREMATURE_CLOSE" || /aborted/i.test(String((err as Error)?.message))) {
    return Response.json({ ok: false, error: "El trozo se interrumpió." }, { status: 499 });
  }
  return Response.json({ ok: false, error: "No se pudo guardar el video. Intentá de nuevo." }, { status: 500 });
}
