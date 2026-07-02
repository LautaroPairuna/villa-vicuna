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
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#17273f]/55">
            CTA Label
          </label>
          <input
            name="ctaLabel"
            defaultValue={ctaLabel ?? ""}
            className="w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#17273f]/55">
            CTA Href
          </label>
          <input
            name="ctaHref"
            defaultValue={ctaHref ?? ""}
            className="w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#17273f]/55">
            Vigencia desde
          </label>
          <input
            type="date"
            name="validFrom"
            defaultValue={toDateInput(validFrom)}
            className="w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-[#17273f]/55">
            Vigencia hasta
          </label>
          <input
            type="date"
            name="validTo"
            defaultValue={toDateInput(validTo)}
            className="w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
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
