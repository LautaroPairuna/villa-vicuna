import { getSectionTexts } from "@/lib/translations";
import { saveTranslationsAction } from "@/app/admin/actions";
import { PageHeader } from "@/components/admin/ui";
import TextEditor from "@/components/admin/TextEditor";

export default async function ExperienciasPage() {
  const texts = await getSectionTexts("experiencias");

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Experiencias Barolo"
        subtitle="Textos de la página «Experiencias» (degustaciones Barolo), editables en español, inglés y francés."
      />
      {texts && (
        <TextEditor section={texts.section} values={texts.values} action={saveTranslationsAction} />
      )}
    </div>
  );
}
