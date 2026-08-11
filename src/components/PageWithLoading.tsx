// src/components/PageWithLoading.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "./Navbar";
import Hero from "./Hero";
import FloatingEditorialActions from "./FloatingEditorialActions";
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
  // Señal compartida: cuando un botón registra el web component de Cloudbeds,
  // el resto se entera (evita recargas y acelera el primer clic).
  const [isCloudbedsReady, setIsCloudbedsReady] = useState(false);
  const handleCloudbedsLoaded = () => setIsCloudbedsReady(true);

  return (
    <>
      <header>
        <Navbar
          onCloudbedsLoaded={handleCloudbedsLoaded}
          isCloudbedsReady={isCloudbedsReady}
        />
      </header>

      <main>
        <Hero posterUrl={sections.hero_poster} videoUrl={sections.hero_video} />
        <Nosotros imageUrl={sections.nosotros} />
        <Reseñas reviews={reviews} />
        <Menu foodsUrl={sections.menu_foods} drinksUrl={sections.menu_drinks} />
        <Habitaciones rooms={rooms} />
      </main>

      <FloatingEditorialActions />

      <footer>
        <Contacto isCloudbedsReady={isCloudbedsReady} imageUrl={sections.contactenos} />
      </footer>
    </>
  );
}
