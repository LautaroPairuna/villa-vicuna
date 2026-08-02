"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Reveal from "./Reveal";

export type { TapeoItem } from "./TapeoModal";
import type { TapeoItem } from "./TapeoModal";

const TapeoModal = dynamic(() => import("./TapeoModal"), { ssr: false });


export default function ExperiencesTapeo({ items }: { items: TapeoItem[] }) {
  const [selected, setSelected] = useState<TapeoItem | null>(null);
  const [modalCargado, setModalCargado] = useState(false);
  const close = useCallback(() => setSelected(null), []);

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal
            as="button"
            key={item.src}
            delay={i * 110}
            type="button"
            onClick={() => {
              setModalCargado(true);
              setSelected(item);
            }}
            aria-label={item.name}
            className="group relative aspect-square overflow-hidden bg-white shadow-lg"
          >
            <Image
              src={item.src}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Reveal>
        ))}
      </div>

      {modalCargado && <TapeoModal item={selected} onClose={close} />}
    </>
  );
}
