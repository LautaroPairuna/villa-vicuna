import "server-only";
import path from "node:path";
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import { prisma } from "./prisma";

// Carpeta del sistema donde se escriben los uploads (volumen persistente en
// prod montado en /app/public/uploads). Las imágenes se sirven en /uploads.
const UPLOADS_FS_DIR = path.resolve(process.env.UPLOADS_DIR ?? "public/uploads");

const MAX_DIMENSION = 2000;

// Carga sharp de forma perezosa y tolerante: si el binario nativo no carga
// (p.ej. problemas de sharp en Windows), devolvemos null y guardamos el
// original sin convertir, en vez de romper la subida.
async function tryLoadSharp() {
  try {
    const mod = await import("sharp");
    return (mod.default ?? mod) as typeof import("sharp");
  } catch (err) {
    console.warn("sharp no disponible; se guarda la imagen sin optimizar.", err);
    return null;
  }
}

function extFromFile(file: File): string {
  const fromName = path.extname(file.name).toLowerCase();
  if (/^\.[a-z0-9]+$/.test(fromName)) return fromName;
  const byMime: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
  };
  return byMime[file.type] ?? ".bin";
}

/**
 * Guarda un archivo subido y crea su registro Media.
 * - SVG o sharp no disponible: se guarda tal cual.
 * - Resto: se reorienta, redimensiona y convierte a WebP.
 */
export async function saveUpload(file: File, subdir: string, alt = "") {
  if (!file || file.size === 0) {
    throw new Error("Archivo vacío");
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(UPLOADS_FS_DIR, subdir);
  await fs.mkdir(dir, { recursive: true });

  const ext = extFromFile(file);
  const isSvg = file.type === "image/svg+xml" || ext === ".svg";
  const sharp = isSvg ? null : await tryLoadSharp();

  let outName: string;
  let outBuf: Buffer;
  let width: number | undefined;
  let height: number | undefined;
  let mime: string;

  if (sharp) {
    try {
      const result = await sharp(buf)
        .rotate()
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer({ resolveWithObject: true });

      outBuf = result.data;
      width = result.info.width;
      height = result.info.height;
      outName = `${randomUUID()}.webp`;
      mime = "image/webp";
    } catch (err) {
      console.warn("Falló la optimización con sharp; se guarda el original.", err);
      outBuf = buf;
      outName = `${randomUUID()}${ext}`;
      mime = file.type || "application/octet-stream";
    }
  } else {
    // SVG o sin sharp: guardamos el archivo original.
    outBuf = buf;
    outName = `${randomUUID()}${ext}`;
    mime = file.type || "application/octet-stream";
  }

  await fs.writeFile(path.join(dir, outName), outBuf);
  const publicPath = path.posix.join("/uploads", subdir, outName);

  return prisma.media.create({
    data: { path: publicPath, alt, width, height, mime, size: outBuf.length },
  });
}
