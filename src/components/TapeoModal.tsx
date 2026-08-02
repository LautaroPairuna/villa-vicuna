"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export type TapeoItem = { name: string; src: string };

// Se carga con next/dynamic al abrir un bocado, así la librería de animación
// no viaja en la carga inicial de /experiencias.
export default function TapeoModalPortal({
  item,
  onClose,
}: {
  item: TapeoItem | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>{item && <TapeoModal item={item} onClose={onClose} />}</AnimatePresence>
  );
}

function TapeoModal({ item, onClose }: { item: TapeoItem; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
          <Image
            src={item.src}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-contain"
          />
        </div>
        <p className="mt-4 text-center text-lg uppercase tracking-[0.14em] text-white">
          {item.name}
        </p>
      </motion.div>
    </motion.div>
  );
}
