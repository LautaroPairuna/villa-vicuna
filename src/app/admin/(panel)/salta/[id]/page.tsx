import { notFound } from "next/navigation";
import EditorialForm from "@/components/admin/EditorialForm";
import { PageHeader } from "@/components/admin/ui";
import {
  deleteSaltaPlaceAction,
  setSaltaPlaceCoverAction,
  updateSaltaPlaceAction,
} from "@/app/admin/actions";
import { getSaltaPlaceByIdAdmin } from "@/lib/editorial";

function SaltaExtraFields({
  category,
  address,
  mapsUrl,
  distanceFromHotel,
  recommendedDuration,
  featured,
}: {
  category: string;
  address?: string | null;
  mapsUrl?: string | null;
  distanceFromHotel?: string | null;
  recommendedDuration?: string | null;
  featured: boolean;
}) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#17273f]/55">
            Categoría
          </label>
          <input
            name="category"
            defaultValue={category}
            className="w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#17273f]/55">
            Distancia desde el hotel
          </label>
          <input
            name="distanceFromHotel"
            defaultValue={distanceFromHotel ?? ""}
            className="w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#17273f]/55">
            Dirección
          </label>
          <input
            name="address"
            defaultValue={address ?? ""}
            className="w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#17273f]/55">
            Duración sugerida
          </label>
          <input
            name="recommendedDuration"
            defaultValue={recommendedDuration ?? ""}
            className="w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#17273f]/55">
            Google Maps URL
          </label>
          <input
            name="mapsUrl"
            defaultValue={mapsUrl ?? ""}
            className="w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-3 rounded-2xl border border-[#e3d6b5] bg-white/70 px-4 py-3 text-sm text-[#17273f]">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={featured}
              className="h-4 w-4 accent-[#17273f]"
            />
            Destacado
          </label>
        </div>
      </div>
    </>
  );
}

export default async function SaltaPlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await getSaltaPlaceByIdAdmin(id);

  if (!place) {
    notFound();
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title={place.title}
        subtitle="Editá el contenido público de esta ficha orientada a búsquedas sobre Salta Capital."
      />
      <EditorialForm
        backHref="/admin/salta"
        action={updateSaltaPlaceAction}
        title="Detalle del lugar"
        subtitle="Mantené el enfoque local y evitá mezclar excursiones fuera de Salta Capital."
        item={place}
        coverLabel="Portada"
        coverAction={setSaltaPlaceCoverAction}
        extraFields={
          <SaltaExtraFields
            category={place.category}
            address={place.address}
            mapsUrl={place.mapsUrl}
            distanceFromHotel={place.distanceFromHotel}
            recommendedDuration={place.recommendedDuration}
            featured={place.featured}
          />
        }
        deleteAction={deleteSaltaPlaceAction}
      />
    </div>
  );
}
