"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { parseTitleWithSpan, getDynamicLetterSpacing } from "@/utils/utilsTitle";

export default function Nosotros() {
  const t = useTranslations("about_us");
  const tituloHTML = t.raw("titulo");
  const { tituloParte1, tituloParte2, tituloCompleto } = parseTitleWithSpan(tituloHTML);

  const [isMobile, setIsMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    setMounted(true);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const letterSpacing = mounted
    ? isMobile
      ? "normal"
      : getDynamicLetterSpacing(tituloCompleto, screenWidth)
    : undefined;

  return (
    <section
      id="about-us"
      className="relative py-16 px-4 md:px-16 bg-white flex flex-col lg:flex-row items-center text-black mx-auto overflow-hidden"
    >
      <div className="grid grid-cols-12 max-w-full mx-auto text-lg relative gap-6 w-full min-w-0">
        {/* Título central */}
        <h2
          className="
            absolute lg:top-[60px] -top-[10px] w-full text-center
            text-4xl lg:text-5xl z-20 uppercase
          "
          style={{ letterSpacing }}
        >
          <span className="block md:inline text-black me-8">{tituloParte1}</span> 
          <span className="block md:inline text-black font-normal lg:font-bold">{tituloParte2}</span>
        </h2>

        {/* Contenido de texto */}
        <div className="lg:col-span-6 col-span-12 relative z-10 bg-white lg:pt-36 pt-20 md:pb-10 pb-0">
          <div
            className="
              absolute left-[50%] xl:left-[75%] 2xl:left-[80%]
              bottom-[0%] md:bottom-[-0%] lg:bottom-[-31%] 2xl:bottom-[-24%]
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
            <p className="text-2xl leading-relaxed relative z-10 break-words">{t("parrafo1")}</p>
            <p className="text-2xl leading-relaxed mt-4 relative z-10 break-words">{t("parrafo2")}</p>
            <p className="text-2xl leading-relaxed mt-4 relative z-10 break-words">{t("parrafo3")}</p>
          </div>
        </div>

        {/* Imagen */}
        <div className="lg:col-span-6 col-span-12 flex lg:justify-end justify-center items-center">
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
