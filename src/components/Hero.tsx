"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { memo } from "react";

const Hero = memo(() => {
  const t = useTranslations("hero");

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
          poster="/images/hero-poster.jpg"
        >
          <source src="/videos/video-home.mp4" type="video/mp4" />
          Tu navegador no soporta videos en HTML5.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-80" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 sm:px-12">
        <div className="relative border border-white/50 rounded-lg p-6 sm:p-10 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl uppercase tracking-widest">
            {t("tituloParte1")}
            <br className="block my-2" />
            {t("tituloParte2")}
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl font-light mt-2 sm:mt-4">
            {t("subtitulo")}
          </p>
          <div className="mt-6">
            <Image 
              src="/images/isologo-villa-vicuna.svg" 
              alt="Isologo Villa Vicuña" 
              width={80}
              height={80}
              priority
              className="w-16 sm:w-20 mx-auto"
            />
          </div>
          <div className="mt-6">
            <a 
              href="https://goo.su/4Nkqe" 
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white text-white px-6 py-2 sm:px-8 sm:py-3 uppercase tracking-wider text-sm sm:text-base hover:bg-white hover:text-black transition-all"
            >
              {t("reservar")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero;
