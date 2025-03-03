"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { parseTitleWithSpan, getDynamicLetterSpacing } from "@/utils/utilsTitle";

export default function Nosotros() {
  const t = useTranslations("about_us");

  // Extraemos el título en formato HTML (Ej: "ABOUT <span>US</span>")
  const tituloHTML = t.raw("titulo");
  const { tituloParte1, tituloParte2, tituloCompleto } = parseTitleWithSpan(tituloHTML);

  // Estado para determinar si la pantalla es menor a 560px
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 560);
    };

    handleResize(); // Inicializamos
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculamos el letterSpacing solo para pantallas >= 560px; de lo contrario, usamos "normal"
  const dynamicLetterSpacing = isMobile ? "normal" : getDynamicLetterSpacing(tituloCompleto);

  return (
    <section
      id="about-us"
      className="relative p-10 bg-white flex flex-col md:flex-row items-center text-black mx-auto"
    >
      <div className="grid grid-cols-12 max-w-[1400px] mx-auto text-lg relative">
        {/* Título central con tracking dinámico aplicado inline (solo en desktop) */}
        <h2
          className={`
            absolute md:top-[20px] -top-[10px] w-full text-center
            text-4xl md:text-6xl z-20 uppercase
          `}
          style={{ letterSpacing: dynamicLetterSpacing }}
        >
          <span className="block md:inline text-black me-auto lg:me-10">{tituloParte1}</span>
          <span className="block md:inline md:text-white text-black md:drop-shadow-[0px_0px_3px_rgba(0,0,0,1)] font-normal md:font-bold">
            {tituloParte2}
          </span>
        </h2>

        {/* Contenido de texto */}
        <div className="lg:col-span-6 md:col-span-8 col-span-12 relative z-10 bg-white pt-28 pb-10 ps-8">
          {/* Fondo dinámico */}
          <div
            className="
              absolute left-[50%] md:left-[75%] bottom-[0%] md:bottom-[-20%] -translate-x-1/2
              w-[350px] h-[300px] opacity-55 pointer-events-none -z-10
              sm:w-[350px] sm:h-[280px] md:w-[500px] md:h-[380px] lg:w-[850px] lg:h-[700px]
            "
          >
            <Image
              src="/images/fondo-carta-2.svg"
              alt="Fondo Carta 2"
              fill
              className="object-contain"
            />
          </div>

          <p className="text-2xl leading-relaxed relative z-10">{t("parrafo1")}</p>
          <p className="text-2xl leading-relaxed mt-4 relative z-10">{t("parrafo2")}</p>
          <p className="text-2xl leading-relaxed mt-4 relative z-10">{t("parrafo3")}</p>
        </div>

        {/* Imagen */}
        <div className="lg:col-span-6 md:col-span-4 col-span-12 flex justify-end items-center">
          <Image
            src="/images/nosotros.jpg"
            alt={t("imagenAlt")}
            width={600}
            height={720}
            className="shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
