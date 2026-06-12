import { prisma } from "@/lib/prisma";
import { STATIC_SECTION_IMAGES } from "@/lib/contentTypes";
import { setSectionImageAction } from "@/app/admin/actions";
import { PageTitle, Card, Thumb, UploadForm, DbErrorNotice } from "@/components/admin/ui";

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
    <>
      <PageTitle subtitle="Imágenes sueltas de las secciones del sitio.">Secciones</PageTitle>

      {dbError ? (
        <DbErrorNotice />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {sections.map((s) => (
            <Card key={s.slug}>
              <div className="flex gap-4">
                <Thumb src={s.path} alt={s.slug} />
                <div className="flex-1 space-y-3">
                  <p className="text-sm uppercase tracking-wider text-[#17273f]">
                    {SECTION_LABELS[s.slug]}
                  </p>
                  <UploadForm action={setSectionImageAction} hidden={{ slug: s.slug }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
