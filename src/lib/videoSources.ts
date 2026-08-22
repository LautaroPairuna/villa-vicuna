export type VideoSource = { src: string; type: string };

const MIME_BY_EXT: Record<string, string> = {
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".mov": "video/quicktime",
};

/**
 * Videos estáticos de /public que además existen en otro formato.
 *
 * Hoy está vacío a propósito. Había un `video-home.webm` (VP9) que se ofrecía
 * antes del mp4 porque pesaba menos: 24 MB contra 33 MB. Al recomprimir los
 * videos esa relación se dio vuelta —el mp4 quedó en 13 MB, más chico que
 * cualquier VP9 o AV1 que se probó al mismo bitrate— así que el segundo archivo
 * dejó de tener sentido y se eliminó.
 *
 * Si mañana se agrega un par (mp4 + webm) donde el webm SÍ pese menos, va acá.
 * Es una lista explícita y no una convención por nombre porque los videos que
 * se suben desde el panel son un solo archivo (media.ts no transcodifica
 * video): derivar el .webm agregaría un <source> inexistente y un 404 en cada
 * carga.
 */
const HAS_WEBM_TWIN = new Set<string>([]);

function mimeFor(url: string): string {
  const clean = url.split(/[?#]/)[0] ?? url;
  const dot = clean.lastIndexOf(".");
  const ext = dot === -1 ? "" : clean.slice(dot).toLowerCase();
  return MIME_BY_EXT[ext] ?? "video/mp4";
}

/**
 * Fuentes ordenadas para un <video>, de preferida a fallback.
 *
 * El navegador se queda con el primer <source> cuyo `type` dice soportar, así
 * que el orden es la decisión. Hoy todos los videos son H.264 en mp4, que anda
 * en todos lados, y devuelve una sola fuente.
 *
 * El atributo `type` no es opcional para que esto funcione: sin él el navegador
 * tiene que descargar cada fuente para saber si puede reproducirla, que es
 * justamente lo que se quiere evitar.
 */
export function videoSources(url?: string | null): VideoSource[] {
  // Sin URL no hay nada que ofrecer: un <video> sin <source> queda vacío, que
  // es lo mismo que antes hacía `src={undefined}`.
  if (!url) return [];

  const original: VideoSource = { src: url, type: mimeFor(url) };
  if (!HAS_WEBM_TWIN.has(url)) return [original];

  const webm = url.replace(/\.[^./]+$/, ".webm");
  return [{ src: webm, type: "video/webm" }, original];
}
