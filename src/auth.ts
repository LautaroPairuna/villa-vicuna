import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { ADMIN_ROLE, authConfig } from "./auth.config";
import { prisma } from "./lib/prisma";
import { checkRateLimit, clearAttempts, clientIp, registerFailure } from "./lib/rate-limit";

/**
 * Hash descartable con el que se compara cuando el email no existe.
 * Sin esto, un email inexistente responde muchísimo más rápido que uno real
 * (se saltea el bcrypt), y esa diferencia de tiempo permite averiguar qué
 * emails están dados de alta. Es el hash de una contraseña aleatoria: nunca
 * puede dar `true`.
 */
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

/** Error con código propio para poder avisar "demasiados intentos" en el login. */
class RateLimitError extends CredentialsSignin {
  code = "rate_limit";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const normalizedEmail = email.trim().toLowerCase();
        const ip = clientIp(request.headers);

        // Dos límites en paralelo: por IP (frena a un atacante desde un origen)
        // y por email (frena el ataque distribuido contra una cuenta puntual).
        const keys = [`ip:${ip}`, `email:${normalizedEmail}`];

        for (const key of keys) {
          const status = checkRateLimit(key);
          if (status.blocked) throw new RateLimitError();
        }

        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        // Se corre bcrypt siempre, exista o no el usuario, para que el tiempo de
        // respuesta no delate qué emails están registrados.
        const ok = await compare(password, user?.passwordHash ?? DUMMY_HASH);

        if (!user || !ok || user.role !== ADMIN_ROLE) {
          for (const key of keys) {
            const result = registerFailure(key);
            if (result.blocked) throw new RateLimitError();
          }
          return null;
        }

        for (const key of keys) clearAttempts(key);

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
});
