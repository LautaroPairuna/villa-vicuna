// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en", "fr"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  // La detección automática por Accept-Language/cookie queda desactivada:
  // el sitio ya tiene selector manual de idioma (banderas en el Navbar), y
  // con páginas cacheadas (ISR) bajo la misma URL sin prefijo, la detección
  // automática puede "pegar" el idioma del primer visitante a esa URL para
  // todos los demás. El locale por defecto (es) siempre se sirve en las
  // rutas sin prefijo, sin importar el navegador de quien visita.
  localeDetection: false,
});
