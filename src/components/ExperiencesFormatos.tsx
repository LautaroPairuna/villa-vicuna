"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Reveal from "./Reveal";
import { ImageWithFallback } from "./ImageWithFallback";
import { editorialEyebrow } from "./editorialUi";

export type { ExperienceFormat } from "./formatosTypes";
import type { ExperienceFormat, Labels } from "./formatosTypes";

const FormatoModal = dynamic(() => import("./FormatoModal"), { ssr: false });


export default function ExperiencesFormatos({
  formatos,
  labels,
}: {
  formatos: ExperienceFormat[];
  labels: Labels;
}) {
  const [selected, setSelected] = useState<ExperienceFormat | null>(null);
  const [modalCargado, setModalCargado] = useState(false);
  const close = useCallback(() => setSelected(null), []);

  return (
    <>
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {formatos.map((f, i) => (
          <Reveal as="article" key={f.key} delay={i * 120} className="flex flex-col">
            <button
              type="button"
              onClick={() => {
                setModalCargado(true);
                setSelected(f);
              }}
              aria-label={`${labels.verMasLabel} — ${f.nombre}`}
              className="group relative aspect-[4/5] w-full overflow-hidden bg-white shadow-lg"
            >
              <ImageWithFallback
                src={f.images[0]}
                alt={f.nombre}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* scrim + info */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-5 pb-5 pt-16 text-left">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/70">{f.capacidad}</p>
                <h3 className="mt-2 text-2xl uppercase tracking-[0.12em] text-white">{f.nombre}</h3>
                <p className="mt-2 text-sm tracking-[0.06em] text-white/85">
                  {f.precio} <span className="text-white/60">{f.precioNota}</span>
                </p>
              </div>
              {/* hover "ver más" */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M10 4a6 6 0 105.293 9.293l3.707 3.707a1 1 0 001.414-1.414l-3.707-3.707A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z" />
                  </svg>
                  {labels.verMasLabel}
                </span>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {modalCargado && <FormatoModal formato={selected} labels={labels} onClose={close} />}
    </>
  );
}
