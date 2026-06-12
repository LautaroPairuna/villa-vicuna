import { prisma } from "@/lib/prisma";
import {
  setReviewCoverAction,
  addReviewImageAction,
  deleteReviewImageAction,
  moveReviewImageAction,
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

function loadReviews() {
  return prisma.review.findMany({
    orderBy: { order: "asc" },
    include: {
      cover: true,
      images: { orderBy: { order: "asc" }, include: { media: true } },
    },
  });
}

export default async function ResenasPage() {
  let dbError = false;
  let reviews: Awaited<ReturnType<typeof loadReviews>> = [];

  try {
    reviews = await loadReviews();
  } catch {
    dbError = true;
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title="Reseñas" subtitle="Portada y carrusel de cada reseña." />

      {dbError && <DbErrorNotice />}
      {!dbError && reviews.length === 0 && (
        <EmptyHint>
          No hay reseñas cargadas. Corré <code>npm run prisma:seed</code>.
        </EmptyHint>
      )}

      <div className="space-y-5">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardTitle>{review.key}</CardTitle>

            <div className="grid lg:grid-cols-[auto_1fr] gap-6 lg:gap-8">
              {/* Portada */}
              <div className="space-y-3">
                <FieldLabel>Portada</FieldLabel>
                <CoverPreview src={review.cover?.path} alt={review.key} />
                <div className="max-w-xs">
                  <UploadField
                    action={setReviewCoverAction}
                    hidden={{ reviewId: review.id }}
                    label="Cambiar"
                  />
                </div>
              </div>

              {/* Carrusel */}
              <div className="space-y-3 min-w-0">
                <FieldLabel>Carrusel ({review.images.length})</FieldLabel>
                <div className="flex flex-wrap gap-3">
                  {review.images.map((img) => (
                    <MediaTile
                      key={img.id}
                      id={img.id}
                      src={img.media.path}
                      alt={img.id}
                      moveAction={moveReviewImageAction}
                      deleteAction={deleteReviewImageAction}
                    />
                  ))}
                </div>
                <div className="max-w-md">
                  <UploadField
                    action={addReviewImageAction}
                    hidden={{ reviewId: review.id }}
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
