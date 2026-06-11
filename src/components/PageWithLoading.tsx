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

// SSR habilitado (sin ssr:false): el contenido entra en el HTML para SEO/GEO.
// Seguimos usando dynamic para code-splitting por sección. Los modales/portales
// (react-slick, createPortal) solo se montan al abrirse, así que el SSR es seguro.
const Nosotros = dynamic(() => import("./Nosotros"));
const Reseñas = dynamic(() => import("./Reseñas"));
const Menu = dynamic(() => import("./Menu"));
const Habitaciones = dynamic(() => import("./Habitaciones"));

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
      {/* Sin JS, el contenido queda visible y se oculta el loader (el contenido
          ya está en el HTML por el SSR). */}
      <noscript>
        <style>{`.site-reveal{opacity:1 !important} .loading-overlay{display:none !important}`}</style>
      </noscript>

      {/* Contenido principal que se revela gradualmente */}
      <div
        className={`site-reveal transition-opacity duration-1000 ease-in-out ${
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
