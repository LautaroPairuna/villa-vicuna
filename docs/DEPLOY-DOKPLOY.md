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

> **Cómo se sirven:** Next indexa `public/` una sola vez, al arrancar el server, así que
> los archivos que el panel escribe después de ese momento no los encuentra (404 hasta el
> siguiente redeploy, aunque el archivo esté en el volumen). Por eso `/uploads/...` lo
> atiende el route handler `src/app/uploads/[...path]/route.ts`, que lee del disco en cada
> request: la imagen recién subida se ve al instante. La carpeta la define `UPLOADS_DIR`
> (default `public/uploads`), y el handler lee de ahí, así que si algún día se mueve el
> volumen fuera de `public/` sigue funcionando con solo cambiar esa variable.

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

## 8. Consumo de RAM

### Qué se midió

Con el servidor de producción real (`next start`), caché de imágenes vacía —el estado
después de cada redeploy— y una carga que pide las 6 páginas (3 idiomas x 2 rutas) y
**todas** las imágenes que referencian, con el `Accept` de Chrome (el que hace que el
optimizador elija AVIF):

| | RSS pico |
|---|---|
| Con `next/image` optimizando en runtime | **1158 MB** |
| Con `images.unoptimized` + imágenes pre-comprimidas | **164 MB** |

La medición se hizo en una máquina de 4 cores; el VPS tiene menos, así que ahí el pico
era más bajo (los ~600 MB observados), pero la proporción es la misma.

### De dónde salía

De `next/image`. Por cada ancho del `srcSet` y por cada formato, sharp **decodifica la
foto original a bitmap crudo**: una de 3072x4608 son ~42 MB de RAM antes de empezar a
comprimir, y AVIF es el encoder más caro que hay. Una sola visita a `/experiencias`
disparaba 60 pedidos a `/_next/image`, y libvips los procesa en paralelo, uno por core.
Peor: la memoria que libera un hilo nativo glibc no se la devuelve al sistema operativo,
así que el RSS subía y se quedaba arriba.

Se llenaba la caché en disco (`.next/cache/images`) y bajaba... hasta el siguiente
deploy, que la borra y vuelve a empezar.

### Qué se cambió

1. **`images.unoptimized: true`** (`next.config.js`). sharp/libvips no se carga nunca en
   el camino de un request: el server solo manda el archivo que ya está en disco.

2. **Las imágenes se pre-comprimen**, que es lo que hace que el punto 1 no empeore lo que
   descarga el visitante. Los dos orígenes quedan cubiertos:
   - las que **sube el panel**: ya se convertían a WebP <=2000px con sharp (`src/lib/media.ts`);
   - las **estáticas de `/public`**: con `npm run optimize:images` (nuevo).

   El script recomprime in-place, sin cambiar nombres ni extensiones (las rutas están
   referenciadas en el código, en el seed y en filas de la DB de producción). Es
   idempotente: correrlo dos veces no re-encodea nada. **Correlo cada vez que agregues
   fotos a `/public/images`**, si no el visitante se baja el original tal cual.

   Resultado de la primera corrida: **52.6 MB -> 17.1 MB (-67%)**, sin diferencia visible
   (se comparó al 100% contra la referencia). Los `.png` se tratan **sin pérdida**: hay
   fotos de habitación guardadas como PNG y cuantizarlas a paleta les metía bandeo.

3. **Tope de heap de V8 y de arenas de glibc**, en el script `start` de `package.json`:

   ```
   MALLOC_ARENA_MAX=2 NODE_OPTIONS=--max-old-space-size=512 next start
   ```

   - `--max-old-space-size=512`: sin esto Node ve la RAM libre del VPS y deja crecer el
     heap muchísimo antes de molestarse en recolectar. Con el tope, el GC trabaja antes.
     Va en el script `start` **a propósito, no como variable de entorno en Dokploy**: si
     estuviera en el entorno también aplicaría a `next build`, y el build con 512 MB de
     heap se cae por OOM.
   - `MALLOC_ARENA_MAX=2`: glibc le da a cada hilo su propia arena de 64 MB y no las
     devuelve. Con Node + el threadpool, eso son cientos de MB de fragmentación.

4. **libvips acotado en el panel** (`src/lib/media.ts`): `sharp.cache(false)` y
   `sharp.concurrency(1)`. El panel lo usa una persona a la vez para una foto a la vez;
   así el pico de una subida es el de esa única imagen y se libera al terminar.

### Límite de memoria del contenedor (recomendado)

Conviene ponerle un techo al contenedor para que un pico nunca se lleve puesto al MySQL
compartido. En Dokploy: **servicio de la app -> Advanced -> Resources -> Memory Limit**,
poner `512 MB` (con el pico medido en 164 MB sobra margen).

Desde consola es lo mismo que:

```bash
# Ver cuánta RAM está usando cada contenedor, en vivo (Ctrl+C para salir)
docker stats --no-stream
```

Si alguna vez el contenedor se reinicia solo, esto confirma si fue OOM:

```bash
# Muestra si el último corte fue por falta de memoria (OOMKilled: true)
docker inspect --format '{{.State.OOMKilled}} {{.State.ExitCode}}' <ID_DEL_CONTENEDOR>
```

El `<ID_DEL_CONTENEDOR>` sale de `docker ps | grep villa`.

### Lo que queda pendiente (no se tocó)

- **`public/video-fondo-experiencias.mp4` pesa 90 MB.** No es RAM, es ancho de banda: 10
  visitas concurrentes a `/experiencias` son 900 MB de tránsito. No tiene versión `.webm`
  ni está comprimido. Vale la pena pasarlo por:

  ```bash
  # Recomprime el video de fondo (sin audio, que no se usa: está en muted)
  ffmpeg -i public/video-fondo-experiencias.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset slow -an public/video-fondo-experiencias-nuevo.mp4
  ```

  Después comparalo a ojo y, si está bien, reemplazá el original. Lo mismo aplica a
  `public/videos/video-home.mp4` (32 MB).

- **Los SVG del menú pesan 2.3 MB y 1.9 MB** (725 KB y 533 KB gzipeados, que es lo que
  viaja). Son vectores de CorelDRAW con el texto convertido a curvas; `next/image` nunca
  los tocó, ni antes ni ahora. Son hoy lo más pesado de la home. Se pueden reemplazar sin
  tocar código, subiendo una versión mejor desde **/admin/menu**.

- **`serverActions.bodySizeLimit` está en 50 MB.** Un server action bufferea el cuerpo
  entero en RAM antes de ejecutarse, así que subir un video de 40 MB desde el panel es un
  pico de +40 MB. Se deja así porque bajarlo rompería la subida de videos; es de una sola
  persona, en el panel, y no en la carga del sitio público.

### Lo que ya estaba y sigue valiendo

- **ISR:** el sitio público se sirve como HTML cacheado y se regenera solo cuando el panel
  guarda un cambio (o cada 24 h). No hay consulta a MySQL ni render por visita.
- **Pool MySQL chico:** `DB_CONNECTION_LIMIT` (default 3).
- **Cache-Control `immutable`** en `/images`, `/uploads`, `/videos`, `/fonts`.
- **Volumen en `/app/.next/cache`:** ya no guarda variantes de imagen (no se generan),
  pero sí la caché de ISR, así que conviene mantenerlo.

## Notas de la migración desde Apache
- Eliminados: `public/.htaccess`, `public/index.html` (eran solo para hosting estático).
- `next.config.js`: `output: "standalone"`, `next/image` reactivado.
- `scripts/optimize-images.js` ya no corre en el build (lo hace `next/image` en runtime).
