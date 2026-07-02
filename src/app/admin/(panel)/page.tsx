import Link from "next/link";
import { FiFilm, FiInfo, FiStar, FiBookOpen, FiPhone, FiArrowRight, FiTag, FiMapPin } from "react-icons/fi";
import { TbBed } from "react-icons/tb";
import type { IconType } from "react-icons";
import { prisma } from "@/lib/prisma";
import { PageHeader, DbErrorNotice } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  let dbError = false;
  let roomsCount = 0;
  let reviewsCount = 0;
  let promotionsCount = 0;
  let saltaCount = 0;

  try {
    [roomsCount, reviewsCount, promotionsCount, saltaCount] = await Promise.all([
      prisma.room.count(),
      prisma.review.count(),
      prisma.promotion.count(),
      prisma.saltaPlace.count(),
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
    { href: "/admin/promociones", label: "Promociones", hint: "Landing comerciales indexables", icon: FiTag, badge: String(promotionsCount) },
    { href: "/admin/salta", label: "Salta", hint: "Guía local de Salta Capital", icon: FiMapPin, badge: String(saltaCount) },
  ];

  return (
    <div className="max-w-5xl">
      <PageHeader title="Inicio" subtitle="Elegí la sección que querés administrar." />

      {dbError && (
        <div className="mb-6">
          <DbErrorNotice />
        </div>
      )}

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-[#e3d6b5] bg-[linear-gradient(135deg,#17273f_0%,#24395c_100%)] px-6 py-6 text-white shadow-[0_24px_50px_rgba(23,39,63,0.18)] md:px-8">
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/55">
            Dashboard
          </p>
          <h2 className="text-2xl uppercase tracking-[0.2em]">Administración centralizada</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">
            Gestioná imágenes, textos y contenido clave del sitio desde un solo lugar, con la misma estética sobria de la marca.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[28px] border border-[#e3d6b5] bg-white/80 px-5 py-5 shadow-[0_18px_40px_rgba(23,39,63,0.08)]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#17273f]/45">Habitaciones</p>
            <p className="mt-3 text-4xl text-[#17273f]">{roomsCount}</p>
          </div>
          <div className="rounded-[28px] border border-[#e3d6b5] bg-white/80 px-5 py-5 shadow-[0_18px_40px_rgba(23,39,63,0.08)]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#17273f]/45">Reseñas</p>
            <p className="mt-3 text-4xl text-[#17273f]">{reviewsCount}</p>
          </div>
          <div className="rounded-[28px] border border-[#e3d6b5] bg-white/80 px-5 py-5 shadow-[0_18px_40px_rgba(23,39,63,0.08)]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#17273f]/45">Promociones</p>
            <p className="mt-3 text-4xl text-[#17273f]">{promotionsCount}</p>
          </div>
          <div className="rounded-[28px] border border-[#e3d6b5] bg-white/80 px-5 py-5 shadow-[0_18px_40px_rgba(23,39,63,0.08)]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#17273f]/45">Salta</p>
            <p className="mt-3 text-4xl text-[#17273f]">{saltaCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, label, hint, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col rounded-[28px] border border-[#e7ddc4] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(248,244,234,0.92)_100%)] p-6 shadow-[0_20px_45px_rgba(23,39,63,0.07)] transition-all hover:-translate-y-1 hover:border-[#17273f]/40 hover:shadow-[0_28px_54px_rgba(23,39,63,0.12)]"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e3d6b5] bg-[#f8f4ea] text-[#17273f]">
                <Icon className="w-5 h-5" />
              </span>
              {badge !== undefined && (
                <span className="rounded-full border border-[#e3d6b5] bg-white/80 px-3 py-1 text-2xl text-[#17273f]/55 transition-colors group-hover:text-[#17273f]">
                  {badge}
                </span>
              )}
            </div>
            <h2 className="text-lg uppercase tracking-[0.2em] text-[#17273f] mt-5">{label}</h2>
            <p className="mt-2 text-sm leading-6 text-[#17273f]/60">{hint}</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#17273f]">
              Administrar
              <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
