"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Reveal from "./Reveal";
import type { ModalImage } from "./MenuImageModal";

// Se descarga recién cuando el visitante abre una imagen, así la librería de
// animación (~41 kB gz) no viaja en la carga inicial de la home.
const MenuImageModal = dynamic(() => import("./MenuImageModal"), { ssr: false });

interface MenuProps {
  foodsUrl?: string;
  drinksUrl?: string;
}

export default function Menu({
  foodsUrl = "/images/menu-foods.svg",
  drinksUrl = "/images/menu-drinks.svg",
}: MenuProps) {
  const t = useTranslations("menu");
  const [selectedImage, setSelectedImage] = useState<ModalImage | null>(null);
  // Una vez abierto, el modal queda montado para que pueda ejecutarse la
  // animación de salida (y para no volver a descargar el chunk).
  const [modalCargado, setModalCargado] = useState(false);

  const openModal = useCallback((src: string, alt: string) => {
    setModalCargado(true);
    setSelectedImage({ src, alt });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  return (
    <section id="menu" className="relative bg-white text-black py-32 md:py-8 md:px-12 xl:py-16 xl:px-16">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-center">
        {/* Título vertical en Desktop */}
        <Reveal variant="left" duration={900} className="hidden lg:flex w-1/6 items-center justify-center relative">
          <div className="absolute 2xl:left-[30%] xl:left-[40%] -top-[10%] -translate-x-1/2 -translate-y-1/2 w-[200px] h-[300px] lg:w-[600px] lg:h-[300px] pointer-events-none z-0">
            <Image
              src="/images/fondo-carta-1.svg"
              alt="Fondo Carta"
              fill
              className="object-contain -rotate-90"
            />
          </div>
          <h2 className="text-4xl transform -rotate-90 whitespace-nowrap tracking-[0.68em] relative z-10 titulo-menu">
            {t("titulo")}
          </h2>
        </Reveal>

        {/* Imágenes en Desktop */}
        <div className="md:w-5/6 w-full flex justify-center items-center">
          <div className="hidden lg:flex justify-between space-x-6">
            <Reveal
              className="cursor-pointer"
              onClick={() => openModal(foodsUrl, t("menu_image_left"))}
            >
              <Image
                src={foodsUrl}
                alt={t("menu_image_left")}
                width={600}
                height={700}
                className="shadow-lg max-w-full h-auto border-2 border-black"
              />
            </Reveal>
            <Reveal
              delay={140}
              className="cursor-pointer"
              onClick={() => openModal(drinksUrl, t("menu_image_right"))}
            >
              <Image
                src={drinksUrl}
                alt={t("menu_image_right")}
                width={600}
                height={700}
                className="shadow-lg max-w-full h-auto border-2 border-black"
              />
            </Reveal>
          </div>
        </div>

        {/* Versión móvil */}
        <div className="lg:hidden flex flex-col items-center text-center w-full mt-6 space-y-4 relative">
          <div className="absolute left-[55%] -top-[130%] -translate-x-1/2 w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] opacity-87 pointer-events-none z-0">
            <Image
              src="/images/fondo-carta-1.svg"
              alt="Fondo Carta"
              fill
              className="object-contain"
            />
          </div>
          <Reveal as="h2" className="text-4xl whitespace-nowrap relative z-10">
            {t("titulo")}
          </Reveal>
          <Reveal
            as="a"
            delay={120}
            href="/menu.pdf"
            download="menu-villa-vicuna.pdf"
            className="bg-[#e3d6b5] text-black px-6 py-3 rounded-md shadow-md text-lg relative z-10"
          >
            {t("boton")}
          </Reveal>
        </div>
      </div>

      {/* Modal de imagen ampliada */}
      {modalCargado && <MenuImageModal image={selectedImage} onClose={closeModal} />}
    </section>
  );
}
