import { prisma } from "@/lib/prisma";
import {
  setReviewCoverAction,
  addReviewImageAction,
  deleteReviewImageAction,
  moveReviewImageAction,
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
    <>
      <PageTitle subtitle="Portada y carrusel de cada reseña.">Reseñas</PageTitle>

      {dbError && <DbErrorNotice />}
      {!dbError && reviews.length === 0 && (
        <p className="text-sm text-[#17273f]/60">
          No hay reseñas cargadas. Corré <code>npm run prisma:seed</code>.
        </p>
      )}

      <div className="space-y-5">
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
      </div>
    </>
  );
}
