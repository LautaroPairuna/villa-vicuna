"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      // El servidor bloquea por intentos fallidos y lo avisa con un código
      // propio. Si la versión de next-auth no lo propaga, cae en el mensaje
      // genérico, que sigue siendo correcto.
      setError(
        (res as { code?: string }).code === "rate_limit"
          ? "Demasiados intentos fallidos. Esperá unos minutos antes de volver a probar."
          : "Email o contraseña incorrectos.",
      );
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    // Fondo navy: el login es "chrome", igual que el sidebar del panel. La
    // tarjeta clara adelanta cómo se va a ver el contenido una vez adentro.
    <div className="admin-scope flex min-h-screen items-center justify-center bg-admin-nav px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-admin-surface px-8 py-10"
      >
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logo-villa-vicuna-2.svg"
            alt="Villa Vicuña"
            width={150}
            height={150}
            className="h-auto w-36"
            priority
          />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-lg uppercase tracking-[0.35em] text-admin-ink">Administración</h1>
          <div className="mx-auto mt-4 h-px w-12 bg-admin-gold" />
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label
              className="block text-[10px] uppercase tracking-[0.2em] text-admin-ink-soft"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-[10px] uppercase tracking-[0.2em] text-admin-ink-soft"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-admin-line bg-admin-canvas px-4 py-3 text-sm text-admin-ink outline-none transition-colors focus:border-admin-gold focus:bg-admin-surface"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-admin-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-admin-nav px-4 py-3.5 text-xs uppercase tracking-[0.25em] text-white transition-colors hover:bg-admin-nav-soft disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </div>
      </form>
    </div>
  );
}
