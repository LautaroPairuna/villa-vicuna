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
import { TbBed } from "react-icons/tb";
import type { IconType } from "react-icons";
import { logoutAction } from "@/app/admin/actions";

const NAV: { href: string; label: string; icon: IconType }[] = [
  { href: "/admin", label: "Inicio", icon: FiHome },
  { href: "/admin/hero", label: "Hero", icon: FiFilm },
  { href: "/admin/nosotros", label: "Nosotros", icon: FiInfo },
  { href: "/admin/habitaciones", label: "Habitaciones", icon: TbBed },
  { href: "/admin/resenas", label: "Reseñas", icon: FiStar },
  { href: "/admin/menu", label: "Menú", icon: FiBookOpen },
  { href: "/admin/contacto", label: "Contacto", icon: FiPhone },
  { href: "/admin/promociones", label: "Promociones", icon: FiTag },
  { href: "/admin/salta", label: "Salta", icon: FiMapPin },
];

export default function Sidebar({ email }: { email?: string | null }) {
  const pathname = usePathname() ?? "";

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="border-b border-[#e3d6b5]/80 px-3 py-3 md:w-72 md:shrink-0 md:border-b-0 md:px-4 md:py-4">
      <div className="md:sticky md:top-4 md:h-[calc(100vh-2rem)] rounded-[28px] border border-[#e3d6b5] bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(248,244,234,0.98)_100%)] shadow-[0_18px_50px_rgba(23,39,63,0.08)] backdrop-blur-sm flex flex-col overflow-hidden">
        <div className="relative px-5 py-5 border-b border-[#e3d6b5]">
          <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(227,214,181,0.85),transparent)]" />
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-[#17273f]/45">
            Panel Admin
          </p>
          <div className="flex items-center justify-center md:justify-start">
            <Image
              src="/images/logo-villa-vicuna-2.svg"
              alt="Villa Vicuña"
              width={150}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </div>
        </div>

        <nav className="flex md:flex-col gap-2 p-3 overflow-x-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
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
        </nav>

        <div className="mt-auto border-t border-[#e3d6b5] bg-white/40 p-4">
          {email && (
            <div className="mb-4 rounded-2xl border border-[#e3d6b5] bg-white/70 px-4 py-3">
              <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-[#17273f]/45">
                Sesion activa
              </p>
              <p className="hidden truncate text-sm text-[#17273f]/70 md:block">{email}</p>
            </div>
          )}
          <Link
            href="/"
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e3d6b5] bg-white/70 px-4 py-3 text-xs uppercase tracking-[0.24em] text-[#17273f] transition-all hover:border-[#17273f] hover:bg-white hover:shadow-[0_12px_30px_rgba(23,39,63,0.10)]"
          >
            <FiExternalLink className="h-3.5 w-3.5" />
            Volver al sitio
          </Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#17273f] bg-transparent px-4 py-3 text-xs uppercase tracking-[0.24em] text-[#17273f] transition-all hover:bg-[#17273f] hover:text-white hover:shadow-[0_12px_30px_rgba(23,39,63,0.16)]">
              <FiLogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
