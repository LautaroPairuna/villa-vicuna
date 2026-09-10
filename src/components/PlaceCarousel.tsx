"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export type CarouselSlide = { url: string; alt: string };

/**
 * Carrusel del detalle de un lugar.
 *
 * No usa react-slick a propósito: esa librería solo se importa dentro de los
 * modales, que se cargan con next/dynamic al abrirlos, para que no entre en la
 * carga inicial. Este carrusel va arriba de todo, así que traerla acá le
 * sumaría peso a la primera pantalla — justo lo contrario de lo que se buscó.
 *
 * El desplazamiento lo hace el navegador con scroll-snap: sin JavaScript se
 * arrastra igual, y los botones solo agregan comodidad en escritorio.
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // El índice se deriva de la posición real del scroll en vez de llevar un
  // contador aparte: así queda bien tanto si se usan los botones como si se
  // arrastra con el dedo.
  const syncActive = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActive(Math.min(Math.max(index, 0), slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener("scroll", syncActive, { passive: true });
    return () => track.removeEventListener("scroll", syncActive);
  }, [syncActive]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  if (slides.length === 0) return null;

  const single = slides.length === 1;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={trackRef}
        className={`flex h-full w-full ${single ? "" : "snap-x snap-mandatory overflow-x-auto"} scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {slides.map((slide, i) => (
          <div key={slide.url} className="relative h-full w-full shrink-0 snap-center">
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

      {!single && (
        <>
          <button
            type="button"
            onClick={() => goTo(Math.max(active - 1, 0))}
            disabled={active === 0}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-[2px] transition-opacity hover:bg-black/65 disabled:pointer-events-none disabled:opacity-0"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(Math.min(active + 1, slides.length - 1))}
            disabled={active === slides.length - 1}
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
                onClick={() => goTo(i)}
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
