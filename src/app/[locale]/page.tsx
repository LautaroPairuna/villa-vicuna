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

/* Rutas estáticas para SSG de los locales */
export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }, { locale: "fr" }];
}
