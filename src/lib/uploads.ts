import "server-only";
import path from "node:path";

// Carpeta del sistema donde se escriben los uploads (volumen persistente en
// prod montado en /app/public/uploads). Las imágenes se sirven en /uploads.
// El `turbopackIgnore` evita que el tracer del build interprete este resolve
// como una lectura dinámica del proyecto y termine trazándolo entero.
export const UPLOADS_FS_DIR = path.resolve(
  /* turbopackIgnore: true */ process.env.UPLOADS_DIR ?? "public/uploads",
);

// Prefijo público bajo el que se sirven (ver src/app/uploads/[...path]/route.ts).
export const UPLOADS_URL_PREFIX = "/uploads";

const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export function mimeForPath(filePath: string): string {
  return MIME_BY_EXT[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

/**
 * Traduce los segmentos de la URL (`/uploads/<subdir>/<archivo>`) a una ruta
 * real dentro de UPLOADS_FS_DIR. Devuelve null si el pedido intenta salirse
 * del directorio (path traversal) o trae segmentos inválidos.
 */
export function resolveUploadPath(segments: string[]): string | null {
  if (!segments.length) return null;

  const invalid = segments.some(
    (s) => !s || s === "." || s === ".." || s.includes("\0") || s.includes("/") || s.includes("\\"),
  );
  if (invalid) return null;

  const full = path.resolve(UPLOADS_FS_DIR, ...segments);
  if (full !== UPLOADS_FS_DIR && !full.startsWith(UPLOADS_FS_DIR + path.sep)) return null;

  return full;
}
