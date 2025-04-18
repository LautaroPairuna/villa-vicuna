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
