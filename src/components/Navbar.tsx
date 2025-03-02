"use client";

import React, { useState, useEffect, useMemo} from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const t = useTranslations("Navbar");
  const pathname = usePathname() || "/";
  console.log("Navbar - Current pathname:", pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Función auxiliar para quitar el segmento del idioma de la URL
  const getPathWithoutLocale = (path: string) => path.replace(/^\/(es|en|fr)/, "");

  // Lista de idiomas disponibles.
  const languages = useMemo(
    () => [
      { lang: "es", flag: "spain-flag.svg", alt: "Español" },
      { lang: "en", flag: "usa-flag.svg", alt: "English" },
      { lang: "fr", flag: "france-flag.svg", alt: "Français" },
    ],
    []
  );

  // Items del menú.
  const menuItems = useMemo(
    () => [
      { href: "#about-us", label: t("aboutNavbar") },
      { href: "#reviews", label: t("reviewsNavbar") },
      { href: "#menu", label: t("menuNavbar") },
      { href: "#rooms", label: t("roomsNavbar") },
      { href: "#contact", label: t("contactNavbar") },
      { href: "https://goo.su/4Nkqe", label: t("bookNavbar") },
    ],
    [t]
  );

  return (
    <nav
      className="fixed top-0 left-0 w-full bg-[#e3d6b5] text-black p-4 z-40 shadow-md"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/images/logo-villa-vicuna.svg"
              alt="Villa Vicuña"
              width={120}
              height={120}
              className="w-32 cursor-pointer transition-transform duration-300 hover:scale-105"
            />
          </Link>
        </div>

        {/* Menú de escritorio */}
        {isDesktop && (
          <div className="flex-1 justify-center">
            <ul className="flex items-center justify-center">
              {menuItems.map((item, index) => (
                <React.Fragment key={item.href}>
                  <li className="whitespace-nowrap">
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="relative group px-3 py-1 font-medium text-xl transition-colors duration-300 hover:text-gray-800"
                    >
                      {item.label}
                      <span className="absolute left-1/2 bottom-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                    </a>
                  </li>
                  {index < menuItems.length - 1 && (
                    <li className="flex items-center mx-6">
                      <span className="text-lg">•</span>
                    </li>
                  )}
                </React.Fragment>
              ))}
            </ul>
          </div>
        )}

        {/* Idiomas y botón toggle para móvil */}
        <div className="flex items-center gap-x-6">
          {isDesktop ? (
            <div className="flex items-center gap-x-3">
              {languages.map(({ lang, flag, alt }) => (
                <Link key={lang} href={`/${lang}${getPathWithoutLocale(pathname)}`}>
                  <Image
                    src={`/images/icons/${flag}`}
                    alt={alt}
                    width={28}
                    height={28}
                    className="hover:opacity-80 transition-opacity duration-300"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <button
              className="text-3xl focus:outline-none flex items-center ml-4"
              onClick={() => setMenuOpen(prev => !prev)}
            >
              ☰
            </button>
          )}
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {menuOpen && !isDesktop && (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 bg-[#e3d6b5] flex flex-col items-center justify-center z-50"
          >
            <button
              className="absolute top-6 right-6 text-3xl focus:outline-none"
              onClick={() => setMenuOpen(false)}
            >
              ✖
            </button>
            <ul className="text-2xl space-y-6 text-center">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="relative group font-semibold transition-colors duration-300 hover:text-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                    <span className="absolute left-1/2 bottom-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex space-x-6">
              {languages.map(({ lang, flag, alt }) => (
                <Link key={lang} href={`/${lang}${getPathWithoutLocale(pathname)}`}>
                  <Image
                    src={`/images/icons/${flag}`}
                    alt={alt}
                    width={28}
                    height={28}
                    className="hover:opacity-80 transition-opacity duration-300"
                  />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
