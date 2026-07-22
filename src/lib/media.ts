import "server-only";
import path from "node:path";
import { promises as fs } from "node:fs";
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

// Detecta el tipo de imagen raster por magic bytes. Espeja lo que hace el
// optimizador de next/image (`detectContentType`): si esto devuelve null, la
// imagen tampoco podrá servirse por /_next/image y da el error
// "The requested resource isn't a valid image ... received null". Por eso
// validamos ACÁ, antes de crear el registro Media, y así no persistimos
// archivos rotos que después fallan al mostrarse.
function sniffRasterMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
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
  // AVIF: caja ISOBMFF "ftyp" con marca avif/avis
  if (buf.subarray(4, 8).toString("latin1") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("latin1");
    if (brand.startsWith("avif") || brand.startsWith("avis")) return "image/avif";
    // HEIC/HEIF (iPhone): es una imagen real pero next/image NO la sabe servir
    // y sharp casi nunca la decodifica sin libheif. La marcamos aparte para
    // rechazarla con un mensaje claro en vez de guardar algo irreproducible.
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

function looksLikeSvg(buf: Buffer): boolean {
  const head = buf.subarray(0, 512).toString("utf8").trimStart().toLowerCase();
  return head.startsWith("<?xml") || head.startsWith("<svg") || head.includes("<svg");
}

// Convierte un texto (slug/título) en un nombre de archivo legible: minúsculas,
// sin acentos, con guiones. Ej.: "Tren a las Nubes" -> "tren-a-las-nubes".
function slugifyName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Nombre final: "<base>-<sufijo>" para que sea legible pero único (el sufijo
// evita pisar la portada anterior y problemas de caché al reemplazar). Si no
// hay base legible, cae a un UUID.
function buildStem(baseName?: string): string {
  const slug = baseName ? slugifyName(baseName) : "";
  return slug ? `${slug}-${randomUUID().slice(0, 8)}` : randomUUID();
}

const EXT_BY_MIME: Record<string, string> = {
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

function extForVideo(file: File): string {
  const fromName = path.extname(file.name).toLowerCase();
  if (/^\.[a-z0-9]+$/.test(fromName)) return fromName;
  return EXT_BY_MIME[file.type] ?? ".bin";
}

// Escritura atómica: escribe a un archivo temporal y luego renombra. Evita que
// una escritura interrumpida (p.ej. disco lleno) deje un archivo .webp truncado
// o de 0 bytes servido públicamente pero irreproducible.
async function writeFileAtomic(dest: string, data: Buffer) {
  const tmp = `${dest}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(tmp, data);
    await fs.rename(tmp, dest);
  } catch (err) {
    await fs.rm(tmp, { force: true }).catch(() => {});
    throw err;
  }
}

/**
 * Guarda un archivo subido y crea su registro Media.
 * - Valida que el contenido sea realmente una imagen/video servible ANTES de
 *   persistir; si no, lanza un error claro (y no crea un Media roto).
 * - Imágenes raster: se reorientan, redimensionan y convierten a WebP (o se
 *   guardan tal cual si sharp no está disponible), nombrando el archivo según
 *   su contenido real, no según el nombre subido.
 * - SVG: se guarda tal cual.
 */
export async function saveUpload(
  file: File,
  subdir: string,
  opts: { alt?: string; baseName?: string } = {},
) {
  const { alt = "", baseName } = opts;
  if (!file || file.size === 0) {
    throw new Error("El archivo subido está vacío.");
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0) {
    throw new Error("El archivo subido está vacío.");
  }

  const rasterMime = sniffRasterMime(buf);
  const isSvg = file.type === "image/svg+xml" || looksLikeSvg(buf);
  const isVideo = file.type.startsWith("video/");

  if (rasterMime === "image/heic") {
    throw new Error(
      "El formato HEIC/HEIF (fotos de iPhone) no es compatible. Convertí la imagen a JPG, PNG o WebP y volvé a subirla.",
    );
  }
  if (!rasterMime && !isSvg && !isVideo) {
    throw new Error(
      "El archivo no es una imagen válida. Subí un JPG, PNG, WebP, AVIF, GIF o SVG.",
    );
  }

  const dir = path.join(UPLOADS_FS_DIR, subdir);
  await fs.mkdir(dir, { recursive: true });

  // Nombre legible (p.ej. "tren-a-las-nubes-a1b2c3d4") en vez de un UUID pelado.
  const stem = buildStem(baseName);
  const sharp = rasterMime && !isSvg ? await tryLoadSharp() : null;

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
      outName = `${stem}.webp`;
      mime = "image/webp";
    } catch (err) {
      console.warn("Falló la optimización con sharp; se guarda el original.", err);
      outBuf = buf;
      outName = `${stem}${EXT_BY_MIME[rasterMime!] ?? ".bin"}`;
      mime = rasterMime!;
    }
  } else if (isVideo) {
    outBuf = buf;
    outName = `${stem}${extForVideo(file)}`;
    mime = file.type || "application/octet-stream";
  } else if (isSvg) {
    outBuf = buf;
    outName = `${stem}.svg`;
    mime = "image/svg+xml";
  } else {
    // Imagen raster válida pero sin sharp: guardamos el original, nombrando el
    // archivo por su contenido real (no por el nombre subido) para no crear un
    // `.webp` que en realidad sea otro formato.
    outBuf = buf;
    outName = `${stem}${EXT_BY_MIME[rasterMime!] ?? ".bin"}`;
    mime = rasterMime!;
  }

  // Guarda final: nunca persistimos un buffer vacío.
  if (!outBuf || outBuf.length === 0) {
    throw new Error("No se pudo procesar la imagen (resultado vacío).");
  }

  await writeFileAtomic(path.join(dir, outName), outBuf);
  const publicPath = path.posix.join("/uploads", subdir, outName);

  return prisma.media.create({
    data: { path: publicPath, alt, width, height, mime, size: outBuf.length },
  });
}
