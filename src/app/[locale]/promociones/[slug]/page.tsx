import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import EditorialBookButton from "@/components/EditorialBookButton";
import PublicEditorialLayout from "@/components/PublicEditorialLayout";
import Reveal from "@/components/Reveal";
import {
  editorialBody,
  editorialEyebrow,
  editorialPrimaryButton,
  editorialSecondaryButton,
} from "@/components/editorialUi";
import { getPromotionBySlug } from "@/lib/editorial";

export const revalidate = 3600;

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (locale !== "es") {
    return {};
  }

  const promotion = await getPromotionBySlug(slug);
  if (!promotion) {
    return {};
  }

  return {
    title: promotion.seoTitle || `${promotion.title} | Promociones Villa Vicuña`,
    description: promotion.seoDescription || promotion.summary,
    alternates: { canonical: `/promociones/${promotion.slug}` },
  };
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (locale !== "es") {
    redirect(`/promociones/${slug}`);
  }

  const promotion = await getPromotionBySlug(slug);
  if (!promotion) {
    notFound();
  }

  const paragraphs = promotion.content.split(/\n{2,}/).filter(Boolean);

  return (
    <PublicEditorialLayout
      eyebrow="Promociones"
      title={promotion.title}
      description={promotion.summary}
    >
      <article className="grid gap-10 bg-white lg:grid-cols-12 lg:items-stretch">
        {promotion.coverUrl && (
          // La foto manda el alto en mobile (aspect fijo); en desktop se estira
          // con la fila del grid para empezar y terminar exactamente donde
          // empieza y termina la columna de texto. El min-h evita que quede
          // achatada cuando la promo trae poco contenido.
          <Reveal
            variant="left"
            duration={900}
            className="relative aspect-[5/6] w-full overflow-hidden lg:col-span-6 lg:aspect-auto lg:min-h-[560px]"
          >
            <Image
              src={promotion.coverUrl}
              alt={promotion.title}
              fill
              sizes="50vw"
              unoptimized={promotion.coverUrl.startsWith("/uploads/")}
              className="object-cover"
            />
          </Reveal>
        )}

        <Reveal
          variant="right"
          delay={140}
          duration={900}
          className={`${
            promotion.coverUrl ? "lg:col-span-6" : "lg:col-span-12"
          } flex flex-col justify-center px-2 py-6 lg:px-8 lg:py-0`}
        >
          <div className={`flex flex-wrap gap-x-6 gap-y-1 ${editorialEyebrow}`}>
            {formatDate(promotion.validFrom) && <span>Desde {formatDate(promotion.validFrom)}</span>}
            {formatDate(promotion.validTo) && <span>Hasta {formatDate(promotion.validTo)}</span>}
          </div>

          <div className={`mt-8 space-y-6 ${editorialBody}`}>
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {/* Los dos botones van apilados y a todo el ancho de la columna: las
              etiquetas se cargan desde el panel, así que no se puede confiar en
              que entren los dos en una línea. Apilados quedan siempre del mismo
              ancho y alineados con la foto. */}
          <div className="mt-10 flex flex-col gap-4">
            <EditorialBookButton
              label={promotion.ctaLabel || "Reservar"}
              fallbackUrl={promotion.ctaHref}
              className={`${editorialPrimaryButton} w-full text-center`}
              wrapperClassName="w-full"
            />
            <Link href="/promociones" className={`${editorialSecondaryButton} w-full text-center`}>
              Volver a promociones
            </Link>
          </div>
        </Reveal>
      </article>
    </PublicEditorialLayout>
  );
}
