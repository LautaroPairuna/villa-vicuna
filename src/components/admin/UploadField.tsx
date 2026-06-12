"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { FiUploadCloud } from "react-icons/fi";

function SubmitButton({ label, onDone }: { label: string; onDone: () => void }) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) onDone();
    wasPending.current = pending;
  }, [pending, onDone]);

  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 text-xs uppercase tracking-[0.2em] bg-[#17273f] text-white px-4 py-2.5 hover:bg-[#24395c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Subiendo…" : label}
    </button>
  );
}

interface UploadFieldProps {
  action: (formData: FormData) => void;
  hidden: Record<string, string>;
  label?: string;
}

export default function UploadField({ action, hidden, label = "Subir" }: UploadFieldProps) {
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
    <form action={action} className="flex flex-col sm:flex-row sm:items-center gap-2">
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
        className={`flex-1 min-w-0 flex items-center gap-3 border border-dashed px-3 py-2.5 cursor-pointer transition-colors ${
          dragOver ? "border-[#17273f] bg-[#f8f4ea]" : "border-[#d8cdb0] hover:border-[#b9a877] hover:bg-[#f8f4ea]/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept="image/*"
          required
          className="sr-only"
          onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-9 h-9 object-cover border border-[#e3d6b5] shrink-0" />
        ) : (
          <FiUploadCloud className="w-5 h-5 text-[#17273f]/50 shrink-0" />
        )}
        <span className="text-sm text-[#17273f]/70 truncate">
          {fileName || "Arrastrá una imagen o hacé clic"}
        </span>
      </label>

      <SubmitButton label={label} onDone={reset} />
    </form>
  );
}
