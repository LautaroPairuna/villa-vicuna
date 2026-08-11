"use client";

import { createElement, useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Animaciones de entrada al hacer scroll, al estilo framer-motion pero sin la
 * librería: IntersectionObserver para detectar la entrada + una transición CSS
 * para el movimiento. Cero JS de animación en el frame, todo lo mueve el
 * compositor (opacity + transform).
 *
 * No envuelve en un <div> extra: `as` renderiza el mismo elemento que tenías y
 * le suma las clases, así no se rompe ningún grid ni flex existente.
 *
 *   <Reveal as="h2" variant="up" className="text-4xl">Título</Reveal>
 *   {items.map((it, i) => <Reveal key={it.id} delay={i * 90}>…</Reveal>)}
 */

type Variant = "up" | "down" | "left" | "right" | "fade" | "zoom";

interface RevealProps {
  children: ReactNode;
  /** Elemento a renderizar. Por defecto "div". */
  as?: ElementType;
  variant?: Variant;
  /** Retraso en ms. Para escalonar (stagger) una grilla: delay={i * 90}. */
  delay?: number;
  /** Duración en ms. */
  duration?: number;
  /** Fracción del elemento que debe verse para disparar (0 a 1). */
  amount?: number;
  /** Si es false, la animación se repite cada vez que el elemento entra. */
  once?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Cualquier otro atributo (id, href, onClick, aria-*) pasa al elemento. */
  [key: string]: unknown;
}

/**
 * OJO: el estado final es `transform: none`, así que no pongas <Reveal> sobre
 * un elemento que ya usa transform para posicionarse (rotate, translate,
 * scale...) — se lo pisa. En esos casos animá el contenedor.
 */

// Un observer por umbral, compartido por todos los Reveal de la página, en vez
// de uno por componente.
const observers = new Map<number, IntersectionObserver>();
const callbacks = new WeakMap<Element, (visible: boolean) => void>();

function getObserver(amount: number): IntersectionObserver {
  let observer = observers.get(amount);
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) callbacks.get(entry.target)?.(entry.isIntersecting);
      },
      // El -8% de abajo hace que dispare un toque antes de que el elemento
      // toque el borde inferior de la pantalla.
      { threshold: amount, rootMargin: "0px 0px -8% 0px" },
    );
    observers.set(amount, observer);
  }
  return observer;
}

export default function Reveal({
  children,
  as = "div",
  variant = "up",
  delay = 0,
  duration = 700,
  amount = 0.15,
  once = true,
  className = "",
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sin IntersectionObserver (navegadores viejos) se muestra y listo: nunca
    // dejamos contenido invisible por no poder animarlo.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

    const observer = getObserver(amount);
    callbacks.set(el, (visible) => {
      if (visible) {
        el.classList.add("is-visible");
        if (once) {
          observer.unobserve(el);
          callbacks.delete(el);
        }
      } else if (!once) {
        el.classList.remove("is-visible");
      }
    });
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      callbacks.delete(el);
    };
  }, [amount, once]);

  return createElement(
    as,
    {
      ...rest,
      ref,
      className: `reveal reveal-${variant} ${className}`.trim(),
      style: {
        ...style,
        ...(delay ? { "--reveal-delay": `${delay}ms` } : null),
        ...(duration !== 700 ? { "--reveal-duration": `${duration}ms` } : null),
      } as CSSProperties,
    },
    children,
  );
}
