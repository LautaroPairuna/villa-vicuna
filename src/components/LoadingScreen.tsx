"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface LoadingScreenProps {
  isVisible?: boolean;
}

export default function LoadingScreen({ isVisible = true }: LoadingScreenProps) {
  const t = useTranslations("loading");

  return (
    <div
      className={`fixed inset-0 z-[100] bg-gradient-to-br from-[#f8f5f0]/95 via-[#f0ebe3]/90 to-[#e8e0d5]/85 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Logo “scale in” */}
      <div className="mb-8 animate-logo-in">
        <Image
          src="/images/logo-villa-vicuna-2.svg"
          alt="Villa Vicuña"
          width={200}
          height={200}
          className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
        />
      </div>

      {/* Texto de carga “fade up” */}
      <div className="text-center mb-8 animate-text-in">
        <p className="text-sm md:text-base text-gray-600">
          {t("preparando")}
        </p>
      </div>

      {/* Indicador de carga animado (spinner) */}
      <div className="relative animate-spinner-in">
        <div className="w-16 h-16 border-4 border-gray-500 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-black rounded-full animate-spin-slow" />
      </div>

      {/* Puntos animados tipo framer-motion, pero con CSS */}
      <div className="flex space-x-2 mt-8 animate-dots-in">
        <span className="w-2 h-2 bg-black rounded-full animate-bounce-dot [animation-delay:0s]" />
        <span className="w-2 h-2 bg-black rounded-full animate-bounce-dot [animation-delay:0.2s]" />
        <span className="w-2 h-2 bg-black rounded-full animate-bounce-dot [animation-delay:0.4s]" />
      </div>

      {/* Decoración de fondo sutil (blobs que rotan/respiran lento) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-full animate-blob-1" />
        <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-tr from-[#d4af37]/5 to-transparent rounded-full animate-blob-2" />
      </div>
    </div>
  );
}
