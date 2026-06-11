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

## 6. Build local / pruebas

```bash
# Levantar MySQL local + app
docker build -t villa-vicuna .
docker run --env-file .env -p 3000:3000 villa-vicuna
```

## Notas de la migración desde Apache
- Eliminados: `public/.htaccess`, `public/index.html` (eran solo para hosting estático).
- `next.config.js`: `output: "standalone"`, `next/image` reactivado.
- `scripts/optimize-images.js` ya no corre en el build (lo hace `next/image` en runtime).
