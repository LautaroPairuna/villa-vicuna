// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "./src/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Awaita el requestLocale para obtener el locale real
  let locale = await requestLocale;
  
  // Si no se obtuvo un locale válido, se utiliza el default
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  
  try {
    // Importa dinámicamente los mensajes para el locale solicitado
    const messages = (await import(`./src/messages/${locale}.json`)).default;
    return { locale, messages };
  } catch (error) {
    console.error(`No se pudieron cargar los mensajes para locale: ${locale}`, error);
    // Fallback a default
    const messages = (await import(`./src/messages/${routing.defaultLocale}.json`)).default;
    return { locale: routing.defaultLocale, messages };
  }
});
