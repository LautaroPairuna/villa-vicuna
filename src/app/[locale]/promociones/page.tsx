import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import EditorialBookButton from "@/components/EditorialBookButton";
import EditorialVideoHero from "@/components/EditorialVideoHero";
import PublicEditorialLayout from "@/components/PublicEditorialLayout";
import Reveal from "@/components/Reveal";
import {
  editorialBody,
  editorialEyebrow,
  editorialPrimaryButton,
  editorialSecondaryButton,
} from "@/components/editorialUi";
import { getSectionImages } from "@/lib/content";
import { getPublishedPromotions } from "@/lib/editorial";
import { getEffectiveValues } from "@/lib/translations";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Promociones en Villa Vicuña | Salta Capital",
  description:
    "Conocé las promociones activas de Villa Vicuña y planificá tu estadía en Salta Capital con beneficios y propuestas especiales.",
  alternates: { canonical: "/promociones" },
};

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function PromotionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "es") {
    redirect("/promociones");
  }

  const promotions = await getPublishedPromotions();
  const sectionImages = await getSectionImages();
  const intro = await getEffectiveValues(locale, [
    "promociones.eyebrow",
    "promociones.titulo",
    "promociones.descripcion",
  ]);

  return (
    <PublicEditorialLayout
      eyebrow="Promociones"
      title="Propuestas pensadas para tu estadía en Salta Capital"
      description="Encontrá promociones activas con una explicación clara de beneficios, vigencia y forma de reserva. Mantenemos esta sección enfocada en propuestas concretas, sin mezclar contenido genérico."
      hideIntro
      topHero={
        <EditorialVideoHero
          videoUrl={sectionImages.promociones_hero_video}
          posterUrl={sectionImages.hero_poster}
        />
      }
    >
      <section className="relative overflow-hidden bg-white px-2 py-4 lg:px-8 lg:py-8">
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 opacity-50 lg:block">
          <Image src="/images/fondo-carta-2.svg" alt="" fill className="object-contain" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal as="p" className={editorialEyebrow}>{intro["promociones.eyebrow"]}</Reveal>
          <Reveal
            as="h2"
            delay={100}
            duration={900}
            className="mt-5 text-3xl uppercase tracking-[0.2em] text-black md:text-5xl md:leading-[1.2]"
          >
            {intro["promociones.titulo"]}
          </Reveal>
          <Reveal as="p" delay={220} className={`mt-6 ${editorialBody}`}>
            {intro["promociones.descripcion"]}
          </Reveal>
        </div>
      </section>

      {promotions.length === 0 ? (
        <section className="relative overflow-hidden bg-white px-6 py-10">
          <div className="pointer-events-none absolute right-0 top-1/2 h-[220px] w-[220px] -translate-y-1/2 opacity-55 md:h-[360px] md:w-[360px]">
            <Image src="/images/fondo-carta-3.svg" alt="" fill className="object-contain" />
          </div>
          <p className={`relative z-10 ${editorialBody}`}>
            En este momento no hay promociones publicadas. Podés volver al{" "}
            <Link href="/" className="underline underline-offset-4">
              sitio principal
            </Link>{" "}
            o avanzar directo con tu reserva.
          </p>
        </section>
      ) : (
        <div className="space-y-16">
          {promotions.map((promotion, index) => (
            <article
              key={promotion.id}
              className="grid items-center gap-8 bg-white py-4 lg:grid-cols-12"
            >
              <Reveal
                variant={index % 2 === 0 ? "right" : "left"}
                duration={900}
                className={`relative aspect-[5/6] overflow-hidden lg:col-span-6 ${
                  index % 2 === 0 ? "lg:order-2" : ""
                }`}
              >
                {promotion.coverUrl ? (
                  <Image
                    src={promotion.coverUrl}
                    alt={promotion.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-end bg-[#17273f] p-6 text-white">
                    <p className="text-lg uppercase tracking-[0.18em]">{promotion.title}</p>
                  </div>
                )}
              </Reveal>
              <Reveal
                variant={index % 2 === 0 ? "left" : "right"}
                delay={140}
                duration={900}
                className={`relative lg:col-span-6 ${index % 2 === 0 ? "lg:order-1" : ""}`}
              >
                <div className="pointer-events-none absolute -left-10 top-1/2 hidden h-[280px] w-[280px] -translate-y-1/2 opacity-55 lg:block">
                  <Image src="/images/fondo-carta-2.svg" alt="" fill className="object-contain" />
                </div>
                <div className="relative z-10 px-2 py-6 lg:px-8">
                  <div className={`flex flex-wrap gap-3 ${editorialEyebrow}`}>
                  {formatDate(promotion.validFrom) && (
                    <span>Desde {formatDate(promotion.validFrom)}</span>
                  )}
                  {formatDate(promotion.validTo) && <span>Hasta {formatDate(promotion.validTo)}</span>}
                  </div>
                  <h2 className="mt-5 text-3xl uppercase tracking-[0.18em] text-black lg:text-[2.35rem] lg:leading-[1.35]">
                    {promotion.title}
                  </h2>
                  <p className={`mt-6 ${editorialBody}`}>{promotion.summary}</p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link href={`/promociones/${promotion.slug}`} className={editorialPrimaryButton}>
                      Ver detalle
                    </Link>
                    <EditorialBookButton
                      label={promotion.ctaLabel || "Reservar"}
                      fallbackUrl={promotion.ctaHref}
                      className={editorialSecondaryButton}
                    />
                  </div>
                </div>
              </Reveal>
            </article>
          ))}
        </div>
      )}
    </PublicEditorialLayout>
  );
}
