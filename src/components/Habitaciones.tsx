"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import Reveal from "./Reveal";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { RoomContent } from "@/lib/contentTypes";
import { staticRoomsContent } from "@/lib/staticContent";

const CloudbedsBookNow = dynamic(() => import("./CloudbedsBookNow"), {
  ssr: false,
  loading: () => null,
});

export type { Habitacion, Translations } from "./habitacionesTypes";
import type { Habitacion, Translations } from "./habitacionesTypes";

// El modal (con su carrusel animado) se descarga recién cuando se abre una
// habitación.
const HabitacionModal = dynamic(() => import("./HabitacionModal"), { ssr: false });

function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]+>/g, "");
}

// Props del modal de detalle de habitación.

export default function HabitacionesComponent({ rooms }: { rooms?: RoomContent[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const t = useTranslations("rooms") as Translations;
  const habitaciones = useMemo<Habitacion[]>(
    () => rooms ?? staticRoomsContent(),
    [rooms]
  );

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
        <Reveal variant="fade" className="relative lg:hidden mb-6">
          <Image
            src="/images/fondo-carta-3-seccion.svg"
            alt="Fondo Carta"
            width={250}
            height={250}
            className="absolute top-[-15%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 object-contain lg:hidden"
          />
          <h2 className="relative text-4xl text-center mt-16">{t("titulo")}</h2>
        </Reveal>
        <Reveal variant="left" duration={900} className="hidden lg:flex w-1/12 items-center justify-center mx-20">
          <h2 className="text-3xl xl:text-4xl 2xl:text-5xl transform -rotate-90 whitespace-nowrap 2xl:tracking-[1em] tracking-[1.2em] text-center mb-10 titulo-menu">
            {t("titulo")}
          </h2>
        </Reveal>


        {/* Se envuelve el grid en un contenedor que aplica el scale sin afectar las tarjetas */}
        <div className="">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-20 gap-y-1">
            {habitaciones.map((hab, i) => (
              <Reveal
                key={hab.id}
                delay={i * 110}
                className="relative mx-auto 2xl:max-w-[300px] xl:max-w-[225px] lg:max-w-[350px]"
              >
                <div className="relative 2xl:w-[300px] 2xl:h-[300px] sm:w-[250px] sm:h-[250px] w-[300px] h-[300px] overflow-hidden mx-auto group cursor-pointer" onClick={() => handleSelect(hab.id)}>
                  <Image
                    src={hab.coverUrl}
                    alt={t(`${hab.key}.nombre`)}
                    fill
                    sizes="300px"
                    unoptimized={hab.coverUrl?.startsWith("/uploads/")}
                    className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/35 flex items-center justify-center text-white">
                    <div className="flex items-center gap-2 uppercase tracking-widest">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M10 4a6 6 0 105.293 9.293l3.707 3.707a1 1 0 001.414-1.414l-3.707-3.707A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z" />
                      </svg>
                      <span>{t("ver_mas")}</span>
                    </div>
                  </div>
                </div>
                <div className="py-4 text-left">
                  <p className="text-xs text-gray-600">{t(`${hab.key}.detalles`)}</p>
                  <h3 className="text-base mt-2 titulo-habitaciones capitalize tracking-widest">
                    {hab.cantidad} {stripHtmlTags(t.raw(hab.categoria))} {t(`${hab.key}.nombre`)}
                  </h3>
                  <CloudbedsBookNow
                    propertyCode="pwSXnD"
                    variant="rooms"
                    roomsButtonClassName="pt-2 text-base transition-all rounded-xl items-center my-0 mx-auto justify-center text-center cursor-pointer titulo-habitaciones"
                    roomsLabel={t(`${hab.key}.boton`)}
                    mode="popup"
                    width="90vw"
                    height="90vh"
                    lang="auto"
                    timeout={4000}
                  />
                </div>
              </Reveal>
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
