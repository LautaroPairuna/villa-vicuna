// Piezas de UI reutilizables del panel (server components que renderizan
// formularios con server actions). Estética del sitio: crema/dorado/navy.

export function Thumb({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="w-24 h-24 border border-[#e3d6b5] bg-[#f8f4ea] flex items-center justify-center text-[10px] uppercase tracking-widest text-[#17273f]/50">
        sin imagen
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="w-24 h-24 object-cover border border-[#e3d6b5] bg-white"
    />
  );
}

export function UploadForm({
  action,
  hidden,
  label = "Subir",
}: {
  action: (formData: FormData) => void;
  hidden: Record<string, string>;
  label?: string;
}) {
  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <input
        type="file"
        name="file"
        accept="image/*"
        required
        className="text-sm text-[#17273f]/70 file:mr-3 file:border-0 file:bg-[#e3d6b5] file:text-[#17273f] file:px-3 file:py-1.5 file:uppercase file:tracking-wider file:text-xs file:cursor-pointer hover:file:bg-[#d6c3a2]"
      />
      <button className="text-xs uppercase tracking-[0.2em] bg-[#17273f] text-white px-4 py-2 hover:bg-[#24395c] transition-colors">
        {label}
      </button>
    </form>
  );
}

export function PageTitle({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl uppercase tracking-[0.2em] text-[#17273f]">{children}</h1>
      {subtitle && <p className="text-sm text-[#17273f]/60 mt-1">{subtitle}</p>}
    </div>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-black/5 shadow-sm p-5">{children}</div>;
}

export function DbErrorNotice() {
  return (
    <div className="border border-amber-300 bg-amber-50 text-amber-900 p-4 text-sm">
      No se pudo leer la base de datos. Verificá <code>DATABASE_URL</code> y que las
      migraciones y el seed (<code>npm run prisma:seed</code>) se hayan corrido.
    </div>
  );
}

export function MoveBtn({
  action,
  id,
  dir,
}: {
  action: (formData: FormData) => void;
  id: string;
  dir: "up" | "down";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dir" value={dir} />
      <button
        className="text-xs border border-[#17273f]/30 text-[#17273f] w-7 h-7 bg-white hover:bg-[#f8f4ea] transition-colors"
        title={dir === "up" ? "Mover antes" : "Mover después"}
      >
        {dir === "up" ? "←" : "→"}
      </button>
    </form>
  );
}

export function DeleteBtn({
  action,
  id,
}: {
  action: (formData: FormData) => void;
  id: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        className="text-xs border border-red-300 text-red-600 w-7 h-7 bg-white hover:bg-red-50 transition-colors"
        title="Eliminar"
      >
        ✕
      </button>
    </form>
  );
}
