"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CloudbedsBookNow from "./CloudbedsBookNow";

const PHONE_NUMBER = "5493874649748";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "¡Hola! Me interesa Villa Vicuña, Hotel en Salta. ¿Podrían brindarme más información?",
);
const WHATSAPP_URL = `https://wa.me/${PHONE_NUMBER}?text=${WHATSAPP_MESSAGE}`;
const CLOUDBEDS_PROPERTY_CODE = "pwSXnD";

export default function FloatingEditorialActions() {
  const [hideForBooking, setHideForBooking] = useState(false);

  useEffect(() => {
    const checkOpen = () => {
      try {
        const root = document.querySelector(".cb-bookingengine-root");
        if (!root) return false;
        const content = root.querySelector('[class*="styles-module__content"]');
        if (!content || !(content instanceof HTMLElement)) return false;
        const rect = content.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      } catch {
        return false;
      }
    };

    const update = () => setHideForBooking(checkOpen());
    update();

    const observer = new MutationObserver(() => update());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="fixed bottom-5 right-6 z-25 flex flex-col items-end gap-3"
      style={{
        pointerEvents: hideForBooking ? "none" : "auto",
        opacity: hideForBooking ? 0 : 1,
      }}
    >
      <CloudbedsBookNow
        propertyCode={CLOUDBEDS_PROPERTY_CODE}
        variant="contact"
        contactButtonClassName="h-16 w-16 rounded-full bg-[#e3d6b5] text-black shadow-md transition-all hover:bg-[#d6c3a2]"
        contactIconSrc="/images/icons/ico-reservar.svg"
        contactIconSize={40}
        contactAriaLabel="Reservar"
        mode="popup"
        width="90vw"
        height="90vh"
        lang="auto"
        timeout={4000}
        buttonClassName="cb-link-btn"
        className="w-auto"
      />

      <Link
        href={WHATSAPP_URL}
        target="_blank"
        title="Contacta con Villa Vicuña por WhatsApp"
      >
        <Image
          src="/images/icons/ico-whatsapp-ventana.svg"
          alt="Logo WhatsApp"
          width={64}
          height={64}
          loading="lazy"
        />
      </Link>
    </div>
  );
}
