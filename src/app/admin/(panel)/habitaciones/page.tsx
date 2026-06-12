import { prisma } from "@/lib/prisma";
import {
  setRoomCoverAction,
  addRoomImageAction,
  deleteRoomImageAction,
  moveRoomImageAction,
} from "@/app/admin/actions";
import {
  PageHeader,
  Card,
  CardTitle,
  CoverPreview,
  FieldLabel,
  MediaTile,
  DbErrorNotice,
  EmptyHint,
} from "@/components/admin/ui";
import UploadField from "@/components/admin/UploadField";

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
    <div className="max-w-5xl">
      <PageHeader title="Habitaciones" subtitle="Portada y carrusel de cada habitación." />

      {dbError && <DbErrorNotice />}
      {!dbError && rooms.length === 0 && (
        <EmptyHint>
          No hay habitaciones cargadas. Corré <code>npm run prisma:seed</code>.
        </EmptyHint>
      )}

      <div className="space-y-5">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardTitle>
              {room.categoria} · {room.key.replace(/_/g, " ")}
            </CardTitle>

            <div className="grid lg:grid-cols-[auto_1fr] gap-6 lg:gap-8">
              {/* Portada */}
              <div className="space-y-3">
                <FieldLabel>Portada</FieldLabel>
                <CoverPreview src={room.cover?.path} alt={room.key} />
                <div className="max-w-xs">
                  <UploadField
                    action={setRoomCoverAction}
                    hidden={{ roomId: room.id }}
                    label="Cambiar"
                  />
                </div>
              </div>

              {/* Carrusel */}
              <div className="space-y-3 min-w-0">
                <FieldLabel>Carrusel ({room.images.length})</FieldLabel>
                <div className="flex flex-wrap gap-3">
                  {room.images.map((img) => (
                    <MediaTile
                      key={img.id}
                      id={img.id}
                      src={img.media.path}
                      alt={img.id}
                      moveAction={moveRoomImageAction}
                      deleteAction={deleteRoomImageAction}
                    />
                  ))}
                </div>
                <div className="max-w-md">
                  <UploadField
                    action={addRoomImageAction}
                    hidden={{ roomId: room.id }}
                    label="Agregar"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
