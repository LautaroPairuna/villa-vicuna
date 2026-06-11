// src/app/[locale]/page.tsx
import { setRequestLocale } from "next-intl/server";
import PageWithLoading from "@/components/PageWithLoading";

/* Metadata básico (solo se actualiza el canonical al nuevo dominio) */
export const metadata = {
  title: "Villa Vicuña | Salta, Argentina",
  description:
    "Bienvenido a Villa Vicuña Hotel Boutique. Mansión colonial del siglo XX a 250 m del centro histórico de Salta. 12 habitaciones y atención personalizada.",
  alternates: { canonical: "https://villavicuna.com.ar" },
};

/* Viewport sin cambios */
export const viewport = { width: "device-width", initialScale: 1 };

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PageWithLoading />;
}

/* Rutas estáticas para SSG */
export function generateStaticParams() {
  return [
    { locale: "es" },
    { locale: "en" },
    { locale: "fr" },
  ];
}

