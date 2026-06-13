import { getSectionImages } from "@/lib/content";
import { getSectionTexts } from "@/lib/translations";
import { setSectionImageAction, saveTranslationsAction } from "@/app/admin/actions";
import { PageHeader, Card, ImageField } from "@/components/admin/ui";
import TextEditor from "@/components/admin/TextEditor";

export const dynamic = "force-dynamic";

export default async function ContactoPage() {
  const sections = await getSectionImages();
  const texts = await getSectionTexts("contacto");

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Contacto" subtitle="Imagen y datos de contacto de la sección." />
      <Card>
        <ImageField
          label="Imagen"
          src={sections.contactenos}
          action={setSectionImageAction}
          hidden={{ slug: "contactenos" }}
        />
      </Card>
      {texts && (
        <TextEditor section={texts.section} values={texts.values} action={saveTranslationsAction} />
      )}
    </div>
  );
}
