import "server-only";

/**
 * Lectura de la DB con contenido base como red de seguridad.
 *
 * El sitio público nunca debe caerse porque MySQL no responda, pero el
 * fallback silencioso tenía un costo alto: si la consulta fallaba (build sin
 * acceso a la base, pool agotado, hipo de red), la página se renderizaba con
 * las imágenes y textos base y —al ser ISR— ese render quedaba cacheado, sin
 * dejar ningún rastro de que hubo un error. Se ve como "primero cargan las
 * imágenes base y después las nuevas".
 *
 * Acá el fallo se loguea (aparece en los logs de build y del contenedor en
 * Dokploy) en vez de tragarse. No se reintenta a propósito: el pool ya espera
 * 10 s antes de fallar, y un segundo intento duplicaría esa espera en cada
 * render con la base caída —además de pasarse del límite de 60 s por página
 * que Next impone durante el build—.
 */
export async function dbRead<T>(label: string, read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch (err) {
    console.error(
      `[content] "${label}": no se pudo leer de la base, se sirve el contenido base.`,
      err instanceof Error ? err.message : err,
    );
    return fallback;
  }
}
