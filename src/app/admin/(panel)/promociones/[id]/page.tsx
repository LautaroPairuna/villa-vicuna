import { notFound } from "next/navigation";
import EditorialForm from "@/components/admin/EditorialForm";
import { PageHeader } from "@/components/admin/ui";
import {
  deletePromotionAction,
  setPromotionCoverAction,
  updatePromotionAction,
} from "@/app/admin/actions";
import { getPromotionByIdAdmin } from "@/lib/editorial";

function toDateInput(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function PromotionExtraFields({
  ctaLabel,
  ctaHref,
  validFrom,
  validTo,
}: {
  ctaLabel?: string | null;
  ctaHref?: string | null;
  validFrom: Date | null;
  validTo: Date | null;
}) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            CTA Label
          </label>
          <input
            name="ctaLabel"
            defaultValue={ctaLabel ?? ""}
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-admin-ink-soft">
            CTA Href
          </label>
          <input
            name="ctaHref"
            defaultValue={ctaHref ?? ""}
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
            defaultValue={toDateInput(validFrom)}
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
            defaultValue={toDateInput(validTo)}
            className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
          />
        </div>
      </div>
    </>
  );
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promotion = await getPromotionByIdAdmin(id);

  if (!promotion) {
    notFound();
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title={promotion.title}
        subtitle="Editá el contenido público, la portada y la metadata de esta promoción."
      />
      <EditorialForm
        backHref="/admin/promociones"
        action={updatePromotionAction}
        title="Detalle de la promoción"
        subtitle="Mantené esta URL enfocada en una única oferta, con CTA claro y contenido suficiente para posicionar."
        item={promotion}
        coverLabel="Portada"
        coverAction={setPromotionCoverAction}
        extraFields={
          <PromotionExtraFields
            ctaLabel={promotion.ctaLabel}
            ctaHref={promotion.ctaHref}
            validFrom={promotion.validFrom}
            validTo={promotion.validTo}
          />
        }
        deleteAction={deletePromotionAction}
      />
    </div>
  );
}
