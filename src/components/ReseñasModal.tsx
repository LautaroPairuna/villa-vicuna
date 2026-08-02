"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { reseñasDetalles } from "../lib/reseñas";
import type { ReseñaItem, ReseñaDetalle, Translations } from "./resenasTypes";

// Este módulo carga con next/dynamic recién cuando se abre una reseña. Se lleva
// consigo framer-motion y react-slick, que antes viajaban en la carga inicial
// de la home solo para este modal.

function splitTitle(raw: string): { part1: string; part2: string; full: string } {
  const regexH3 = /<h3><span>(.*?)<\/span>(.*?)<\/h3>?/;
  let match = raw.match(regexH3);
  if (match) {
    return { part1: match[1], part2: match[2], full: match[1] + match[2] };
  }
  const regexSpan = /^(.*?)<span>(.*?)<\/span>?$/;
  match = raw.match(regexSpan);
  if (match) {
    return { part1: match[1], part2: match[2], full: match[1] + match[2] };
  }
  return { part1: raw, part2: "", full: raw };
}

function calculateTrackingBase(text: string): number {
  const length = text.length;
  if (length <= 8) return 1.25;
  if (length <= 11) return .68;
  if (length <= 12) return .60;
  if (length <= 15) return 0.66;
  return 0.4;
}

function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{ width?: number; height?: number }>({});
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}

// -----------------------------------------------------------------------------
// Componente Modal de Reseñas
// -----------------------------------------------------------------------------
interface ReseñasModalProps {
  selectedReseña: ReseñaItem;
  onClose: () => void;
}

