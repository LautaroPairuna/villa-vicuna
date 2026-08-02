# Despliegue en VPS con Dokploy

Esta app dejó de ser un export estático (Apache) y ahora corre como **servidor Next.js**,
con **MySQL** y un **volumen persistente** para las imágenes subidas desde el panel.

El build lo hace **Railpack** (el builder de Dokploy). No hay `Dockerfile` en el repo: el
proyecto se detecta como app Node y se construye con `npm run build`.

## 1. Servicios en Dokploy

Creá un proyecto con dos servicios:

### a) Base de datos — MySQL (o MariaDB)
- Tipo: **MySQL** (Dokploy lo provisiona como contenedor).
- Anotá: usuario, password, nombre de DB y el **host interno** (normalmente el nombre del
  servicio, p.ej. `mysql`).

### b) Aplicación — esta repo
- Build type: **Railpack**.
- Puerto interno: **3000**.
- Start command: `npm run start` (corre `prisma migrate deploy` y después `next start`).

## 2. Variables de entorno (servicio de la app)

Copiá de `.env.example`:

```
DATABASE_URL=mysql://USUARIO:PASSWORD@HOST_INTERNO:3306/NOMBRE_DB
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://villavicuna.com.ar
UPLOADS_DIR=./public/uploads
DB_CONNECTION_LIMIT=3
```

> `DATABASE_URL` debe usar el **host interno** del servicio MySQL, no `localhost`.

## 3. El build no tiene acceso a la base (y no lo necesita)

Con Railpack en Dokploy, **el build no puede leer MySQL**, por dos motivos independientes:

1. Las variables de entorno del servicio son de **runtime**: no se inyectan en el build.
2. El contenedor de build **no está en `dokploy-network`**, así que el host interno del
   servicio MySQL ni siquiera resuelve.

Por eso la app está pensada para construirse sin base:

- Las páginas públicas devuelven `generateStaticParams() => []`. **No se prehornean en el
  build**: se generan on-demand en el primer request —ya con la base disponible— y quedan
  cacheadas por ISR. Si se prehornearan, quedaría cacheado el contenido base y el sitio
  mostraría las fotos viejas después de cada deploy.
- Las lecturas de contenido caen a `STATIC_SECTION_IMAGES` y a los JSON de mensajes si la
  consulta falla, así el sitio nunca se cae por un problema de MySQL.

Cuando una lectura cae al contenido base queda registrada en el log del contenedor:

```
[content] "imágenes de secciones": no se pudo leer de la base, se sirve el contenido base. ...
```

Verla **durante el build** es lo esperado. Verla **en runtime** significa que la app no
está llegando a MySQL: revisá `DATABASE_URL` y el servicio de la base.

> No intentes darle acceso a la base al build. La única forma sería exponer MySQL en un
> puerto del host (o usar una base externa accesible por internet) solo por los segundos
> que dura el build. No vale la pena.

## 4. Volumen persistente (imágenes)

En el servicio de la app, montá un volumen en la carpeta a la que apunte `UPLOADS_DIR`
(por defecto `public/uploads`, dentro del directorio de la app).

Ahí se guardan las imágenes que se suban desde el panel. Se sirven bajo `/uploads/...` a
través de una route handler, así que no hace falta redeploy para que se vean.
**Sin este volumen, las imágenes se pierden en cada redeploy.**

## 5. Dominio y TLS

Asigná el dominio (`villavicuna.com.ar`) en Dokploy; el proxy (Traefik) gestiona el
certificado Let's Encrypt automáticamente. El redirect `/es → /` lo hace `next.config.js`
(ya no hace falta `.htaccess`).

## 6. Migraciones y seed

- **Migraciones:** el script `start` corre `prisma migrate deploy` en cada arranque
  (idempotente). La migración inicial (`prisma/migrations/0_init`) crea las tablas.
- **Seed inicial** (una sola vez, para cargar las imágenes actuales): desde una shell del
  contenedor o localmente apuntando a la DB de prod:

  ```bash
  npm run prisma:seed
  ```

## 7. Panel administrativo (`/admin`)

- Login en `https://villavicuna.com.ar/admin` (NextAuth + credenciales).
- Crear el usuario admin (una vez):

  ```bash
  ADMIN_EMAIL=tu@email.com ADMIN_PASSWORD=tu-clave npm run prisma:seed:admin
  ```

- Variables necesarias: `AUTH_SECRET` (obligatoria) y `AUTH_URL` (URL pública).
- Desde el panel se editan las imágenes y videos de **secciones** (hero, nosotros,
  contacto, menú, experiencias), **habitaciones** y **reseñas** (portada + carrusel, con
  reordenamiento), además de los textos en los 3 idiomas.
- Las imágenes subidas se optimizan a WebP (`sharp`) y se guardan en el volumen,
  sirviéndose en `/uploads/...`.
- El sitio público es **ISR**: al guardar, el panel revalida las rutas afectadas (las 3
  variantes de idioma), así que los cambios se ven al instante.

## 8. Build local / pruebas

```bash
npm ci
npx prisma generate
npm run build
npm run start          # para las migraciones sí necesita una DATABASE_URL alcanzable
```

El build funciona sin base (ver punto 3), pero `DATABASE_URL` tiene que estar **definida**
igual: Prisma la valida al instanciar el cliente.

## 9. Optimización de consumo (CPU / RAM / ancho de banda)

- **ISR (no dinámico):** el sitio público se sirve como HTML cacheado y solo se regenera
  de MySQL cuando el panel guarda un cambio (o cada 24 h). No hay consulta a la base ni
  render en cada visita → CPU casi nula por request.
- **Pool MySQL chico:** `DB_CONNECTION_LIMIT` (default 3). Subilo solo si hace falta.
- **Caché de imágenes de Next:** montá un volumen en `.next/cache` para no re-optimizar
  las imágenes después de cada deploy.
- **Cache-Control largo** (`immutable`) en `/images`, `/uploads`, `/videos`, `/fonts`
  → el navegador no las vuelve a descargar (ahorra ancho de banda del VPS).
- **Variantes de imagen acotadas** (`deviceSizes`/`imageSizes`) → menos CPU y disco.
- **Video del hero:** es lo más pesado en ancho de banda. Ya está `video-home.webm`
  (más liviano que el mp4); mantené los dos y comprimí bien los videos nuevos.
- **framer-motion fuera de la carga inicial:** las animaciones de scroll son CSS
  (`<Reveal>`), y los modales que sí usan la librería se cargan recién al abrirse.
- Memoria del contenedor: el server arranca en ~100-150 MB. Si tu VPS es muy chico,
  podés limitar Node con `NODE_OPTIONS=--max-old-space-size=512`.

## Notas de la migración desde Apache
- Eliminados: `public/.htaccess`, `public/index.html` (eran solo para hosting estático).
- `next/image` reactivado; `scripts/optimize-images.js` ya no corre en el build (lo hace
  `next/image` en runtime).
