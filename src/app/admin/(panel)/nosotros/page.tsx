import { getSectionImages } from "@/lib/content";
import { getSectionTexts } from "@/lib/translations";
import { setSectionImageAction, saveTranslationsAction } from "@/app/admin/actions";
import { PageHeader, Card, ImageField } from "@/components/admin/ui";
import TextEditor from "@/components/admin/TextEditor";

export const dynamic = "force-dynamic";

export default async function NosotrosPage() {
  const sections = await getSectionImages();
  const texts = await getSectionTexts("nosotros");

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Nosotros" subtitle="Imagen y textos de la sección «Acerca de nosotros»." />
      <Card>
        <ImageField
          label="Imagen"
          src={sections.nosotros}
          action={setSectionImageAction}
          hidden={{ slug: "nosotros" }}
        />
      </Card>
      {texts && (
        <TextEditor section={texts.section} values={texts.values} action={saveTranslationsAction} />
      )}
    </div>
  );
}