export default function ReseñasModal({ selectedReseña, onClose }: ReseñasModalProps) {
  const tGlobal = useTranslations() as Translations;
  const { width } = useWindowSize();
  const locale = useLocale();

  const detalles: ReseñaDetalle[] = useMemo(() => {
    const data = (reseñasDetalles as Record<string, ReseñaDetalle[]>)[
      String(selectedReseña.id)
    ];
    return data ?? [];
  }, [selectedReseña.id]);

  const rawTitle = useMemo(() => tGlobal.raw(selectedReseña.nombreKey), [
    tGlobal,
    selectedReseña.nombreKey,
  ]);
  const { part1, part2, full } = useMemo(() => splitTitle(rawTitle), [rawTitle]);

  const computedTracking = useMemo(() => {
    // calcula el tracking “base” según la longitud
    let baseTracking = calculateTrackingBase(full);
  
    // si es desayuno y portugués, lo reducimos un poco más
    if (locale === "fr" && selectedReseña.folder === "reseñas-desayuno") {
      baseTracking *= .6;  // ajusta el factor a tu gusto
    }
  
    // luego aplicas el factor según el ancho
    const factor =
      width && width < 768
        ? 0.3
        : width && width < 1024
        ? 0.6
        : 1.2;
  
    return baseTracking * factor;
  }, [full, width, locale, selectedReseña.folder]);

  // Slider de comentarios (con react-slick, se deja como estaba)
  const commentsSliderSettings = useMemo(() => ({
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: true,
    centerMode: false,
    variableWidth: false,
    centerPadding: "20px",
  }), []);

  // Estado y funciones para el carrusel de imágenes (manual)
  const [currentImage, setCurrentImage] = useState(0);
  // Para animar la dirección de la transición: 1 => next, -1 => prev
  const [direction, setDirection] = useState(0);
  const totalImages = selectedReseña.images.length;

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
  }, [selectedReseña]);

  const overlayVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }), []);

  const modalVariants = useMemo(() => ({
    hidden: { scale: 0.9, y: 50, opacity: 0 },
    visible: { scale: 1, y: 0, opacity: 1 },
    exit: { scale: 0.9, y: 50, opacity: 0 },
  }), []);

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

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] px-4 overflow-y-auto"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white 
          pt-4 sm:pt-6 md:pt-8 lg:pt-10 
          pb-2 sm:pb-4 md:pb-6 lg:pb-8 
          px-4 sm:px-8 md:px-14 
          pe-4 sm:pe-6 md:pe-10 lg:pe-16 
          w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-5xl 
          overflow-y-auto
          max-h-[90vh]
          relative transform md:overflow-hidden"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute lg:top-6 top-4 left-0 text-xl sm:text-2xl md:text-5xl text-[#9ea4ae] bg-[#17273f] rounded-tr-full rounded-br-full lg:px-4 px-2 sm:py-3 py-2 flex items-center"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h3
            className={`relative lg:absolute lg:left-1/2 lg:-translate-x-1/2 text-3xl sm:text-4xl lg:text-6xl uppercase z-10 w-full text-center mt-8 sm:mt-6 lg:mt-0 lg:ms-4 ms-0 text-black
              ${
                selectedReseña.folder === "reseñas-desayuno"
                  ? "lg:top-[12%]"  // valor para desayuno
                  : "lg:top-[15%]"  // valor por defecto
              }  
            `}
            style={{ letterSpacing: `${computedTracking}em` }}
          >
            <span className="whitespace-nowrap">{part1}</span>
            <span className="whitespace-nowrap lg:text-white text-black">{part2}</span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-12 text-black gap-6">
            <div className="flex flex-col col-span-1 lg:col-span-7 pt-2 relative lg:pe-[2em]">
              <div className={`absolute inset-0 pointer-events-none z-10 flex justify-center items-center lg:w-[750px] w-[250px] h-[250px]
                  ${
                    selectedReseña.folder === "reseñas-personal"
                      ? "lg:top-[75%] top-[22%] lg:-left-[17%] left-[10%]"  // valor para desayuno
                      : "lg:top-[75%] top-[25%] lg:-left-[17%] left-[10%]"  // valor por defecto
                  }
                  ${
                    selectedReseña.folder === "reseñas-desayuno"
                      ? "lg:top-[75%] top-[56%] lg:-left-[17%] left-[10%]"  // valor para desayuno
                      : "lg:top-[75%] top-[25%] lg:-left-[17%] left-[10%]"  // valor por defecto
                  }
                
                `}>
                <Image
                  src="/images/fondo-carta-5.svg"
                  alt="Personal Review Background"
                  fill
                  className="object-contain opacity-55"
                />
              </div>
              <p
                className={`
                  relative z-10 text-left pe-[1.5em]
                  ${
                    selectedReseña.folder === "reseñas-desayuno"
                      ? "tracking-[0.08rem] leading-6 text-base mt-2 lg:mt-24"  // valor para desayuno
                      : "tracking-[0.08rem] leading-7 text-base mt-2 lg:mt-32"  // valor por defecto
                  }
                `}
                style={{ whiteSpace: "pre-line" }}
              >
                {tGlobal(selectedReseña.textoKey)}
              </p>
              <div className="mt-2 relative z-10 w-full overflow-hidden">
                <Slider {...commentsSliderSettings}>
                  {detalles.map((detalle, i) => {
                    const countrySlug = detalle.pais
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/\./g, '');
                    const flagSrc = `/images/icons/habitaciones/ico-${countrySlug}.png`;
                    const starsSrc = `/images/icons/ico-five-stars.svg`;

                    return (
                      <div key={i}>
                        <div className="relative bg-[#f6f0e1]/70 rounded-2xl pb-2 pt-8 px-4">
                          <div className="absolute top-2 right-2">
                            <Image
                              src={flagSrc}
                              alt={detalle.pais}
                              width={32}
                              height={32}
                            />
                          </div>
                          <p className="text-base leading-6 resenas-texto text-left lg:pe-[1em]">
                            {tGlobal(detalle.comentarioKey)}
                          </p>
                          <div className="flex items-center justify-end space-x-2 mb-2">
                            <span className="text-lg font-semibold resenas-texto">{detalle.autor}</span>
                            <Image
                              src={starsSrc}
                              alt="5 estrellas"
                              width={80}
                              height={20}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </Slider>
              </div>
            </div>

            {/* Carrusel de imágenes manual con animación */}
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
                      src={selectedReseña.images[currentImage]}
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
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
