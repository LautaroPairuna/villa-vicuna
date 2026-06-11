import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7: la URL de conexión para Migrate/Introspection vive aquí.
// El runtime de la app NO usa esto: se conecta vía driver adapter (src/lib/prisma.ts).
// Usamos process.env directo (no el helper env()) para que `prisma generate`
// no falle en el build de Docker, donde DATABASE_URL aún no existe.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
