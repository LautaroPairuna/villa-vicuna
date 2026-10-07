export type VideoUploadResult = { ok: true } | { ok: false; error: string };

interface Reply {
  status: number;
  body: { ok?: boolean; error?: string; received?: number; uploadId?: string; chunkSize?: number } | null;
}

const BASE = "/api/admin/upload-video";
const MAX_RETRIES = 6;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// XMLHttpRequest y no fetch: es lo que expone el progreso de subida. status 0
// significa que el pedido no llegó (red caída, conexión cortada).
function send(
  method: string,
  url: string,
  body?: XMLHttpRequestBodyInit,
  onProgress?: (loaded: number) => void,
  json = false,
): Promise<Reply> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (json) xhr.setRequestHeader("content-type", "application/json");
    if (onProgress) xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded);
    xhr.onload = () => {
      let parsed: Reply["body"] = null;
      try {
        parsed = JSON.parse(xhr.responseText);
      } catch {
        // respuesta que no es nuestra (p. ej. un proxy cortando por tamaño)
      }
      resolve({ status: xhr.status, body: parsed });
    };
    xhr.onerror = () => resolve({ status: 0, body: null });
    xhr.onabort = () => resolve({ status: 0, body: null });
    xhr.send(body);
  });
}

/**
 * Sube un video en trozos. Cada trozo se reintenta con espera creciente, y tras
 * un fallo se le pregunta al servidor cuánto tiene para retomar desde ahí: si
 * se corta la red al 90%, no se empieza de cero.
 */
export async function uploadVideo(
  file: File,
  slug: string,
  onProgress: (percent: number) => void,
): Promise<VideoUploadResult> {
  const init = await send(
    "POST",
    BASE,
    JSON.stringify({ slug, fileName: file.name, type: file.type, size: file.size }),
    undefined,
    true,
  );
  if (!init.body?.ok || !init.body.uploadId || !init.body.chunkSize) {
    return { ok: false, error: init.body?.error ?? "No se pudo iniciar la subida. Intentá de nuevo." };
  }
  const { uploadId, chunkSize } = init.body;
  const url = `${BASE}/${uploadId}`;

  let offset = 0;
  let failures = 0;
  while (offset < file.size) {
    const end = Math.min(offset + chunkSize, file.size);
    const base = offset;
    const res = await send(
      "PUT",
      `${url}?offset=${offset}`,
      file.slice(offset, end),
      (loaded) => onProgress(Math.min(99, Math.round(((base + loaded) / file.size) * 100))),
    );

    if (res.status >= 200 && res.status < 300 && res.body?.ok) {
      offset = end;
      failures = 0;
      continue;
    }
    // El servidor ya tiene otra cosa (un trozo repetido, o uno que llegó pero
    // cuya respuesta se perdió): nos alineamos a lo que dice que recibió.
    if (res.status === 409 && typeof res.body?.received === "number") {
      offset = res.body.received;
      continue;
    }
    // Error definitivo (sesión vencida, video demasiado grande, sin disco...).
    const transient = res.status === 0 || res.status >= 500 || res.status === 408 || res.status === 429;
    if (!transient || res.status === 507) {
      return { ok: false, error: res.body?.error ?? "No se pudo subir el video. Intentá de nuevo." };
    }
    if (++failures > MAX_RETRIES) {
      return { ok: false, error: "Se cortó la conexión y no se pudo retomar. Reintentá la subida." };
    }
    await sleep(Math.min(1000 * 2 ** failures, 15000));
    const status = await send("GET", url);
    if (status.body?.ok && typeof status.body.received === "number") offset = status.body.received;
  }

  const done = await send("POST", url);
  if (done.status >= 200 && done.status < 300 && done.body?.ok) return { ok: true };
  return { ok: false, error: done.body?.error ?? "No se pudo terminar de guardar el video. Intentá de nuevo." };
}
