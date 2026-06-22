import createIntlMiddleware from "next-intl/middleware";
import type { NextFetchEvent, NextRequest } from "next/server";
import NextAuth from "next-auth";
import type { Session } from "next-auth";
import { authConfig } from "./auth.config";
import { routing } from "./i18n/routing";

// Instancia edge-safe solo para leer la sesión (JWT) en el proxy.
const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware(routing);
const adminAuthMiddleware = auth((req: NextRequest & { auth: Session | null }, _event: NextFetchEvent) => {
  const authReq = req as NextRequest & { auth: Session | null };
  const { nextUrl } = authReq;
  const isLoggedIn = !!authReq.auth;
  const isLogin = nextUrl.pathname === "/admin/login";

  if (!isLoggedIn && !isLogin) {
    return Response.redirect(new URL("/admin/login", nextUrl));
  }
  if (isLoggedIn && isLogin) {
    return Response.redirect(new URL("/admin", nextUrl));
  }
  return;
});

export function proxy(req: NextRequest, event: NextFetchEvent) {
  const { nextUrl } = req;
  const isAdmin = nextUrl.pathname.startsWith("/admin");

  // Rutas públicas: next-intl maneja la redirección / -> /es (o el locale detectado).
  if (!isAdmin) {
    return intlMiddleware(req);
  }

  // Rutas /admin: protegidas y NO localizadas (no pasan por next-intl).
  if (isAdmin) {
    return adminAuthMiddleware(req, event);
  }
}

export const config = {
  // Todo excepto API, estáticos de Next y archivos con extensión.
  matcher: ["/", "/((?!api|_next|.*\\..*).*)"],
};
