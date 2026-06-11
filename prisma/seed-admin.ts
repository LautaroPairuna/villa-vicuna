import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "bcryptjs";

// Crea o actualiza el usuario admin a partir de ADMIN_EMAIL / ADMIN_PASSWORD.
// Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:seed:admin
const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Definí ADMIN_EMAIL y ADMIN_PASSWORD en el entorno.");
  }
  const passwordHash = await hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Admin", role: "admin" },
  });
  console.log("✅ Admin listo:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
