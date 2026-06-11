// src/components/PageWithLoading.tsx
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import LoadingScreen from "./LoadingScreen";
import Navbar from "./Navbar";
import Hero from "./Hero";
import WhatsappLink from "./WhatsappLink";
import Contacto from "./Contacto";

const Nosotros = dynamic(() => import("./Nosotros"), { ssr: false });
const Reseñas = dynamic(() => import("./Reseñas"), { ssr: false });
const Menu = dynamic(() => import("./Menu"), { ssr: false });
const Habitaciones = dynamic(() => import("./Habitaciones"), { ssr: false });

export default function PageWithLoading() {
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
      console.log("🚨 Timeout de seguridad activado - revelando sitio");
      setIsHeroLoaded(true);
      setIsLoadingVisible(false);
      setTimeout(() => setShowContent(true), 200);
    }, 6000);

    return () => clearTimeout(safetyTimer);
  }, []);

  // Cuando Hero está listo + tiempo mínimo cumplido → revelar sitio
  useEffect(() => {
    const state = {
      isHeroLoaded,
      isCloudbedsLoaded,
      minLoadingTime,
      allReady: isHeroLoaded && minLoadingTime,
    };

    console.log("📊 Estado de carga:", state);

    if (isHeroLoaded && minLoadingTime) {
      console.log("✅ Hero listo + tiempo mínimo cumplido - iniciando revelación");

      setIsLoadingVisible(false);

      const contentTimer = setTimeout(() => {
        setShowContent(true);
        console.log("🎉 Sitio revelado completamente");
      }, 200);

      return () => clearTimeout(contentTimer);
    }
  }, [isHeroLoaded, minLoadingTime]);

  const handleHeroLoaded = () => {
    console.log("🎬 Hero cargado (video + logo listos)");
    setIsHeroLoaded(true);
  };

  const handleCloudbedsLoaded = () => {
    console.log("☁️ Cloudbeds cargado");
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
          <Hero onLoaded={handleHeroLoaded} />
          <Nosotros />
          <Reseñas />
          <Menu />
          <Habitaciones />
        </main>

        <WhatsappLink />

        <footer>
          <Contacto isCloudbedsReady={isCloudbedsLoaded} />
        </footer>
      </div>

      {/* Pantalla de carga superpuesta */}
      {!showContent && <LoadingScreen isVisible={isLoadingVisible} />}
    </>
  );
}
