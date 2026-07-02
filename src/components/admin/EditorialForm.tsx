import Link from "next/link";
import UploadField from "./UploadField";
import { Card, CoverPreview, FieldLabel } from "./ui";

const inputCls =
  "w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]";

interface EditorialFormProps {
  backHref: string;
  action: (formData: FormData) => void;
  title: string;
  subtitle: string;
  item?: {
    id?: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    published?: boolean;
    coverUrl?: string | null;
  };
  coverLabel: string;
  coverAction: (formData: FormData) => void;
  coverHidden?: Record<string, string>;
  extraFields?: React.ReactNode;
  deleteAction?: (formData: FormData) => void;
}

export default function EditorialForm({
  backHref,
  action,
  title,
  subtitle,
  item,
  coverLabel,
  coverAction,
  coverHidden,
  extraFields,
  deleteAction,
}: EditorialFormProps) {
  const coverFields = item?.id ? { id: item.id, ...(coverHidden ?? {}) } : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-full border border-[#e3d6b5] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#17273f] transition-all hover:border-[#17273f] hover:bg-white"
        >
          Volver
        </Link>
        {item?.id && deleteAction && (
          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <button className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-red-700 transition-all hover:bg-red-100">
              Eliminar
            </button>
          </form>
        )}
      </div>

      <Card>
        <div className="mb-6 border-b border-[#efe7d2] pb-5">
          <h2 className="text-xl uppercase tracking-[0.2em] text-[#17273f]">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#17273f]/65">{subtitle}</p>
        </div>

        {coverFields && (
          <div className="mb-6 flex flex-col gap-5 rounded-[24px] border border-[#efe7d2] bg-white/55 p-4 sm:flex-row">
            <CoverPreview src={item?.coverUrl} alt={coverLabel} />
            <div className="flex-1 min-w-0 flex flex-col">
              <FieldLabel>{coverLabel}</FieldLabel>
              <div className="mt-auto">
                <UploadField
                  action={coverAction}
                  hidden={coverFields}
                  label="Reemplazar portada"
                  successLabel="Portada actualizada"
                />
              </div>
            </div>
          </div>
        )}

        <form action={action} className="space-y-5">
          {item?.id && <input type="hidden" name="id" value={item.id} />}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <FieldLabel>Título</FieldLabel>
              <input name="title" defaultValue={item?.title} required className={inputCls} />
            </div>
            <div>
              <FieldLabel>Slug</FieldLabel>
              <input name="slug" defaultValue={item?.slug} required className={inputCls} />
            </div>
          </div>

          {extraFields}

          <div>
            <FieldLabel>Resumen</FieldLabel>
            <textarea
              name="summary"
              rows={4}
              defaultValue={item?.summary}
              required
              className={`${inputCls} resize-y`}
            />
          </div>

          <div>
            <FieldLabel>Contenido</FieldLabel>
            <textarea
              name="content"
              rows={10}
              defaultValue={item?.content}
              required
              className={`${inputCls} resize-y`}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <FieldLabel>SEO Title</FieldLabel>
              <input name="seoTitle" defaultValue={item?.seoTitle ?? ""} className={inputCls} />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-3 rounded-2xl border border-[#e3d6b5] bg-white/70 px-4 py-3 text-sm text-[#17273f]">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={item?.published ?? false}
                  className="h-4 w-4 accent-[#17273f]"
                />
                Publicado
              </label>
            </div>
          </div>

          <div>
            <FieldLabel>SEO Description</FieldLabel>
            <textarea
              name="seoDescription"
              rows={3}
              defaultValue={item?.seoDescription ?? ""}
              className={`${inputCls} resize-y`}
            />
          </div>

          <div className="flex justify-end border-t border-[#efe7d2] pt-5">
            <button className="rounded-2xl bg-[#17273f] px-5 py-3 text-xs uppercase tracking-[0.22em] text-white shadow-[0_14px_32px_rgba(23,39,63,0.18)] transition-all hover:bg-[#24395c] hover:shadow-[0_18px_36px_rgba(23,39,63,0.22)]">
              Guardar
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
