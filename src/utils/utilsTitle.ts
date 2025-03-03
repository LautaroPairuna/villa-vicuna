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
 */
export function getDynamicLetterSpacing(text: string): string {
  const length = text.length;
  if (length <= 5) return "1em";
  if (length <= 8) return "0.95em";
  if (length <= 10) return "1em";
  if (length <= 12) return "0.75em";
  if (length <= 15) return "0.5em";
  return "0.55em";
}
