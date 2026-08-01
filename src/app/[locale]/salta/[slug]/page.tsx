import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PublicEditorialLayout from "@/components/PublicEditorialLayout";
import Reveal from "@/components/Reveal";
import {
  editorialBody,
  editorialEyebrow,
  editorialPrimaryButton,
  editorialSecondaryButton,
} from "@/components/editorialUi";
import { getSaltaPlaceBySlug } from "@/lib/editorial";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (locale !== "es") {
    return {};
  }

  const place = await getSaltaPlaceBySlug(slug);
  if (!place) {
    return {};
  }

  return {
    title: place.seoTitle || `${place.title} | Qué hacer en Salta Capital`,
    description: place.seoDescription || place.summary,
    alternates: { canonical: `/salta/${place.slug}` },
  };
}

export default async function SaltaPlacePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (locale !== "es") {
    redirect(`/salta/${slug}`);
  }

  const place = await getSaltaPlaceBySlug(slug);
  if (!place) {
    notFound();
  }

  const paragraphs = place.content.split(/\n{2,}/).filter(Boolean);

  return (
    <PublicEditorialLayout eyebrow="Salta Capital" title={place.title} description={place.summary}>
      <article className="grid gap-10 bg-white lg:grid-cols-12 lg:items-start">
        {place.coverUrl && (
          <Reveal variant="left" duration={900} className="relative aspect-[5/6] overflow-hidden lg:col-span-6">
            <Image src={place.coverUrl} alt={place.title} fill sizes="50vw" unoptimized className="object-cover" />
          </Reveal>
        )}

        <Reveal
          variant="right"
          delay={140}
          duration={900}
          className={`${place.coverUrl ? "lg:col-span-6" : "lg:col-span-12"} relative px-2 py-4 lg:px-8`}
        >
          <div className="pointer-events-none absolute -left-10 top-1/3 hidden h-[280px] w-[280px] opacity-55 lg:block">
            <Image src="/images/fondo-carta-3.svg" alt="" fill className="object-contain" />
          </div>
          <div className="relative z-10">
            <div className={`flex flex-wrap gap-x-4 gap-y-2 ${editorialEyebrow}`}>
              <span>{place.category}</span>
              {place.distanceFromHotel && <span>{place.distanceFromHotel}</span>}
              {place.recommendedDuration && <span>{place.recommendedDuration}</span>}
            </div>

            <div className={`mt-8 space-y-6 ${editorialBody}`}>
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {(place.address || place.mapsUrl) && (
              <div className="relative mt-10 border-t border-[#e7ddc4] pt-8">
                <div className="pointer-events-none absolute right-0 top-1/2 h-[220px] w-[220px] -translate-y-1/2 opacity-55 md:h-[320px] md:w-[320px]">
                  <Image src="/images/fondo-carta-6.svg" alt="" fill className="object-contain" />
                </div>
                <div className="relative z-10">
                  <p className={editorialEyebrow}>Información útil</p>
                  <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <div>
                      {place.address && (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.28em] text-[#17273f]/45">
                            Dirección
                          </p>
                          <p className={`mt-2 max-w-2xl ${editorialBody}`}>{place.address}</p>
                        </div>
                      )}
                    </div>
                    {place.mapsUrl && (
                      <a
                        href={place.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={editorialSecondaryButton}
                      >
                        Abrir en Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/salta" className={editorialSecondaryButton}>
                Volver a Salta Capital
              </Link>
              <Link href="/" className={editorialPrimaryButton}>
                Ver el hotel
              </Link>
            </div>
          </div>
        </Reveal>
      </article>
    </PublicEditorialLayout>
  );
}
