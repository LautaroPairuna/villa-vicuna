import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { mimeForPath, resolveUploadPath } from "@/lib/uploads";

// ¿Por qué existe esta ruta si los archivos ya están dentro de `public/`?
//
// En producción Next indexa el contenido de `public/` UNA sola vez, cuando
// arranca el server. Los archivos que el panel escribe después (el volumen
// montado en /app/public/uploads) no están en ese índice, así que Next les
// responde 404 hasta el siguiente redeploy: la imagen se guarda bien, se ve
// en el volumen, pero el preview del panel y el sitio quedan rotos.
//
// Este handler sirve /uploads/... leyendo del disco en cada request, con lo
// que la imagen recién subida se ve al instante. Los archivos que ya existían
// al arrancar los sigue sirviendo Next de forma estática (nunca llegan acá).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMMUTABLE = "public, max-age=31536000, immutable";

function notFound(): Response {
  // Un 404 no se debe cachear: si el archivo aparece después (o el volumen
  // se montó tarde), la imagen tiene que poder recuperarse sin esperar a que
  // expire la caché del navegador. Ojo: los headers de next.config.js tienen
  // precedencia sobre los de este handler, así que mientras `/uploads/:path*`
  // esté marcado como immutable ahí, ese valor es el que sale por la red.
  return new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
  });
}

function parseRange(header: string, size: number): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  const [, rawStart, rawEnd] = match;
  let start: number;
  let end: number;

  if (rawStart === "") {
    // Sufijo: los últimos N bytes.
    const suffix = Number(rawEnd);
    if (!rawEnd || !Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === "" ? size - 1 : Number(rawEnd);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start > end || start >= size) return null;

  return { start, end: Math.min(end, size - 1) };
}

function fileStream(filePath: string, range?: { start: number; end: number }) {
  const nodeStream = createReadStream(filePath, range);
  return Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;
}

async function handle(req: Request, segments: string[], withBody: boolean): Promise<Response> {
  const filePath = resolveUploadPath(segments);
  if (!filePath) return notFound();

  let info;
  try {
    info = await stat(filePath);
  } catch {
    return notFound();
  }
  if (!info.isFile()) return notFound();

  const etag = `"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`;
  const headers = new Headers({
    "Content-Type": mimeForPath(filePath),
    // Los nombres son UUID únicos por archivo, así que el contenido nunca
    // cambia para una misma URL. (next.config.js ya manda este mismo valor
    // para /uploads/*; se repite acá para que la ruta sea correcta por sí sola.)
    "Cache-Control": IMMUTABLE,
    "Accept-Ranges": "bytes",
    ETag: etag,
    "Last-Modified": new Date(info.mtimeMs).toUTCString(),
  });

  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }

  const rangeHeader = req.headers.get("range");
  if (rangeHeader) {
    const range = parseRange(rangeHeader, info.size);
    if (!range) {
      headers.set("Content-Range", `bytes */${info.size}`);
      return new Response(null, { status: 416, headers });
    }
    const length = range.end - range.start + 1;
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${info.size}`);
    headers.set("Content-Length", String(length));
    return new Response(withBody ? fileStream(filePath, range) : null, { status: 206, headers });
  }

  headers.set("Content-Length", String(info.size));
  return new Response(withBody ? fileStream(filePath) : null, { status: 200, headers });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: Request, ctx: Ctx): Promise<Response> {
  const { path: segments } = await ctx.params;
  return handle(req, segments ?? [], true);
}

export async function HEAD(req: Request, ctx: Ctx): Promise<Response> {
  const { path: segments } = await ctx.params;
  return handle(req, segments ?? [], false);
}
