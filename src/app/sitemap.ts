import type { MetadataRoute } from "next";
import { getPublishedPromotions, getPublishedSaltaPlaces } from "@/lib/editorial";

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

// Promociones y guía de Salta existen solo en español.
const soloEs = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
  url: url(DEFAULT_LOCALE, path),
  changeFrequency: "weekly",
  priority,
});

// Se regenera cada hora, como las páginas de promociones y de Salta.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Si la base no responde (por ejemplo, durante el build), dbRead devuelve
  // listas vacías y salen igual las páginas fijas.
  const [promociones, lugares] = await Promise.all([
    getPublishedPromotions(),
    getPublishedSaltaPlaces(),
  ]);
  return [
    ...localizada("", 1),
    ...localizada("/experiencias", 0.8),
    soloEs("/promociones", 0.7),
    ...promociones.map((p) => soloEs(`/promociones/${p.slug}`, 0.6)),
    soloEs("/salta", 0.7),
    ...lugares.map((l) => soloEs(`/salta/${l.slug}`, 0.5)),
  ];
}
