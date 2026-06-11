import "server-only";
import path from "node:path";
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { prisma } from "./prisma";

// Carpeta del sistema donde se escriben los uploads (volumen persistente en
// Dokploy montado en /app/public/uploads). Las imágenes se sirven en /uploads.
const UPLOADS_FS_DIR = path.resolve(process.env.UPLOADS_DIR ?? "public/uploads");

const MAX_DIMENSION = 2000;

/**
 * Guarda un archivo subido y crea su registro Media.
 * - SVG: se guarda tal cual.
 * - Resto (jpg/png/webp/…): se reorienta, redimensiona y convierte a WebP.
 */
export async function saveUpload(file: File, subdir: string, alt = "") {
  if (!file || file.size === 0) {
    throw new Error("Archivo vacío");
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(UPLOADS_FS_DIR, subdir);
  await fs.mkdir(dir, { recursive: true });

  let outName: string;
  let outBuf: Buffer;
  let width: number | undefined;
  let height: number | undefined;
  let mime: string;

  if (file.type === "image/svg+xml") {
    outName = `${randomUUID()}.svg`;
    outBuf = buf;
    mime = "image/svg+xml";
  } else {
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
  }

  await fs.writeFile(path.join(dir, outName), outBuf);
  const publicPath = path.posix.join("/uploads", subdir, outName);

  return prisma.media.create({
    data: { path: publicPath, alt, width, height, mime, size: outBuf.length },
  });
}
