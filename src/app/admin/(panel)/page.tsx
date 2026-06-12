import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageTitle, DbErrorNotice } from "@/components/admin/ui";

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

  const cards = [
    { href: "/admin/secciones", label: "Secciones", count: SECTION_COUNT, hint: "Hero, Nosotros, Contacto, Menú" },
    { href: "/admin/habitaciones", label: "Habitaciones", count: roomsCount, hint: "Portada y carrusel por habitación" },
    { href: "/admin/resenas", label: "Reseñas", count: reviewsCount, hint: "Portada y carrusel por reseña" },
  ];

  return (
    <>
      <PageTitle subtitle="Elegí qué querés administrar.">Inicio</PageTitle>

      {dbError && (
        <div className="mb-6">
          <DbErrorNotice />
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group bg-white border border-black/5 shadow-sm p-6 hover:border-[#e3d6b5] transition-colors"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl uppercase tracking-[0.2em] text-[#17273f]">{c.label}</h2>
              <span className="text-2xl text-[#17273f]/40 group-hover:text-[#17273f]">
                {c.count}
              </span>
            </div>
            <p className="text-sm text-[#17273f]/60 mt-2">{c.hint}</p>
            <span className="inline-block mt-4 text-xs uppercase tracking-[0.2em] text-[#17273f] border-b border-[#e3d6b5] group-hover:border-[#17273f]">
              Administrar →
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
