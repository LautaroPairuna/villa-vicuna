import "server-only";
import { auth } from "@/auth";
import { ADMIN_ROLE } from "@/auth.config";
import { prisma } from "@/lib/prisma";

/**
 * ¿La request viene de un admin? Valida el JWT y además relee rol y existencia
 * contra la DB: el token vale hasta 7 días, y sin esta consulta un usuario
 * borrado o al que se le bajó el rol seguiría escribiendo hasta que venza la
 * cookie. Lo usan las server actions y la ruta de subida de videos, que no
 * pasa por el proxy (el matcher excluye /api) y tiene que chequear por su cuenta.
 */
export async function isAdminSession(): Promise<boolean> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return false;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return user?.role === ADMIN_ROLE;
}
