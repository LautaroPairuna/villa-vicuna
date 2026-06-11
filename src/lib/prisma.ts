import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7: conexión vía driver adapter (MySQL/MariaDB sobre TCP).
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Parseamos DATABASE_URL para poder limitar el pool (menos RAM en el VPS).
function buildAdapter() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL no está definida");
  }
  const u = new URL(url);
  return new PrismaMariaDb({
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    // Pool chico: con ISR la DB casi no se consulta, no necesitamos muchas.
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 3),
  });
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: buildAdapter() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
