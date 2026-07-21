import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import FloatingEditorialActions from "@/components/FloatingEditorialActions";
import ExperiencesTapeo from "@/components/ExperiencesTapeo";
import ExperiencesFormatos from "@/components/ExperiencesFormatos";
import {
  editorialBody,
  editorialEyebrow,
  editorialPrimaryButton,
  editorialSecondaryButton,
} from "@/components/editorialUi";

// ISR: la página se sirve estática y se regenera cuando el panel guarda textos
// (saveTranslationsAction revalida estas rutas) o cada `revalidate` como red de
// seguridad. Los textos salen del sistema de traducciones (JSON + overrides DB),
// así que se editan desde /admin/experiencias en los 3 idiomas.
export const revalidate = 86400;

const LOCALES = ["es", "en", "fr"] as const;
const DEFAULT_LOCALE = "es";
const RESERVATION_URL = "https://hotels.cloudbeds.com/reservation/pwSXnD";
const FORMATOS = ["intima", "terroir", "atardecer"] as const;

function localePath(locale: string) {
  return locale === DEFAULT_LOCALE ? "/experiencias" : `/${locale}/experiencias`;
}

export function generateStaticParams() {
  // Igual que la home: no prehorneamos en el build (sin DB). Se generan on-demand
  // y quedan cacheadas por ISR. dynamicParams (true) permite es | en | fr.
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "experiences" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: localePath(locale),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localePath(l)])),
    },
    openGraph: {
      type: "website",
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: localePath(locale),
      locale,
      images: ["/opengraph.jpg"],
    },
  };
}

