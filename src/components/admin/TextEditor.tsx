"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { type EditableSection, decomposeSplit } from "@/lib/editableContent";

const LOCALES = [
  { id: "es", label: "Español" },
  { id: "en", label: "English" },
  { id: "fr", label: "Français" },
];

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs uppercase tracking-[0.2em] bg-[#17273f] text-white px-5 py-2.5 hover:bg-[#24395c] transition-colors disabled:opacity-50"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

const inputCls =
  "w-full border border-[#d8cdb0] bg-[#f8f4ea] px-3 py-2 text-sm text-[#17273f] outline-none focus:border-[#17273f] transition-colors";

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
    <div className="bg-white border border-[#e7ddc4] shadow-[0_1px_3px_rgba(23,39,63,0.06)]">
      {/* Pestañas de idioma */}
      <div className="flex border-b border-[#efe7d2]">
        {LOCALES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setActive(l.id)}
            className={`px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors ${
              active === l.id
                ? "bg-[#17273f] text-white"
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
                  <div key={f.key}>
                    <label className="block text-xs uppercase tracking-widest text-[#17273f]/60 mb-2">
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
                  <div key={f.key}>
                    <label className="block text-xs uppercase tracking-widest text-[#17273f]/60 mb-2">
                      {f.label}
                    </label>
                    <textarea name={f.key} defaultValue={raw} rows={3} className={inputCls} />
                  </div>
                );
              }

              return (
                <div key={f.key}>
                  <label className="block text-xs uppercase tracking-widest text-[#17273f]/60 mb-2">
                    {f.label}
                  </label>
                  <input name={f.key} defaultValue={raw} className={inputCls} />
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <SaveButton />
          </div>
        </form>
      ))}
    </div>
  );
}
