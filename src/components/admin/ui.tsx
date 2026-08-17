import { FiChevronLeft, FiChevronRight, FiTrash2, FiImage } from "react-icons/fi";
import UploadField from "./UploadField";

// ── Encabezado de página ────────────────────────────────────────────
// El título ya no va dentro de una caja: la caja competía con las tarjetas de
// abajo y todo el contenido parecía del mismo nivel. Ahora es texto sobre el
// canvas, con un filete dorado como única marca.
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-[10px] uppercase tracking-[0.35em] text-admin-ink-soft">
        Villa Vicuña
      </p>
      <h1 className="mt-3 text-3xl uppercase tracking-[0.2em] text-admin-ink md:text-4xl">
        {title}
      </h1>
      <div className="mt-4 h-px w-16 bg-admin-gold" />
      {subtitle && (
        <p className="mt-4 max-w-3xl text-sm text-admin-ink-soft">{subtitle}</p>
      )}
    </div>
  );
}

// ── Tarjeta ─────────────────────────────────────────────────────────
// Blanca y plana: el gradiente crema + sombra fuerte hacía que cada bloque
// pidiera atención por igual. Con borde fino la jerarquía la marca el
// contenido, no el relieve.
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-admin-line bg-admin-surface p-5 md:p-6">
      {children}
    </div>
  );
}

// Título dentro de una tarjeta (con filete dorado a la izquierda).
export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-admin-line pb-4">
      <span className="h-4 w-px shrink-0 bg-admin-gold" />
      <h3 className="text-sm uppercase tracking-[0.2em] text-admin-ink capitalize md:text-base">
        {children}
      </h3>
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-admin-ink-soft">{children}</p>
  );
}

// ── Vista previa de portada (grande) ────────────────────────────────
export function CoverPreview({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-32 w-44 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-admin-line bg-admin-canvas text-admin-ink-soft">
        <FiImage className="h-5 w-5" />
        <span className="text-[10px] uppercase tracking-widest">Sin portada</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-32 w-44 rounded-xl border border-admin-line bg-admin-canvas object-cover" />
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
          danger ? "hover:bg-admin-danger/30 hover:text-white" : "hover:bg-white/10 hover:text-admin-gold"
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
    <div className="group relative h-32 w-32 overflow-hidden rounded-xl border border-admin-line bg-admin-canvas">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-admin-nav/85 px-1 backdrop-blur-[1px]">
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
  action: (formData: FormData) => Promise<{ ok: true } | { ok: false; error: string } | void>;
  hidden: Record<string, string>;
  uploadLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-admin-line bg-admin-canvas p-4 sm:flex-row">
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
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      No se pudo leer la base de datos. Verificá <code>DATABASE_URL</code> y que las
      migraciones y el seed (<code>npm run prisma:seed</code>) se hayan corrido.
    </div>
  );
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-admin-ink-soft">{children}</p>;
}
