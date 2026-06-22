"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { type EditableSection, decomposeSplit } from "@/lib/editableContent";

const LOCALES = [
  { id: "es", label: "Español" },
  { id: "en", label: "English" },
  { id: "fr", label: "Français" },
];

function SaveButton({
  localeLabel,
}: {
  localeLabel: string;
}) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      toast.success(`Textos guardados en ${localeLabel}.`);
    }
    wasPending.current = pending;
  }, [pending, localeLabel]);

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-2xl bg-[#17273f] px-5 py-3 text-xs uppercase tracking-[0.22em] text-white shadow-[0_14px_32px_rgba(23,39,63,0.18)] transition-all hover:bg-[#24395c] hover:shadow-[0_18px_36px_rgba(23,39,63,0.22)] disabled:opacity-50"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

const inputCls =
  "w-full rounded-2xl border border-[#d8cdb0] bg-[#f8f4ea] px-4 py-3 text-sm text-[#17273f] outline-none transition-all focus:border-[#17273f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(227,214,181,0.28)]";

export default function TextEditor({
  section,
  values,
  action,
}: {
  section: EditableSection;
  values: Record<string, Record<string, string>>;
  action: (formData: FormData) => void;
}) {
  const [active, setActive] = useState("es");

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e7ddc4] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,244,234,0.92)_100%)] shadow-[0_20px_45px_rgba(23,39,63,0.07)]">
      {/* Pestañas de idioma */}
      <div className="flex border-b border-[#efe7d2] bg-white/70 p-2">
        {LOCALES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setActive(l.id)}
            className={`rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.2em] transition-all ${
              active === l.id
                ? "bg-[#17273f] text-white shadow-[0_12px_28px_rgba(23,39,63,0.18)]"
                : "text-[#17273f]/70 hover:bg-[#f8f4ea]"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {LOCALES.map((l) => (
        <form
          key={l.id}
          action={action}
          className={`p-5 md:p-6 ${active === l.id ? "block" : "hidden"}`}
        >
          <input type="hidden" name="locale" value={l.id} />
          <input type="hidden" name="section" value={section.id} />

          <div className="space-y-5">
            {section.fields.map((f) => {
              const raw = values[l.id]?.[f.key] ?? "";

              if (f.type === "splitTitle" && f.wrap) {
                const { a, b } = decomposeSplit(f.wrap, raw);
                return (
                  <div key={f.key} className="rounded-[24px] border border-[#efe7d2] bg-white/60 p-4">
                    <label className="mb-2 block text-xs uppercase tracking-widest text-[#17273f]/60">
                      {f.label}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        name={`${f.key}__a`}
                        defaultValue={a}
                        placeholder={f.wrap.labelA}
                        className={inputCls}
                      />
                      <input
                        name={`${f.key}__b`}
                        defaultValue={b}
                        placeholder={f.wrap.labelB}
                        className={inputCls}
                      />
                    </div>
                  </div>
                );
              }

              if (f.type === "textarea") {
                return (
                  <div key={f.key} className="rounded-[24px] border border-[#efe7d2] bg-white/60 p-4">
                    <label className="mb-2 block text-xs uppercase tracking-widest text-[#17273f]/60">
                      {f.label}
                    </label>
                    <textarea name={f.key} defaultValue={raw} rows={4} className={`${inputCls} resize-y`} />
                  </div>
                );
              }

              return (
                <div key={f.key} className="rounded-[24px] border border-[#efe7d2] bg-white/60 p-4">
                  <label className="mb-2 block text-xs uppercase tracking-widest text-[#17273f]/60">
                    {f.label}
                  </label>
                  <input name={f.key} defaultValue={raw} className={inputCls} />
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-end border-t border-[#efe7d2] pt-5">
            <SaveButton localeLabel={l.label} />
          </div>
        </form>
      ))}
    </div>
  );
}
