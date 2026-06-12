import { FiChevronLeft, FiChevronRight, FiTrash2, FiImage } from "react-icons/fi";

// ── Encabezado de página ────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl uppercase tracking-[0.2em] text-[#17273f]">{title}</h1>
      <div className="mt-3 h-[2px] w-14 bg-[#e3d6b5]" />
      {subtitle && <p className="text-sm text-[#17273f]/60 mt-3">{subtitle}</p>}
    </div>
  );
}

// ── Tarjeta blanca ──────────────────────────────────────────────────
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e7ddc4] shadow-[0_1px_3px_rgba(23,39,63,0.06)] p-5 md:p-6">
      {children}
    </div>
  );
}

// Título dentro de una tarjeta (con bullet dorado).
export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#efe7d2]">
      <span className="w-2 h-2 bg-[#e3d6b5] shrink-0" />
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
      <div className="w-44 h-32 border border-dashed border-[#d8cdb0] bg-[#f8f4ea] flex flex-col items-center justify-center gap-1 text-[#17273f]/40">
        <FiImage className="w-5 h-5" />
        <span className="text-[10px] uppercase tracking-widest">Sin portada</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="w-44 h-32 object-cover border border-[#e3d6b5] bg-white" />
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
        className={`w-7 h-7 flex items-center justify-center text-white/80 transition-colors ${
          danger ? "hover:text-red-300" : "hover:text-[#e3d6b5]"
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
    <div className="relative w-32 h-32 border border-[#e3d6b5] bg-white overflow-hidden group">
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

export function DbErrorNotice() {
  return (
    <div className="border border-amber-300 bg-amber-50 text-amber-900 p-4 text-sm">
      No se pudo leer la base de datos. Verificá <code>DATABASE_URL</code> y que las
      migraciones y el seed (<code>npm run prisma:seed</code>) se hayan corrido.
    </div>
  );
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#17273f]/60">{children}</p>;
}
