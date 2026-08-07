"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";
import { ImageWithFallback } from "./ImageWithFallback";
import { editorialEyebrow, editorialPrimaryButton } from "./editorialUi";

export type ExperienceFormat = {
  key: string;
  nombre: string;
  capacidad: string;
  precio: string;
  precioNota: string;
  resumen: string;
  incluye: string[];
  images: string[];
  whatsappUrl: string;
};

type Labels = {
  incluyeLabel: string;
  verMasLabel: string;
  reservarLabel: string;
};

function FormatoModal({
  formato,
  labels,
  onClose,
}: {
  formato: ExperienceFormat;
  labels: Labels;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const total = formato.images.length;

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p === total - 1 ? 0 : p + 1));
  }, [total]);
  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p === 0 ? total - 1 : p - 1));
  }, [total]);

  useEffect(() => {
    setCurrent(0);
    setDirection(0);
  }, [formato]);

  const imageVariants = {
    initial: (d: number) => ({ opacity: 0, x: d > 0 ? 50 : -50 }),
    animate: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -50 : 50 }),
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/80 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div
        className="relative mt-8 max-h-[90vh] w-full max-w-md overflow-y-auto bg-white px-4 pb-6 pt-4 sm:px-8 md:mt-0 md:px-10 md:pb-8 md:pt-10 lg:max-w-6xl"
        initial={{ scale: 0.92, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 40, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute left-0 top-1 z-20 flex items-center rounded-br-full rounded-tr-full bg-[#17273f] px-2 py-2 text-white md:top-6 md:px-4 md:py-3"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Texto (primero, como en Habitaciones/Reseñas; en desktop queda a la
              izquierda). El pt/pl deja libre el botón de cerrar. */}
          <div className="pt-12 lg:col-span-7 lg:pl-12 lg:pt-2">
            <p className={editorialEyebrow}>{formato.capacidad}</p>
            <h3 className="mt-3 text-3xl uppercase tracking-[0.14em] text-black md:text-4xl">
              {formato.nombre}
            </h3>
            <p className="mt-5 text-base leading-7 tracking-[0.04em] text-black/75">
              {formato.resumen}
            </p>

            <p className="mb-3 mt-7 text-xs uppercase tracking-[0.28em] text-black/45">
              {labels.incluyeLabel}
            </p>
            <ul className="space-y-2">
              {formato.incluye.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-6 tracking-[0.03em] text-black/80">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#17273f]" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Precio y CTA en la misma línea. En desktop la nota del precio
                pasa debajo del importe para que el botón entre al lado; el
                flex-wrap queda de red por si una etiqueta traducida crece. */}
            <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-black/10 pt-6">
              <div className="flex flex-wrap items-baseline gap-x-2 lg:flex-col lg:items-start lg:gap-y-1">
                <span className="text-3xl tracking-[0.08em] text-[#17273f]">{formato.precio}</span>
                <span className={editorialEyebrow}>{formato.precioNota}</span>
              </div>
              <a href={formato.whatsappUrl} target="_blank" rel="noopener noreferrer" className={editorialPrimaryButton}>
                {labels.reservarLabel}
              </a>
            </div>
          </div>

          {/* Carrusel de imágenes (debajo en mobile, a la derecha en desktop).
              En mobile manda el aspect ratio; en desktop la columna se estira
              con el grid para terminar justo donde termina el botón de la
              columna de texto. */}
          <div className="relative aspect-[4/3] w-full lg:col-span-5 lg:aspect-auto">
            <div className="absolute inset-0 overflow-hidden">
              <AnimatePresence custom={direction}>
                <motion.div
                  key={current}
                  className="absolute inset-0"
                  custom={direction}
                  variants={imageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                >
                  <ImageWithFallback
                    src={formato.images[current]}
                    alt={`${formato.nombre} ${current + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            {total > 1 && (
              <>
                <button onClick={prev} aria-label="Anterior" className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center justify-center text-white drop-shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={next} aria-label="Siguiente" className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center text-white drop-shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ExperiencesFormatos({
  formatos,
  labels,
}: {
  formatos: ExperienceFormat[];
  labels: Labels;
}) {
  const [selected, setSelected] = useState<ExperienceFormat | null>(null);
  const close = useCallback(() => setSelected(null), []);

  return (
    <>
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {formatos.map((f, i) => (
          <Reveal as="article" key={f.key} delay={i * 120} className="flex flex-col">
            <button
              type="button"
              onClick={() => setSelected(f)}
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

      <AnimatePresence>
        {selected && <FormatoModal formato={selected} labels={labels} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
