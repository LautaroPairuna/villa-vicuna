import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, type PrismaClient as PrismaClientInstance } from "@/generated/prisma/client";

// Prisma 7: conexión vía driver adapter (MySQL/MariaDB sobre TCP).
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientInstance;
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
    // Fallar rápido si la DB no está disponible (build sin DB o caída en
    // runtime): sin esto, un host inalcanzable cuelga hasta el timeout de la
    // plataforma (~60s en el build). Con estos límites, los getters con
    // try/catch caen al contenido estático en pocos segundos.
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT ?? 5000),
    acquireTimeout: Number(process.env.DB_ACQUIRE_TIMEOUT ?? 8000),
  });
}

export const prisma: PrismaClientInstance =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: buildAdapter() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
