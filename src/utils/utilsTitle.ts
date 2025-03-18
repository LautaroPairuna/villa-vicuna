// utilsTitle.ts

/**
 * Extrae el título en dos partes a partir de una cadena que contiene un <span>.
 * Ejemplo: "ABOUT <span>US</span>"
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
 * Calcula el tracking (letterSpacing) dinámico en función de la cantidad de caracteres
 * del título completo y retorna el valor en "em".
 * 
 * Si el ancho de pantalla es mayor a 1490px, se usan otros valores.
 * Se puede pasar opcionalmente el ancho de pantalla para hacer pruebas o en ambientes SSR.
 */
export function getDynamicLetterSpacing(text: string, screenWidth?: number): string {
  const length = text.length;
  // Determinamos si el ancho de pantalla es mayor a 1490px.
  const isLargeScreen =
    screenWidth !== undefined
      ? screenWidth > 1490
      : typeof window !== 'undefined'
      ? window.innerWidth > 1490
      : false;
  
  if (isLargeScreen) {
    // Valores para pantallas grandes (ancho > 1490px)
    if (length <= 5) return "1.2em";
    if (length <= 8) return "1.1em";
    if (length <= 10) return "1em";
    if (length <= 12) return "0.85em";
    if (length <= 15) return "0.65em";
    return "0.92em";
  } else {
    // Valores por defecto
    if (length <= 5) return "1em";
    if (length <= 8) return "0.95em";
    if (length <= 10) return "1em";
    if (length <= 12) return "0.75em";
    if (length <= 15) return "0.5em";
    return "0.78em";
  }
}
