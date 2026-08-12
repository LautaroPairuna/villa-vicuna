"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import EditorialBookButton from "./EditorialBookButton";
import { useMountTransition } from "./useMountTransition";
import {
  editorialBody,
  editorialEyebrow,
  editorialPrimaryButton,
  editorialSecondaryButton,
} from "./editorialUi";

// Duración de la transición de apertura/cierre. Tiene que coincidir con las
// clases `duration-300` de abajo, porque useMountTransition usa este número
// para saber cuándo desmontar.
const DURACION = 300;

export type PromocionDetalleData = {
  slug: string;
  titulo: string;
  contenido: string;
  // Ya formateadas en el server ("Desde 15 de junio de 2026"), así el modal no
  // arrastra Intl ni depende de la zona horaria del visitante.
  vigencia: string[];
  ctaLabel: string;
  ctaHref: string | null;
};

/**
 * Botón «Ver detalle» de una promoción, con el contenido largo en un modal.
 *
 * Reemplaza a la ruta /promociones/[slug], que repetía portada, vigencia,
 * título y resumen de la lista para agregar solamente estos párrafos. El
 * contenido ya viaja en la consulta de la lista, así que abrir el detalle no
 * pega a la base.
 *
 * El hash de la URL (/promociones#mi-promo) abre la promoción directamente,
 * para no perder la posibilidad de compartir el link de una promo puntual.
 */
export default function PromocionDetalle({
  promocion,
  label,
  className = editorialPrimaryButton,
}: {
  promocion: PromocionDetalleData;
  label: string;
  className?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const { montado, visible } = useMountTransition(abierto, DURACION);

  const abrir = useCallback(() => setAbierto(true), []);
  const cerrar = useCallback(() => setAbierto(false), []);

  // Un link con #slug abre esta promoción: al cargar y también si el hash
  // cambia con la página ya abierta (por ejemplo al pegar otro link).
  useEffect(() => {
    const aplicarHash = () => {
      if (decodeURIComponent(window.location.hash.slice(1)) === promocion.slug) {
        setAbierto(true);
      }
    };
    aplicarHash();
    window.addEventListener("hashchange", aplicarHash);
    return () => window.removeEventListener("hashchange", aplicarHash);
  }, [promocion.slug]);

  // Con el modal abierto: Escape cierra y el fondo no scrollea.
  useEffect(() => {
    if (!abierto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto, cerrar]);

  // El hash acompaña al modal para que el link sea copiable. Va con
  // replaceState en vez de tocar location.hash: no ensucia el historial ni
  // salta el scroll al elemento.
  useEffect(() => {
    const hashActual = decodeURIComponent(window.location.hash.slice(1));
    if (abierto) {
      if (hashActual !== promocion.slug) {
        window.history.replaceState(null, "", `#${promocion.slug}`);
      }
      return;
    }
    if (hashActual === promocion.slug) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [abierto, promocion.slug]);

  const parrafos = promocion.contenido.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <button type="button" onClick={abrir} className={className}>
        {label}
      </button>

      {montado &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/80 px-4 transition-opacity duration-300 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            onClick={cerrar}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={promocion.titulo}
              className={`relative my-8 max-h-[90vh] w-full max-w-md overflow-y-auto bg-white px-4 pb-6 pt-20 transition-all duration-300 sm:px-8 md:px-12 md:pb-10 md:pt-24 lg:max-w-3xl ${
                visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="absolute left-0 top-4 z-20 flex items-center rounded-br-full rounded-tr-full bg-[#17273f] px-2 py-2 text-white md:top-6 md:px-4 md:py-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Ornamento de las páginas editoriales. Va en la esquina y con
                  menos opacidad que en la lista: acá el texto ocupa todo el
                  ancho y cruzarlo por el medio molesta la lectura. */}
              <div className="pointer-events-none absolute -bottom-8 -right-10 hidden h-[240px] w-[240px] opacity-40 lg:block">
                <Image src="/images/fondo-carta-3.svg" alt="" fill className="object-contain" />
              </div>

              <div className="relative z-10">
                {promocion.vigencia.length > 0 && (
                  <div className={`flex flex-wrap gap-3 ${editorialEyebrow}`}>
                    {promocion.vigencia.map((texto) => (
                      <span key={texto}>{texto}</span>
                    ))}
                  </div>
                )}

                <h2 className="mt-5 text-2xl uppercase tracking-[0.18em] text-black md:text-3xl md:leading-[1.35]">
                  {promocion.titulo}
                </h2>

                <div className={`mt-8 space-y-6 ${editorialBody}`}>
                  {parrafos.map((parrafo) => (
                    <p key={parrafo}>{parrafo}</p>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  <EditorialBookButton
                    label={promocion.ctaLabel}
                    fallbackUrl={promocion.ctaHref}
                    className={editorialPrimaryButton}
                  />
                  <button type="button" onClick={cerrar} className={editorialSecondaryButton}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
