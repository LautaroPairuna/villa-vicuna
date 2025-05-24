// src/app/[locale]/page.tsx
import { setRequestLocale } from 'next-intl/server';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Nosotros from "@/components/Nosotros";
import Reseñas from "@/components/Reseñas";
import Menu from "@/components/Menu";
import Habitaciones from "@/components/Habitaciones";
import WhatsappLink from '@/components/WhatsappLink';
import Contacto from "@/components/ContactoClient";

// Importamos el componente Contacto como cliente
export const metadata = {
  title: "Villa Vicuña | Salta, Argentina",
  description: "Hotel Villa Vicuña Salta es un encantador hotel boutique en una casona colonial restaurada, ubicado en el corazón de la ciudad. Disfruta de elegantes habitaciones, un jardín pintoresco y una atención cálida para una estancia inolvidable.",
  alternates: { canonical: "https://tusitio.com" },
};

export const viewport = { width: "device-width", initialScale: 1 };

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <Hero />
        <Nosotros />
        <Reseñas />
        <Menu />
        <Habitaciones />
      </main>
      <WhatsappLink />
      <footer>
        <Contacto />
      </footer>
    </>
  );
}

export function generateStaticParams() {
  return [
    { locale: "es" },
    { locale: "en" },
    { locale: "fr" }
  ];
}
