import EditorialForm from "@/components/admin/EditorialForm";
import { PageHeader } from "@/components/admin/ui";
import { createSaltaPlaceAction, setSaltaPlaceCoverAction } from "@/app/admin/actions";

function SaltaExtraFields() {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            Categoría
          </label>
          <input
            name="category"
            defaultValue="Paseos"
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            Distancia desde el hotel
          </label>
          <input
            name="distanceFromHotel"
            placeholder="10 minutos a pie"
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            Dirección
          </label>
          <input
            name="address"
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            Duración sugerida
          </label>
          <input
            name="recommendedDuration"
            placeholder="1 a 2 horas"
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            Google Maps URL
          </label>
          <input
            name="mapsUrl"
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-3 rounded-2xl border border-admin-line bg-white/70 px-4 py-3 text-sm text-admin-ink">
            <input type="checkbox" name="featured" className="h-4 w-4 accent-admin-nav" />
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
