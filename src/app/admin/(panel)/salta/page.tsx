import Link from "next/link";
import { FiArrowRight, FiPlus } from "react-icons/fi";
import { PageHeader, Card } from "@/components/admin/ui";
import { getAllSaltaPlacesAdmin } from "@/lib/editorial";

export default async function SaltaAdminPage() {
  const places = await getAllSaltaPlacesAdmin();

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader
          title="Salta Capital"
          subtitle="Administrá la guía pública de lugares, paseos y planes para hacer en Salta Capital."
        />
        <Link
          href="/admin/salta/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17273f] px-5 py-3 text-xs uppercase tracking-[0.22em] text-white shadow-[0_14px_32px_rgba(23,39,63,0.18)] transition-all hover:bg-[#24395c]"
        >
          <FiPlus className="h-4 w-4" />
          Nuevo lugar
        </Link>
      </div>

      {places.length === 0 ? (
        <Card>
          <p className="text-sm leading-6 text-[#17273f]/65">
            Todavía no hay lugares cargados. Empezá por los puntos fuertes de Salta Capital cerca del hotel.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {places.map((place) => (
            <Link
              key={place.id}
              href={`/admin/salta/${place.id}`}
              className="group rounded-[28px] border border-[#e7ddc4] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(248,244,234,0.92)_100%)] p-6 shadow-[0_20px_45px_rgba(23,39,63,0.07)] transition-all hover:-translate-y-1 hover:border-[#17273f]/40 hover:shadow-[0_28px_54px_rgba(23,39,63,0.12)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#17273f]/45">
                    /salta/{place.slug}
                  </p>
                  <h2 className="mt-3 text-lg uppercase tracking-[0.16em] text-[#17273f]">
                    {place.title}
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {place.featured && (
                    <span className="rounded-full bg-[#17273f] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white">
                      Destacado
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${
                      place.published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {place.published ? "Publicado" : "Borrador"}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm uppercase tracking-[0.18em] text-[#17273f]/45">
                {place.category}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#17273f]/65">{place.summary}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#17273f]">
                Editar
                <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
