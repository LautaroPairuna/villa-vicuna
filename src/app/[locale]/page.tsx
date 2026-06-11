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

// Render dinámico: refleja siempre el contenido actual de la base de datos
// (las imágenes editadas desde el panel) sin necesidad de rebuild.
export const dynamic = "force-dynamic";

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
