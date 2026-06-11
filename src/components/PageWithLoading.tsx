// src/components/PageWithLoading.tsx
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import LoadingScreen from "./LoadingScreen";
import Navbar from "./Navbar";
import Hero from "./Hero";
import WhatsappLink from "./WhatsappLink";
import Contacto from "./Contacto";
import type {
  RoomContent,
  ReviewContent,
  SectionImages,
} from "@/lib/contentTypes";

const Nosotros = dynamic(() => import("./Nosotros"), { ssr: false });
const Reseñas = dynamic(() => import("./Reseñas"), { ssr: false });
const Menu = dynamic(() => import("./Menu"), { ssr: false });
const Habitaciones = dynamic(() => import("./Habitaciones"), { ssr: false });

interface PageWithLoadingProps {
  rooms?: RoomContent[];
  reviews?: ReviewContent[];
  sections?: SectionImages;
}

export default function PageWithLoading({
  rooms,
  reviews,
  sections = {},
}: PageWithLoadingProps) {
  const [isHeroLoaded, setIsHeroLoaded] = useState(false);
  const [isCloudbedsLoaded, setIsCloudbedsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isLoadingVisible, setIsLoadingVisible] = useState(true);

  // Tiempo mínimo para que el loader no haga "flash"
  const [minLoadingTime, setMinLoadingTime] = useState(false);

  // Timer de tiempo mínimo (800ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Timeout de seguridad (6s) para evitar pantalla infinita
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsHeroLoaded(true);
      setIsLoadingVisible(false);
      setTimeout(() => setShowContent(true), 200);
    }, 6000);

    return () => clearTimeout(safetyTimer);
  }, []);

  // Cuando Hero está listo + tiempo mínimo cumplido → revelar sitio
  useEffect(() => {
    if (isHeroLoaded && minLoadingTime) {
      setIsLoadingVisible(false);

      const contentTimer = setTimeout(() => {
        setShowContent(true);
      }, 200);

      return () => clearTimeout(contentTimer);
    }
  }, [isHeroLoaded, minLoadingTime]);

  const handleHeroLoaded = () => {
    setIsHeroLoaded(true);
  };

  const handleCloudbedsLoaded = () => {
    setIsCloudbedsLoaded(true);
  };

  return (
    <>
      {/* Contenido principal que se revela gradualmente */}
      <div
        className={`transition-opacity duration-1000 ease-in-out ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        <header>
          <Navbar
            onCloudbedsLoaded={handleCloudbedsLoaded}
            isCloudbedsReady={isCloudbedsLoaded}
          />
        </header>

        <main>
          <Hero onLoaded={handleHeroLoaded} posterUrl={sections.hero_poster} />
          <Nosotros imageUrl={sections.nosotros} />
          <Reseñas reviews={reviews} />
          <Menu foodsUrl={sections.menu_foods} drinksUrl={sections.menu_drinks} />
          <Habitaciones rooms={rooms} />
        </main>

        <WhatsappLink />

        <footer>
          <Contacto
            isCloudbedsReady={isCloudbedsLoaded}
            imageUrl={sections.contactenos}
          />
        </footer>
      </div>

      {/* Pantalla de carga superpuesta */}
      {!showContent && <LoadingScreen isVisible={isLoadingVisible} />}
    </>
  );
}
