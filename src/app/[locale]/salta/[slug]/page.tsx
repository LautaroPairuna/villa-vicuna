import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PublicEditorialLayout from "@/components/PublicEditorialLayout";
import PlaceCarousel from "@/components/PlaceCarousel";
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

  // La portada abre el carrusel y después van las fotos cargadas en el panel.
  // Se filtra por URL para no repetirla si además está en el carrusel.
  //
  // El alt es siempre el nombre del lugar: el nombre de archivo que guarda el
  // panel sirve para identificar la foto al administrarla, pero como texto
  // alternativo sería peor que nada ("catedral-2-final.jpg" no describe nada).
  const slides = [
    ...(place.coverUrl ? [{ url: place.coverUrl, alt: place.title }] : []),
    ...place.images
      .filter((img) => img.url !== place.coverUrl)
      .map((img) => ({ url: img.url, alt: place.title })),
  ];

  // Con carrusel la columna de texto ocupa media pantalla y los botones no
  // entran en una línea, así que van apilados a todo su ancho. Sin fotos la
  // columna ocupa las doce y a todo el ancho quedarían enormes: ahí van en
  // línea, como en el resto del sitio.
  const ctasApilados = slides.length > 0;

  return (
    <PublicEditorialLayout eyebrow="Salta Capital" title={place.title} description={place.summary}>
      <article className="grid gap-10 bg-white lg:grid-cols-12 lg:items-stretch">
        {slides.length > 0 && (
          // El carrusel manda el alto en mobile (aspect fijo); en desktop se
          // estira con la fila del grid para empezar y terminar exactamente
          // donde empieza y termina la columna de texto. El min-h evita que
          // quede achatado cuando el lugar trae poco contenido.
          <Reveal variant="left" duration={900} className="lg:col-span-6 lg:min-h-[560px]">
            <PlaceCarousel slides={slides} className="aspect-[5/6] lg:aspect-auto lg:h-full" />
          </Reveal>
        )}

        <Reveal
          variant="right"
          delay={140}
          duration={900}
          className={`${
            slides.length > 0 ? "lg:col-span-6" : "lg:col-span-12"
          } flex flex-col justify-center px-2 py-6 lg:px-8 lg:py-0`}
        >
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
            <div className="mt-10 border-t border-[#e7ddc4] pt-8">
              <p className={editorialEyebrow}>Información útil</p>
              {/* La dirección y el botón iban uno al lado del otro, pero en
                  media columna al texto le quedaban tres renglones de dos
                  palabras. Van uno debajo del otro. */}
              <div className="mt-5 flex flex-col items-start gap-5">
                {place.address && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#17273f]/45">
                      Dirección
                    </p>
                    <p className={`mt-2 max-w-2xl ${editorialBody}`}>{place.address}</p>
                  </div>
                )}
                {place.mapsUrl && (
                  <a
                    href={place.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${editorialSecondaryButton} ${
                      ctasApilados ? "w-full text-center" : ""
                    }`}
                  >
                    Abrir en Google Maps
                  </a>
                )}
              </div>
            </div>
          )}

          <div className={`mt-10 flex gap-4 ${ctasApilados ? "flex-col" : "flex-wrap"}`}>
            <Link
              href="/"
              className={`${editorialPrimaryButton} ${ctasApilados ? "w-full text-center" : ""}`}
            >
              Ver el hotel
            </Link>
            <Link
              href="/salta"
              className={`${editorialSecondaryButton} ${ctasApilados ? "w-full text-center" : ""}`}
            >
              Volver a Salta Capital
            </Link>
          </div>
        </Reveal>
      </article>
    </PublicEditorialLayout>
  );
}
