"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export type CarouselSlide = { url: string; alt: string };

/**
 * Carrusel del detalle de un lugar, sobre embla-carousel.
 *
 * Embla no arrastra su propio CSS ni trae animaciones pesadas: solo maneja el
 * track y expone la API de navegación, así que sigue siendo liviano para ir
 * arriba de todo en la carga inicial.
 */
export default function PlaceCarousel({
  slides,
  /**
   * Clases de la caja del carrusel. Por defecto manda el aspect ratio; el
   * detalle de un lugar lo pisa para que en desktop el carrusel se estire con
   * la fila del grid y termine a la misma altura que la columna de texto.
   */
  className = "aspect-[5/6]",
}: {
  slides: CarouselSlide[];
  className?: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false });
  const [active, setActive] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncState = useCallback((api: NonNullable<typeof emblaApi>) => {
    setActive(api.selectedScrollSnap());
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    syncState(emblaApi);
    emblaApi.on("select", syncState);
    emblaApi.on("reInit", syncState);
    return () => {
      emblaApi.off("select", syncState);
      emblaApi.off("reInit", syncState);
    };
  }, [emblaApi, syncState]);

  if (slides.length === 0) return null;

  const single = slides.length === 1;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        <div className="flex h-full w-full">
          {slides.map((slide, i) => (
            <div key={slide.url} className="relative h-full w-full shrink-0 grow-0 basis-full">
              <Image
                src={slide.url}
                alt={slide.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                // Solo las subidas desde el panel saltean el optimizador:
                // media.ts ya las dejó en WebP redimensionado.
                unoptimized={slide.url.startsWith("/uploads/")}
                // La primera abre la vista, así que entra sin lazy.
                priority={i === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {!single && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-[2px] transition-opacity hover:bg-black/65 disabled:pointer-events-none disabled:opacity-0"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label="Foto siguiente"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-[2px] transition-opacity hover:bg-black/65 disabled:pointer-events-none disabled:opacity-0"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.url}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Ir a la foto ${i + 1} de ${slides.length}`}
                aria-current={i === active}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
