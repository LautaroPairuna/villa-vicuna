import Link from "next/link";
import { FiFilm, FiInfo, FiStar, FiBookOpen, FiPhone, FiArrowRight } from "react-icons/fi";
import { TbBed } from "react-icons/tb";
import type { IconType } from "react-icons";
import { prisma } from "@/lib/prisma";
import { PageHeader, DbErrorNotice } from "@/components/admin/ui";

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
  ];

  return (
    <div className="max-w-5xl">
      <PageHeader title="Inicio" subtitle="Elegí la sección que querés administrar." />

      {dbError && (
        <div className="mb-6">
          <DbErrorNotice />
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ href, label, hint, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white border border-[#e7ddc4] shadow-[0_1px_3px_rgba(23,39,63,0.06)] p-6 hover:border-[#17273f] transition-colors flex flex-col"
          >
            <div className="flex items-start justify-between">
              <span className="w-11 h-11 flex items-center justify-center bg-[#f8f4ea] border border-[#e3d6b5] text-[#17273f]">
                <Icon className="w-5 h-5" />
              </span>
              {badge !== undefined && (
                <span className="text-3xl text-[#17273f]/30 group-hover:text-[#17273f] transition-colors">
                  {badge}
                </span>
              )}
            </div>
            <h2 className="text-lg uppercase tracking-[0.2em] text-[#17273f] mt-5">{label}</h2>
            <p className="text-sm text-[#17273f]/60 mt-1">{hint}</p>
            <span className="inline-flex items-center gap-1.5 mt-5 text-xs uppercase tracking-[0.2em] text-[#17273f]">
              Administrar
              <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
