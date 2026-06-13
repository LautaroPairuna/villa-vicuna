import { getSectionImages } from "@/lib/content";
import { getSectionTexts } from "@/lib/translations";
import { setSectionImageAction, saveTranslationsAction } from "@/app/admin/actions";
import { PageHeader, Card, ImageField } from "@/components/admin/ui";
import TextEditor from "@/components/admin/TextEditor";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const sections = await getSectionImages();
  const texts = await getSectionTexts("menu");

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Menú" subtitle="Imágenes de la carta y textos de la sección." />
      <Card>
        <div className="space-y-6">
          <ImageField
            label="Comidas"
            src={sections.menu_foods}
            action={setSectionImageAction}
            hidden={{ slug: "menu_foods" }}
          />
          <div className="border-t border-[#efe7d2]" />
          <ImageField
            label="Bebidas"
            src={sections.menu_drinks}
            action={setSectionImageAction}
            hidden={{ slug: "menu_drinks" }}
          />
        </div>
      </Card>
      {texts && (
        <TextEditor section={texts.section} values={texts.values} action={saveTranslationsAction} />
      )}
    </div>
  );
}
