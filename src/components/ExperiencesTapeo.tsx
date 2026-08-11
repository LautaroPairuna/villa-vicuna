"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";

export type TapeoItem = { name: string; src: string };

// Las fotos de los bocados son en su mayoría tomas verticales de celular
// (3:4) mezcladas con alguna horizontal, así que el visor no fija ninguna
// relación de aspecto: el marco se ajusta a la foto y ésta se limita por
// alto de viewport. Así no quedan franjas negras alrededor.
function TapeoLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: TapeoItem[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const item = items[index];
  const total = items.length;

  const goPrev = useCallback(
    () => onNavigate((index - 1 + total) % total),
    [index, total, onNavigate],
  );
  const goNext = useCallback(
    () => onNavigate((index + 1) % total),
    [index, total, onNavigate],
  );

  // Teclado: Esc cierra y las flechas recorren los bocados sin salir del visor.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (total < 2) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, goPrev, goNext, total]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-4 z-20 flex items-center justify-center rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:right-8 md:top-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Bocado anterior"
            className="absolute left-1 z-20 flex items-center justify-center rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/70 md:left-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Bocado siguiente"
            className="absolute right-1 z-20 flex items-center justify-center rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/70 md:right-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* El marco blanco envuelve la foto con su relación real y le da el aire
          de una copia impresa, con el nombre a modo de ficha debajo. */}
      <AnimatePresence mode="wait">
        <motion.figure
          key={item.src}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="relative inline-flex max-w-full flex-col bg-white p-3 shadow-2xl md:p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={item.src}
            alt={item.name}
            width={1200}
            height={1600}
            sizes="(max-width: 768px) 84vw, 720px"
            priority
            className="h-auto w-auto max-h-[62vh] max-w-[84vw] self-center object-contain md:max-h-[68vh] md:max-w-[720px]"
          />
          {/* `w-0 min-w-full`: la ficha ocupa el ancho del marco pero no lo
              define, así el marco queda del ancho exacto de la foto por más
              largo que sea el nombre del bocado. */}
          <figcaption className="w-0 min-w-full px-1 pb-1 pt-4 text-center text-sm uppercase leading-5 tracking-[0.2em] text-black md:text-base">
            {item.name}
            {total > 1 && (
              <span className="mt-2 block text-xs tracking-[0.3em] text-black/40">
                {index + 1} / {total}
              </span>
            )}
          </figcaption>
        </motion.figure>
      </AnimatePresence>
    </motion.div>
  );
}

export default function ExperiencesTapeo({ items }: { items: TapeoItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const close = useCallback(() => setOpenIndex(null), []);

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal
            as="button"
            key={item.src}
            delay={i * 110}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={item.name}
            className="group relative aspect-square overflow-hidden bg-white shadow-lg"
          >
            <Image
              src={item.src}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            {/* El nombre en la miniatura evita tener que abrir cada foto para
                saber qué bocado es. */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-4 pt-16 text-left">
              <p className="text-[11px] uppercase leading-4 tracking-[0.18em] text-white">
                {item.name}
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
                <path d="M10 4a6 6 0 105.293 9.293l3.707 3.707a1 1 0 001.414-1.414l-3.707-3.707A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z" />
              </svg>
            </div>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <TapeoLightbox
            items={items}
            index={openIndex}
            onClose={close}
            onNavigate={setOpenIndex}
          />
        )}
      </AnimatePresence>
    </>
  );
}
