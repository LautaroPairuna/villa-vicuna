"use client";

import CloudbedsBookNow from "./CloudbedsBookNow";

const CLOUDBEDS_PROPERTY_CODE = "pwSXnD";
const DEFAULT_RESERVATION_URL = "https://hotels.cloudbeds.com/reservation/pwSXnD";

export default function EditorialBookButton({
  label,
  className,
  wrapperClassName,
  fallbackUrl,
}: {
  label: string;
  className: string;
  /**
   * Clases para el contenedor del botón (por defecto `inline-flex`, o sea del
   * ancho del texto). Se usa cuando el botón tiene que ocupar todo el ancho de
   * su columna: sin esto el wrapper se queda chico y el botón no se estira.
   */
  wrapperClassName?: string;
  fallbackUrl?: string | null;
}) {
  return (
    <CloudbedsBookNow
      propertyCode={CLOUDBEDS_PROPERTY_CODE}
      variant="rooms"
      roomsLabel={label}
      roomsButtonClassName={className}
      className={wrapperClassName}
      directUrlFallback={fallbackUrl || DEFAULT_RESERVATION_URL}
      mode="popup"
      width="90vw"
      height="90vh"
      lang="auto"
      timeout={4000}
    />
  );
}
