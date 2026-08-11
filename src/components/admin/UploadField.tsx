"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiUploadCloud } from "react-icons/fi";
import { toast } from "sonner";

type UploadResult = { ok: true } | { ok: false; error: string };

interface UploadFieldProps {
  // La acción DEVUELVE un resultado (ok/error). Admitimos void por si alguna
  // acción legacy no devuelve nada: en ese caso se trata como éxito.
  action: (formData: FormData) => Promise<UploadResult | void>;
  hidden: Record<string, string>;
  label?: string;
  accept?: string;
  emptyLabel?: string;
  successLabel?: string;
}

export default function UploadField({
  action,
  hidden,
  label = "Subir",
  accept = "image/*",
  emptyLabel = "Arrastrá una imagen o hacé clic",
  successLabel = "Archivo actualizado",
}: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function applyFile(f: File | null) {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return f && f.type.startsWith("image/") ? URL.createObjectURL(f) : null;
    });
    setFileName(f?.name ?? "");
  }

  function reset() {
    if (inputRef.current) inputRef.current.value = "";
    applyFile(null);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(f);
      inputRef.current.files = dt.files;
      applyFile(f);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = fileName;

    startTransition(async () => {
      try {
        const res = await action(formData);
        if (res && res.ok === false) {
          // Error real devuelto por la acción (no se guardó nada).
          toast.error(res.error);
          return;
        }
        toast.success(name ? `${successLabel}: ${name}` : successLabel);
        reset();
        // Re-renderiza los server components (preview de portada, etc.) con el
        // dato nuevo, ya que la subida no navega.
        router.refresh();
      } catch {
        toast.error("No se pudo subir el archivo. Intentá de nuevo.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[24px] border border-dashed px-4 py-3 transition-all ${
          dragOver
            ? "border-[#17273f] bg-[#f8f4ea] shadow-[0_0_0_4px_rgba(227,214,181,0.28)]"
            : "border-[#d8cdb0] bg-white/80 hover:border-[#b9a877] hover:bg-[#f8f4ea]/70"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept={accept}
          required
          className="sr-only"
          onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-10 w-10 shrink-0 rounded-xl border border-[#e3d6b5] object-cover" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e3d6b5] bg-[#f8f4ea]">
            <FiUploadCloud className="h-5 w-5 text-[#17273f]/50" />
          </span>
        )}
        <span className="text-sm text-[#17273f]/70 truncate">
          {fileName || emptyLabel}
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-2xl bg-[#17273f] px-4 py-3 text-xs uppercase tracking-[0.2em] text-white shadow-[0_14px_32px_rgba(23,39,63,0.18)] transition-all hover:bg-[#24395c] hover:shadow-[0_18px_36px_rgba(23,39,63,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Subiendo…" : label}
      </button>
    </form>
  );
}
