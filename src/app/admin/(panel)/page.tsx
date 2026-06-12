import Link from "next/link";
import { FiImage, FiStar, FiArrowRight } from "react-icons/fi";
import { TbBed } from "react-icons/tb";
import type { IconType } from "react-icons";
import { prisma } from "@/lib/prisma";
import { PageHeader, DbErrorNotice } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const SECTION_COUNT = 5; // hero, nosotros, contacto, menu_foods, menu_drinks

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

  const cards: { href: string; label: string; count: number; hint: string; icon: IconType }[] = [
    { href: "/admin/secciones", label: "Secciones", count: SECTION_COUNT, hint: "Hero, Nosotros, Contacto y Menú", icon: FiImage },
    { href: "/admin/habitaciones", label: "Habitaciones", count: roomsCount, hint: "Portada y carrusel por habitación", icon: TbBed },
    { href: "/admin/resenas", label: "Reseñas", count: reviewsCount, hint: "Portada y carrusel por reseña", icon: FiStar },
  ];

  return (
    <div className="max-w-5xl">
      <PageHeader title="Inicio" subtitle="Elegí qué querés administrar." />

      {dbError && (
        <div className="mb-6">
          <DbErrorNotice />
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ href, label, count, hint, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white border border-[#e7ddc4] shadow-[0_1px_3px_rgba(23,39,63,0.06)] p-6 hover:border-[#17273f] transition-colors flex flex-col"
          >
            <div className="flex items-start justify-between">
              <span className="w-11 h-11 flex items-center justify-center bg-[#f8f4ea] border border-[#e3d6b5] text-[#17273f]">
                <Icon className="w-5 h-5" />
              </span>
              <span className="text-3xl text-[#17273f]/30 group-hover:text-[#17273f] transition-colors">
                {count}
              </span>
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
