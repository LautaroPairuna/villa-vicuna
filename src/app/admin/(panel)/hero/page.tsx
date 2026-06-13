import { getSectionImages } from "@/lib/content";
import { setSectionImageAction } from "@/app/admin/actions";
import { PageHeader, Card, ImageField } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function HeroPage() {
  const sections = await getSectionImages();
  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Hero" subtitle="Imagen de portada del video principal." />
      <Card>
        <ImageField
          label="Póster del video"
          src={sections.hero_poster}
          action={setSectionImageAction}
          hidden={{ slug: "hero_poster" }}
        />
      </Card>
    </div>
  );
}
