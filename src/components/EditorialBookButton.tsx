"use client";

import CloudbedsBookNow from "./CloudbedsBookNow";

const CLOUDBEDS_PROPERTY_CODE = "pwSXnD";
const DEFAULT_RESERVATION_URL = "https://hotels.cloudbeds.com/reservation/pwSXnD";

export default function EditorialBookButton({
  label,
  className,
  fallbackUrl,
}: {
  label: string;
  className: string;
  fallbackUrl?: string | null;
}) {
  return (
    <CloudbedsBookNow
      propertyCode={CLOUDBEDS_PROPERTY_CODE}
      variant="rooms"
      roomsLabel={label}
      roomsButtonClassName={className}
      directUrlFallback={fallbackUrl || DEFAULT_RESERVATION_URL}
      mode="popup"
      width="90vw"
      height="90vh"
      lang="auto"
      timeout={4000}
    />
  );
}
