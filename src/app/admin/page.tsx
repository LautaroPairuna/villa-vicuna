import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { STATIC_SECTION_IMAGES } from "@/lib/contentTypes";
import {
  setSectionImageAction,
  setRoomCoverAction,
  addRoomImageAction,
  deleteRoomImageAction,
  moveRoomImageAction,
  setReviewCoverAction,
  addReviewImageAction,
  deleteReviewImageAction,
  moveReviewImageAction,
  logoutAction,
} from "./actions";

export const dynamic = "force-dynamic";

const SECTION_LABELS: Record<string, string> = {
  hero_poster: "Hero · Póster del video",
  nosotros: "Nosotros · Imagen",
  contactenos: "Contacto · Imagen",
  menu_foods: "Menú · Comidas",
  menu_drinks: "Menú · Bebidas",
};

function Thumb({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="w-24 h-24 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500">
        sin imagen
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="w-24 h-24 rounded-md object-cover border bg-white"
    />
  );
}

function UploadForm({
  action,
  hidden,
  label = "Subir",
}: {
  action: (formData: FormData) => void;
  hidden: Record<string, string>;
  label?: string;
}) {
  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <input
        type="file"
        name="file"
        accept="image/*"
        required
        className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-white"
      />
      <button className="text-sm bg-gray-900 text-white rounded-md px-3 py-1.5">
        {label}
      </button>
    </form>
  );
}

export default async function AdminDashboard() {
  const session = await auth();

  let dbError = false;
  let sections: { slug: string; path: string | null }[] = [];
  let rooms: Awaited<ReturnType<typeof loadRooms>> = [];
  let reviews: Awaited<ReturnType<typeof loadReviews>> = [];

  try {
    const sectionRows = await prisma.sectionImage.findMany({ include: { media: true } });
    const bySlug = new Map(sectionRows.map((s) => [s.slug, s.media?.path ?? null]));
    sections = Object.keys(SECTION_LABELS).map((slug) => ({
      slug,
      path: bySlug.get(slug) ?? STATIC_SECTION_IMAGES[slug] ?? null,
    }));
    rooms = await loadRooms();
    reviews = await loadReviews();
  } catch {
    dbError = true;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Panel de imágenes</h1>
          <p className="text-sm text-gray-500">{session?.user?.email}</p>
        </div>
        <form action={logoutAction}>
          <button className="text-sm border rounded-md px-3 py-1.5 hover:bg-gray-200">
            Cerrar sesión
          </button>
        </form>
      </header>

      {dbError && (
        <div className="rounded-md bg-yellow-100 text-yellow-900 p-4 text-sm">
          No se pudo leer la base de datos. Verificá <code>DATABASE_URL</code> y que las
          migraciones y el seed se hayan corrido.
        </div>
      )}

      {/* ── Secciones ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Secciones</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {sections.map((s) => (
            <div key={s.slug} className="bg-white rounded-lg shadow p-4 flex gap-4">
              <Thumb src={s.path} alt={s.slug} />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-sm">{SECTION_LABELS[s.slug]}</p>
                <UploadForm action={setSectionImageAction} hidden={{ slug: s.slug }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Habitaciones ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Habitaciones</h2>
        {rooms.length === 0 && !dbError && (
          <p className="text-sm text-gray-500">
            No hay habitaciones cargadas. Corré <code>npm run db:seed</code>.
          </p>
        )}
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium capitalize">
                {room.categoria} · {room.key}
              </h3>
            </div>

            <div className="flex gap-4 items-start">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Portada</p>
                <Thumb src={room.cover?.path} alt={room.key} />
              </div>
              <div className="pt-5">
                <UploadForm
                  action={setRoomCoverAction}
                  hidden={{ roomId: room.id }}
                  label="Cambiar portada"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500">Carrusel</p>
              <div className="flex flex-wrap gap-3">
                {room.images.map((img) => (
                  <div key={img.id} className="space-y-1">
                    <Thumb src={img.media.path} alt={img.id} />
                    <div className="flex gap-1">
                      <MoveBtn action={moveRoomImageAction} id={img.id} dir="up" />
                      <MoveBtn action={moveRoomImageAction} id={img.id} dir="down" />
                      <DeleteBtn action={deleteRoomImageAction} id={img.id} />
                    </div>
                  </div>
                ))}
              </div>
              <UploadForm
                action={addRoomImageAction}
                hidden={{ roomId: room.id }}
                label="Agregar imagen"
              />
            </div>
          </div>
        ))}
      </section>

      {/* ── Reseñas ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Reseñas</h2>
        {reviews.length === 0 && !dbError && (
          <p className="text-sm text-gray-500">
            No hay reseñas cargadas. Corré <code>npm run db:seed</code>.
          </p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow p-4 space-y-4">
            <h3 className="font-medium capitalize">{review.key}</h3>

            <div className="flex gap-4 items-start">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Portada</p>
                <Thumb src={review.cover?.path} alt={review.key} />
              </div>
              <div className="pt-5">
                <UploadForm
                  action={setReviewCoverAction}
                  hidden={{ reviewId: review.id }}
                  label="Cambiar portada"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500">Carrusel</p>
              <div className="flex flex-wrap gap-3">
                {review.images.map((img) => (
                  <div key={img.id} className="space-y-1">
                    <Thumb src={img.media.path} alt={img.id} />
                    <div className="flex gap-1">
                      <MoveBtn action={moveReviewImageAction} id={img.id} dir="up" />
                      <MoveBtn action={moveReviewImageAction} id={img.id} dir="down" />
                      <DeleteBtn action={deleteReviewImageAction} id={img.id} />
                    </div>
                  </div>
                ))}
              </div>
              <UploadForm
                action={addReviewImageAction}
                hidden={{ reviewId: review.id }}
                label="Agregar imagen"
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function MoveBtn({
  action,
  id,
  dir,
}: {
  action: (formData: FormData) => void;
  id: string;
  dir: "up" | "down";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dir" value={dir} />
      <button
        className="text-xs border rounded px-2 py-0.5 bg-white hover:bg-gray-100"
        title={dir === "up" ? "Mover antes" : "Mover después"}
      >
        {dir === "up" ? "←" : "→"}
      </button>
    </form>
  );
}

function DeleteBtn({
  action,
  id,
}: {
  action: (formData: FormData) => void;
  id: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button className="text-xs border border-red-300 text-red-600 rounded px-2 py-0.5 bg-white hover:bg-red-50">
        ✕
      </button>
    </form>
  );
}

function loadRooms() {
  return prisma.room.findMany({
    orderBy: { order: "asc" },
    include: {
      cover: true,
      images: { orderBy: { order: "asc" }, include: { media: true } },
    },
  });
}

function loadReviews() {
  return prisma.review.findMany({
    orderBy: { order: "asc" },
    include: {
      cover: true,
      images: { orderBy: { order: "asc" }, include: { media: true } },
    },
  });
}
