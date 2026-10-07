export type VideoUploadResult = { ok: true } | { ok: false; error: string };

/**
 * Sube un video a /api/admin/upload-video como cuerpo crudo, con progreso.
 * Usa XMLHttpRequest porque fetch todavía no expone el progreso de subida.
 * El nombre y el tipo viajan en headers: el cuerpo es solo el archivo.
 */
export function uploadVideo(
  file: File,
  slug: string,
  onProgress: (percent: number) => void,
): Promise<VideoUploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload-video");
    xhr.setRequestHeader("x-slug", slug);
    xhr.setRequestHeader("x-file-name", encodeURIComponent(file.name));
    xhr.setRequestHeader("x-file-type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
    };
    xhr.onload = () => {
      let body: { ok?: boolean; error?: string } | null = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // respuesta que no es nuestra (p. ej. un proxy cortando por tamaño)
      }
      if (xhr.status >= 200 && xhr.status < 300 && body?.ok) return resolve({ ok: true });
      if (body?.error) return resolve({ ok: false, error: body.error });
      if (xhr.status === 413) {
        return resolve({
          ok: false,
          error: "El servidor rechazó el archivo por su tamaño. Si el video es grande, revisá el límite del proxy del hosting.",
        });
      }
      resolve({ ok: false, error: "No se pudo subir el video. Intentá de nuevo." });
    };
    xhr.onerror = () =>
      resolve({ ok: false, error: "Se cortó la conexión mientras se subía el video. Reintentá." });
    xhr.onabort = () => resolve({ ok: false, error: "Subida cancelada." });

    xhr.send(file);
  });
}
