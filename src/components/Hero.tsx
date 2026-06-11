// src/components/Hero.tsx
"use client";

import Image from "next/image";
import React, { memo, useRef } from "react";

interface HeroProps {
  onLoaded?: () => void;
}

const Hero = memo(({ onLoaded }: HeroProps) => {
  const videoReadyRef = useRef(false);
  const logoReadyRef = useRef(false);
  const notifiedRef = useRef(false);

  const tryNotifyLoaded = () => {
    if (!notifiedRef.current && videoReadyRef.current && logoReadyRef.current) {
      notifiedRef.current = true;
      onLoaded?.();
    }
  };

  const handleVideoEvent = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;

    // 3 = HAVE_FUTURE_DATA, 4 = HAVE_ENOUGH_DATA
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      videoReadyRef.current = true;
      tryNotifyLoaded();
    }
  };

  const handleLogoLoad = () => {
    logoReadyRef.current = true;
    tryNotifyLoaded();
  };

  return (
    <section
      className="relative w-full min-h-dvh"
      aria-label="Hero - Bienvenida a Villa Vicuña"
    >
      {/* Fondo de video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/hero-poster.webp"
          onLoadedData={handleVideoEvent}
          onCanPlayThrough={handleVideoEvent}
        >
          {/* Versión WebM (más eficiente) */}
          <source src="/videos/video-home.webm" type="video/webm" />
          {/* Fallback MP4 */}
          <source src="/videos/video-home.mp4" type="video/mp4" />
          Tu navegador no soporta videos en HTML5.
        </video>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Contenido centrado */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 sm:px-12">
        <div className="mt-6">
          <Image
            src="/images/logo-villa-vicuna-3.svg"
            alt="Isologo Villa Vicuña"
            width={120}
            height={120}
            priority
            onLoad={handleLogoLoad}
          />
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero;
