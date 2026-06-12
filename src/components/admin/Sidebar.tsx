"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/secciones", label: "Secciones" },
  { href: "/admin/habitaciones", label: "Habitaciones" },
  { href: "/admin/resenas", label: "Reseñas" },
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
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap px-4 py-2.5 text-sm uppercase tracking-[0.18em] transition-colors ${
              isActive(item.href)
                ? "bg-[#17273f] text-white"
                : "text-[#17273f] hover:bg-[#efe7d2]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Pie: usuario + salir */}
      <div className="mt-auto p-4 border-t border-[#e3d6b5] flex items-center justify-between gap-3">
        {email && (
          <span className="hidden md:block text-xs text-[#17273f]/60 truncate">{email}</span>
        )}
        <form action={logoutAction} className="md:ml-auto">
          <button className="text-xs uppercase tracking-[0.2em] border border-[#17273f] text-[#17273f] px-3 py-1.5 hover:bg-[#17273f] hover:text-white transition-colors">
            Salir
          </button>
        </form>
      </div>
    </aside>
  );
}
