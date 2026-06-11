// next.config.js
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n.ts"); // Note this path

const ONE_YEAR = "public, max-age=31536000, immutable";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Servidor Node (Dokploy/Docker) en vez de export estático.
  output: "standalone",

  // Comprime las respuestas (HTML/JSON) desde el server Node.
  compress: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    // Acotamos las variantes que genera next/image: menos CPU y menos disco.
    deviceSizes: [360, 640, 828, 1200, 1920],
    imageSizes: [96, 200, 300],
    // Las imágenes optimizadas se cachean ~31 días.
    minimumCacheTTL: 2678400,
  },

  // Paquetes nativos / solo-servidor que no deben bundlearse.
  serverExternalPackages: ["@prisma/adapter-mariadb", "mariadb", "sharp"],

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
