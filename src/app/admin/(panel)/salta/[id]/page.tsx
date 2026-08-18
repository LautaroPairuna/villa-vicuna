import { notFound } from "next/navigation";
import EditorialForm from "@/components/admin/EditorialForm";
import { Card, CardTitle, EmptyHint, MediaTile, PageHeader } from "@/components/admin/ui";
import UploadField from "@/components/admin/UploadField";
import {
  addSaltaPlaceImageAction,
  deleteSaltaPlaceAction,
  deleteSaltaPlaceImageAction,
  moveSaltaPlaceImageAction,
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
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            Categoría
          </label>
          <input
            name="category"
            defaultValue={category}
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            Distancia desde el hotel
          </label>
          <input
            name="distanceFromHotel"
            defaultValue={distanceFromHotel ?? ""}
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
            defaultValue={address ?? ""}
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            Duración sugerida
          </label>
          <input
            name="recommendedDuration"
            defaultValue={recommendedDuration ?? ""}
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
            defaultValue={mapsUrl ?? ""}
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-3 rounded-2xl border border-admin-line bg-white/70 px-4 py-3 text-sm text-admin-ink">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={featured}
              className="h-4 w-4 accent-admin-nav"
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

      {/* Carrusel del lugar: la portada sigue siendo la foto del listado, y
          estas son las que se ven al entrar al detalle. */}
      <Card>
        <CardTitle>Carrusel ({place.images.length})</CardTitle>
        <div className="space-y-5">
          {place.images.length === 0 ? (
            <EmptyHint>
              Todavía no hay fotos en el carrusel. La portada abre la galería y estas van después.
            </EmptyHint>
          ) : (
            <div className="flex flex-wrap gap-4">
              {place.images.map((img) => (
                <MediaTile
                  key={img.id}
                  id={img.id}
                  src={img.url}
                  alt={img.name || place.title}
                  name={img.name}
                  updatedAt={img.updatedAt}
                  moveAction={moveSaltaPlaceImageAction}
                  deleteAction={deleteSaltaPlaceImageAction}
                />
              ))}
            </div>
          )}
          <div className="max-w-md">
            <UploadField
              action={addSaltaPlaceImageAction}
              hidden={{ placeId: place.id }}
              label="Agregar"
              successLabel="Foto agregada"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
