import "server-only";
import { revalidatePath } from "next/cache";

// Revalidación del sitio público tras un cambio en el panel. Vive acá y no en
// actions.ts porque la usan tanto las server actions como la ruta de subida de
// videos (src/app/api/admin/upload-video), y un archivo "use server" solo puede
// exportar server actions.

export function refresh() {
  // El sitio público es ISR: regeneramos las páginas por idioma al guardar,
  // así el cambio se ve al instante sin tener que renderizar en cada visita.
  for (const locale of ["es", "en", "fr"] as const) {
    revalidatePath(locale === "es" ? "/" : `/${locale}`);
  }
  revalidatePath("/admin");
}

export type EditorialKind = "promociones" | "salta" | "experiencias";

/**
 * Secciones que se publican en una página propia y no en la home.
 *
 * `refresh()` solo regenera la home, así que sin este mapeo un cambio en los
 * textos o el video de /salta, /promociones o /experiencias no se ve hasta que
 * vence el ISR de esas páginas (una hora). Se mapea tanto por id de sección
 * (lo que manda el editor de textos) como por prefijo de slug de imagen/video.
 */
const EDITORIAL_KINDS: EditorialKind[] = ["promociones", "salta", "experiencias"];

function editorialKindFor(idOrSlug: string): EditorialKind | null {
  return EDITORIAL_KINDS.find((k) => idOrSlug === k || idOrSlug.startsWith(`${k}_`)) ?? null;
}

/** refresh() + la página editorial que corresponda, si el slug es de una. */
export function refreshFor(idOrSlug: string) {
  refresh();
  const kind = editorialKindFor(idOrSlug);
  if (kind) refreshEditorial(kind);
}

export function refreshEditorial(kind: EditorialKind, slug?: string) {
  // Igual que refresh(): el público es ISR y se sirve por idioma (es sin
  // prefijo, en/fr con prefijo). Antes solo se revalidaba "/promociones" |
  // "/salta", así que las variantes /en y /fr quedaban con la caché vieja y la
  // portada/textos nuevos no aparecían hasta expirar el ISR. Revalidamos las
  // tres para que el cambio se vea al instante en todos los idiomas.
  for (const locale of ["es", "en", "fr"] as const) {
    const prefix = locale === "es" ? "" : `/${locale}`;
    revalidatePath(`${prefix}/${kind}`);
    if (slug) {
      revalidatePath(`${prefix}/${kind}/${slug}`);
    }
  }
  revalidatePath(`/admin/${kind}`);
}
