// utilsTitle.ts

/**
 * Extrae el título en dos partes a partir de una cadena que contiene un <span>.
 */
export function parseTitleWithSpan(tituloHTML: string): {
  tituloParte1: string;
  tituloParte2: string;
  tituloCompleto: string;
} {
  const regex = /^(.*?)<span>(.*?)<\/span>/;
  const match = tituloHTML.match(regex);
  const tituloParte1 = match ? match[1].trim() : "ERROR";
  const tituloParte2 = match ? match[2].trim() : "";
  const tituloCompleto = `${tituloParte1} ${tituloParte2}`.trim();
  return { tituloParte1, tituloParte2, tituloCompleto };
}

/**
 * Calcula el letter-spacing dinámico según longitud de texto y ancho de pantalla.
 * - ≥1490px: valores para pantallas muy grandes
 * - ≥1280px y <1490px: valores intermedios
 * - <1280px: valores por defecto
 */
export function getDynamicLetterSpacing(
  text: string,
  screenWidth?: number
): string {
  const length = text.length;
  const width =
    screenWidth ??
    (typeof window !== "undefined" ? window.screen.width : 0);

  if (width >= 1490) {
    // Pantallas muy grandes
    if (length <= 5) return "1.2em";
    if (length <= 8) return "1.1em";
    if (length <= 10) return "1em";
    if (length <= 12) return "0.85em";
    if (length <= 15) return "0.65em";
    return "0.92em";
  }

  if (width >= 1280) {
    // Pantallas grandes (entre 1280px y 1490px)
    if (length <= 5) return "1.15em";
    if (length <= 8) return "1.05em";
    if (length <= 10) return "0.95em";
    if (length <= 12) return "0.8em";
    if (length <= 15) return "0.6em";
    return "0.63em";
  }

  // Valores por defecto (<1280px)
  if (length <= 5) return "1em";
  if (length <= 8) return "0.95em";
  if (length <= 10) return "1em";
  if (length <= 12) return "0.75em";
  if (length <= 15) return "0.5em";
  return "0.72em";
}