export default async function ExperiencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as (typeof LOCALES)[number])) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "experiences" });
  const tapeo = t.raw("tapeo") as string[];

  // Cada bocado con su foto (archivos en public/images/experiencias). El orden
  // coincide con el array `experiences.tapeo` de los mensajes.
  const TAPEO_IMAGES = [
    "/images/experiencias/profitelores-queso.jpg",
    "/images/experiencias/tartaletas-cerdo.jpg",
    "/images/experiencias/trufas-queso-almendras.jpg",
    "/images/experiencias/datiles-jamon-crudo.jpg",
  ];
  const tapeoItems = tapeo.map((name, i) => ({
    name,
    src: TAPEO_IMAGES[i] ?? "/images/placeholder.jpg",
  }));

  // Fotos por experiencia (archivos en public/images/experiencias). Se puede
  // listar más de una por formato para el carrusel del modal; la primera es la
  // portada de la tarjeta. Si un archivo falta, ImageWithFallback muestra el
  // placeholder, así el layout no se rompe hasta subir las fotos definitivas.
  const EXPERIENCE_IMAGES: Record<string, string[]> = {
    intima: ["/images/experiencias/degustacion-intima.webp"],
    terroir: ["/images/experiencias/recorrido-terroir.webp"],
    atardecer: ["/images/experiencias/atardecer-intimo.jpg"],
  };
  const formatosData = FORMATOS.map((key) => ({
    key,
    nombre: t(`formatos.${key}.nombre`),
    capacidad: t(`formatos.${key}.capacidad`),
    precio: t(`formatos.${key}.precio`),
    precioNota: t(`formatos.${key}.precioNota`),
    resumen: t(`formatos.${key}.resumen`),
    incluye: t.raw(`formatos.${key}.incluye`) as string[],
    images: EXPERIENCE_IMAGES[key] ?? ["/images/placeholder.jpg"],
  }));
  const formatosLabels = {
    incluyeLabel: t("incluyeLabel"),
    verMasLabel: t("verMas"),
    reservarLabel: t("ctaBotonPrimario"),
    reservationUrl: RESERVATION_URL,
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-16 pt-20 text-black">
        {/* Intro */}
        <section className="relative bg-white px-4 py-14 md:px-12 md:py-18">
          <div className="relative mx-auto max-w-[1200px]">
            <h1 className="mx-auto max-w-5xl text-center text-4xl uppercase tracking-[0.2em] text-black sm:text-5xl lg:text-[4.3rem] lg:leading-[1.15]">
              {t("titulo")}
            </h1>
            <p className={`mx-auto mt-8 max-w-3xl text-center ${editorialBody}`}>
              {t("descripcion")}
            </p>
            <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 tracking-[0.08em] text-black/70">
              {t("descripcion2")}
            </p>
          </div>
        </section>

        {/* Cita de la enóloga — video vertical de fondo (se muestra su franja media) */}
        <section className="relative mt-4 overflow-hidden bg-black py-24 md:py-32">
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/images/hero-poster.webp"
          >
            <source src="/video-fondo-experiencias.mp4" />
          </video>
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative mx-auto max-w-3xl px-6 text-center md:px-10">
            <p className="text-2xl italic leading-relaxed tracking-[0.06em] text-white md:text-3xl">
              “{t("quote")}”
            </p>
            <p className="mt-8 text-sm uppercase tracking-[0.22em] text-white">
              {t("quoteAuthor")}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.35em] text-white/70">
              {t("quoteRole")}
            </p>
            <Image
              src="/images/logo-barolo.svg"
              alt="Barolo · Vinos por descubrir"
              width={210}
              height={72}
              className="mx-auto mt-10 h-auto w-[130px] brightness-0 invert sm:w-[150px] md:w-[170px]"
            />
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 md:px-12">
          {/* Formatos */}
          <section className="mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className={editorialEyebrow}>{t("formatosEyebrow")}</p>
              <h2 className="mt-5 text-3xl uppercase tracking-[0.2em] text-black md:text-4xl md:leading-[1.2]">
                {t("formatosTitulo")}
              </h2>
              <p className={`mx-auto mt-6 max-w-2xl ${editorialBody} text-lg leading-7`}>
                {t("formatosDescripcion")}
              </p>
            </div>

            <ExperiencesFormatos formatos={formatosData} labels={formatosLabels} />
          </section>

          {/* Tapeo */}
          <section className="relative mt-20 overflow-hidden bg-white">
            <div className="mx-auto max-w-3xl text-center">
              <p className={editorialEyebrow}>{t("tapeoEyebrow")}</p>
              <h2 className="mt-5 text-3xl uppercase tracking-[0.2em] text-black md:text-4xl md:leading-[1.2]">
                {t("tapeoTitulo")}
              </h2>
            </div>
            <ExperiencesTapeo items={tapeoItems} />
          </section>

          {/* Info práctica */}
          <section className="mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className={editorialEyebrow}>{t("infoEyebrow")}</p>
              <h2 className="mt-5 text-3xl uppercase tracking-[0.2em] text-black md:text-4xl md:leading-[1.2]">
                {t("infoTitulo")}
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 divide-y divide-[#e3d6b5] md:grid-cols-3 md:divide-x md:divide-y-0">
              {[
                {
                  titulo: t("reservaTitulo"),
                  texto: t("reservaTexto"),
                  icon: (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </>
                  ),
                },
                {
                  titulo: t("idiomaTitulo"),
                  texto: t("idiomaTexto"),
                  icon: (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </>
                  ),
                },
                {
                  titulo: t("botellaTitulo"),
                  texto: t("botellaTexto"),
                  icon: (
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                  ),
                },
              ].map((info, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center px-6 py-8 text-center md:px-8 md:py-4"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-9 w-9 text-[#17273f]"
                    aria-hidden
                  >
                    {info.icon}
                  </svg>
                  <h3 className="mt-4 text-lg uppercase tracking-[0.16em] text-black">{info.titulo}</h3>
                  <p className="mt-3 text-base leading-7 tracking-[0.04em] text-black/70">
                    {info.texto}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA de cierre */}
          <section className="relative mt-20 overflow-hidden bg-white px-6 py-10 md:px-10 md:py-14">
            <div className="pointer-events-none absolute bottom-[-8%] right-[-6%] h-[220px] w-[220px] opacity-60 sm:h-[320px] sm:w-[320px] lg:h-[420px] lg:w-[560px]">
              <Image src="/images/fondo-carta-6.svg" alt="" fill className="object-contain" />
            </div>
            <div className="relative max-w-4xl">
              <p className={editorialEyebrow}>{t("ctaEyebrow")}</p>
              <h2 className="mt-5 text-3xl uppercase tracking-[0.2em] text-black md:text-5xl md:leading-[1.2]">
                {t("ctaTitulo")}
              </h2>
              <p className={`mt-5 max-w-3xl ${editorialBody}`}>{t("ctaTexto")}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={RESERVATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={editorialPrimaryButton}
                >
                  {t("ctaBotonPrimario")}
                </a>
                <Link
                  href={locale === DEFAULT_LOCALE ? "/" : `/${locale}`}
                  className={editorialSecondaryButton}
                >
                  {t("ctaBotonSecundario")}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <FloatingEditorialActions />
    </>
  );
}
