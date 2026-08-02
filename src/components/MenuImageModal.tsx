"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export type ModalImage = { src: string; alt: string };

/**
 * Modal de imagen ampliada del menú.
 *
 * Vive en su propio módulo —con su AnimatePresence adentro— para que Menu.tsx
 * lo cargue con next/dynamic recién cuando alguien abre una imagen. Así
 * framer-motion no entra en la carga inicial de la home.
 */
export default function MenuImageModal({
  image,
  onClose,
}: {
  image: ModalImage | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={800}
              height={1120}
              quality={100}
              className="max-w-[95vw] max-h-[95vh] object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
