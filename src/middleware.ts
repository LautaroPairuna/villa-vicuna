import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { routing } from "./i18n/routing";

// Instancia edge-safe solo para leer la sesión (JWT) en el middleware.
const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware(routing);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = nextUrl.pathname.startsWith("/admin");
  const isLogin = nextUrl.pathname === "/admin/login";

  // Rutas /admin: protegidas y NO localizadas (no pasan por next-intl).
  if (isAdmin) {
    if (!isLoggedIn && !isLogin) {
      return Response.redirect(new URL("/admin/login", nextUrl));
    }
    if (isLoggedIn && isLogin) {
      return Response.redirect(new URL("/admin", nextUrl));
    }
    return;
  }

  // Resto del sitio: internacionalización (es/en/fr).
  return intlMiddleware(req);
});

export const config = {
  // Todo excepto API, estáticos de Next y archivos con extensión.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
