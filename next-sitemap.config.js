// next-sitemap.config.js
const BASE_URL = 'https://villavicuna.com.ar';
const LOCALES  = ['es', 'en', 'fr'];

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: BASE_URL,          // prefijo para todas las <loc>
  outDir: 'public',           // app con servidor Node: robots/sitemap van a /public
  generateRobotsTxt: true,    // también crea robots.txt
  generateIndexSitemap: false, // ⟵  un único sitemap, sin sitemap-index
  changefreq: 'daily',
  priority: 0.8,

  // -------- ❶ rutas que NO detecta automáticamente --------
  additionalPaths: async (config) => {
    const lastmod = new Date().toISOString();

    return [
      {
        loc: '/',             // raíz sin prefijo de idioma
        lastmod,
        changefreq: 'daily',
        priority: 1.0,
      },
      ...LOCALES.map((l) => ({
        loc: `/${l}`,         // /es  /en  /fr
        lastmod,
        changefreq: 'daily',
        priority: 0.8,
      })),
    ];
  },

  // -------- ❷ ajustes del robots.txt --------
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
    additionalSitemaps: [`${BASE_URL}/sitemap.xml`],
  },
};
