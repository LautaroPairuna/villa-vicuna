export type VideoSource = { src: string; type: string };

const MIME_BY_EXT: Record<string, string> = {
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".mov": "video/quicktime",
};

/**
 * Videos estáticos de /public que además existen en .webm con el mismo nombre.
 *
 * Es una lista explícita a propósito. Los videos que se suben desde el panel
 * son un solo archivo (media.ts no transcodifica video), así que derivar el
 * .webm por convención agregaría un <source> inexistente y un 404 en cada
 * carga. Al listarlos, solo se ofrece el webm donde realmente está.
 *
 * Si mañana se agrega otro par mp4 + webm a /public, va acá.
 */
const HAS_WEBM_TWIN = new Set(["/videos/video-home.mp4"]);

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
 * que el orden es la decisión: webm primero porque pesa bastante menos (24 MB
 * contra 33 MB en el video del hero), y mp4 después como red de seguridad.
 *
 * Safari en iOS es el motivo del mp4: recién soporta WebM de forma parcial
 * desde 17.4, así que descarta el primer <source> y cae al segundo, que es
 * H.264 y funciona en todos lados.
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
