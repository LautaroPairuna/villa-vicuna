import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PublicEditorialLayout from "@/components/PublicEditorialLayout";
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
          <div className="relative aspect-[5/6] overflow-hidden lg:col-span-6">
            <Image src={place.coverUrl} alt={place.title} fill sizes="50vw" className="object-cover" />
          </div>
        )}

        <div className={`${place.coverUrl ? "lg:col-span-6" : "lg:col-span-12"} relative px-2 py-4 lg:px-8`}>
          <div className="pointer-events-none absolute -left-10 top-1/3 hidden h-[280px] w-[280px] opacity-55 lg:block">
            <Image src="/images/fondo-carta-3.svg" alt="" fill className="object-contain" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.24em] text-[#17273f]/45">
              <span>{place.category}</span>
              {place.distanceFromHotel && <span>{place.distanceFromHotel}</span>}
              {place.recommendedDuration && <span>{place.recommendedDuration}</span>}
            </div>

            <div className="mt-8 space-y-6 text-base leading-8 text-[#17273f]/78">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {(place.address || place.mapsUrl) && (
              <div className="relative mt-10 overflow-hidden bg-white px-6 py-8">
                <div className="pointer-events-none absolute right-0 top-1/2 h-[220px] w-[220px] -translate-y-1/2 opacity-55 md:h-[320px] md:w-[320px]">
                  <Image src="/images/fondo-carta-6.svg" alt="" fill className="object-contain" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#17273f]/45">Información útil</p>
                  {place.address && (
                    <p className="mt-4 max-w-2xl text-base leading-8 text-[#17273f]/72">
                      <strong className="text-[#17273f]">Dirección:</strong> {place.address}
                    </p>
                  )}
                  {place.mapsUrl && (
                    <a
                      href={place.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex rounded-full border border-[#17273f]/10 bg-[#e3d6b5] px-6 py-3 text-xs uppercase tracking-[0.22em] text-[#17273f] transition-all hover:bg-[#d9c8a0]"
                    >
                      Abrir en Google Maps
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/salta"
                className="rounded-full border border-[#17273f]/10 bg-[#e3d6b5] px-6 py-3 text-xs uppercase tracking-[0.22em] text-[#17273f] transition-all hover:bg-[#d9c8a0]"
              >
                Volver a Salta Capital
              </Link>
              <Link
                href="/"
                className="rounded-full bg-[#17273f] px-6 py-3 text-xs uppercase tracking-[0.22em] text-white transition-all hover:bg-[#24395c]"
              >
                Ver el hotel
              </Link>
            </div>
          </div>
        </div>
      </article>
    </PublicEditorialLayout>
  );
}
