// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./src/i18n/routing";
import { applyTranslationOverrides } from "./src/lib/translations";

export default getRequestConfig(async ({ requestLocale }) => {
  // Awaita el requestLocale para obtener el locale real
  let locale = await requestLocale;

  // Si no se obtuvo un locale válido, se utiliza el default
  if (!locale || !routing.locales.includes(locale as "es" | "en" | "fr")) {
    locale = routing.defaultLocale;
  }

  try {
    // Mensajes base del JSON + overrides editados desde el panel (DB).
    const base = (await import(`./src/messages/${locale}.json`)).default;
    const messages = await applyTranslationOverrides(locale, base);
    return { locale, messages };
  } catch (error) {
    console.error(`No se pudieron cargar los mensajes para locale: ${locale}`, error);
    const messages = (await import(`./src/messages/${routing.defaultLocale}.json`)).default;
    return { locale: routing.defaultLocale, messages };
  }
});
