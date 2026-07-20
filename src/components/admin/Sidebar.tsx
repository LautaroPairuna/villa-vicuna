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
  FiMapPin,
  FiTag,
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
    items: [
      { href: "/admin/promociones", label: "Promociones", icon: FiTag },
      { href: "/admin/salta", label: "Salta", icon: FiMapPin },
      { href: "/admin/experiencias", label: "Experiencias", icon: TbGlassFull },
    ],
  },
];

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
    <aside className="border-b border-[#e3d6b5]/80 bg-[linear-gradient(180deg,#fcfaf5_0%,#f7f1e6_100%)] md:sticky md:top-0 md:h-screen md:w-72 md:shrink-0 md:border-b-0 md:border-r md:border-[#e3d6b5]">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="relative border-b border-[#cbb789]/45 bg-[#17273f] px-5 py-5">
          <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(203,183,137,0.75),transparent)]" />
          <div className="flex items-center justify-center py-2">
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

        <nav className="flex gap-3 overflow-x-auto p-3 md:flex-1 md:flex-col md:overflow-y-auto md:overflow-x-hidden md:px-4 md:py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="min-w-[220px] md:min-w-0">
              <p className="px-1 text-[10px] uppercase tracking-[0.32em] text-[#17273f]/45">
                {group.title}
              </p>
              <div className="my-3 h-px bg-[linear-gradient(90deg,rgba(227,214,181,0.85),rgba(227,214,181,0.18))]" />
              <div className="space-y-2">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`group relative flex items-center gap-3 whitespace-nowrap rounded-2xl border px-4 py-3 text-sm uppercase tracking-[0.16em] transition-all ${
                        active
                          ? "border-[#17273f] bg-[#17273f] text-white shadow-[0_12px_30px_rgba(23,39,63,0.22)]"
                          : "border-transparent text-[#17273f] hover:border-[#e3d6b5] hover:bg-white/80 hover:shadow-[0_10px_24px_rgba(23,39,63,0.06)]"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                          active
                            ? "border-[#e3d6b5]/40 bg-white/10 text-[#e3d6b5]"
                            : "border-[#e3d6b5] bg-[#f8f4ea] text-[#17273f]/70 group-hover:bg-white"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                      </span>
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-[#cbb789]/45 bg-[#17273f] p-4">
          {(name || email) && (
            <div className="mb-4 rounded-[24px] border border-[#cbb789]/35 bg-white px-4 py-4 shadow-[0_16px_36px_rgba(7,14,28,0.18)]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#17273f]/45">
                Sesion activa
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#17273f] text-sm uppercase tracking-[0.12em] text-white">
                  {sessionLabel.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-base text-[#17273f]">{sessionLabel}</p>
                  {email && name && (
                    <p className="truncate text-xs tracking-[0.08em] text-[#17273f]/45">{email}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-[24px] border border-[#3C7022] bg-[#3C7022] px-4 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-all hover:bg-[#335f1d] hover:shadow-[0_12px_30px_rgba(7,14,28,0.16)]"
            >
              <FiExternalLink className="h-3.5 w-3.5" />
              Volver al sitio
            </Link>
            <form action={logoutAction}>
              <button className="flex w-full items-center justify-center gap-2 rounded-[24px] border border-[#a34848]/55 bg-[#8f3a3a]/12 px-4 py-3.5 text-xs uppercase tracking-[0.24em] text-[#f4d7d7] transition-all hover:bg-[#8f3a3a]/20 hover:shadow-[0_12px_30px_rgba(7,14,28,0.18)]">
                <FiLogOut className="h-3.5 w-3.5" />
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
