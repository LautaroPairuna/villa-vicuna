"use client";

import UploadField from "./UploadField";
import { uploadVideo } from "@/lib/uploadVideoClient";

// Wrapper cliente: las páginas del panel son server components y no pueden
// pasarle funciones a UploadField, así que el uploader se arma acá.
export default function VideoUploadField({
  slug,
  label = "Reemplazar video",
}: {
  slug: string;
  label?: string;
}) {
  return (
    <UploadField
      uploader={(file, onProgress) => uploadVideo(file, slug, onProgress)}
      hidden={{ slug }}
      label={label}
      accept="video/mp4,video/webm,video/quicktime"
      emptyLabel="Arrastrá un video o hacé clic"
      successLabel="Video actualizado"
    />
  );
}
