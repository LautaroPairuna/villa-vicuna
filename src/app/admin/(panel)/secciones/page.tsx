import { prisma } from "@/lib/prisma";
import { STATIC_SECTION_IMAGES } from "@/lib/contentTypes";
import { setSectionImageAction } from "@/app/admin/actions";
import {
  PageHeader,
  Card,
  CoverPreview,
  FieldLabel,
  DbErrorNotice,
} from "@/components/admin/ui";
import UploadField from "@/components/admin/UploadField";

export const dynamic = "force-dynamic";

const SECTION_LABELS: Record<string, string> = {
  hero_poster: "Hero · Póster del video",
  nosotros: "Nosotros · Imagen",
  contactenos: "Contacto · Imagen",
  menu_foods: "Menú · Comidas",
  menu_drinks: "Menú · Bebidas",
};

export default async function SeccionesPage() {
  let dbError = false;
  let sections: { slug: string; path: string | null }[] = [];

  try {
    const rows = await prisma.sectionImage.findMany({ include: { media: true } });
    const bySlug = new Map(rows.map((s) => [s.slug, s.media?.path ?? null]));
    sections = Object.keys(SECTION_LABELS).map((slug) => ({
      slug,
      path: bySlug.get(slug) ?? STATIC_SECTION_IMAGES[slug] ?? null,
    }));
  } catch {
    dbError = true;
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title="Secciones" subtitle="Imágenes sueltas de las secciones del sitio." />

      {dbError ? (
        <DbErrorNotice />
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {sections.map((s) => (
            <Card key={s.slug}>
              <div className="flex gap-5">
                <CoverPreview src={s.path} alt={s.slug} />
                <div className="flex-1 min-w-0 flex flex-col">
                  <FieldLabel>{SECTION_LABELS[s.slug]}</FieldLabel>
                  <div className="mt-auto">
                    <UploadField
                      action={setSectionImageAction}
                      hidden={{ slug: s.slug }}
                      label="Reemplazar"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
