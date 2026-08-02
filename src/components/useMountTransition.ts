"use client";

import { useEffect, useState } from "react";

/**
 * Reemplazo mínimo de <AnimatePresence> para animar entrada y salida con CSS.
 *
 * El problema que resuelve: si desmontás el elemento apenas se cierra, la
 * animación de salida no llega a verse. Este hook lo mantiene montado hasta que
 * la transición termina.
 *
 *   const { montado, visible } = useMountTransition(abierto, 400);
 *   {montado && <div className={visible ? "opacity-100" : "opacity-0"} />}
 *
 * `duracion` tiene que coincidir con la de la transición CSS.
 */
export function useMountTransition(abierto: boolean, duracion: number) {
  const [montado, setMontado] = useState(abierto);
  const [visible, setVisible] = useState(abierto);

  useEffect(() => {
    if (abierto) {
      setMontado(true);
      return;
    }
    setVisible(false);
    const t = setTimeout(() => setMontado(false), duracion);
    return () => clearTimeout(t);
  }, [abierto, duracion]);

  useEffect(() => {
    if (!montado || !abierto) return;
    // Dos frames: el primero deja que el navegador pinte el estado inicial
    // (cerrado), el segundo dispara la transición. Con uno solo, el navegador
    // suele juntar los dos estados y no se ve nada.
    let segundo = 0;
    const primero = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(primero);
      cancelAnimationFrame(segundo);
    };
  }, [montado, abierto]);

  return { montado, visible };
}
