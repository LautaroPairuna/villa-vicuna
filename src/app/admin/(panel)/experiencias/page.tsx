import { getSectionTexts } from "@/lib/translations";
import { getSectionImages } from "@/lib/content";
import { saveTranslationsAction, setSectionImageAction, setSectionVideoAction } from "@/app/admin/actions";
import { Card, CardTitle, ImageField, PageHeader } from "@/components/admin/ui";
import UploadField from "@/components/admin/UploadField";
import TextEditor from "@/components/admin/TextEditor";

function VideoField({
  label,
  slug,
  src,
}: {
  label: string;
  slug: string;
  src?: string;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[24px] border border-[#efe7d2] bg-white/55 p-4">
      <div className="overflow-hidden rounded-[22px] border border-[#e3d6b5] bg-[#f8f4ea]">
        <video
          key={src}
          src={src}
          controls
          preload="metadata"
          className="aspect-video w-full bg-[#17273f]"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#17273f]/50">{label}</p>
        <p className="truncate text-sm text-[#17273f]/60">{src}</p>
        <UploadField
          action={setSectionVideoAction}
          hidden={{ slug }}
          label="Reemplazar video"
          accept="video/mp4,video/webm,video/quicktime"
          emptyLabel="Arrastrá un video o hacé clic"
          successLabel="Video actualizado"
        />
      </div>
    </div>
  );
}

export default async function ExperienciasPage() {
  const texts = await getSectionTexts("experiencias");
  const sections = await getSectionImages();

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Experiencias Barolo"
        subtitle="Textos, videos de fondo y fotos de la página «Experiencias» (degustaciones Barolo)."
      />

      <Card>
        <CardTitle>Videos de fondo</CardTitle>
        <div className="space-y-5">
          <VideoField
            label="Video · sección de la cita (enóloga)"
            slug="experiencias_cita_video"
            src={sections.experiencias_cita_video}
          />
          <VideoField
            label="Video · sección de testimonio"
            slug="experiencias_testimonio_video"
            src={sections.experiencias_testimonio_video}
          />
        </div>
      </Card>

      <Card>
        <CardTitle>Fotos · Formatos</CardTitle>
        <div className="space-y-5">
          <ImageField
            label="Carácter del Norte"
            src={sections.experiencias_formato_intima}
            action={setSectionImageAction}
            hidden={{ slug: "experiencias_formato_intima" }}
          />
          <ImageField
            label="Recorrido por el Terroir"
            src={sections.experiencias_formato_terroir}
            action={setSectionImageAction}
            hidden={{ slug: "experiencias_formato_terroir" }}
          />
          <ImageField
            label="Atardecer Íntimo"
            src={sections.experiencias_formato_atardecer}
            action={setSectionImageAction}
            hidden={{ slug: "experiencias_formato_atardecer" }}
          />
        </div>
      </Card>

      <Card>
        <CardTitle>Fotos · El tapeo</CardTitle>
        <div className="space-y-5">
          <ImageField
            label="Bocado 1"
            src={sections.experiencias_tapeo_0}
            action={setSectionImageAction}
            hidden={{ slug: "experiencias_tapeo_0" }}
          />
          <ImageField
            label="Bocado 2"
            src={sections.experiencias_tapeo_1}
            action={setSectionImageAction}
            hidden={{ slug: "experiencias_tapeo_1" }}
          />
          <ImageField
            label="Bocado 3"
            src={sections.experiencias_tapeo_2}
            action={setSectionImageAction}
            hidden={{ slug: "experiencias_tapeo_2" }}
          />
          <ImageField
            label="Bocado 4"
            src={sections.experiencias_tapeo_3}
            action={setSectionImageAction}
            hidden={{ slug: "experiencias_tapeo_3" }}
          />
        </div>
      </Card>

      {texts && (
        <TextEditor section={texts.section} values={texts.values} action={saveTranslationsAction} />
      )}
    </div>
  );
}
