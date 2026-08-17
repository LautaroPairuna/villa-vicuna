// Rate limiting en memoria para el login del panel.
//
// Alcance: el sitio corre como UN proceso Node en el VPS, así que un Map local
// alcanza y evita meter Redis solo para esto. Si algún día se escala a varias
// instancias, cada una tendrá su propio contador y el límite efectivo se
// multiplica por la cantidad de réplicas — ahí sí habría que mover el estado a
// Redis (misma interfaz, cambia solo el cuerpo de estas funciones).
//
// El estado vive en globalThis porque en dev el hot reload recarga el módulo y
// perderíamos los contadores en cada guardado (mismo patrón que prisma.ts).

type Attempt = {
  count: number;
  /** Epoch ms en el que arranca la ventana vigente. */
  windowStart: number;
  /** Epoch ms hasta el que está bloqueado. 0 = no bloqueado. */
  blockedUntil: number;
};

const globalForRateLimit = globalThis as unknown as {
  loginAttempts?: Map<string, Attempt>;
};

const attempts = (globalForRateLimit.loginAttempts ??= new Map<string, Attempt>());

/** Intentos fallidos permitidos dentro de la ventana antes de bloquear. */
const MAX_ATTEMPTS = 5;
/** Ventana en la que se acumulan los fallos. */
const WINDOW_MS = 10 * 60 * 1000;
/** Cuánto dura el bloqueo una vez superado el límite. */
const BLOCK_MS = 15 * 60 * 1000;
/** Cota del Map: si se pasa, se purga lo vencido (defensa contra IPs rotativas). */
const MAX_ENTRIES = 5_000;

export type RateLimitResult =
  | { blocked: false; remaining: number }
  | { blocked: true; retryAfterSeconds: number };

/**
 * Purga entradas vencidas. Se llama de forma perezosa (no con setInterval) para
 * no dejar un timer vivo que impida al proceso terminar ni corra en cada
 * request. Con tráfico normal el Map tiene decenas de entradas.
 */
function purgeExpired(now: number) {
  for (const [key, entry] of attempts) {
    const expired = entry.blockedUntil < now && now - entry.windowStart > WINDOW_MS;
    if (expired) attempts.delete(key);
  }
}

/**
 * Consulta si la clave puede intentar loguearse. NO cuenta el intento: eso lo
 * hace `registerFailure` cuando la credencial resulta inválida, así un login
 * correcto nunca acerca al usuario al bloqueo.
 */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry) return { blocked: false, remaining: MAX_ATTEMPTS };

  if (entry.blockedUntil > now) {
    return {
      blocked: true,
      retryAfterSeconds: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  // Ventana vencida: el historial viejo ya no cuenta.
  if (now - entry.windowStart > WINDOW_MS) {
    attempts.delete(key);
    return { blocked: false, remaining: MAX_ATTEMPTS };
  }

  return { blocked: false, remaining: Math.max(0, MAX_ATTEMPTS - entry.count) };
}

/** Suma un fallo y bloquea la clave si se pasó del límite. */
export function registerFailure(key: string): RateLimitResult {
  const now = Date.now();

  if (attempts.size > MAX_ENTRIES) purgeExpired(now);

  const entry = attempts.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now, blockedUntil: 0 });
    return { blocked: false, remaining: MAX_ATTEMPTS - 1 };
  }

  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_MS;
    return { blocked: true, retryAfterSeconds: Math.ceil(BLOCK_MS / 1000) };
  }

  return { blocked: false, remaining: MAX_ATTEMPTS - entry.count };
}

/** Login exitoso: se limpia el historial de esa clave. */
export function clearAttempts(key: string) {
  attempts.delete(key);
}

/**
 * IP del cliente detrás del reverse proxy (Traefik en Dokploy).
 * `x-forwarded-for` puede traer una cadena "cliente, proxy1, proxy2": el primer
 * elemento es el cliente real.
 *
 * Ojo: esta cabecera es falsificable si la app queda expuesta directo a
 * internet. En el VPS solo Traefik habla con el contenedor y la reescribe, así
 * que acá es confiable.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
