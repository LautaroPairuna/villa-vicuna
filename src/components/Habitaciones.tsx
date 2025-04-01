"use client";

import { useState, useMemo, useCallback } from "react";
import { Habitaciones as getHabitaciones } from "@/lib/habitaciones";
import { useTranslations } from "next-intl";
import Image from "next/image";

// Interfaz para cada amenidad.
export interface Amenity {
  nombre: string;
  icono: string;
}

// Interfaz que describe una habitación.
export interface Habitacion {
  id: number;
  categoria: string;
  key: string;
  imagen: string;
  amenities: Amenity[];
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4 overflow-y-auto md:overflow-visible">
      <div className="bg-white 
            pt-4 sm:pt-6 md:pt-8 lg:pt-10 
            pb-2 sm:pb-4 md:pb-6 lg:pb-8 
            px-4 sm:px-8 md:px-12 lg:px-20 
            pe-4 sm:pe-6 md:pe-10 lg:pe-16
            w-full max-w-md md:max-w-7xl 
            relative transform transition-transform duration-300 scale-95 animate-fadeIn max-h-screen 
            mt-8 md:mt-0 
            overflow-y-auto md:overflow-visible">
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
            relative md:absolute md:top-[10%] md:left-1/2 md:transform md:-translate-x-1/2
            text-4xl md:text-8xl leading-tight md:leading-normal uppercase z-10 w-full text-center
            tracking-[0.2em] md:tracking-[1.05em] lg:tracking-[.88em] md:mt-0 mt-4
          `}
        >
          <span className="text-black">{categoriaBlack}</span>
          <span className="text-black md:text-white drop-shadow-none md:drop-shadow-[0px_0px_4px_rgba(0,0,0,1)]">
            {categoriaWhite}
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="col-span-1 md:col-span-7 relative pt-2 md:pt-32">
            <h4 className="text-2xl md:text-3xl uppercase text-gray-700 z-10 w-full text-center tracking-[.65em] md:mt-10 mt-2">
              {t(`${habitacion.key}.nombre`)}
            </h4>
            <div className="relative mt-4">
              <div className="absolute top-[45%] left-[55%] md:w-[650px] w-[350px] lg:h-[250%] md:h-[160%] h-[110%] pointer-events-none -z-10 transform -translate-x-1/2 -translate-y-1/2">
                <Image
                  src="/images/fondo-carta-3.svg"
                  alt="Fondo Carta"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative z-10 text-base text-justify md:text-left px-2 md:px-0 space-y-2">
                <p className="text-justify">{t(`${habitacion.key}.descripcion`)}</p>
                <p className="text-justify">{t(`${habitacion.key}.parrafo_minibar`)}</p>
                {/* Sección de Amenities */}
                <div className="amenities-gallery flex flex-wrap justify-start items-center gap-4 md:gap-8 mt-4 px-2 md:px-4">
                  {habitacion.amenities.map((amenity, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <Image
                        src={`/images/icons/habitaciones/${amenity.icono}`}
                        alt={amenity.nombre}
                        width={50}
                        height={50}
                        className="object-contain md:w-[70px] md:h-[70px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-5 flex items-center justify-center">
            {/* Contenedor para limitar la imagen en móviles */}
            <div className="relative w-full max-h-[80vh] aspect-[4/3] lg:aspect-[3/4] overflow-hidden">
              <Image
                src={`/images/Habitaciones/${habitacion.imagen}`}
                alt={t(`${habitacion.key}.nombre`)}
                fill
                className="object-cover"
              />
            </div>
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
      <div className="pointer-events-none absolute inset-0 hidden lg:block 2xl:w-full w-3/4 h-full 2xl:top-0 xl:top-7 2xl:-left-32 xl:left-0 z-10">
        <Image
          src="/images/fondo-carta-3-seccion.svg"
          alt="Fondo Carta"
          fill
          className="object-contain opacity-60"
        />
      </div>

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center">
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
        <div className="hidden lg:flex w-1/6 items-center justify-center mx-20">
          <h2 className="text-3xl xl:text-4xl 2xl:text-5xl transform -rotate-90 whitespace-nowrap 2xl:tracking-[0.85em] tracking-[1em] text-center mb-10">
            {t("titulo")}
          </h2>
        </div>

        
        {/* Se envuelve el grid en un contenedor que aplica el scale sin afectar las tarjetas */}
        <div className="">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-1">
            {habitaciones.map((hab) => (
              <div key={hab.id} className="relative mx-auto 2xl:max-w-[300px] xl:max-w-[225px] lg:max-w-[350px]">
                <div className="relative 2xl:w-[300px] 2xl:h-[300px] sm:w-[225px] sm:h-[225px] w-[300px] h-[300px] overflow-hidden mx-auto">
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



