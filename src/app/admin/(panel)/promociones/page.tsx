import Link from "next/link";
import { FiArrowRight, FiPlus } from "react-icons/fi";
import { saveTranslationsAction, setSectionVideoAction } from "@/app/admin/actions";
import UploadField from "@/components/admin/UploadField";
import TextEditor from "@/components/admin/TextEditor";
import { PageHeader, Card } from "@/components/admin/ui";
import { getSectionImages } from "@/lib/content";
import { getAllPromotionsAdmin } from "@/lib/editorial";
import { getSectionTexts } from "@/lib/translations";

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function PromotionsAdminPage() {
  const [sections, texts, promotions] = await Promise.all([
    getSectionImages(),
    getSectionTexts("promociones"),
    getAllPromotionsAdmin(),
  ]);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader
          title="Promociones"
          subtitle="Administrá promociones públicas con contenido propio, URL indexable y CTA comercial."
        />
        <Link
          href="/admin/promociones/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17273f] px-5 py-3 text-xs uppercase tracking-[0.22em] text-white shadow-[0_14px_32px_rgba(23,39,63,0.18)] transition-all hover:bg-[#24395c]"
        >
          <FiPlus className="h-4 w-4" />
          Nueva promoción
        </Link>
      </div>

      {texts && (
        <TextEditor section={texts.section} values={texts.values} action={saveTranslationsAction} />
      )}

      <Card>
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[22px] border border-[#e3d6b5] bg-[#f8f4ea]">
            <video
              key={sections.promociones_hero_video}
              src={sections.promociones_hero_video}
              controls
              preload="metadata"
              className="aspect-video w-full bg-[#17273f]"
            />
          </div>
          <div className="min-w-0 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#17273f]/50">
              Video del hero de promociones
            </p>
            <p className="truncate text-sm text-[#17273f]/60">{sections.promociones_hero_video}</p>
            <div className="max-w-md">
              <UploadField
                action={setSectionVideoAction}
                hidden={{ slug: "promociones_hero_video" }}
                label="Reemplazar video"
                accept="video/mp4,video/webm,video/quicktime"
                emptyLabel="Arrastrá un video o hacé clic"
                successLabel="Video actualizado"
              />
            </div>
          </div>
        </div>
      </Card>

      {promotions.length === 0 ? (
        <Card>
          <p className="text-sm leading-6 text-[#17273f]/65">
            Todavía no hay promociones cargadas. Creá la primera y publicala cuando esté lista.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {promotions.map((promotion) => (
            <Link
              key={promotion.id}
              href={`/admin/promociones/${promotion.id}`}
              className="group rounded-[28px] border border-[#e7ddc4] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(248,244,234,0.92)_100%)] p-6 shadow-[0_20px_45px_rgba(23,39,63,0.07)] transition-all hover:-translate-y-1 hover:border-[#17273f]/40 hover:shadow-[0_28px_54px_rgba(23,39,63,0.12)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#17273f]/45">
                    /promociones/{promotion.slug}
                  </p>
                  <h2 className="mt-3 text-lg uppercase tracking-[0.16em] text-[#17273f]">
                    {promotion.title}
                  </h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${
                    promotion.published
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {promotion.published ? "Publicado" : "Borrador"}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#17273f]/65">{promotion.summary}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-[#17273f]/50">
                {formatDate(promotion.validFrom) && <span>Desde {formatDate(promotion.validFrom)}</span>}
                {formatDate(promotion.validTo) && <span>Hasta {formatDate(promotion.validTo)}</span>}
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#17273f]">
                Editar
                <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
