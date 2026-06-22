"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { FiUploadCloud } from "react-icons/fi";
import { toast } from "sonner";

function SubmitButton({
  label,
  fileName,
  onDone,
  successLabel,
}: {
  label: string;
  fileName: string;
  onDone: () => void;
  successLabel: string;
}) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      toast.success(fileName ? `${successLabel}: ${fileName}` : successLabel);
      onDone();
    }
    wasPending.current = pending;
  }, [pending, onDone, fileName, successLabel]);

  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-2xl bg-[#17273f] px-4 py-3 text-xs uppercase tracking-[0.2em] text-white shadow-[0_14px_32px_rgba(23,39,63,0.18)] transition-all hover:bg-[#24395c] hover:shadow-[0_18px_36px_rgba(23,39,63,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Subiendo…" : label}
    </button>
  );
}

interface UploadFieldProps {
  action: (formData: FormData) => void;
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

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

      <SubmitButton
        label={label}
        fileName={fileName}
        onDone={reset}
        successLabel={successLabel}
      />
    </form>
  );
}
