"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageWithFallback } from "./ImageWithFallback";
import { editorialEyebrow, editorialPrimaryButton } from "./editorialUi";
import type { ExperienceFormat, Labels } from "./formatosTypes";

// Se carga con next/dynamic al abrir un formato, así la librería de animación
// no viaja en la carga inicial de /experiencias.
export default function FormatoModalPortal({
  formato,
  labels,
  onClose,
}: {
  formato: ExperienceFormat | null;
  labels: Labels;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {formato && <FormatoModal formato={formato} labels={labels} onClose={onClose} />}
    </AnimatePresence>
  );
}

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
        className="relative mt-8 max-h-[90vh] w-full max-w-md overflow-y-auto bg-white px-4 pb-6 pt-4 sm:px-8 md:mt-0 md:px-10 md:pb-8 md:pt-10 lg:max-w-5xl"
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

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl tracking-[0.08em] text-[#17273f]">{formato.precio}</span>
                <span className={editorialEyebrow}>{formato.precioNota}</span>
              </div>
              <a href={formato.whatsappUrl} target="_blank" rel="noopener noreferrer" className={editorialPrimaryButton}>
                {labels.reservarLabel}
              </a>
            </div>
          </div>

          {/* Carrusel de imágenes (debajo en mobile, a la derecha en desktop) */}
          <div className="relative flex aspect-[4/3] w-full items-center justify-center lg:col-span-5 lg:aspect-[6/8]">
            <div className="relative h-full w-full overflow-hidden">
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
