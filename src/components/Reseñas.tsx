"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import Slider from "react-slick";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { reseñas, reseñasDetalles } from "../lib/reseñas";
import { motion, AnimatePresence } from "framer-motion";

// -----------------------------------------------------------------------------
// Tipos e Interfaces
// -----------------------------------------------------------------------------
export interface ReseñaItem {
  id: number;
  nombreKey: string;
  textoKey: string;
  imagen: string;
}

export interface ReseñaDetalle {
  comentarioKey: string;
  autor: string;
  pais: string;
}

export interface Translations {
  (key: string, options?: Record<string, unknown>): string;
  raw: (key: string) => string;
}

// -----------------------------------------------------------------------------
// Funciones Helper
// -----------------------------------------------------------------------------
function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]+>/g, "");
}

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
  if (length <= 8) return 1.55;
  if (length <= 10) return 1.45;
  if (length <= 12) return 1;
  if (length <= 15) return 0.65;
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

function ReseñasModal({ selectedReseña, onClose }: ReseñasModalProps) {
  const tGlobal = useTranslations() as Translations;
  const { width } = useWindowSize();

  // Filtrar los detalles correspondientes
  const detalles: ReseñaDetalle[] = useMemo(() => {
    const data = (reseñasDetalles as Record<string, ReseñaDetalle[]>)[String(selectedReseña.id)];
    return data ?? [];
  }, [selectedReseña.id]);

  // Obtener título en bruto y separarlo
  const rawTitle = useMemo(() => tGlobal.raw(selectedReseña.nombreKey), [
    tGlobal,
    selectedReseña.nombreKey,
  ]);
  const { part1, part2, full } = useMemo(() => splitTitle(rawTitle), [rawTitle]);

  // Calcular el tracking (letterSpacing)
  const computedTracking = useMemo(() => {
    const baseTracking = calculateTrackingBase(full);
    const factor = width && width < 768 ? 0.3 : width && width < 1024 ? 0.6 : 1.15;
    return baseTracking * factor;
  }, [full, width]);

  // Configuración del slider de react-slick
  const sliderSettings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2500,
      arrows: true,
      centerMode: true,
      centerPadding: "20px",
    }),
    []
  );

  // Variantes de animación para framer-motion
  const overlayVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    }),
    []
  );
  const modalVariants = useMemo(
    () => ({
      hidden: { scale: 0.9, y: 50, opacity: 0 },
      visible: { scale: 1, y: 0, opacity: 1 },
      exit: { scale: 0.9, y: 50, opacity: 0 },
    }),
    []
  );

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] px-4 overflow-y-auto"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white p-4 sm:p-6 md:p-10 rounded-lg w-full max-w-md sm:max-w-2xl md:max-w-7xl relative max-h-screen transform"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-2 sm:top-4 right-2 sm:right-4 md:top-6 md:right-6 text-xl sm:text-2xl md:text-4xl font-bold text-black"
            onClick={onClose}
          >
            ✖
          </button>
          <h3
            className="relative md:absolute md:top-[120px] md:left-1/2 md:-translate-x-1/2 text-3xl sm:text-4xl md:text-6xl leading-tight md:leading-normal uppercase z-10 w-full text-center mt-4 sm:mt-6 md:mt-0"
            style={{ letterSpacing: `${computedTracking}em` }}
          >
            <span className="text-black whitespace-nowrap">{part1}</span>
            <span className="text-black md:text-white whitespace-nowrap drop-shadow-none md:drop-shadow-[0px_0px_4px_rgba(0,0,0,1)]">
              {part2}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-6 md:mt-12 text-black">
            {/* Columna de texto y carrusel */}
            <div className="flex flex-col col-span-1 md:col-span-7 pt-2 sm:pt-4 md:pt-16 relative">
              <div className="absolute top-[75%] left-0 right-0 inset-0 pointer-events-none z-0 flex justify-center items-center">
                <Image
                  src="/images/fondo-carta-5.svg"
                  alt="Personal Review Background"
                  fill
                  className="object-contain opacity-55"
                />
              </div>
              <p className="mt-2 md:mt-16 text-lg md:text-2xl italic relative z-10 px-2 sm:px-4 md:px-8">
                &quot;{tGlobal(selectedReseña.textoKey)}&quot;
              </p>
              <div className="mt-2 relative z-10 px-2 sm:px-4 md:px-8">
                <Slider {...sliderSettings}>
                  {detalles.map((detalle, index) => (
                    <div key={index} className="px-2 py-4 sm:px-6 sm:py-8 md:px-10 md:py-10">
                      <div className="relative bg-[#e3d6b5] bg-opacity-50 text-black rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 max-w-2xl mx-auto text-center transition-transform duration-300 hover:scale-105">
                        <p className="text-lg sm:text-xl md:text-xl italic leading-relaxed">
                          {tGlobal(detalle.comentarioKey)}
                        </p>
                        <div className="w-16 h-[2px] bg-black mx-auto my-3"></div>
                        <p className="text-base sm:text-lg md:text-xl font-semibold">
                          - {detalle.autor}, {detalle.pais}
                        </p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
            {/* Columna de imagen */}
            <div className="flex justify-center items-center col-span-1 md:col-span-5 mx-auto mt-4 sm:mt-6 md:mt-0">
              <Image
                src={`/images/reseñas/${selectedReseña.imagen}`}
                alt={stripHtmlTags(rawTitle)}
                width={1200}
                height={800}
                className="object-cover rounded-lg w-full h-auto max-h-[30vh] md:max-h-full shadow-2xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// -----------------------------------------------------------------------------
// Componente de Tarjeta
// -----------------------------------------------------------------------------
interface ReseñaCardProps {
  reseña: ReseñaItem;
  onClick: (id: number) => void;
}

function ReseñaCard({ reseña, onClick }: ReseñaCardProps) {
  const tGlobal = useTranslations() as Translations;
  const cardTitle = useMemo(() => stripHtmlTags(tGlobal.raw(reseña.nombreKey)), [tGlobal, reseña.nombreKey]);
  const handleClick = useCallback(() => onClick(reseña.id), [onClick, reseña.id]);

  return (
    <div
      className="relative bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer aspect-square"
      onClick={handleClick}
    >
      <Image
        src={`/images/reseñas/${reseña.imagen}`}
        alt={cardTitle}
        width={500}
        height={500}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-4 left-0 right-0 text-white text-center">
        <p className="text-xl font-semibold bg-black bg-opacity-60 px-3 py-1 inline-block rounded-lg">
          &quot;{cardTitle}&quot;
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Componente Principal
// -----------------------------------------------------------------------------
export default function ReseñasSection() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const tReseñas = useTranslations("reseñas");

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedReseña = useMemo(
    () => reseñas.find((item: ReseñaItem) => item.id === selectedId),
    [selectedId]
  );

  const handleCardClick = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <section id="reviews" className="relative p-10 bg-white text-black">
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="absolute -top-[9%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] opacity-55 pointer-events-none -z-10 sm:-top-[6%] sm:w-[350px] sm:h-[350px] md:-top-[30%] md:w-[450px] md:h-[450px] lg:-top-[35%] lg:w-[600px] lg:h-[600px]">
          <Image
            src="/images/fondo-carta-1.svg"
            alt="Fondo Carta 1"
            fill
            className="object-contain"
          />
        </div>
        <h2 className="md:text-6xl text-4xl mb-8 md:tracking-[0.8em] tracking-[0.1em] text-center">
          {tReseñas("titulo")}
        </h2>
        <p className="text-2xl mx-auto">{tReseñas("descripcion")}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
          {reseñas.map((reseña: ReseñaItem) => (
            <ReseñaCard key={reseña.id} reseña={reseña} onClick={handleCardClick} />
          ))}
        </div>
      </div>
      <AnimatePresence>
        {mounted && selectedReseña && (
          <ReseñasModal selectedReseña={selectedReseña} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </section>
  );
}
