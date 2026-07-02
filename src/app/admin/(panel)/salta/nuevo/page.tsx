import EditorialForm from "@/components/admin/EditorialForm";
import { PageHeader } from "@/components/admin/ui";
import { createSaltaPlaceAction, setSaltaPlaceCoverAction } from "@/app/admin/actions";

function SaltaExtraFields() {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#17273f]/55">
            Categoría
          </label>
          <input
            name="category"
            defaultValue="Paseos"
            className="w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#17273f]/55">
            Distancia desde el hotel
          </label>
          <input
            name="distanceFromHotel"
            placeholder="10 minutos a pie"
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
            className="w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#17273f]/55">
            Duración sugerida
          </label>
          <input
            name="recommendedDuration"
            placeholder="1 a 2 horas"
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
            className="w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-3 rounded-2xl border border-[#e3d6b5] bg-white/70 px-4 py-3 text-sm text-[#17273f]">
            <input type="checkbox" name="featured" className="h-4 w-4 accent-[#17273f]" />
            Destacado
          </label>
        </div>
      </div>
    </>
  );
}

export default function NewSaltaPlacePage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Nuevo lugar en Salta"
        subtitle="Creá una página pública orientada a búsquedas sobre qué hacer en Salta Capital."
      />
      <EditorialForm
        backHref="/admin/salta"
        action={createSaltaPlaceAction}
        title="Detalle del lugar"
        subtitle="Priorizá contenido útil para huéspedes: qué ver, cuándo ir, cómo llegar y cuánto tiempo lleva."
        coverLabel="Portada"
        coverAction={setSaltaPlaceCoverAction}
        extraFields={<SaltaExtraFields />}
      />
    </div>
  );
}
