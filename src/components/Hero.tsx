"use client";

import Image from "next/image";
import React, { memo } from "react";

const Hero = memo(() => {
  return (
    <section
      className="relative w-screen h-screen"
      aria-label="Hero - Bienvenida a Villa Vicuña"
    >
      <div className="absolute inset-0 w-full h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/videos/video-home.mp4" type="video/mp4" />
          Tu navegador no soporta videos en HTML5.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-10" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 sm:px-12">
          <div className="mt-6">
            <Image 
              src="/images/logo-villa-vicuna-3.svg" 
              alt="Isologo Villa Vicuña" 
              width={120}
              height={120}
              priority
            />
          </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero;
