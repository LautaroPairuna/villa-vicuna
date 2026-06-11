// src/app/[locale]/page.tsx
import { setRequestLocale } from "next-intl/server";
import PageWithLoading from "@/components/PageWithLoading";
import {
  getRoomsContent,
  getReviewsContent,
  getSectionImages,
} from "@/lib/content";

/* Metadata básico (solo se actualiza el canonical al nuevo dominio) */
export const metadata = {
  title: "Villa Vicuña | Salta, Argentina",
  description:
    "Bienvenido a Villa Vicuña Hotel Boutique. Mansión colonial del siglo XX a 250 m del centro histórico de Salta. 12 habitaciones y atención personalizada.",
  alternates: { canonical: "https://villavicuna.com.ar" },
};

/* Viewport sin cambios */
export const viewport = { width: "device-width", initialScale: 1 };

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
