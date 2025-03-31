"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa";

export default function Contacto() {
  const t = useTranslations("contact");

  const tituloHTML = t.raw("titulo");
  const match = tituloHTML.match(/<h2>(.*?)<span>(.*?)<\/span><\/h2>/);
  const tituloParte1 = match ? match[1] : "ERROR";
  const tituloParte2 = match ? match[2] : "";
  const tituloCompleto = `${tituloParte1}${tituloParte2}`;

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const calculateTracking = (text: string) => {
    const length = text.length;
    if (screenWidth < 1280) {
      if (length <= 5) return "tracking-[0.8em]";
      if (length <= 8) return "tracking-[0.7em]";
      if (length <= 10) return "tracking-[0.9em]";
      if (length <= 12) return "tracking-[0.7em]";
      if (length <= 15) return "tracking-[0.5em]";
      return "tracking-[0.6em]";
    }
    if (length <= 5) return "tracking-[1em]";
    if (length <= 8) return "tracking-[0.95em]";
    if (length <= 10) return "tracking-[1.1em]";
    if (length <= 12) return "tracking-[1.1em]";
    if (length <= 15) return "tracking-[0.70em]";
    return "tracking-[0.40em]";
  };

  return (
    <section
      id="contact"
      className="relative bg-white text-black px-6 sm:px-12 lg:px-16 py-12 lg:py-20"
    >
      <div className="max-w-[1400px] mx-auto relative">
        {/* Título móvil */}
        <h2 className="block lg:hidden text-4xl text-center uppercase mb-6">
          {tituloCompleto}
        </h2>

        {/* Título desktop */}
        <h2
          className={`hidden lg:block absolute top-[20px] left-1/2 -translate-x-1/2 text-4xl lg:text-6xl uppercase text-center z-10 w-full ${calculateTracking(
            tituloCompleto
          )}`}
        >
          <span className="text-black">
            {tituloParte1}
          </span>
          <span className="text-white">{tituloParte2}</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Bloque izquierdo: Botón móvil e información de contacto */}
          <div>
            {/* Botón mobile */}
            <div className="block lg:hidden text-center mb-6">
              <div className="relative w-[300px] h-[200px] mx-auto opacity-65">
                <Image
                  src="/images/fondo-carta-4.svg"
                  alt="Fondo Carta 4"
                  fill
                  className="object-contain"
                />
              </div>
              <button className="bg-[#e3d6b5] text-black px-6 py-2 text-lg font-semibold shadow-md hover:bg-[#d6c3a2] transition-all rounded-xl mt-4">
                <a
                  href="https://goo.su/4Nkqe"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("boton")}
                </a>
              </button>
            </div>

            {/* Información de contacto */}
            <div className="px-4 pb-16 pt-32 flex flex-col justify-end">
              <div className="gap-4">
                <div className="space-y-2 text-lg sm:text-xl lg:text-lg max-w-[350px]">
                  <Image 
                    src={"/images/logo-villa-vicuna-2.svg"} 
                    alt="" 
                    width={192} 
                    height={192}
                    className="mb-8"
                  >
                  </Image>
                  <p className="flex items-center gap-3">
                    <FaPhoneAlt className="text-xl" /> {t("telefono")}
                  </p>
                  <p className="flex items-center gap-3">
                    <FaEnvelope className="text-xl" /> {t("email")}
                  </p>
                  <p className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-4xl" /> {t("direccion")}
                  </p>
                  <a
                    href="https://instagram.com/villavicunasalta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:text-gray-500 transition"
                  >
                    <FaInstagram className="text-xl" /> Villa Vicuña Salta
                  </a>
                  <a
                    href="https://facebook.com/villavicunasalta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:text-gray-500 transition"
                  >
                    <FaFacebookF className="text-xl" /> Villa Vicuña Salta
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bloque derecho: Imagen */}
          <div className="relative w-full aspect-[4/4] flex justify-center items-center">
            <Image
              src="/images/contactenos.jpg"
              alt="Hotel Interior"
              fill
              className="w-full object-cover"
            />
          </div>
        </div>

        {/* Fondo carta (desktop) */}
        <div className="hidden lg:block absolute bottom-[15%] left-[53%] -translate-x-1/2 w-[300px] h-[200px] lg:w-[400px] lg:h-[300px] opacity-55 z-20">
          <Image
            src="/images/fondo-carta-4.svg"
            alt="Fondo Carta 4"
            fill
            className="object-contain"
          />
        </div>

        {/* Botón desktop */}
        <div className="hidden lg:block absolute bottom-[2%] left-[51%] -translate-x-1/2 z-30">
          <button className="bg-[#e3d6b5] text-black p-4 text-xl font-semibold shadow-md hover:bg-[#d6c3a2] transition-all rounded-full">
            <a
              href="https://bit.ly/HotelVillaVicunaSalta"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image 
                src="/images/icons/ico-reservar.svg" 
                alt=""
                width={64}
                height={64} 
              />
            </a>
          </button>
        </div>
      </div>
    </section>
  );
}
