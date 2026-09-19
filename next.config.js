// next.config.js
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n.ts"); // Note this path

const ONE_YEAR = "public, max-age=31536000, immutable";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Comprime las respuestas (HTML/JSON) desde el server Node.
  compress: true,
  poweredByHeader: false,

  images: {
    // El optimizador en runtime de next/image es, de lejos, lo que más RAM
    // consumía en el VPS: por cada variante que pide un visitante, sharp
    // decodifica la foto ORIGINAL a bitmap crudo. Una de 3072x4608 son ~42 MB
    // de RAM antes de empezar a comprimir, y AVIF es el encoder más caro de
    // todos. Con varias visitas en paralelo el proceso escalaba a cientos de
    // MB que glibc después no le devuelve al sistema operativo.
    //
    // Con `unoptimized`, sharp/libvips no se carga nunca en el camino de un
    // request: el server solo manda el archivo que ya está en disco. Eso se
    // banca porque los dos orígenes de imágenes ya vienen comprimidos:
    //   - las que sube el panel -> WebP <=2000px con sharp (src/lib/media.ts),
    //   - las estáticas de /public -> `npm run optimize:images`.
    // Si alguna vez se agregan fotos a /public sin pasar por ese script, el
    // visitante se descarga el original tal cual: ese es el precio de esto.
    unoptimized: true,
  },

  // Paquetes nativos / solo-servidor que no deben bundlearse.
  serverExternalPackages: ["@prisma/adapter-mariadb", "mariadb", "sharp"],

  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },

  // Cache-Control largo para assets que no cambian (los uploads usan nombre
  // único por archivo, así que también son "immutable" de forma segura).
  async headers() {
    const longCache = [{ key: "Cache-Control", value: ONE_YEAR }];
    return [
      { source: "/videos/:path*", headers: longCache },
      { source: "/fonts/:path*", headers: longCache },
      { source: "/images/:path*", headers: longCache },
      { source: "/uploads/:path*", headers: longCache },
    ];
  },

  async redirects() {
    return [
      {
        source: "/es",
        destination: "/",
        permanent: true,
      },
      {
        source: "/es/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
