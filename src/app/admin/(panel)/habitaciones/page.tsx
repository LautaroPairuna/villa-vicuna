import { prisma } from "@/lib/prisma";
import {
  setRoomCoverAction,
  addRoomImageAction,
  deleteRoomImageAction,
  moveRoomImageAction,
} from "@/app/admin/actions";
import {
  PageTitle,
  Card,
  Thumb,
  UploadForm,
  MoveBtn,
  DeleteBtn,
  DbErrorNotice,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function loadRooms() {
  return prisma.room.findMany({
    orderBy: { order: "asc" },
    include: {
      cover: true,
      images: { orderBy: { order: "asc" }, include: { media: true } },
    },
  });
}

export default async function HabitacionesPage() {
  let dbError = false;
  let rooms: Awaited<ReturnType<typeof loadRooms>> = [];

  try {
    rooms = await loadRooms();
  } catch {
    dbError = true;
  }

  return (
    <>
      <PageTitle subtitle="Portada y carrusel de cada habitación.">Habitaciones</PageTitle>

      {dbError && <DbErrorNotice />}
      {!dbError && rooms.length === 0 && (
        <p className="text-sm text-[#17273f]/60">
          No hay habitaciones cargadas. Corré <code>npm run prisma:seed</code>.
        </p>
      )}

      <div className="space-y-5">
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
      </div>
    </>
  );
}
