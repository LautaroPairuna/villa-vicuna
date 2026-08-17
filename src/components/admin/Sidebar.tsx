"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiStar,
  FiLogOut,
  FiFilm,
  FiInfo,
  FiBookOpen,
  FiPhone,
  FiExternalLink,
} from "react-icons/fi";
import { TbBed, TbGlassFull } from "react-icons/tb";
import type { IconType } from "react-icons";
import { logoutAction } from "@/app/admin/actions";

const NAV_GROUPS: {
  title: string;
  items: { href: string; label: string; icon: IconType }[];
}[] = [
  {
    title: "Panel",
    items: [{ href: "/admin", label: "Inicio", icon: FiHome }],
  },
  {
    title: "Página principal",
    items: [
      { href: "/admin/hero", label: "Hero", icon: FiFilm },
      { href: "/admin/nosotros", label: "Nosotros", icon: FiInfo },
      { href: "/admin/habitaciones", label: "Habitaciones", icon: TbBed },
      { href: "/admin/resenas", label: "Reseñas", icon: FiStar },
      { href: "/admin/menu", label: "Menú", icon: FiBookOpen },
      { href: "/admin/contacto", label: "Contacto", icon: FiPhone },
    ],
  },
  {
    title: "Editorial",
    items: [{ href: "/admin/experiencias", label: "Experiencias", icon: TbGlassFull }],
  },
];

/**
 * Sidebar: una sola banda navy de arriba a abajo.
 *
 * Antes el navy aparecía en tres bloques sueltos (cabecera del logo, item
 * activo y pie) separados por crema, y el corte se leía como tres barras
 * distintas. Ahora el navy es el color de "chrome" —toda la navegación— y el
 * contenido queda claro; la separación interna se hace con filetes dorados al
 * 20%, no cambiando el fondo.
 *
 * El dorado sólido queda reservado al item activo: es el único elemento que lo
 * usa de relleno, así que no hay ambigüedad sobre dónde estás parado.
 */
export default function Sidebar({
  email,
  name,
}: {
  email?: string | null;
  name?: string | null;
}) {
  const pathname = usePathname() ?? "";
  const sessionLabel = name?.trim() || email?.trim() || "Administrador";

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="bg-admin-nav md:sticky md:top-0 md:h-screen md:w-72 md:shrink-0">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-admin-gold/20 px-5 py-6">
          <div className="flex items-center justify-center">
            <Image
              src="/images/logo-villa-vicuna-5.svg"
              alt="Villa Vicuña"
              width={220}
              height={84}
              className="h-14 w-auto"
              priority
            />
          </div>
        </div>

        <nav className="flex gap-4 overflow-x-auto p-4 md:flex-1 md:flex-col md:gap-6 md:overflow-y-auto md:overflow-x-hidden md:px-4 md:py-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="min-w-[220px] md:min-w-0">
              <p className="px-3 pb-3 text-[10px] uppercase tracking-[0.32em] text-admin-gold/55">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs uppercase tracking-[0.16em] transition-colors ${
                        active
                          ? "bg-admin-gold text-admin-nav"
                          : "text-white/70 hover:bg-admin-nav-soft hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          active ? "text-admin-nav" : "text-admin-gold/70 group-hover:text-admin-gold"
                        }`}
                      />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-admin-gold/20 p-4">
          {(name || email) && (
            <div className="mb-4 flex items-center gap-3 px-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-gold text-sm uppercase text-admin-nav">
                {sessionLabel.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{sessionLabel}</p>
                {email && (
                  <p className="truncate text-xs text-white/45">{email}</p>
                )}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] text-white/80 transition-colors hover:border-admin-gold/50 hover:bg-admin-nav-soft hover:text-white"
            >
              <FiExternalLink className="h-3.5 w-3.5" />
              Volver al sitio
            </Link>
            <form action={logoutAction}>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] text-admin-danger transition-colors hover:bg-admin-danger/15">
                <FiLogOut className="h-3.5 w-3.5" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
