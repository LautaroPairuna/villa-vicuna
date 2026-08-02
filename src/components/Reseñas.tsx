"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { staticReviewsContent } from "@/lib/staticContent";
import type { ReviewContent } from "@/lib/contentTypes";
import Reveal from "./Reveal";
import type { ReseñaItem, Translations } from "./resenasTypes";

export type { ReseñaItem, ReseñaDetalle, Translations } from "./resenasTypes";

// El modal (con su librería de animación y react-slick) se descarga recién
// cuando el visitante abre una reseña.
const ReseñasModal = dynamic(() => import("./ReseñasModal"), { ssr: false });

// -----------------------------------------------------------------------------
// Funciones Helper
// -----------------------------------------------------------------------------
function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]+>/g, "");
}



// -----------------------------------------------------------------------------
// Componente de Tarjeta (sin modificar el src)
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
        src={reseña.coverUrl}
        alt={cardTitle}
        width={500}
        height={500}
        unoptimized={reseña.coverUrl?.startsWith("/uploads/")}
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
export default function ReseñasSection({ reviews }: { reviews?: ReviewContent[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const tReseñas = useTranslations("reseñas");

  const reseñas = useMemo<ReseñaItem[]>(
    () => reviews ?? staticReviewsContent(),
    [reviews]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedReseña = useMemo(
    () => reseñas.find((item: ReseñaItem) => item.id === selectedId),
    [reseñas, selectedId]
  );

  const handleCardClick = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <section id="reviews" className="relative lg:pt-36 pt-10 pb-10 px-5 bg-white text-black">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="absolute -top-[9%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] pointer-events-none -z-10 sm:-top-[8%] sm:w-[350px] sm:h-[350px] md:-top-[30%] md:w-[450px] md:h-[450px] lg:-top-[33%] lg:w-[775px] lg:h-[600px]">
          <Image
            src="/images/fondo-carta-1.svg"
            alt="Fondo Carta 1"
            fill
            className="object-contain"
          />
        </div>
        <Reveal
          as="h2"
          duration={900}
          className="xl:text-9xl lg:text-8xl md:text-6xl text-4xl mb-8 md:tracking-[.60em] tracking-[0.1em] text-center ms-5"
        >
          {tReseñas("titulo")}
        </Reveal>
        <Reveal as="p" delay={100} className="text-xl leading-7 tracking-[0.03em]">
          {tReseñas("descripcion")}
        </Reveal>
        <Reveal as="p" delay={180} className="text-xl leading-7 tracking-[0.03em]">
          {tReseñas("gracias")}
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-5">
          {reseñas.map((reseña: ReseñaItem, i: number) => (
            <Reveal key={reseña.id} delay={i * 120}>
              <ReseñaCard reseña={reseña} onClick={handleCardClick} />
            </Reveal>
          ))}
        </div>
      </div>
      {mounted && selectedReseña && (
        <ReseñasModal selectedReseña={selectedReseña} onClose={handleCloseModal} />
      )}
    </section>
  );
}
