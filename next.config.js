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
    // Las imágenes ya vienen optimizadas: las que se suben por el panel se
    // convierten a WebP con sharp (media.ts) y las estáticas se cachean fuerte
    // (headers immutable + service worker). Desactivamos la optimización en
    // runtime de next/image para NO mantener sharp/libvips cargado en el
    // servidor → bastante menos RAM.
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
};

module.exports = withNextIntl(nextConfig);
