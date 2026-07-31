import { FiChevronLeft, FiChevronRight, FiTrash2, FiImage } from "react-icons/fi";
import UploadField from "./UploadField";

// ── Encabezado de página ────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8 rounded-[28px] border border-[#e3d6b5] bg-[linear-gradient(180deg,#fcfaf5_0%,#f7f1e6_100%)] px-6 py-6 shadow-[0_16px_40px_rgba(23,39,63,0.06)] md:px-8">
      <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-[#17273f]/45">
        Villa Vicuna
      </p>
      <h1 className="text-3xl md:text-4xl uppercase tracking-[0.2em] text-[#17273f]">{title}</h1>
      <div className="mt-4 h-[2px] w-20 bg-[linear-gradient(90deg,#e3d6b5,#cbb789)]" />
      {subtitle && <p className="mt-4 max-w-3xl text-sm leading-6 text-[#17273f]/65">{subtitle}</p>}
    </div>
  );
}

// ── Tarjeta blanca ──────────────────────────────────────────────────
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[#e7ddc4] bg-[linear-gradient(180deg,#fcfaf5_0%,#f7f1e6_100%)] p-5 shadow-[0_20px_45px_rgba(23,39,63,0.07)] md:p-6">
      {children}
    </div>
  );
}

// Título dentro de una tarjeta (con bullet dorado).
export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-[#efe7d2] pb-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e3d6b5] bg-[#f8f4ea]">
        <span className="h-2 w-2 rounded-full bg-[#cbb789]" />
      </span>
      <h3 className="text-base md:text-lg uppercase tracking-[0.2em] text-[#17273f] capitalize">
        {children}
      </h3>
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.2em] text-[#17273f]/50 mb-2">{children}</p>
  );
}

// ── Vista previa de portada (grande) ────────────────────────────────
export function CoverPreview({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-32 w-44 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-[#d8cdb0] bg-[#f8f4ea] text-[#17273f]/40">
        <FiImage className="w-5 h-5" />
        <span className="text-[10px] uppercase tracking-widest">Sin portada</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-32 w-44 rounded-2xl border border-[#e3d6b5] bg-white object-cover shadow-[0_12px_26px_rgba(23,39,63,0.08)]" />
  );
}

// ── Botón de acción dentro de la barra de una miniatura ─────────────
function IconForm({
  action,
  fields,
  title,
  danger,
  children,
}: {
  action: (formData: FormData) => void;
  fields: Record<string, string>;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        title={title}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors ${
          danger ? "hover:bg-red-500/20 hover:text-red-200" : "hover:bg-white/10 hover:text-[#e3d6b5]"
        }`}
      >
        {children}
      </button>
    </form>
  );
}

// ── Miniatura de carrusel con barra de acciones sobre la imagen ─────
export function MediaTile({
  id,
  src,
  alt,
  moveAction,
  deleteAction,
}: {
  id: string;
  src: string;
  alt: string;
  moveAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
}) {
  return (
    <div className="group relative h-32 w-32 overflow-hidden rounded-2xl border border-[#e3d6b5] bg-white shadow-[0_12px_26px_rgba(23,39,63,0.08)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1 bg-[#17273f]/85 backdrop-blur-[1px]">
        <IconForm action={moveAction} fields={{ id, dir: "up" }} title="Mover antes">
          <FiChevronLeft className="w-4 h-4" />
        </IconForm>
        <IconForm action={deleteAction} fields={{ id }} title="Eliminar" danger>
          <FiTrash2 className="w-3.5 h-3.5" />
        </IconForm>
        <IconForm action={moveAction} fields={{ id, dir: "down" }} title="Mover después">
          <FiChevronRight className="w-4 h-4" />
        </IconForm>
      </div>
    </div>
  );
}

// Bloque de imagen de sección: preview + uploader.
export function ImageField({
  label,
  src,
  action,
  hidden,
  uploadLabel = "Reemplazar",
}: {
  label: string;
  src?: string | null;
  action: (formData: FormData) => void;
  hidden: Record<string, string>;
  uploadLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[24px] border border-[#efe7d2] bg-[#fcfaf5] p-4 sm:flex-row">
      <CoverPreview src={src} alt={label} />
      <div className="flex-1 min-w-0 flex flex-col">
        <FieldLabel>{label}</FieldLabel>
        <div className="mt-auto">
          <UploadField action={action} hidden={hidden} label={uploadLabel} />
        </div>
      </div>
    </div>
  );
}

export function DbErrorNotice() {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-[0_12px_26px_rgba(180,83,9,0.08)]">
      No se pudo leer la base de datos. Verificá <code>DATABASE_URL</code> y que las
      migraciones y el seed (<code>npm run prisma:seed</code>) se hayan corrido.
    </div>
  );
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#17273f]/60">{children}</p>;
}
