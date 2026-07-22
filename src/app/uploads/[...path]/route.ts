import path from "node:path";
import { createReadStream, promises as fs } from "node:fs";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";

// Sirve los archivos subidos leyéndolos directamente de UPLOADS_DIR (el volumen
// persistente montado en prod). Así el servido NO depende del static serving de
// `public/` de Next —que en algunos deploys no sirve archivos agregados en
// runtime— y funciona montando el volumen en cualquier ruta con solo apuntar
// UPLOADS_DIR. Soporta Range requests para que los videos puedan buscarse.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UPLOADS_FS_DIR = path.resolve(process.env.UPLOADS_DIR ?? "public/uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

const CACHE_CONTROL = "public, max-age=31536000, immutable";

function notFound() {
  return new Response("Not found", { status: 404 });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await ctx.params;

  // Sanea la ruta: nada de traversal ni separadores dentro de un segmento.
  const parts = segments.map((s) => decodeURIComponent(s));
  if (parts.some((s) => !s || s === "." || s === ".." || /[\\/\0]/.test(s))) {
    return notFound();
  }

  const target = path.resolve(UPLOADS_FS_DIR, ...parts);
  if (target !== UPLOADS_FS_DIR && !target.startsWith(UPLOADS_FS_DIR + path.sep)) {
    return notFound();
  }

  let stat;
  try {
    stat = await fs.stat(target);
  } catch {
    return notFound();
  }
  if (!stat.isFile()) return notFound();

  const ext = path.extname(target).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const range = req.headers.get("range");

  // Range request (seek de videos): devolvemos el tramo pedido.
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (match) {
      let start = match[1] ? Number(match[1]) : 0;
      let end = match[2] ? Number(match[2]) : stat.size - 1;
      if (Number.isNaN(start)) start = 0;
      if (Number.isNaN(end) || end >= stat.size) end = stat.size - 1;
      if (start > end || start >= stat.size) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${stat.size}` },
        });
      }
      const stream = createReadStream(target, { start, end });
      return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(end - start + 1),
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": CACHE_CONTROL,
        },
      });
    }
  }

  const stream = createReadStream(target);
  return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
