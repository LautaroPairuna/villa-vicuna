"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ModalImage = { src: string; alt: string };

function ImageModal({ image, onClose }: { image: ModalImage; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
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
  );
}

export default function Menu() {
  const t = useTranslations("menu");
  const [selectedImage, setSelectedImage] = useState<ModalImage | null>(null);

  const openModal = useCallback((src: string, alt: string) => {
    setSelectedImage({ src, alt });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  return (
    <section id="menu" className="relative bg-white text-black py-8 px-4 md:py-16 md:px-8">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center">
        {/* Título vertical en Desktop */}
        <div className="hidden md:flex w-1/6 items-center justify-center relative">
          <div className="absolute left-[20%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-[200px] h-[400px] lg:w-[550px] lg:h-[600px] opacity-55 pointer-events-none z-0">
            <Image
              src="/images/fondo-carta-1.svg"
              alt="Fondo Carta"
              fill
              className="object-contain -rotate-90"
            />
          </div>
          <h2 className="text-4xl lg:text-5xl transform -rotate-90 whitespace-nowrap tracking-[0.45em] relative z-10">
            {t("titulo")}
          </h2>
        </div>

        {/* Imágenes en Desktop */}
        <div className="md:w-5/6 w-full flex justify-center items-center">
          <div className="hidden md:flex justify-between space-x-6">
            <div className="cursor-pointer" onClick={() => openModal("/images/menu-foods.svg", t("menu_image_left"))}>
              <Image
                src="/images/menu-foods.svg"
                alt={t("menu_image_left")}
                width={600}
                height={700}
                className="shadow-lg max-w-full h-auto border-2 border-black"
              />
            </div>
            <div className="cursor-pointer" onClick={() => openModal("/images/menu-drinks.svg", t("menu_image_right"))}>
              <Image
                src="/images/menu-drinks.svg"
                alt={t("menu_image_right")}
                width={600}
                height={700}
                className="shadow-lg max-w-full h-auto border-2 border-black"
              />
            </div>
          </div>
        </div>

        {/* Versión móvil */}
        <div className="md:hidden flex flex-col items-center text-center w-full mt-6 space-y-4 relative">
          <div className="absolute left-1/2 -top-[75%] -translate-x-1/2 w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] opacity-87 pointer-events-none z-0">
            <Image
              src="/images/fondo-carta-1.svg"
              alt="Fondo Carta"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-4xl whitespace-nowrap relative z-10">{t("titulo")}</h2>
          <a
            href="/menu.pdf"
            download="menu-villa-vicuna.pdf"
            className="bg-black text-white px-6 py-3 rounded-md shadow-md text-lg relative z-10"
          >
            {t("boton")}
          </a>
        </div>
      </div>

      {/* Modal de imagen ampliada */}
      <AnimatePresence>
        {selectedImage && <ImageModal image={selectedImage} onClose={closeModal} />}
      </AnimatePresence>
    </section>
  );
}
