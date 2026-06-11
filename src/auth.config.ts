import type { NextAuthConfig } from "next-auth";

// Config "edge-safe": sin Prisma ni bcrypt, para poder usarse en el middleware.
// La verificación de credenciales vive en auth.ts (runtime Node).
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "admin";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
