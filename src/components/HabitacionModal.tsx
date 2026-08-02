"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Habitacion, Translations } from "./habitacionesTypes";

// Se carga con next/dynamic al abrir una habitación: la librería de animación
// solo se usa acá (el carrusel del modal) y no tiene por qué viajar en la
// carga inicial de la home.

interface HabitacionModalProps {
  habitacion: Habitacion;
  onClose: () => void;
  t: Translations;
}


export default function HabitacionModal({ habitacion, onClose, t }: HabitacionModalProps) {
  // Separa la categoría en dos partes usando la función raw.
  const { categoriaBlack, categoriaWhite } = useMemo(() => {
    const categoriaHTML = t.raw(habitacion.categoria);
    const regex = /<h3>(.*?)<span>(.*?)<\/span><\/h3>?/;
    const match = categoriaHTML.match(regex);
    if (match) {
      return { categoriaBlack: match[1], categoriaWhite: match[2] };
    }
    return { categoriaBlack: categoriaHTML, categoriaWhite: "" };
  }, [habitacion, t]);

  // Estado y funciones para el carrusel de imágenes (manual)
  const [currentImage, setCurrentImage] = useState(0);
  // Para animar la dirección de la transición: 1 => next, -1 => prev
  const [direction, setDirection] = useState(0);
  const totalImages = habitacion.images.length;

  const nextImage = useCallback(() => {
    setDirection(1);
    setCurrentImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  }, [totalImages]);

  const prevImage = useCallback(() => {
    setDirection(-1);
    setCurrentImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  }, [totalImages]);

  // Resetea la imagen actual al cambiar la reseña
  useEffect(() => {
    setCurrentImage(0);
    setDirection(0);
  }, [habitacion]);

  // Variantes para animar la transición de imágenes
  const imageVariants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 50 : -50,
    }),
    animate: { opacity: 1, x: 0 },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -50 : 50,
    }),
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 overflow-y-auto md:overflow-visible"
      onClick={onClose}
    >
      <div
        className="bg-white 
          pt-4 sm:pt-6 md:pt-8 lg:pt-10 
          pb-2 sm:pb-4 md:pb-6 lg:pb-8 
          px-4 sm:px-8 md:px-8 lg:px-10 
          w-full max-w-md lg:max-w-5xl  
          relative transform transition-transform duration-300 scale-95 animate-fadeIn max-h-screen 
          mt-8 md:mt-0 
          overflow-y-auto md:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute md:top-6 top-1 left-0 text-xl sm:text-2xl md:text-4xl text-white bg-[#17273f] rounded-tr-full rounded-br-full md:px-4 px-2 md:py-3 py-2 flex items-center"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <h3
          className={`
            relative lg:absolute md:top-[9%] md:left-1/2 md:-translate-x-1/2
            text-4xl lg:text-8xl leading-tight md:leading-normal uppercase z-10 w-full text-center
            lg:mt-0 mt-4 font-normal
            ${habitacion.categoria === "standard" ? "lg:tracking-[0.52em]" : "lg:tracking-[0.62em]"}
          `}
        >
          <span className="text-black">{categoriaBlack}</span>
          <span className="text-black lg:text-white">
            {categoriaWhite}
          </span>
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-5">
          <div className="col-span-1 md:col-span-7 relative lg:pt-36">
            <h4 className={`text-2xl uppercase text-gray-700 z-10 w-full text-center titulo-habitaciones-nombre
              ${habitacion.key === "jardin" ? "lg:tracking-[3rem]" : "lg:tracking-[.95em] tracking-widest"}
              ${habitacion.key === "balcon" ? "lg:tracking-[3rem] tracking-widest" : "lg:tracking-[.95em] tracking-widest"}
              ${habitacion.key === "twin_interna" ? "lg:tracking-[.85rem] tracking-widest" : "lg:tracking-[.95em] tracking-widest"}
              ${habitacion.key === "twin_externa" ? "lg:tracking-[.85rem] tracking-widest" : "lg:tracking-[.95em] tracking-widest"}
            `}>
              {t(`${habitacion.key}.nombre`)}
            </h4>
            <div className="relative mt-2">
              <div className="absolute 
              top-[50%] xl:left-[65%] left-[50%] 
              md:w-[750px] w-[450px] lg:h-[450px] md:h-[200px] h-[110px] 
              pointer-events-none z-10 
              transform -translate-x-1/2 -translate-y-1/2">
                <Image
                  src="/images/fondo-carta-3.svg"
                  alt="Fondo Carta"
                  fill
                  className="object-contain  opacity-45"
                />
              </div>
              <div className="relative z-10 px-2 md:px-0 leading-7 lg:pe-[3rem]">
                <div className="space-y-6">
                  <p className="text-left text-base">{t(`${habitacion.key}.descripcion`)}</p>
                  <p className="text-left text-base">{t(`${habitacion.key}.parrafo_minibar`)}</p>
                </div>
                {/* Sección de Amenities */}
                <div className="amenities-gallery flex flex-wrap justify-start items-center lg:mt-36 my-4">
                  {habitacion.amenities.map((amenity, index) => (
                    <div key={index} className="flex flex-col items-center me-auto">
                      <Image
                        src={`/images/icons/habitaciones/${amenity.icono}`}
                        alt={amenity.nombre}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Sección del carrusel de imágenes */}
          <div className="relative col-span-1 lg:col-span-5 w-full aspect-[3/4] lg:aspect-[6/9] flex items-center justify-center">
            <div className="relative w-full h-full overflow-hidden">
              <AnimatePresence custom={direction}>
                <motion.div
                  key={currentImage}
                  className="absolute inset-0"
                  custom={direction}
                  variants={imageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src={habitacion.images[currentImage]}
                    alt={`Imagen ${currentImage + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Botón Prev con SVG */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white flex items-center justify-center transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {/* Botón Next con SVG */}
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white flex items-center justify-center transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
