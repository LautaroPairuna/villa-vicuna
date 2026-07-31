import "server-only";
import path from "node:path";
import { promises as fs, createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import { randomUUID } from "node:crypto";
import { prisma } from "./prisma";

// Carpeta del sistema donde se escriben los uploads (volumen persistente en
// prod montado en /app/public/uploads). Las imágenes se sirven en /uploads.
const UPLOADS_FS_DIR = path.resolve(process.env.UPLOADS_DIR ?? "public/uploads");

const MAX_DIMENSION = 2000;
type SharpFn = typeof import("sharp");

// Carga sharp de forma perezosa y tolerante: si el binario nativo no carga
// (p.ej. problemas de sharp en Windows), devolvemos null y guardamos el
// original sin convertir, en vez de romper la subida.
async function tryLoadSharp(): Promise<SharpFn | null> {
  try {
    const mod = await import("sharp");
    return (mod as unknown as { default?: SharpFn }).default ?? (mod as unknown as SharpFn);
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
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
  };
  return byMime[file.type] ?? ".bin";
}

// Detecta el tipo de imagen raster por magic bytes, sin confiar en el
// `file.type` declarado por el navegador (puede venir mal, o un HEIC
// renombrado a .jpg). Si devuelve null y tampoco es SVG, no es una imagen
// servible: sharp puede tirar un error nativo no controlable (crashea el
// proceso) en vez de un rechazo prolijo, así que se valida ANTES de tocarla.
function sniffRasterMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  // GIF: "GIF87a" / "GIF89a"
  if (buf.subarray(0, 3).toString("latin1") === "GIF") return "image/gif";
  // WebP: "RIFF"????"WEBP"
  if (
    buf.subarray(0, 4).toString("latin1") === "RIFF" &&
    buf.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "image/webp";
  }
  // AVIF / HEIC: caja ISOBMFF "ftyp" con marca de formato en offset 8.
  if (buf.subarray(4, 8).toString("latin1") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("latin1");
    if (brand.startsWith("avif") || brand.startsWith("avis")) return "image/avif";
    // HEIC/HEIF (fotos de iPhone): es una imagen real, pero sharp casi nunca
    // la decodifica sin libheif instalado. Se marca aparte para rechazarla
    // con un mensaje claro en vez de dejar que sharp falle de forma rara.
    if (
      brand.startsWith("heic") ||
      brand.startsWith("heif") ||
      brand.startsWith("mif1") ||
      brand.startsWith("msf1")
    ) {
      return "image/heic";
    }
  }
  return null;
}

// Escribe el archivo a disco en streaming (por chunks), sin materializar el
// contenido completo en un Buffer. Clave para videos grandes: el pico de RAM
// es de unos pocos KB en vez del tamaño del archivo.
async function streamToDisk(file: File, dest: string): Promise<void> {
  const webStream = file.stream() as unknown as NodeWebReadableStream<Uint8Array>;
  await pipeline(Readable.fromWeb(webStream), createWriteStream(dest));
}

/**
 * Guarda un archivo subido y crea su registro Media.
 * - Imágenes (no SVG) con sharp: se valida el contenido real (magic bytes) y
 *   se rechazan formatos no servibles (HEIC/HEIF u otros) ANTES de pasarlas
 *   por sharp, porque un buffer no soportado puede hacerlo fallar de forma
 *   no controlada. Las válidas se reorientan, redimensionan y convierten a WebP.
 * - Videos / SVG / sin sharp: se streamean a disco sin cargar todo en RAM.
 */
export async function saveUpload(file: File, subdir: string, alt = "") {
  if (!file || file.size === 0) {
    throw new Error("Archivo vacío");
  }

  const dir = path.join(UPLOADS_FS_DIR, subdir);
  await fs.mkdir(dir, { recursive: true });

  const ext = extFromFile(file);
  const isImage = file.type.startsWith("image/");
  const isSvg = file.type === "image/svg+xml" || ext === ".svg";

  let outName: string;
  let width: number | undefined;
  let height: number | undefined;
  let mime: string;
  let size: number;

  if (isImage && !isSvg) {
    // Imágenes: sharp necesita los bytes en memoria (están acotadas en tamaño).
    const input = Buffer.from(await file.arrayBuffer());

    const rasterMime = sniffRasterMime(input);
    if (rasterMime === "image/heic") {
      throw new Error(
        "El formato HEIC/HEIF (fotos de iPhone) no es compatible. Convertí la imagen a JPG, PNG o WebP y volvé a subirla.",
      );
    }
    if (!rasterMime) {
      throw new Error("El archivo no es una imagen válida. Subí un JPG, PNG, WebP, AVIF o GIF.");
    }

    const sharp = await tryLoadSharp();
    if (sharp) {
      try {
        const result = await sharp(input)
          .rotate()
          .resize({
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toBuffer({ resolveWithObject: true });

        outName = `${randomUUID()}.webp`;
        await fs.writeFile(path.join(dir, outName), result.data);
        width = result.info.width;
        height = result.info.height;
        mime = "image/webp";
        size = result.data.length;
      } catch (err) {
        console.warn("Falló la optimización con sharp; se guarda el original.", err);
        outName = `${randomUUID()}${ext}`;
        await fs.writeFile(path.join(dir, outName), input);
        mime = rasterMime;
        size = input.length;
      }
    } else {
      outName = `${randomUUID()}${ext}`;
      await fs.writeFile(path.join(dir, outName), input);
      mime = rasterMime;
      size = input.length;
    }
  } else {
    // Videos, SVG o sin sharp: streaming directo a disco (sin buffer completo).
    outName = `${randomUUID()}${ext}`;
    await streamToDisk(file, path.join(dir, outName));
    mime = file.type || "application/octet-stream";
    size = file.size;
  }

  const publicPath = path.posix.join("/uploads", subdir, outName);

  return prisma.media.create({
    data: { path: publicPath, alt, width, height, mime, size },
  });
}
