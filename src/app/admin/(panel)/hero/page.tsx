import { getSectionImages } from "@/lib/content";
import { setSectionImageAction, setSectionVideoAction } from "@/app/admin/actions";
import UploadField from "@/components/admin/UploadField";
import { Card, ImageField, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

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

          <div className="flex flex-col gap-5 rounded-[24px] border border-[#efe7d2] bg-white/55 p-4">
            <div className="overflow-hidden rounded-[22px] border border-[#e3d6b5] bg-[#f8f4ea]">
              <video
                key={sections.hero_video}
                src={sections.hero_video}
                controls
                preload="metadata"
                className="aspect-video w-full bg-[#17273f]"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#17273f]/50">Video del hero</p>
              <p className="truncate text-sm text-[#17273f]/60">{sections.hero_video}</p>
              <UploadField
                action={setSectionVideoAction}
                hidden={{ slug: "hero_video" }}
                label="Reemplazar video"
                accept="video/mp4,video/webm,video/quicktime"
                emptyLabel="Arrastrá un video o hacé clic"
                successLabel="Video actualizado"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
