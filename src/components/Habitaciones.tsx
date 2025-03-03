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
      <div className="bg-white p-6 md:p-10 rounded-lg w-full max-w-md md:max-w-7xl relative transform transition-transform duration-300 scale-95 animate-fadeIn max-h-screen mt-8 md:mt-0 overflow-y-auto md:overflow-visible">
        <button
          className="absolute top-3 right-3 md:top-6 md:right-6 text-2xl md:text-4xl font-bold"
          onClick={onClose}
        >
          ✖
        </button>
        <h3
          className={`
            relative md:absolute md:top-[140px] md:left-1/2 md:transform md:-translate-x-1/2
            text-4xl md:text-6xl leading-tight md:leading-normal uppercase z-10 w-full text-center
            tracking-[0.2em] md:tracking-[1.05em] lg:tracking-[1.85em]
          `}
        >
          <span className="text-black">{categoriaBlack}</span>
          <span className="text-black md:text-white drop-shadow-none md:drop-shadow-[0px_0px_4px_rgba(0,0,0,1)]">
            {categoriaWhite}
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8 md:mt-16">
          <div className="col-span-1 md:col-span-7 relative pt-2 md:pt-32">
            <h4 className="text-2xl md:text-3xl uppercase text-gray-700 z-10 w-full text-center">
              {t(`${habitacion.key}.nombre`)}
            </h4>
            <div className="relative mt-4 md:mt-8">
              <div className="absolute lg:top-[85%] md:top-[60%] top-[50%] md:left-[60%] left-[50%] lg:w-[850px] md:w-[550px] w-[350px] lg:h-[250%] md:h-[160%] h-[110%] pointer-events-none z-0 transform -translate-x-1/2 -translate-y-1/2">
                <Image
                  src="/images/fondo-carta-3.svg"
                  alt="Fondo Carta"
                  fill
                  className="object-contain opacity-55"
                />
              </div>
              <div className="relative z-10 text-lg md:text-xl text-justify md:text-left px-2 md:px-0">
                <p className="mb-4">{t(`${habitacion.key}.descripcion`)}</p>
                <p>{t(`${habitacion.key}.parrafo_minibar`)}</p>
                {/* Sección de Amenities */}
                <div className="amenities-gallery flex flex-wrap justify-start items-center gap-4 md:gap-8 mt-4 px-2 md:px-4">
                  {habitacion.amenities.map((amenity, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <Image
                        src={`/images/icons/habitaciones/${amenity.icono}`}
                        alt={amenity.nombre}
                        width={60}
                        height={60}
                        className="object-contain md:w-[70px] md:h-[70px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-5 flex items-center justify-center mt-6 md:mt-0">
            {/* Contenedor para limitar la imagen en móviles */}
            <div className="w-full max-h-[80vh] overflow-hidden">
              <Image
                src={`/images/Habitaciones/${habitacion.imagen}`}
                alt={t(`${habitacion.key}.nombre`)}
                width={486}
                height={729}
                className="object-cover rounded-lg w-full h-auto shadow-lg"
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
    <section id="rooms" className="relative bg-white text-black py-16 px-8">
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <Image
          src="/images/fondo-carta-3.svg"
          alt="Fondo Carta"
          fill
          className="object-contain opacity-60"
        />
      </div>
      <div className="max-w-[1400px] mx-auto flex">
        <div className="hidden md:flex w-1/6 items-center justify-center">
          <h2 className="text-3xl md:text-5xl transform -rotate-90 whitespace-nowrap tracking-[0.70em]">
            {t("titulo")}
          </h2>
        </div>
        <div className="md:w-5/6 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative md:hidden mb-6">
            <Image
              src="/images/fondo-carta-3.svg"
              alt="Fondo Carta"
              width={350}
              height={350}
              className="absolute top-[15%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 object-contain opacity-55"
            />
            <h2 className="relative text-4xl text-center">{t("titulo")}</h2>
          </div>
          {habitaciones.map((hab) => (
            <div
              key={hab.id}
              className="relative bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => handleSelect(hab.id)}
            >
              <div className="relative w-full h-60">
                <Image
                  src={`/images/Habitaciones/${hab.imagen}`}
                  alt={t(`${hab.key}.nombre`)}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <p className="text-sm text-gray-600">{t(`${hab.key}.detalles`)}</p>
                <h3 className="text-lg font-semibold mt-2">{t(`${hab.key}.nombre`)}</h3>
                <button className="bg-[#e3d6b5] text-black px-6 py-2 text-lg font-semibold shadow-md hover:bg-[#d6c3a2] transition-all rounded-xl mt-4 items-center my-0 mx-auto justify-center text-center">
                  <a href="https://goo.su/4Nkqe" target="_blank">{t(`${hab.key}.boton`)}</a>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedHabitacion && (
        <HabitacionModal
          habitacion={selectedHabitacion}
          onClose={handleCloseModal}
          t={t}
        />
      )}
    </section>
  );
}
