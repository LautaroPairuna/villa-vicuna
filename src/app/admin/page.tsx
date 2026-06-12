import Image from "next/image";
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
      <div className="w-24 h-24 border border-[#e3d6b5] bg-[#f8f4ea] flex items-center justify-center text-[10px] uppercase tracking-widest text-[#17273f]/50">
        sin imagen
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="w-24 h-24 object-cover border border-[#e3d6b5] bg-white"
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
        className="text-sm text-[#17273f]/70 file:mr-3 file:border-0 file:bg-[#e3d6b5] file:text-[#17273f] file:px-3 file:py-1.5 file:uppercase file:tracking-wider file:text-xs file:cursor-pointer hover:file:bg-[#d6c3a2]"
      />
      <button className="text-xs uppercase tracking-[0.2em] bg-[#17273f] text-white px-4 py-2 hover:bg-[#24395c] transition-colors">
        {label}
      </button>
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b-2 border-[#e3d6b5] pb-2">
      <h2 className="text-2xl uppercase tracking-[0.25em] text-[#17273f]">{children}</h2>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-black/5 shadow-sm p-5">{children}</div>;
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
    <>
      {/* Barra superior */}
      <header className="sticky top-0 z-20 bg-[#f8f4ea] border-b border-[#e3d6b5]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-villa-vicuna-2.svg"
              alt="Villa Vicuña"
              width={120}
              height={40}
              className="h-9 w-auto"
            />
            <span className="hidden sm:block text-sm uppercase tracking-[0.3em] text-[#17273f]/70 border-l border-[#e3d6b5] pl-3">
              Administración
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs text-[#17273f]/60">
              {session?.user?.email}
            </span>
            <form action={logoutAction}>
              <button className="text-xs uppercase tracking-[0.2em] border border-[#17273f] text-[#17273f] px-3 py-1.5 hover:bg-[#17273f] hover:text-white transition-colors">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        <div>
          <h1 className="text-3xl uppercase tracking-[0.2em] text-[#17273f]">Panel de imágenes</h1>
          <p className="text-sm text-[#17273f]/60 mt-1">
            Gestioná las imágenes de las secciones, habitaciones y reseñas del sitio.
          </p>
        </div>

        {dbError && (
          <div className="border border-amber-300 bg-amber-50 text-amber-900 p-4 text-sm">
            No se pudo leer la base de datos. Verificá <code>DATABASE_URL</code> y que las
            migraciones y el seed se hayan corrido.
          </div>
        )}

        {/* ── Secciones ── */}
        <section className="space-y-5">
          <SectionTitle>Secciones</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-4">
            {sections.map((s) => (
              <Card key={s.slug}>
                <div className="flex gap-4">
                  <Thumb src={s.path} alt={s.slug} />
                  <div className="flex-1 space-y-3">
                    <p className="text-sm uppercase tracking-wider text-[#17273f]">
                      {SECTION_LABELS[s.slug]}
                    </p>
                    <UploadForm action={setSectionImageAction} hidden={{ slug: s.slug }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Habitaciones ── */}
        <section className="space-y-5">
          <SectionTitle>Habitaciones</SectionTitle>
          {rooms.length === 0 && !dbError && (
            <p className="text-sm text-[#17273f]/60">
              No hay habitaciones cargadas. Corré <code>npm run prisma:seed</code>.
            </p>
          )}
          {rooms.map((room) => (
            <Card key={room.id}>
              <h3 className="text-lg uppercase tracking-[0.2em] text-[#17273f] capitalize mb-4">
                {room.categoria} · {room.key.replace(/_/g, " ")}
              </h3>

              <div className="flex gap-4 items-start mb-5">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-[#17273f]/50">Portada</p>
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
                <p className="text-[10px] uppercase tracking-widest text-[#17273f]/50">Carrusel</p>
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
                <div className="pt-1">
                  <UploadForm
                    action={addRoomImageAction}
                    hidden={{ roomId: room.id }}
                    label="Agregar imagen"
                  />
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* ── Reseñas ── */}
        <section className="space-y-5">
          <SectionTitle>Reseñas</SectionTitle>
          {reviews.length === 0 && !dbError && (
            <p className="text-sm text-[#17273f]/60">
              No hay reseñas cargadas. Corré <code>npm run prisma:seed</code>.
            </p>
          )}
          {reviews.map((review) => (
            <Card key={review.id}>
              <h3 className="text-lg uppercase tracking-[0.2em] text-[#17273f] capitalize mb-4">
                {review.key}
              </h3>

              <div className="flex gap-4 items-start mb-5">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-[#17273f]/50">Portada</p>
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
                <p className="text-[10px] uppercase tracking-widest text-[#17273f]/50">Carrusel</p>
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
                <div className="pt-1">
                  <UploadForm
                    action={addReviewImageAction}
                    hidden={{ reviewId: review.id }}
                    label="Agregar imagen"
                  />
                </div>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </>
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
        className="text-xs border border-[#17273f]/30 text-[#17273f] w-7 h-7 bg-white hover:bg-[#f8f4ea] transition-colors"
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
      <button
        className="text-xs border border-red-300 text-red-600 w-7 h-7 bg-white hover:bg-red-50 transition-colors"
        title="Eliminar"
      >
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
