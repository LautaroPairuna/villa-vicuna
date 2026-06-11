/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = process.cwd();
const outDir = path.resolve(ROOT, 'out');
const outImages = path.resolve(outDir, 'images');
const publicImages = path.resolve(ROOT, 'public', 'images');

// Si ya existe out/images, optimizamos ahí (post-export).
// Si no, caemos a public/images (útil en dev o pre-export).
const baseDir = fs.existsSync(outImages)
  ? outImages
  : (fs.existsSync(publicImages) ? publicImages : null);

if (!baseDir) {
  process.exit(0);
}

// Ahora también incluimos .webp para poder redimensionarlas
const exts = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Solo permitimos borrar los originales (JPG/PNG) de estas carpetas
const deleteAllowed = (p) => {
  const rel = path.relative(baseDir, p).replace(/\\/g, '/');
  return rel.startsWith('habitaciones/') || rel.startsWith('reseñas/');
};

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.has(ext)) optimize(full, ext);
    }
  });
};

// Config de tamaños máximos
const DEFAULT_MAX_WIDTH = 1600;
const DEFAULT_MAX_HEIGHT = 1600;
const REVIEWS_MAX = 1200; // para /reseñas, podemos ir un poco más chicos

function getResizeTarget(rel, meta) {
  // meta.width / meta.height pueden venir undefined, así que ponemos fallback amplio
  const { width = DEFAULT_MAX_WIDTH, height = DEFAULT_MAX_HEIGHT } = meta;

  // Ejemplo: reseñas → no necesitamos más de 1200x1200
  if (rel.startsWith('reseñas/')) {
    return { width: REVIEWS_MAX, height: REVIEWS_MAX };
  }

  // Habitaciones: pueden ser un poco más grandes si las usas en hero o grillas grandes
  if (rel.startsWith('habitaciones/')) {
    return { width: DEFAULT_MAX_WIDTH, height: DEFAULT_MAX_HEIGHT };
  }

  // Por defecto
  return { width: DEFAULT_MAX_WIDTH, height: DEFAULT_MAX_HEIGHT };
}

const optimize = async (filePath, ext) => {
  try {
    const rel = path.relative(baseDir, filePath).replace(/\\/g, '/');
    const orig = fs.readFileSync(filePath);

    let img = sharp(orig);
    const meta = await img.metadata();

    const { width, height } = meta;
    const { width: maxW, height: maxH } = getResizeTarget(rel, meta);

    // Solo redimensionamos si realmente es más grande que el límite
    if ((width && width > maxW) || (height && height > maxH)) {
      img = img.resize({
        width: maxW,
        height: maxH,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Salida WebP
    const webpOut = filePath.slice(0, -ext.length) + '.webp';

    const buf = await img.webp({
      quality: 75,
      effort: 4, // un poco más de esfuerzo de compresión
    }).toBuffer();

    if (buf && buf.length > 0) {
      fs.writeFileSync(webpOut, buf);

      // Si estamos en out/images y el original es JPG/PNG y está en carpetas permitidas, lo borramos
      if (
        baseDir === outImages &&
        ext !== '.webp' &&
        deleteAllowed(filePath)
      ) {
        try {
          fs.unlinkSync(filePath);
        } catch (_) {}
      }
    }
  } catch (err) {
    console.error('Error optimizing', filePath, err);
  }
};

walk(baseDir);

// ───────────────────── .htaccess para cache ─────────────────────
// Aquí ya no dependemos de baseDir === outImages, sino de que exista out/
if (fs.existsSync(outDir)) {
  try {
    const htaccessPath = path.join(outDir, '.htaccess');
    const content = `
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 month"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.(png|jpg|jpeg|gif|svg|webp)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.(woff2|woff)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
    Header set Access-Control-Allow-Origin "*"
  </FilesMatch>
</IfModule>

# Enable Gzip/Brotli compression
<IfModule mod_brotli.c>
  BrotliCompressionQuality 5
  AddOutputFilterByType BROTLI_COMPRESS text/html text/plain text/css application/javascript application/json image/svg+xml
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json image/svg+xml
</IfModule>
`;
    fs.writeFileSync(htaccessPath, content, 'utf8');
  } catch (_) {}
}
