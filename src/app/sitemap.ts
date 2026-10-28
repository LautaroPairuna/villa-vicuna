import type { MetadataRoute } from "next";

const BASE_URL = "https://villavicuna.com.ar";
const LOCALES = ["es", "en", "fr"] as const;
const DEFAULT_LOCALE = "es";

// Cada página en sus tres idiomas, con las otras versiones como alternates
// (hreflang) para que Google indexe en y fr como versiones de la misma página.
const url = (locale: string, path: string) =>
  `${BASE_URL}${locale === DEFAULT_LOCALE ? "" : `/${locale}`}${path}`;

function localizada(path: string, priority: number): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, url(l, path)]));
  return LOCALES.map((locale) => ({
    url: url(locale, path),
    changeFrequency: "monthly",
    priority: locale === DEFAULT_LOCALE ? priority : priority - 0.1,
    alternates: { languages: { ...languages, "x-default": url(DEFAULT_LOCALE, path) } },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [...localizada("", 1), ...localizada("/experiencias", 0.8)];
}
