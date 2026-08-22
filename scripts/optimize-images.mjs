#!/usr/bin/env node
/**
 * Recomprime las imágenes estáticas de `public/` in-place.
 *
 * ¿Por qué existe? Porque `images.unoptimized` está activo en next.config.js:
 * el servidor NO reprocesa nada en runtime (ver el comentario largo ahí), así
 * que el archivo que está en disco es exactamente el que descarga el visitante.
 * Este script es el que paga ese costo una vez, en la máquina de desarrollo,
 * en vez de pagarlo el VPS en cada request.
 *
 * Reglas de diseño:
 * - **No cambia nombres ni extensiones.** Las rutas están referenciadas en el
 *   código (contentTypes.ts), en el seed y en filas de la DB de producción;
 *   renombrar a .webp rompería imágenes que hoy funcionan.
 * - **Es idempotente.** Un archivo que ya cumple el presupuesto de tamaño y
 *   dimensiones se saltea, así que correrlo dos veces no re-encodea (y no
 *   acumula pérdida generacional).
 * - **Escribe atómico** (tmp + rename) y solo si el resultado pesa menos: si
 *   una imagen ya está mejor comprimida que lo que logramos, se deja como está.
 *
 * Uso:
 *   node scripts/optimize-images.mjs --dry-run   # solo reporta, no toca nada
 *   node scripts/optimize-images.mjs             # recomprime
 */
import { readdir, stat, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET_DIR = path.join(ROOT, "public", "images");

// Mismo tope que usa el panel al subir (src/lib/media.ts): ninguna foto del
// sitio se muestra a más de ~1200 px de ancho, 2000 deja margen para retina.
const MAX_DIMENSION = 2000;

// Presupuesto de bytes por píxel para decidir si un archivo YA está bien.
// 0.15 B/px ≈ lo que da un JPEG q78: por encima de eso, hay algo que ganar.
const BUDGET_BYTES_PER_PIXEL = 0.15;

const JPEG_OPTIONS = { quality: 78, progressive: true, mozjpeg: true };
const WEBP_OPTIONS = { quality: 78, effort: 6, smartSubsample: true };
// PNG **sin pérdida** a propósito: `palette: true` recomprime muchísimo mejor,
// pero cuantiza a 256 colores. En las fotos de habitación que están guardadas
// como .png eso metía bandeo (desvío de hasta 59/255 en un canal) en las
// paredes y los cielos. Acá el PNG solo se re-empaqueta y, si hace falta, se
// reescala; la ganancia es chica pero no se toca ni un píxel de color.
const PNG_OPTIONS = { compressionLevel: 9, effort: 10, palette: false };

// Un archivo se reescribe solo si la ganancia vale la pena. Sin este umbral el
// script no converge: una imagen que ya está en su punto se re-encodea en cada
// corrida para ahorrar 200 bytes, y en JPEG cada pasada suma pérdida.
const MIN_GAIN = 0.1;

const HANDLERS = {
  ".jpg": (img) => img.jpeg(JPEG_OPTIONS),
  ".jpeg": (img) => img.jpeg(JPEG_OPTIONS),
  ".webp": (img) => img.webp(WEBP_OPTIONS),
  ".png": (img) => img.png(PNG_OPTIONS),
};

const dryRun = process.argv.includes("--dry-run");

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

function fmt(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  // sharp es una dependencia de runtime del panel; acá se usa la misma versión.
  const sharp = (await import("sharp")).default;
  // Sin caché de libvips y de a una imagen por vez: este script corre en una
  // notebook, no queremos que se coma 2 GB procesando 130 fotos.
  sharp.cache(false);
  sharp.concurrency(1);

  let before = 0;
  let after = 0;
  let touched = 0;
  let skipped = 0;

  for await (const file of walk(TARGET_DIR)) {
    const ext = path.extname(file).toLowerCase();
    const encode = HANDLERS[ext];
    if (!encode) continue; // .svg, .mp4, etc.: fuera de alcance

    const { size } = await stat(file);
    before += size;

    let meta;
    try {
      meta = await sharp(file).metadata();
    } catch (err) {
      console.warn(`!  ${path.relative(ROOT, file)}: no se pudo leer (${err.message})`);
      after += size;
      continue;
    }

    const pixels = (meta.width ?? 0) * (meta.height ?? 0);
    const oversized = (meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION;
    const overBudget = pixels > 0 && size > pixels * BUDGET_BYTES_PER_PIXEL;

    if (!oversized && !overBudget) {
      skipped += 1;
      after += size;
      continue;
    }

    const output = await encode(
      sharp(file)
        // Aplica la orientación EXIF y la limpia: si no, una foto de celular
        // recortada queda acostada al perder el metadato.
        .rotate()
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        }),
    )
      // Conserva el perfil de color. Sin esto, una foto en Display P3 se
      // reinterpreta como sRGB y se ve lavada.
      .keepIccProfile()
      .toBuffer();

    if (output.length > size * (1 - MIN_GAIN)) {
      // Ya está en su punto: recomprimirla no ahorra nada y solo degrada.
      skipped += 1;
      after += size;
      continue;
    }

    const rel = path.relative(ROOT, file);
    console.log(
      `${dryRun ? "[dry] " : ""}${rel}\n     ${fmt(size)} -> ${fmt(output.length)}` +
        `  (-${Math.round((1 - output.length / size) * 100)}%)`,
    );

    if (!dryRun) {
      const tmp = `${file}.tmp-${process.pid}`;
      try {
        await writeFile(tmp, output);
        await rename(tmp, file);
      } catch (err) {
        await unlink(tmp).catch(() => {});
        throw err;
      }
    }

    touched += 1;
    after += output.length;
  }

  console.log(
    `\n${dryRun ? "[dry-run] " : ""}${touched} recomprimidas, ${skipped} sin cambios.\n` +
      `Total: ${fmt(before)} -> ${fmt(after)} (-${Math.round((1 - after / before) * 100)}%)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
