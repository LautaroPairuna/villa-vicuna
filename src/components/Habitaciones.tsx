"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Habitaciones as getHabitaciones } from "@/lib/habitaciones";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Interfaz para cada amenidad.
export interface Amenity {
  nombre: string;
  icono: string;
}

// Interfaz que describe una habitación con carrusel.
export interface Habitacion {
  id: number;
  categoria: string;
  key: string;
  imagen: string;
  amenities: Amenity[];
  folder: string;        // Carpeta donde se almacenan las imágenes del carrusel
  carrusel: string[];    // Array de imágenes para el carrusel
}

// Tipo para la función de traducción (next-intl).
export interface Translations {
  (key: string, options?: Record<string, unknown>): string;
  raw: (key: string) => string;
}

// Props del modal de detalle de habitación.
interface HabitacionModalProps {
  habitacion: Habitacion;
  onClose: () => void;
  t: Translations;
}


function HabitacionModal({ habitacion, onClose, t }: HabitacionModalProps) {
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
  const totalImages = habitacion.carrusel.length;

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
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4 overflow-y-auto md:overflow-visible"
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
            relative lg:absolute md:top-[10%] md:left-1/2 md:-translate-x-1/2
            text-4xl lg:text-8xl leading-tight md:leading-normal uppercase z-10 w-full text-center
            lg:mt-0 mt-4 font-normal
            ${habitacion.categoria === "standard" ? "lg:tracking-[0.55em]" : "lg:tracking-[0.65em]"}
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
              top-[60%] xl:left-[65%] left-[50%] 
              md:w-[750px] w-[450px] lg:h-[450px] md:h-[200px] h-[110px] 
              pointer-events-none z-10 
              transform -translate-x-1/2 -translate-y-1/2">
                <Image
                  src="/images/fondo-carta-3.svg"
                  alt="Fondo Carta"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative z-10 px-2 md:px-0 leading-7 lg:pe-[3rem]">
                <div className="space-y-6">
                  <p className="text-left text-base">{t(`${habitacion.key}.descripcion`)}</p>
                  <p className="text-left text-base">{t(`${habitacion.key}.parrafo_minibar`)}</p>
                </div>
                {/* Sección de Amenities */}
                <div className="amenities-gallery flex flex-wrap justify-start items-center lg:mt-24 my-4">
                  {habitacion.amenities.map((amenity, index) => (
                    <div key={index} className="flex flex-col items-center me-auto">
                      <Image
                        src={`/images/icons/habitaciones/${amenity.icono}`}
                        alt={amenity.nombre}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Sección del carrusel de imágenes */}
          <div className="relative col-span-1 lg:col-span-5 w-full aspect-[4/3] lg:aspect-[2/3] flex items-center justify-center">
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
                    src={`/images/Habitaciones/${habitacion.folder}/${habitacion.carrusel[currentImage]}`}
                    alt={`Imagen ${currentImage + 1}`}
                    fill
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

export default function HabitacionesComponent() {
  const [selected, setSelected] = useState<number | null>(null);
  const t = useTranslations("rooms") as Translations;
  const habitaciones = getHabitaciones() as Habitacion[];

  const selectedHabitacion = useMemo(
    () => habitaciones.find((hab) => hab.id === selected) || null,
    [habitaciones, selected]
  );

  const handleSelect = useCallback((id: number) => {
    setSelected(id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelected(null);
  }, []);

  return (
    <section id="rooms" className="relative bg-white text-black md:px-12 px-6">
      <div className="pointer-events-none absolute inset-0 hidden lg:block 2xl:w-[1150px] w-[1000px] h-full 2xl:top-28 xl:top-24 2xl:left-56 xl:left-0 z-10">
        <Image
          src="/images/fondo-carta-3-seccion.svg"
          alt="Fondo Carta"
          fill
          className="object-contain opacity-60"
        />
      </div>

      <div className="max-w-[1200px] w-full mx-auto flex flex-col lg:flex-row items-center">
        <div className="relative lg:hidden mb-6">
          <Image
            src="/images/fondo-carta-3-seccion.svg"
            alt="Fondo Carta"
            width={250}
            height={250}
            className="absolute top-[75%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 object-contain lg:hidden"
          />
          <h2 className="relative text-4xl text-center mt-16">{t("titulo")}</h2>
        </div>
        <div className="hidden lg:flex w-1/12 items-center justify-center mx-20">
          <h2 className="text-3xl xl:text-4xl 2xl:text-5xl transform -rotate-90 whitespace-nowrap 2xl:tracking-[1em] tracking-[1.2em] text-center mb-10 titulo-menu">
            {t("titulo")}
          </h2>
        </div>

        
        {/* Se envuelve el grid en un contenedor que aplica el scale sin afectar las tarjetas */}
        <div className="">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-20 gap-y-1">
            {habitaciones.map((hab) => (
              <div key={hab.id} className="relative mx-auto 2xl:max-w-[300px] xl:max-w-[225px] lg:max-w-[350px]">
                <div className="relative 2xl:w-[300px] 2xl:h-[300px] sm:w-[250px] sm:h-[250px] w-[300px] h-[300px] overflow-hidden mx-auto">
                  <Image
                    src={`/images/Habitaciones/${hab.imagen}`}
                    alt={t(`${hab.key}.nombre`)}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="py-4 text-left">
                  <p className="text-xs text-gray-600">{t(`${hab.key}.detalles`)}</p>
                  <h3 className="text-base mt-2 titulo-habitaciones capitalize tracking-widest">
                    {hab.categoria} {t(`${hab.key}.nombre`)}
                  </h3>
                  <button
                    className="pt-2 text-base transition-all rounded-xl items-center my-0 mx-auto justify-center text-center cursor-pointer titulo-habitaciones"
                    onClick={() => handleSelect(hab.id)}
                  >
                    {t("ver_mas")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedHabitacion && (
        <HabitacionModal habitacion={selectedHabitacion} onClose={handleCloseModal} t={t} />
      )}
    </section>
  );
}



