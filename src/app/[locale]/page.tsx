// src/app/[locale]/page.tsx
import { setRequestLocale } from "next-intl/server";
import PageWithLoading from "@/components/PageWithLoading";
import {
  getRoomsContent,
  getReviewsContent,
  getSectionImages,
} from "@/lib/content";

// El SEO (title, description, canonical por idioma, hreflang, OG, favicons)
// se define una sola vez en generateMetadata del layout.

// ISR: la página se sirve estática (cacheada) y se regenera de la DB solo
// cuando el panel guarda un cambio (revalidatePath) o cada `revalidate` seg.
// Así no se consulta MySQL ni se renderiza en cada visita → mínimo consumo.
export const revalidate = 86400; // 24 h (red de seguridad; el panel revalida al instante)

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [rooms, reviews, sections] = await Promise.all([
    getRoomsContent(),
    getReviewsContent(),
    getSectionImages(),
  ]);

  return <PageWithLoading rooms={rooms} reviews={reviews} sections={sections} />;
}

/* NO pre-renderizamos en el build. El build de Docker corre SIN acceso a la
   base (ver los try/catch en src/lib/content.ts y translations.ts), así que
   prehornear acá dejaría la home con el texto base del JSON hasta el próximo
   revalidate/guardado. Devolviendo [] la página se genera on-demand en la
   primera visita —ya en runtime, con la DB disponible— y luego queda cacheada
   por ISR (revalidate arriba + revalidatePath desde el panel). Es el mismo
   patrón que ya usan /promociones y /salta. dynamicParams (true por defecto)
   permite es | en | fr; el locale lo valida el layout con notFound(). */
export function generateStaticParams() {
  return [];
}
