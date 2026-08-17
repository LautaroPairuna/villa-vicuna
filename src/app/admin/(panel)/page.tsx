import Link from "next/link";
import { FiFilm, FiInfo, FiStar, FiBookOpen, FiPhone, FiArrowRight } from "react-icons/fi";
import { TbBed, TbGlassFull } from "react-icons/tb";
import type { IconType } from "react-icons";
import { prisma } from "@/lib/prisma";
import { DbErrorNotice } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  let dbError = false;
  let roomsCount = 0;
  let reviewsCount = 0;

  try {
    [roomsCount, reviewsCount] = await Promise.all([
      prisma.room.count(),
      prisma.review.count(),
    ]);
  } catch {
    dbError = true;
  }

  const cards: { href: string; label: string; hint: string; icon: IconType; badge?: string }[] = [
    { href: "/admin/hero", label: "Hero", hint: "Póster del video principal", icon: FiFilm },
    { href: "/admin/nosotros", label: "Nosotros", hint: "Imagen y textos", icon: FiInfo },
    { href: "/admin/habitaciones", label: "Habitaciones", hint: "Textos e imágenes por habitación", icon: TbBed, badge: String(roomsCount) },
    { href: "/admin/resenas", label: "Reseñas", hint: "Textos e imágenes por reseña", icon: FiStar, badge: String(reviewsCount) },
    { href: "/admin/menu", label: "Menú", hint: "Imágenes de la carta y textos", icon: FiBookOpen },
    { href: "/admin/contacto", label: "Contacto", hint: "Imagen y datos de contacto", icon: FiPhone },
    { href: "/admin/experiencias", label: "Experiencias", hint: "Textos, videos y fotos de la degustación Barolo", icon: TbGlassFull },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.35em] text-admin-ink-soft">Panel admin</p>
        <h1 className="mt-3 text-3xl uppercase tracking-[0.18em] text-admin-ink md:text-4xl">
          Inicio
        </h1>
        <div className="mt-4 h-px w-16 bg-admin-gold" />
      </div>

      {dbError && (
        <div className="mb-6">
          <DbErrorNotice />
        </div>
      )}

      {/* Métricas: el dorado marca el dato, que es lo único que se mira acá. */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {[
          { label: "Habitaciones", value: roomsCount },
          { label: "Reseñas", value: reviewsCount },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center gap-5 rounded-2xl border border-admin-line bg-admin-surface px-6 py-5"
          >
            <span className="h-10 w-px bg-admin-gold" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-admin-ink-soft">{label}</p>
              <p className="mt-1 text-4xl text-admin-ink">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, label, hint, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col rounded-2xl border border-admin-line bg-admin-surface p-6 transition-colors hover:border-admin-gold"
          >
            <div className="flex items-start justify-between">
              {/* En hover el icono va a navy, no a dorado: el dorado marca lo
                  que está activo y un hover no lo está. */}
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-canvas text-admin-ink transition-colors group-hover:bg-admin-nav group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              {badge !== undefined && (
                <span className="text-2xl text-admin-ink-soft">{badge}</span>
              )}
            </div>
            <h2 className="mt-5 text-base uppercase tracking-[0.2em] text-admin-ink">{label}</h2>
            <p className="mt-2 text-sm text-admin-ink-soft">{hint}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[11px] uppercase tracking-[0.2em] text-admin-ink">
              Administrar
              <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
