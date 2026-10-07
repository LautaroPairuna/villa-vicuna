import { getSectionImages } from "@/lib/content";
import { videoSources } from "@/lib/videoSources";
import { setSectionImageAction } from "@/app/admin/actions";
import VideoUploadField from "@/components/admin/VideoUploadField";
import { Card, ImageField, PageHeader } from "@/components/admin/ui";

export default async function HeroPage() {
  const sections = await getSectionImages();
  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Hero" subtitle="Póster y video principal de la portada." />
      <Card>
        <div className="space-y-5">
          <ImageField
            label="Póster del video"
            src={sections.hero_poster}
            action={setSectionImageAction}
            hidden={{ slug: "hero_poster" }}
          />

          <div className="flex flex-col gap-5 rounded-xl border border-admin-line bg-admin-canvas p-4">
            <div className="overflow-hidden rounded-lg border border-admin-line bg-admin-canvas">
              {/* `key` fuerza el remonte al cambiar de video: con <source> hijos
                  el navegador no recarga solo cuando cambia la fuente. */}
              <video
                key={sections.hero_video}
                controls
                preload="metadata"
                className="aspect-video w-full bg-admin-nav"
              >
                {videoSources(sections.hero_video).map((s) => (
                  <source key={s.src} src={s.src} type={s.type} />
                ))}
              </video>
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-admin-ink-soft">Video del hero</p>
              <p className="truncate text-sm text-admin-ink-soft">{sections.hero_video}</p>
              <VideoUploadField slug="hero_video" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
