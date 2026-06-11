#!/bin/sh
set -e

# Aplica las migraciones pendientes antes de levantar el servidor.
# Idempotente: si no hay nada que migrar, no hace cambios.
if [ -n "$DATABASE_URL" ]; then
  echo "→ Aplicando migraciones de Prisma..."
  npx prisma migrate deploy || echo "⚠ migrate deploy falló (¿DB no lista?). Continuo."
else
  echo "⚠ DATABASE_URL no definida; salteo migraciones."
fi

exec "$@"
