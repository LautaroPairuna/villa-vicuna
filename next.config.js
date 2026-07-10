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
    // Solo WebP: en este VPS (poca CPU/RAM) codificar AVIF en la primera
    // request de cada variante tarda segundos y consume mucha memoria. WebP
    // codifica mucho más rápido, pesa apenas más y tiene soporte universal.
    formats: ["image/webp"],
    // Acotamos las variantes que genera next/image: menos CPU y menos disco.
    deviceSizes: [360, 640, 828, 1200, 1920],
    imageSizes: [96, 200, 300],
    // Las imágenes optimizadas se cachean ~31 días.
    minimumCacheTTL: 2678400,
  },

  // Paquetes nativos / solo-servidor que no deben bundlearse.
  serverExternalPackages: ["@prisma/adapter-mariadb", "mariadb", "sharp"],

  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // Sin esto, el navegador puede seguir mostrando una copia cacheada de
    // las páginas públicas por hasta 180s tras navegar, aunque el panel ya
    // haya revalidado el ISR del lado del servidor con revalidatePath.
    // "static" no acepta 0: Next.js exige un mínimo de 30s.
    staleTimes: {
      dynamic: 0,
      static: 30,
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
