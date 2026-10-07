// Límites de subida del panel. Módulo plano (sin server-only): lo usan tanto el
// cliente (aviso antes de subir) como la ruta de videos (tope real).

export const MB = 1024 * 1024;
export const GB = 1024 * MB;

// Imágenes: viajan en una server action, y Next arma todo el cuerpo en memoria,
// así que el tope es el bodySizeLimit de next.config.js. Mantener sincronizados.
export const MAX_IMAGE_BYTES = 50 * MB;

// Videos: viajan por streaming a disco (/api/admin/upload-video), sin pasar por
// memoria, así que el tope es de espacio y de paciencia, no de RAM.
export const MAX_VIDEO_BYTES = 5 * GB;

// A partir de acá se avisa: un video de fondo que pesa de más castiga a quien
// entra desde el celular. No bloquea, solo recomienda comprimir.
export const WARN_VIDEO_BYTES = 100 * MB;

export function formatBytes(bytes: number): string {
  if (bytes >= GB) return `${(bytes / GB).toFixed(1).replace(".", ",")} GB`;
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
