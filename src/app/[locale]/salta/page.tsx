import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import PublicEditorialLayout from "@/components/PublicEditorialLayout";
import {
  editorialBody,
  editorialEyebrow,
  editorialPrimaryButton,
  editorialSecondaryButton,
} from "@/components/editorialUi";
import { getPublishedSaltaPlaces } from "@/lib/editorial";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Qué hacer en Salta Capital | Villa Vicuña",
  description:
    "Descubrí lugares, paseos y propuestas para hacer en Salta Capital, con foco en experiencias cercanas al centro histórico y a Villa Vicuña.",
  alternates: { canonical: "/salta" },
};

export default async function SaltaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "es") {
    redirect("/salta");
  }

  const places = await getPublishedSaltaPlaces();

  return (
    <PublicEditorialLayout
      eyebrow="Salta Capital"
      title="Qué hacer en Salta Capital durante tu estadía"
      description="Esta guía reúne lugares, paseos y experiencias dentro de Salta Capital. El foco está puesto en propuestas reales, cercanas al centro y útiles para quienes se hospedan en Villa Vicuña."
    >
      {places.length === 0 ? (
        <section className="relative overflow-hidden bg-white px-6 py-10">
          <div className="pointer-events-none absolute right-0 top-1/2 h-[220px] w-[220px] -translate-y-1/2 opacity-55 md:h-[360px] md:w-[360px]">
            <Image src="/images/fondo-carta-3.svg" alt="" fill className="object-contain" />
          </div>
          <p className={`relative z-10 ${editorialBody}`}>
            Todavía no hay lugares publicados en esta guía. Podés volver al{" "}
            <Link href="/" className="underline underline-offset-4">
              sitio principal
            </Link>{" "}
            mientras terminamos de cargar recomendaciones locales.
          </p>
        </section>
      ) : (
        <div className="space-y-16">
          {places.map((place, index) => (
            <article
              key={place.id}
              className="grid items-center gap-8 bg-white py-4 lg:grid-cols-12"
            >
              <div
                className={`relative aspect-[5/6] overflow-hidden lg:col-span-6 ${
                  index % 2 === 0 ? "lg:order-2" : ""
                }`}
              >
                {place.coverUrl ? (
                  <Image
                    src={place.coverUrl}
                    alt={place.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-end bg-[#17273f] p-6 text-white">
                    <p className="text-lg uppercase tracking-[0.18em]">{place.title}</p>
                  </div>
                )}
              </div>
              <div className={`relative lg:col-span-6 ${index % 2 === 0 ? "lg:order-1" : ""}`}>
                <div className="pointer-events-none absolute -left-10 top-1/2 hidden h-[280px] w-[280px] -translate-y-1/2 opacity-55 lg:block">
                  <Image src="/images/fondo-carta-2.svg" alt="" fill className="object-contain" />
                </div>
                <div className="relative z-10 bg-white px-2 py-6 lg:px-8">
                  <div className={`flex flex-wrap gap-3 ${editorialEyebrow}`}>
                    <span>{place.category}</span>
                    {place.distanceFromHotel && <span>{place.distanceFromHotel}</span>}
                  </div>
                  <h2 className="mt-5 text-3xl uppercase tracking-[0.18em] text-black lg:text-[2.35rem] lg:leading-[1.35]">
                    {place.title}
                  </h2>
                  <p className={`mt-6 ${editorialBody}`}>{place.summary}</p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link href={`/salta/${place.slug}`} className={editorialPrimaryButton}>
                      Ver lugar
                    </Link>
                    {place.mapsUrl && (
                      <a
                        href={place.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={editorialSecondaryButton}
                      >
                        Ver mapa
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PublicEditorialLayout>
  );
}
