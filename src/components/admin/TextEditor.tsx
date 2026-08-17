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
      className="rounded-xl bg-admin-nav px-5 py-3 text-xs uppercase tracking-[0.22em] text-white transition-colors hover:bg-admin-nav-soft disabled:opacity-50"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

const inputCls =
  "w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface";

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
    <div className="overflow-hidden rounded-2xl border border-admin-line bg-admin-surface">
      {/* Pestañas de idioma. El idioma activo se marca con el filete dorado,
          igual que el item activo del sidebar: mismo color, mismo significado. */}
      <div className="flex gap-1 border-b border-admin-line px-2">
        {LOCALES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setActive(l.id)}
            aria-pressed={active === l.id}
            className={`border-b-2 px-4 py-3.5 text-xs uppercase tracking-[0.2em] transition-colors ${
              active === l.id
                ? "border-admin-gold text-admin-ink"
                : "border-transparent text-admin-ink-soft hover:text-admin-ink"
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
          {section.fields.map((f) => (
            <input key={`${l.id}-${f.key}`} type="hidden" name="fieldKey" value={f.key} />
          ))}

          <div className="space-y-5">
            {section.fields.map((f) => {
              const raw = values[l.id]?.[f.key] ?? "";

              if (f.type === "splitTitle" && f.wrap) {
                const { a, b } = decomposeSplit(f.wrap, raw);
                return (
                  <div key={f.key} className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-admin-ink-soft">
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
                  <div key={f.key} className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-admin-ink-soft">
                      {f.label}
                    </label>
                    <textarea name={f.key} defaultValue={raw} rows={4} className={`${inputCls} resize-y`} />
                  </div>
                );
              }

              return (
                <div key={f.key} className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-admin-ink-soft">
                    {f.label}
                  </label>
                  <input name={f.key} defaultValue={raw} className={inputCls} />
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-end border-t border-admin-line pt-5">
            <SaveButton localeLabel={l.label} />
          </div>
        </form>
      ))}
    </div>
  );
}
