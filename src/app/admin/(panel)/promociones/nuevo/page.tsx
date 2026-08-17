import EditorialForm from "@/components/admin/EditorialForm";
import { PageHeader } from "@/components/admin/ui";
import { createPromotionAction, setPromotionCoverAction } from "@/app/admin/actions";

function PromotionExtraFields() {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            CTA Label
          </label>
          <input
            name="ctaLabel"
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            CTA Href
          </label>
          <input
            name="ctaHref"
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            Vigencia desde
          </label>
          <input
            type="date"
            name="validFrom"
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            Vigencia hasta
          </label>
          <input
            type="date"
            name="validTo"
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
      </div>
    </>
  );
}

export default function NewPromotionPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Nueva promoción"
        subtitle="Creá una landing comercial pública con título, resumen, detalle y CTA."
      />
      <EditorialForm
        backHref="/admin/promociones"
        action={createPromotionAction}
        title="Detalle de la promoción"
        subtitle="Usá contenido concreto y estable. Si la promoción va a durar pocos días, mantené el texto corto y la vigencia clara."
        coverLabel="Portada"
        coverAction={setPromotionCoverAction}
        extraFields={<PromotionExtraFields />}
      />
    </div>
  );
}
