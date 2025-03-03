// src/app/[locale]/page.tsx
import { setRequestLocale } from 'next-intl/server';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Nosotros from "@/components/Nosotros";
import Reseñas from "@/components/Reseñas";
import Menu from "@/components/Menu";
import Habitaciones from "@/components/Habitaciones";
import Contacto from "@/components/Contacto";
import WhatsappLink from '@/components/WhatsappLink';

export const metadata = {
  title: "Villa Vicuña | Salta, Argentina",
  description: "Hotel Villa Vicuña Salta es un encantador hotel boutique en una casona colonial restaurada, ubicado en el corazón de la ciudad. Disfruta de elegantes habitaciones, un jardín pintoresco y una atención cálida para una estancia inolvidable.",
  alternates: {
    canonical: "https://tusitio.com",
  },
};  

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Definimos que params es una Promise que se resuelve con un objeto que contiene locale
interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalePage({ params }: LocalePageProps) {
  // Esperamos a que params se resuelva para obtener el locale
  const { locale } = await params;

  // Habilitamos el renderizado estático configurando el locale
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

// Genera los parámetros estáticos para que Next.js sepa qué rutas generar en build
export function generateStaticParams() {
  return [
    { locale: "es" },
    { locale: "en" },
    { locale: "fr" }
  ];
}
