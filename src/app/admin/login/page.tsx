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
      setError("Email o contraseña incorrectos.");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Decoración de fondo sutil (mismo motivo que el sitio) */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] opacity-40">
        <Image src="/images/fondo-carta-1.svg" alt="" fill className="object-contain" />
      </div>
      <div className="pointer-events-none absolute -bottom-28 -left-24 w-[420px] h-[420px] opacity-30">
        <Image src="/images/fondo-carta-2.svg" alt="" fill className="object-contain" />
      </div>

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-sm bg-white shadow-xl border border-black/5 px-8 py-10"
      >
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo-villa-vicuna-2.svg"
            alt="Villa Vicuña"
            width={150}
            height={150}
            className="w-36 h-auto"
            priority
          />
        </div>

        <h1 className="text-center text-xl uppercase tracking-[0.35em] mb-8 text-[#17273f]">
          Administración
        </h1>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-[#17273f]/70" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full border border-[#d8cdb0] bg-[#f8f4ea] px-3 py-2.5 outline-none focus:border-[#17273f] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-[#17273f]/70" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-[#d8cdb0] bg-[#f8f4ea] px-3 py-2.5 outline-none focus:border-[#17273f] transition-colors"
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#17273f] text-white uppercase tracking-[0.25em] text-sm py-3 hover:bg-[#24395c] transition-colors disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </div>
      </form>
    </div>
  );
}
