// next.config.js
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n.ts"); // Note this path

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Servidor Node (Dokploy/Docker) en vez de export estático.
  output: "standalone",

  // next/image vuelve a optimizar en runtime (sharp). Las imágenes subidas
  // desde el panel viven en el volumen montado en /public/uploads.
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Paquetes nativos / solo-servidor que no deben bundlearse.
  serverExternalPackages: ["@prisma/adapter-mariadb", "mariadb", "sharp"],
};

module.exports = withNextIntl(nextConfig);
