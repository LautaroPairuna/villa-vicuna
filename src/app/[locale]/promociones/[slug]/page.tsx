import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import EditorialBookButton from "@/components/EditorialBookButton";
import PublicEditorialLayout from "@/components/PublicEditorialLayout";
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
      <article className="grid gap-10 bg-white lg:grid-cols-12 lg:items-start">
        {promotion.coverUrl && (
          <div className="relative aspect-[5/6] overflow-hidden lg:col-span-6">
            <Image src={promotion.coverUrl} alt={promotion.title} fill sizes="50vw" className="object-cover" />
          </div>
        )}

        <div className={`${promotion.coverUrl ? "lg:col-span-6" : "lg:col-span-12"} relative px-2 py-4 lg:px-8`}>
          <div className="pointer-events-none absolute -left-10 top-1/3 hidden h-[280px] w-[280px] opacity-55 lg:block">
            <Image src="/images/fondo-carta-3.svg" alt="" fill className="object-contain" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.24em] text-[#17273f]/45">
            {formatDate(promotion.validFrom) && <span>Desde {formatDate(promotion.validFrom)}</span>}
            {formatDate(promotion.validTo) && <span>Hasta {formatDate(promotion.validTo)}</span>}
            </div>

            <div className="mt-8 space-y-6 text-base leading-8 text-[#17273f]/78">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/promociones"
                className="rounded-full border border-[#17273f]/10 bg-[#e3d6b5] px-6 py-3 text-xs uppercase tracking-[0.22em] text-[#17273f] transition-all hover:bg-[#d9c8a0]"
              >
                Volver a promociones
              </Link>
              <EditorialBookButton
                label={promotion.ctaLabel || "Reservar"}
                fallbackUrl={promotion.ctaHref}
                className="rounded-full bg-[#17273f] px-6 py-3 text-xs uppercase tracking-[0.22em] text-white transition-all hover:bg-[#24395c]"
              />
            </div>
          </div>
        </div>
      </article>
    </PublicEditorialLayout>
  );
}
