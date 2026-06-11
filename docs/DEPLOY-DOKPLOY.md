# Despliegue en VPS con Dokploy

Esta app dejó de ser un export estático (Apache) y ahora corre como **servidor Next.js
(standalone) en Docker**, con **MySQL** y un **volumen persistente** para las imágenes
subidas desde el panel.

## 1. Servicios en Dokploy

Creá un proyecto con dos servicios:

### a) Base de datos — MySQL (o MariaDB)
- Tipo: **MySQL** (Dokploy lo provisiona como contenedor).
- Anotá: usuario, password, nombre de DB y el **host interno** (normalmente el nombre del
  servicio, p.ej. `mysql`).

### b) Aplicación — esta repo
- Build type: **Dockerfile** (ya incluido en la raíz).
- Puerto interno: **3000**.

## 2. Variables de entorno (servicio de la app)

Copiá de `.env.example`:

```
DATABASE_URL=mysql://USUARIO:PASSWORD@HOST_INTERNO:3306/NOMBRE_DB
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://villavicuna.com.ar
UPLOADS_DIR=./public/uploads
```

> `DATABASE_URL` debe usar el **host interno** del servicio MySQL, no `localhost`.

## 3. Volumen persistente (imágenes)

En el servicio de la app, montá un volumen en:

```
/app/public/uploads
```

Ahí se guardan las imágenes que se suban desde el panel. Se sirven públicamente bajo
`/uploads/...`. **Sin este volumen, las imágenes se pierden en cada redeploy.**

## 4. Dominio y TLS

Asigná el dominio (`villavicuna.com.ar`) en Dokploy; el proxy (Traefik) gestiona el
certificado Let's Encrypt automáticamente. El redirect `/ → /es/` lo hace el middleware
de next-intl (ya no hace falta `.htaccess`).

## 5. Migraciones y seed

- **Migraciones:** el `docker-entrypoint.sh` corre `prisma migrate deploy` en cada
  arranque (idempotente). La migración inicial (`prisma/migrations/0_init`) crea las tablas.
- **Seed inicial** (una sola vez, para cargar las imágenes actuales): desde una shell del
  contenedor o localmente apuntando a la DB de prod:

  ```bash
  npm run db:seed
  ```

## 6. Panel administrativo (`/admin`)

- Login en `https://villavicuna.com.ar/admin` (NextAuth + credenciales).
- Crear el usuario admin (una vez):

  ```bash
  ADMIN_EMAIL=tu@email.com ADMIN_PASSWORD=tu-clave npm run db:seed:admin
  ```

- Variables necesarias: `AUTH_SECRET` (obligatoria) y `AUTH_URL` (URL pública).
- Desde el panel se editan las imágenes de **secciones** (hero, nosotros, contacto,
  menú), **habitaciones** y **reseñas** (portada + carrusel, con reordenamiento).
- Las imágenes subidas se optimizan a WebP (`sharp`) y se guardan en el volumen
  (`/app/public/uploads`), sirviéndose en `/uploads/...`.
- El sitio público es `force-dynamic` y además se revalida al guardar, así que los
  cambios se ven al instante.

## 7. Build local / pruebas

```bash
# Levantar MySQL local + app
docker build -t villa-vicuna .
docker run --env-file .env -p 3000:3000 villa-vicuna
```

## 8. Optimización de consumo (CPU / RAM / ancho de banda)

- **ISR (no dinámico):** el sitio público se sirve como HTML estático cacheado y
  solo se regenera de MySQL cuando el panel guarda un cambio (o cada 24 h). No hay
  consulta a la base ni render en cada visita → CPU casi nula por request.
- **Pool MySQL chico:** `DB_CONNECTION_LIMIT` (default 3). Subilo solo si hace falta.
- **Caché de imágenes de Next:** montá un volumen en `/app/.next/cache` para no
  re-optimizar las imágenes después de cada deploy.
- **Cache-Control largo** (`immutable`) en `/images`, `/uploads`, `/videos`, `/fonts`
  → el navegador no las vuelve a descargar (ahorra ancho de banda del VPS).
- **Variantes de imagen acotadas** (`deviceSizes`/`imageSizes`) → menos CPU y disco.
- **Video del hero:** es lo más pesado en ancho de banda. Asegurate de subir
  `video-home.webm` (más liviano que el mp4) y, si podés, comprimilo bien.
- Memoria del contenedor: el server standalone arranca en ~100-150 MB. Si tu VPS es
  muy chico, podés limitar Node con `NODE_OPTIONS=--max-old-space-size=512`.

## Notas de la migración desde Apache
- Eliminados: `public/.htaccess`, `public/index.html` (eran solo para hosting estático).
- `next.config.js`: `output: "standalone"`, `next/image` reactivado.
- `scripts/optimize-images.js` ya no corre en el build (lo hace `next/image` en runtime).
