import Link from "next/link";

export const metadata = {
  title: "Página no encontrada · Administración",
  robots: { index: false, follow: false },
};

// Vive en el layout raíz de /admin (sin sidebar): una ruta que no matchea
// puede darse tanto logueado como deslogueado, y el sidebar espera sesión.
export default function AdminNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.35em] text-admin-ink-soft">
        Villa Vicuña · Administración
      </p>
      <h1 className="mt-4 text-3xl uppercase tracking-[0.2em] text-admin-ink md:text-4xl">
        Página no encontrada
      </h1>
      <div className="mt-4 h-px w-16 bg-admin-gold" />
      <p className="mt-6 max-w-md text-sm text-admin-ink-soft">
        La sección que buscás no existe o cambió de lugar.
      </p>
      <Link
        href="/admin"
        className="mt-8 inline-block rounded-md bg-admin-gold px-6 py-3 text-xs uppercase tracking-[0.15em] text-admin-nav shadow-sm transition-opacity hover:opacity-90"
      >
        Volver al panel
      </Link>
    </div>
  );
}
