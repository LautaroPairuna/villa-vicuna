"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export type TapeoItem = { name: string; src: string };

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

export default function ExperiencesTapeo({ items }: { items: TapeoItem[] }) {
  const [selected, setSelected] = useState<TapeoItem | null>(null);
  const close = useCallback(() => setSelected(null), []);

  return (
    <>
      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setSelected(item)}
            aria-label={item.name}
            className="group relative aspect-square overflow-hidden bg-white shadow-lg"
          >
            <Image
              src={item.src}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected && <TapeoModal item={selected} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
