"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useWindowSize } from "@/utils/utilsTitle"; // Usamos el hook aquí

export default function Nosotros() {
  const t = useTranslations("about_us");
  const tituloHTML = t.raw("titulo");
  const { tituloParte1, tituloParte2, tituloCompleto } = parseTitleWithSpan(tituloHTML);

  // Usamos el hook para obtener el tamaño de la ventana
  const { width: screenWidth } = useWindowSize();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Esto asegura que el código solo se ejecute en el cliente
  }, []);

  const getDynamicLetterSpacing = (text: string, screenWidth: number): string => {
    const length = text.length;

    if (screenWidth >= 1490) {
      if (length <= 5) return "1.2em";
      if (length <= 8) return "1.1em";
      if (length <= 10) return "1em";
      if (length <= 12) return "0.85em";
      if (length <= 15) return "0.65em";
      return "0.92em";
    }

    if (screenWidth >= 1280) {
      if (length <= 5) return "1.15em";
      if (length <= 8) return "1.05em";
      if (length <= 10) return "0.95em";
      if (length <= 12) return "0.8em";
      if (length <= 15) return "0.6em";
      return "0.78em";
    }

    if (length <= 5) return "1em";
    if (length <= 8) return "0.95em";
    if (length <= 10) return "1em";
    if (length <= 12) return "0.75em";
    if (length <= 15) return "0.5em";
    return "0.42em";
  };

  const letterSpacing = mounted && screenWidth !== undefined
    ? getDynamicLetterSpacing(tituloCompleto, screenWidth)
    : undefined;

  return (
    <section
      id="about-us"
      className="relative py-16 px-4 md:px-12 bg-white flex flex-col lg:flex-row items-center text-black mx-auto overflow-hidden"
    >
      <div className="grid grid-cols-12 2xl:max-w-[1400px] max-w-full mx-auto text-lg relative gap-6 lg:gap-20 w-full min-w-0">
        {/* Título central */}
        <h2
          className="
            absolute lg:top-[60px] -top-[10px] w-full text-center
            text-4xl lg:text-5xl z-20 uppercase
          "
          style={{ letterSpacing }}
        >
          <span className="block md:inline text-black me-auto md:me-8">{tituloParte1}</span> 
          <span className="block md:inline text-black font-normal">{tituloParte2}</span>
        </h2>

        {/* Contenido de texto */}
        <div className="lg:col-span-6 col-span-12 relative z-10 bg-white lg:pt-36 pt-20 md:pb-10 pb-0">
          <div
            className="
              absolute left-[50%] xl:left-[75%] 2xl:left-[80%]
              bottom-[0%] md:bottom-[-0%] lg:bottom-[-27%] 2xl:bottom-[-21%]
              -translate-x-1/2 w-[350px] h-[300px] opacity-100 pointer-events-none -z-10
              sm:w-[350px] sm:h-[280px]
              md:w-[500px] md:h-[380px]
              xl:w-[1050px] xl:h-[750px]
              2xl:w-[1250px] 2xl:h-[750px]
            "
          >
            <Image
              src="/images/fondo-carta-2.svg"
              alt="Fondo Carta 2"
              fill
              className="object-contain w-[1250px] h-[700px]"
            />
          </div>

          <div className="md:text-justify text-left">
            <p className="text-xl leading-6 relative z-10 break-words">{t("parrafo1")}</p>
            <p className="text-xl leading-6 mt-8 relative z-10 break-words">{t("parrafo2")}</p>
            <p className="text-xl leading-6 mt-8 relative z-10 break-words">{t("parrafo3")}</p>
          </div>
        </div>

        {/* Imagen */}
        <div className="lg:col-span-6 col-span-12 flex justify-center items-center">
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

// Función para extraer partes del título
function parseTitleWithSpan(tituloHTML: string): {
  tituloParte1: string;
  tituloParte2: string;
  tituloCompleto: string;
} {
  const regex = /^(.*?)<span>(.*?)<\/span>/;
  const match = tituloHTML.match(regex);
  const tituloParte1 = match ? match[1].trim() : "ERROR";
  const tituloParte2 = match ? match[2].trim() : "";
  const tituloCompleto = `${tituloParte1} ${tituloParte2}`.trim();
  return { tituloParte1, tituloParte2, tituloCompleto };
}
