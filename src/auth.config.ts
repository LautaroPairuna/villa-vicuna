import type { NextAuthConfig } from "next-auth";

/** Rol que habilita el panel. Único punto donde se define. */
export const ADMIN_ROLE = "admin";

/**
 * Duración de la sesión: 7 días, renovable.
 *
 * Antes no estaba seteado y corría el default de NextAuth (30 días). Con
 * `updateAge` el token se reemite cuando pasaron más de 24 h desde la última
 * renovación, así que en uso normal nunca corta; lo que cambia es el techo si
 * alguien deja de entrar o si le roban la cookie.
 */
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 días
const SESSION_UPDATE_AGE = 24 * 60 * 60; // renovación diaria

// Config "edge-safe": sin Prisma ni bcrypt, para poder usarse en el middleware.
// La verificación de credenciales vive en auth.ts (runtime Node).
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: SESSION_UPDATE_AGE,
  },
  // El JWT tiene que caducar junto con la sesión: si solo se limita la sesión,
  // el token firmado sigue siendo válido más tiempo del que queremos.
  jwt: { maxAge: SESSION_MAX_AGE },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Sin fallback a "admin": el rol sale de la DB o no hay rol. Antes un
        // usuario sin rol quedaba como admin por defecto.
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
