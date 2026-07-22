// components/ImageWithFallback.tsx
"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface Props extends Omit<ImageProps, "src"> {
  /** Ruta inicial (p. ej. `/images/Habitaciones/...`) */
  src: string;
  /** Imagen a mostrar si falla la carga */
  fallbackSrc?: string;
}

export function ImageWithFallback({
  src,
  fallbackSrc = "/images/placeholder.jpg",
  alt,
  ...rest
}: Props) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...rest}
      // Las imágenes subidas (/uploads) ya vienen optimizadas (WebP ≤2000px) y
      // se sirven por su propia ruta; se saltean el optimizador de next/image
      // para no depender de él en producción.
      unoptimized={imgSrc.startsWith("/uploads/")}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
