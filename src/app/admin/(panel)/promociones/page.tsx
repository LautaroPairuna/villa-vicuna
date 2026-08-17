import Link from "next/link";
import { FiArrowRight, FiPlus } from "react-icons/fi";
import { saveTranslationsAction, setSectionVideoAction } from "@/app/admin/actions";
import UploadField from "@/components/admin/UploadField";
import TextEditor from "@/components/admin/TextEditor";
import { PageHeader, Card } from "@/components/admin/ui";
import { getSectionImages } from "@/lib/content";
import { videoSources } from "@/lib/videoSources";
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
  const sections = await getSectionImages();
  const texts = await getSectionTexts("promociones");
  const promotions = await getAllPromotionsAdmin();

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader
          title="Promociones"
          subtitle="Administrá promociones públicas con contenido propio, URL indexable y CTA comercial."
        />
        <Link
          href="/admin/promociones/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-admin-nav px-5 py-3 text-xs uppercase tracking-[0.22em] text-white transition-colors hover:bg-admin-nav-soft"
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
          <div className="overflow-hidden rounded-lg border border-admin-line bg-admin-canvas">
            {/* `key` fuerza el remonte al cambiar de video: con <source> hijos
                el navegador no recarga solo cuando cambia la fuente. */}
            <video
              key={sections.promociones_hero_video}
              controls
              preload="metadata"
              className="aspect-video w-full bg-admin-nav"
            >
              {videoSources(sections.promociones_hero_video).map((s) => (
                <source key={s.src} src={s.src} type={s.type} />
              ))}
            </video>
          </div>
          <div className="min-w-0 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-admin-ink-soft">
              Video del hero de promociones
            </p>
            <p className="truncate text-sm text-admin-ink-soft">{sections.promociones_hero_video}</p>
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
          <p className="text-sm leading-6 text-admin-ink-soft">
            Todavía no hay promociones cargadas. Creá la primera y publicala cuando esté lista.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {promotions.map((promotion) => (
            <Link
              key={promotion.id}
              href={`/admin/promociones/${promotion.id}`}
              className="group rounded-2xl border border-admin-line bg-admin-surface p-6 transition-colors hover:border-admin-gold"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-admin-ink-soft">
                    /promociones/{promotion.slug}
                  </p>
                  <h2 className="mt-3 text-lg uppercase tracking-[0.16em] text-admin-ink">
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
              <p className="mt-4 text-sm leading-6 text-admin-ink-soft">{promotion.summary}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-admin-ink-soft">
                {formatDate(promotion.validFrom) && <span>Desde {formatDate(promotion.validFrom)}</span>}
                {formatDate(promotion.validTo) && <span>Hasta {formatDate(promotion.validTo)}</span>}
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-admin-ink">
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
