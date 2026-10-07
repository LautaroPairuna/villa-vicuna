import "server-only";
import path from "node:path";
import { promises as fs, createWriteStream } from "node:fs";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import { randomUUID } from "node:crypto";
import { prisma } from "./prisma";
import { UPLOADS_FS_DIR, buildStem, extForVideo } from "./media";
import { MAX_VIDEO_BYTES, VIDEO_CHUNK_BYTES, formatBytes } from "./uploadLimits";

// Subida de videos en trozos. Cada trozo se agrega a un archivo parcial en
// <uploads>/.partial; al completar se renombra a su lugar definitivo (mismo
// volumen, así que el rename es atómico). El estado vive en disco —un .json al
// lado del parcial— para no necesitar una tabla ni una migración.

const PARTIAL_DIR = path.join(/* turbopackIgnore: true */ UPLOADS_FS_DIR, ".partial");
const UPLOAD_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

interface Meta {
  slug: string;
  fileName: string;
  mime: string;
  size: number;
  createdAt: number;
}

/** Error de validación con un mensaje apto para mostrarle al usuario. */
export class UploadValidationError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

/** El offset del trozo no coincide con lo que el servidor ya tiene. */
export class OffsetMismatchError extends Error {
  constructor(readonly received: number) {
    super("offset mismatch");
  }
}

function partPath(id: string) {
  return path.join(/* turbopackIgnore: true */ PARTIAL_DIR, `${id}.part`);
}
function metaPath(id: string) {
  return path.join(/* turbopackIgnore: true */ PARTIAL_DIR, `${id}.json`);
}

async function readMeta(id: string): Promise<Meta> {
  if (!UPLOAD_ID_RE.test(id)) throw new UploadValidationError("Subida inválida.", 400);
  try {
    return JSON.parse(await fs.readFile(metaPath(id), "utf8")) as Meta;
  } catch {
    throw new UploadValidationError("La subida venció o no existe. Empezá de nuevo.", 404);
  }
}

async function receivedBytes(id: string): Promise<number> {
  try {
    return (await fs.stat(partPath(id))).size;
  } catch {
    throw new UploadValidationError("La subida venció o no existe. Empezá de nuevo.", 404);
  }
}

// Borra subidas abandonadas (pestaña cerrada, red caída para siempre). Corre al
// iniciar otra, así no hace falta un cron.
async function sweepStale() {
  const now = Date.now();
  let names: string[] = [];
  try {
    names = await fs.readdir(PARTIAL_DIR);
  } catch {
    return;
  }
  for (const name of names) {
    const full = path.join(/* turbopackIgnore: true */ PARTIAL_DIR, name);
    const stat = await fs.stat(full).catch(() => null);
    if (stat && now - stat.mtimeMs > STALE_AFTER_MS) await fs.rm(full, { force: true });
  }
}

export async function startUpload(input: {
  slug: string;
  fileName: string;
  mime: string;
  size: number;
}) {
  const { slug, fileName, mime, size } = input;
  if (!/^[a-z0-9_-]{1,80}$/i.test(slug)) {
    throw new UploadValidationError("Falta indicar a qué sección pertenece el video.");
  }
  if (!mime.startsWith("video/")) {
    throw new UploadValidationError("El archivo debe ser un video (MP4, WebM o MOV).");
  }
  if (!Number.isFinite(size) || size <= 0) throw new UploadValidationError("El archivo está vacío.");
  if (size > MAX_VIDEO_BYTES) {
    throw new UploadValidationError(
      `El video pesa ${formatBytes(size)} y el máximo es ${formatBytes(MAX_VIDEO_BYTES)}.`,
      413,
    );
  }

  await fs.mkdir(PARTIAL_DIR, { recursive: true });
  await sweepStale();

  const id = randomUUID();
  const meta: Meta = { slug, fileName, mime, size, createdAt: Date.now() };
  await fs.writeFile(partPath(id), "");
  await fs.writeFile(metaPath(id), JSON.stringify(meta));
  return { uploadId: id, chunkSize: VIDEO_CHUNK_BYTES };
}

export async function getReceived(id: string) {
  await readMeta(id);
  return receivedBytes(id);
}

/**
 * Agrega un trozo. Exige que `offset` sea justo lo que ya hay: así un trozo
 * repetido o salteado se detecta y el cliente se resincroniza. Si el pedido se
 * corta a la mitad se deshace lo escrito, para que el parcial siempre quede
 * alineado a un trozo completo.
 */
export async function appendChunk(id: string, offset: number, body: ReadableStream<Uint8Array>) {
  const meta = await readMeta(id);
  const received = await receivedBytes(id);
  if (offset !== received) throw new OffsetMismatchError(received);

  const allowed = Math.min(VIDEO_CHUNK_BYTES, meta.size - received);
  if (allowed <= 0) throw new UploadValidationError("El video ya está completo.", 409);

  let bytes = 0;
  const limiter = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      bytes += chunk.length;
      if (bytes > allowed) cb(new UploadValidationError("El trozo supera el tamaño esperado.", 413));
      else cb(null, chunk);
    },
  });

  try {
    await pipeline(
      Readable.fromWeb(body as unknown as NodeWebReadableStream<Uint8Array>),
      limiter,
      createWriteStream(partPath(id), { flags: "a" }),
    );
  } catch (err) {
    await fs.truncate(partPath(id), received).catch(() => {});
    throw err;
  }
  return received + bytes;
}

/** Cierra la subida: verifica el tamaño, mueve el archivo y crea el Media. */
export async function completeUpload(id: string) {
  const meta = await readMeta(id);
  const received = await receivedBytes(id);
  if (received !== meta.size) {
    throw new UploadValidationError(
      `Faltan datos: llegaron ${formatBytes(received)} de ${formatBytes(meta.size)}. Reintentá la subida.`,
      409,
    );
  }

  const dir = path.join(/* turbopackIgnore: true */ UPLOADS_FS_DIR, "sections");
  await fs.mkdir(dir, { recursive: true });
  const outName = `${buildStem(meta.slug)}${extForVideo({ name: meta.fileName, type: meta.mime })}`;
  await fs.rename(partPath(id), path.join(/* turbopackIgnore: true */ dir, outName));
  await fs.rm(metaPath(id), { force: true });

  const media = await prisma.media.create({
    data: {
      path: path.posix.join("/uploads", "sections", outName),
      originalName: meta.fileName,
      alt: meta.slug,
      mime: meta.mime,
      size: meta.size,
    },
  });
  return { media, slug: meta.slug };
}
