// next.config.js
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n.ts"); // Note this path

/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: "/fonts/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Content-Type", value: "application/font-woff2" },
        { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "X-Requested-With" },
      ],
    },
  ],
};

module.exports = withNextIntl(nextConfig);