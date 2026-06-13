import "server-only";
import { prisma } from "./prisma";
import { getSection } from "./editableContent";
import es from "../messages/es.json";
import en from "../messages/en.json";
import fr from "../messages/fr.json";

// JSON base por idioma (valores por defecto).
const BASE: Record<string, unknown> = { es, en, fr };

/* eslint-disable @typescript-eslint/no-explicit-any */
function getByPath(obj: any, path: string): unknown {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setByPath(obj: any, path: string, value: unknown) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== "object" || cur[parts[i]] == null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Mergea los overrides de la DB sobre los mensajes base. Tolerante a fallos:
// ante cualquier error devuelve los mensajes base intactos.
export async function applyTranslationOverrides(
  locale: string,
  messages: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    const rows = await prisma.translation.findMany({ where: { locale } });
    if (!rows.length) return messages;
    const merged = structuredClone(messages);
    for (const r of rows) setByPath(merged, r.key, r.value);
    return merged;
  } catch {
    return messages;
  }
}

// Valor por defecto (del JSON) para una clave.
export function baseValue(locale: string, key: string): string {
  const v = getByPath(BASE[locale] ?? BASE.es, key);
  return typeof v === "string" ? v : "";
}

// Valor efectivo (override de la DB si existe; si no, el del JSON) para un set
// de claves en un idioma.
export async function getEffectiveValues(
  locale: string,
  keys: string[],
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = baseValue(locale, k);
  try {
    const rows = await prisma.translation.findMany({
      where: { locale, key: { in: keys } },
    });
    for (const r of rows) out[r.key] = r.value;
  } catch {
    // se mantienen los valores base
  }
  return out;
}

// Carga los valores efectivos de una sección en los 3 idiomas.
export async function getSectionTexts(sectionId: string) {
  const section = getSection(sectionId);
  if (!section) return null;
  const keys = section.fields.map((f) => f.key);
  const values: Record<string, Record<string, string>> = {};
  for (const locale of ["es", "en", "fr"]) {
    values[locale] = await getEffectiveValues(locale, keys);
  }
  return { section, values };
}
