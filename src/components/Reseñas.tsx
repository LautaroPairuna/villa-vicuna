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
  if (length <= 11) return 0.96;
  if (length <= 12) return 0.85;
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

  const detalles: ReseñaDetalle[] = useMemo(() => {
    const data = (reseñasDetalles as Record<string, ReseñaDetalle[]>)[String(selectedReseña.id)];
    return data ?? [];
  }, [selectedReseña.id]);

  const rawTitle = useMemo(() => tGlobal.raw(selectedReseña.nombreKey), [
    tGlobal,
    selectedReseña.nombreKey,
  ]);
  const { part1, part2, full } = useMemo(() => splitTitle(rawTitle), [rawTitle]);

  const computedTracking = useMemo(() => {
    const baseTracking = calculateTrackingBase(full);
    const factor = width && width < 768 ? 0.3 : width && width < 1024 ? 0.6 : 1.15;
    return baseTracking * factor;
  }, [full, width]);

  const sliderSettings = useMemo(() => ({
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    centerMode: false,
    variableWidth: false,
    centerPadding: "20px",
  }), []);

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
          className="
            bg-white 
            pt-4 sm:pt-6 md:pt-8 lg:pt-10 
            pb-2 sm:pb-4 md:pb-6 lg:pb-8 
            px-4 sm:px-8 md:px-12 lg:px-20 
            pe-4 sm:pe-6 md:pe-10 lg:pe-16 
            w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-5xl 
            relative transform overflow-hidden
          "
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute lg:top-6 top-1 md:left-0 text-xl sm:text-2xl lg:text-4xl text-white md:bg-[#17273f] md:rounded-tr-full md:rounded-br-full lg:px-4 px-2 py-3 flex items-center"
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
            className="relative lg:absolute lg:top-[15%] lg:left-1/2 lg:-translate-x-1/2 text-3xl sm:text-4xl lg:text-5xl uppercase z-10 w-full text-center mt-4 sm:mt-6 lg:mt-0 lg:ms-4 ms-0 text-black"
            style={{ letterSpacing: `${computedTracking}em` }}
          >
            <span className="whitespace-nowrap">{part1}</span>
            <span className="whitespace-nowrap">{part2}</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 text-black">
            <div className="flex flex-col col-span-1 lg:col-span-7 pt-2 lg:pt-12 relative">
              <div className="absolute lg:top-[72%] top-[50%] lg:-left-[21%] left-[20%] inset-0 pointer-events-none z-10 flex justify-center items-center lg:w-[775px] w-[250px] h-[250px]">
                <Image src="/images/fondo-carta-5.svg" alt="Personal Review Background" fill className="object-contain opacity-55"/>
              </div>
              <p className="mt-2 lg:mt-16 text-sm relative z-10 text-left leading-4" style={{ whiteSpace: 'pre-line' }}>
                {tGlobal(selectedReseña.textoKey)}
              </p>
              <div className="mt-2 relative z-10 w-full overflow-hidden">
                <Slider {...sliderSettings}>
                  {detalles.map((detalle, i) => (
                    <div key={i} className="py-4 sm:py-3 md:py-5">
                      <div className="bg-[#e3d6b5] bg-opacity-50 rounded-2xl py-4 px-2 transition-transform duration-300 hover:scale-105">
                        <p className="text-lg leading-6 resenas-texto mb-3 text-left">{tGlobal(detalle.comentarioKey)}</p>
                        <p className="text-base sm:text-md leading-3 resenas-texto text-left">- {detalle.autor}, {detalle.pais}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>

            <div className="relative col-span-1 lg:col-span-5 w-full aspect-[4/3] lg:aspect-[2/3]">
              <Image
                src={`/images/reseñas/${selectedReseña.imagen}`}
                alt={stripHtmlTags(rawTitle)}
                fill
                className="object-cover"
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
      className="relative bg-white shadow-lg overflow-hidden cursor-pointer aspect-square"
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
        <p className="text-xl font-semibold px-3 py-1 inline-block rounded-lg">
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
    <section id="reviews" className="relative md:px-12 px-6 lg:pt-36 pt-10 pb-10 bg-white text-black">
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="absolute -top-[9%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] pointer-events-none -z-10 sm:-top-[8%] sm:w-[350px] sm:h-[350px] md:-top-[30%] md:w-[450px] md:h-[450px] lg:-top-[33%] lg:w-[775px] lg:h-[600px]">
          <Image
            src="/images/fondo-carta-1.svg"
            alt="Fondo Carta 1"
            fill
            className="object-contain"
          />
        </div>
        <h2 className="xl:text-9xl lg:text-8xl md:text-6xl text-4xl mb-8 md:tracking-[.60em] tracking-[0.1em] text-center ms-5">
          {tReseñas("titulo")}
        </h2>
        <p className="text-xl">{tReseñas("descripcion")}</p>
        <p className="text-xl">{tReseñas("gracias")}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-5">
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
