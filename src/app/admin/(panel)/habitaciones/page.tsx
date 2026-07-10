import { prisma } from "@/lib/prisma";
import { getSectionTexts } from "@/lib/translations";
import {
  setRoomCoverAction,
  addRoomImageAction,
  deleteRoomImageAction,
  moveRoomImageAction,
  saveTranslationsAction,
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
import TextEditor from "@/components/admin/TextEditor";

const GLOBAL_ROOM_TEXT_KEYS = new Set([
  "rooms.titulo",
  "rooms.ver_mas",
  "rooms.standard",
  "rooms.superior",
]);

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

  // Arrancamos la carga de textos en paralelo con la de habitaciones
  // (getSectionTexts ya maneja sus propios errores, no hace falta try/catch).
  const textsPromise = getSectionTexts("habitaciones");
  try {
    rooms = await loadRooms();
  } catch {
    dbError = true;
  }

  const texts = await textsPromise;
  const globalTexts = texts
    ? {
        ...texts.section,
        fields: texts.section.fields.filter((field) => GLOBAL_ROOM_TEXT_KEYS.has(field.key)),
      }
    : null;

  return (
    <div className="max-w-5xl">
      <PageHeader title="Habitaciones" subtitle="Textos de la sección, portada y carrusel de cada habitación." />

      {texts && globalTexts && (
        <div className="mb-8">
          <TextEditor section={globalTexts} values={texts.values} action={saveTranslationsAction} />
        </div>
      )}

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

            {texts && (
              <div className="mt-8 border-t border-[#e7ddc4] pt-6">
                <FieldLabel>Textos de esta habitación</FieldLabel>
                <div className="mt-3">
                  <TextEditor
                    section={{
                      ...texts.section,
                      fields: texts.section.fields.filter((field) =>
                        field.key.startsWith(`rooms.${room.key}.`),
                      ),
                    }}
                    values={texts.values}
                    action={saveTranslationsAction}
                  />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
