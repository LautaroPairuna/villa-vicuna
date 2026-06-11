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

  // El driver de MySQL y el adapter solo deben cargarse en el servidor.
  serverExternalPackages: ["@prisma/adapter-mariadb", "mariadb"],
};

module.exports = withNextIntl(nextConfig);
