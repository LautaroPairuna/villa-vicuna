"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { editorialSecondaryButton } from "./editorialUi";

// Mismo motor de reservas que usan el navbar, contacto y habitaciones: el
// botón abre el widget de Cloudbeds en una ventana emergente sobre la propia
// página, no un enlace al motor.
const CLOUDBEDS_PROPERTY_CODE = "pwSXnD";
const RESERVATION_URL = `https://hotels.cloudbeds.com/reservation/${CLOUDBEDS_PROPERTY_CODE}`;

// Mientras se descarga el chunk del widget (o si el script de Cloudbeds no
// llega) mostramos el mismo botón como enlace directo al motor, así el
// huésped siempre puede reservar.
function ReservaFallback() {
  const t = useTranslations("experiences");

  return (
    <a
      href={RESERVATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={editorialSecondaryButton}
    >
      {t("ctaBotonSecundario")}
    </a>
  );
}

// Fuera del bundle principal y sin SSR: el web component sólo existe en el
// navegador, renderizarlo en el servidor rompería la hidratación.
const CloudbedsBookNow = dynamic(() => import("./CloudbedsBookNow"), {
  ssr: false,
  loading: () => <ReservaFallback />,
});

export default function ExperiencesReservaButton() {
  const t = useTranslations("experiences");

  return (
    <CloudbedsBookNow
      propertyCode={CLOUDBEDS_PROPERTY_CODE}
      variant="rooms"
      roomsButtonClassName={editorialSecondaryButton}
      roomsLabel={t("ctaBotonSecundario")}
      directUrlFallback={RESERVATION_URL}
      mode="popup"
      width="90vw"
      height="90vh"
      lang="auto"
      timeout={4000}
    />
  );
}
