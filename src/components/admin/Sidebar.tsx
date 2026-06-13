"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiHome, FiStar, FiLogOut, FiFilm, FiInfo, FiBookOpen, FiPhone } from "react-icons/fi";
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
];

export default function Sidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="bg-[#f8f4ea] border-b md:border-b-0 md:border-r border-[#e3d6b5] md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[#e3d6b5] flex items-center justify-center md:justify-start">
        <Image
          src="/images/logo-villa-vicuna-2.svg"
          alt="Villa Vicuña"
          width={150}
          height={48}
          className="h-10 w-auto"
          priority
        />
      </div>

      {/* Navegación */}
      <nav className="flex md:flex-col gap-1 p-3 overflow-x-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 whitespace-nowrap px-4 py-3 text-sm uppercase tracking-[0.16em] transition-colors ${
                active
                  ? "bg-[#17273f] text-white"
                  : "text-[#17273f] hover:bg-[#efe7d2]"
              }`}
            >
              {/* Acento dorado en el activo (desktop) */}
              <span
                className={`hidden md:block absolute left-0 top-0 bottom-0 w-[3px] ${
                  active ? "bg-[#e3d6b5]" : "bg-transparent"
                }`}
              />
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#e3d6b5]" : "text-[#17273f]/60 group-hover:text-[#17273f]"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Pie: usuario + salir */}
      <div className="mt-auto p-4 border-t border-[#e3d6b5]">
        {email && (
          <p className="hidden md:block text-xs text-[#17273f]/55 truncate mb-3">{email}</p>
        )}
        <form action={logoutAction}>
          <button className="w-full md:w-auto flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] border border-[#17273f] text-[#17273f] px-3 py-2 hover:bg-[#17273f] hover:text-white transition-colors">
            <FiLogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </form>
      </div>
    </aside>
  );
}
